const axios = require('axios');
const oAuthClient = require('./helpers/oauth-crucible-client');
const crucibleClient = require('./helpers/service-clients');
const axiosUtils = require('./utils/axios-utils');
const conf = require('./conf/conf');
const ERRORS = require('./conf/errors');
const createCase = require('./helpers/create-case');
const predicates = require('./validations/business-predicates');
const gacSiebelErrUnwrap = require('./utils/common').gacSiebelErrUnwrap
const GacException = require('./utils/common').GacException

// Validations
const oauthConstraint = require('./validations/oAuthSchema');
const payloadConstraint = require('./validations/payloadSchema');

// Exception labels
const PAYLOAD_INVALID = 'PAYLOAD-INVALID';
const OAUTH_INVALID_STRUCT = 'OAUTH-INVALID-STRUCTURE';
const SERIAL_ON_PIRATED_LIST = 'SERIAL-ON-PIRATED-LIST';
const ASSET_FAILED_VAL = 'ASSET-FAILED-VALIDATION';
const ASSET_AUTH_CONTACT_ISSUE = 'ASSET-AUTH-CONTACT-ISSUE';
const BUSINESS_VAL_FAILED = 'BUSINESS-VALIDATION-FAILED';
const AUTH_CONT_MISM = 'AUTH-CONTACT-MISMATCH';
//Global Config for SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const returnToRequester = (initialPayload) => {
    let validationErrors;
    let orchestrationResponse = {};
    let orchBodyWithCli;

    //Payload Validations
    const isPayloadInvalid = payloadConstraint.joiValidate(initialPayload, payloadConstraint.payloadSchema);
    if ((validationErrors = payloadConstraint.doesPayloadHaveErrs(isPayloadInvalid)) !== false) {
        if (validationErrors.length > 0) {
            throw new GacException(PAYLOAD_INVALID, validationErrors);
        }
    }

    // AD-HOC timer
    const TIMER_LBL = 'GAC - Get Activation Code!';
    console.time(TIMER_LBL);

    return new Promise((mainResolve, mainReject) => {
        function* gacGenerator(payload, CONF) {
            const apiCalls = []
            const assetContactBody = { 'request': { 'serialNumber': payload.serialNumber } };
            const reqContact = {
                lastName: payload.reqLastName,
                firstName: payload.reqFirstName,
                email: payload.reqEmail,
                country: payload.country || 'US',
                contactLanguage: payload.language || 'EN'
            }
            const piracyPayload = 'piracyCheck?serialNumber=' + payload.serialNumber

            // Call 1
            let oAuthToken = yield oAuthClient.oAuthClient();

            // Call 2
            let assetAndContactCallResult = yield axios.all([
                crucibleClient.crucibleGet(CONF.URLs.PIRACY_URL, piracyPayload, oAuthToken),
                crucibleClient.crucibleGet(CONF.URLs.ASSET_URL, payload.serialNumber, oAuthToken),
                crucibleClient.crucibleGet(CONF.URLs.CONTACT_URL, payload.reqEmail, oAuthToken)
            ]);

            // Call 3 - External Account, CLI, AssetContacts, POST Contact
            apiCalls.push(crucibleClient.crucibleGet(CONF.URLs.ACCOUNT_URL, assetAndContactCallResult.validatedAsset.endCustomerAccountCsn, oAuthToken))
            apiCalls.push(crucibleClient.crucibleGet(CONF.URLs.CLI_SERIAL_URL + '?AssetNumber=&AssetSerialNumber=' + payload.serialNumber, '', oAuthToken))
            apiCalls.push(crucibleClient.cruciblePost(CONF.URLs.ASSET_CONTACTS_URL, assetContactBody, oAuthToken))
            if ((orchestrationResponse.reqContactStatusCode === 404) && (orchestrationResponse.reqContactStatusCode !== 400)) {
                console.log('Posting new Auth Contact = ', reqContact.email)
                apiCalls.push(crucibleClient.cruciblePost(CONF.URLs.CONTACT_URL, reqContact, oAuthToken))
            }
            yield axios.all(apiCalls);

            // Call 4 - Internal
            const orchBody = yield assetAndContactCallResult;

            // Call 5 - Internal Business Validations
            yield predicates.businessValidation(orchBody, payload);

            const gacBody = {
                serialNumber: payload.serialNumber,
                requestCode: payload.requestCode,
                productKey: orchBody.asset.productKey,
            };

            // EAOT-1162
            if (!predicates.stringUtils.isNullOrEmpty(payload.overActivationReason)) {
                gacBody.overActivationReason = payload.overActivationReason;
                gacBody.isOverActivation = 'true';
            } else {
                gacBody.isOverActivation = 'false';
            }

            // Call 6 - GAC
            yield crucibleClient.cruciblePost(CONF.URLs.GAC_URL, gacBody, oAuthToken)
        }

        //Declare the generator & Start it.
        const promiseChain = gacGenerator(initialPayload, conf);
        const promiseOne = promiseChain.next();

        promiseOne.value.then((res) => {
            if (res.status !== 200) {
                throw new GacException(OAUTH_INVALID_STRUCT, [ERRORS.get('GAC0035')]);
            }
            const validation = payloadConstraint.joiValidate(res.data, oauthConstraint.oAuthSchema);
            if (validation.error !== null) {
                throw new GacException(OAUTH_INVALID_STRUCT, [ERRORS.get('GAC0035')]);
            }
            return promiseChain.next(res.data);
        }).then((val) => {
            return val.value;
        }).then(axios.spread(function(piracy, asset, contact) {
            if (piracy !== undefined && piracy.data.pirated === true) {
                const respBody = {
                    piracy: {
                        pirated: true,
                    },
                };
                if (initialPayload.case && (typeof initialPayload.case === 'object')) {
                    createCase.createPiracyCase(initialPayload, respBody);
                    console.dir('Piracy Case Creation invoked as Closed-Solved!')
                }
                throw new GacException(SERIAL_ON_PIRATED_LIST, [ERRORS.get('GAC0027')]);
            }

            const assetResp = {
                asset: asset.data,
                assetCode: asset.status,
                reqContactStatusCode: contact.status,
                reqContact: contact.data
            };
            // Validate Asset
            const validAsset = predicates.isValidAsset(assetResp, initialPayload);
            if (typeof validAsset.isAssetValid !== 'undefined') {
                throw new GacException(ASSET_FAILED_VAL, validAsset.errors);
            }

            orchestrationResponse.validatedAsset = validAsset[0];
            orchestrationResponse.asset = validAsset[0];
            orchestrationResponse.reqContactStatusCode = assetResp.reqContactStatusCode;
            orchestrationResponse.reqContact = assetResp.reqContact;
            return promiseChain.next(orchestrationResponse);
        })).then((val) => {
            return val.value;
        }).then(axios.spread(function(acct, cli, assetContact, contact) {

            let orchBody = promiseChain.next().value;

            orchBody.account = acct.data[0];
            orchBody.cliSerialStatusCode = cli.status;
            orchBody.cliSerial = cli.data;
            orchBody.assetContactStatus = assetContact.status
            orchBody.assetContact = assetContact.data
            if (assetContact.data.asset !== undefined) {
                if (assetContact.data.asset.contacts !== undefined)
                    orchBody.assetContactContacts = assetContact.data.asset.contacts
            }
            if (contact !== undefined)
                orchBody.reqContactPosted = contact

            const resOfBusinessValidation = promiseChain.next(orchBody).value;

            orchBodyWithCli = orchBody;
            if (resOfBusinessValidation !== true) {
                throw new GacException(BUSINESS_VAL_FAILED, resOfBusinessValidation);
            }

            return promiseChain.next();
        })).then((val) => {
            return val.value;
        }).then((val) => {
            if (val !== undefined) {
                if (val.status !== 200) {
                    if (val.data.Envelope.Body.Fault) {
                        console.dir(val.data.Envelope.Body.Fault, { depth: 100 });
                        let siebelError = gacSiebelErrUnwrap(val.data); // TODO: Finish up this function
                        throw new GacException('SIEBEL-ERROR', siebelError);
                    }
                }
            }

            const gacRes = {};
            const data = {}
            data.activationCode = val.data.Envelope.Body.GetAssetActivationCodeResponse.ActivationCode;
            data.serialNumber = val.data.Envelope.Body.GetAssetActivationCodeResponse.SerialNumber;
            data.status = val.data.Envelope.Body.GetAssetActivationCodeResponse.Status;

            gacRes.status = 200
            gacRes.meta = conf.STRS.META
            gacRes.data = data

            if (initialPayload.case && (typeof initialPayload.case === 'object')) {
                orchBodyWithCli.activationCode = val.data.Envelope.Body.GetAssetActivationCodeResponse.ActivationCode;
                createCase.createClosedCase(initialPayload, orchBodyWithCli)
                console.dir('Case Creation invoked as Closed-Solved!')
            }
            console.timeEnd(TIMER_LBL);
            mainResolve(gacRes);
        }).catch((err) => { // Catch all errors
            console.dir(err, { depth: 100 });
            console.timeEnd(TIMER_LBL);
            if (typeof err.errors !== 'undefined') {
                mainReject(err);
            }
            if (err.response || err.request || err.config) {
                mainReject(axiosUtils.axiosErrorHandler(err));
            }
            // TODO: In case of System Exception, What can be done?
        });
    });
};
module.exports = returnToRequester;