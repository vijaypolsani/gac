'use strict';
const _ = require('lodash');

const ERROR_CODES = require('../conf/errors');

const stringUtils = {
    compareStrings: function compareStrings(string1, string2, ignoreCase, useLocale) {
        if (ignoreCase) {
            if (useLocale) {
                string1 = string1.toLocaleLowerCase();
                string2 = string2.toLocaleLowerCase();
            } else {
                string1 = string1.toLowerCase();
                string2 = string2.toLowerCase();
            }
        }
        return string1 === string2;
    },
    checkSuccessCode: function checkSuccessCode(statusCode) {
        let regExp = /^2[0-9][0-9]$/;
        return regExp.test(statusCode);
    },
    checkNotFound: function checkNotFound(statusCode) {
        let regExp = /^4[0][4]$/;
        return regExp.test(statusCode);
    },
    checkInternalServer: function checkInternalServer(statusCode) {
        let regExp = /^5[0][0]$/;
        return regExp.test(statusCode);
    },
    checkAlreadyExist: function checkAlreadyExist(statusCode) {
        let regExp = /^4[0][0]$/;
        return regExp.test(statusCode);
    },
    validateEmail: function validateEmail(email) {
        let re = /\S+@\S+\.\S+/;
        return re.test(email);
    },
    isNullOrEmpty: function(value) {
        return !(typeof value === 'string' && value.length > 0);
    },
};

const LOC_STRS = {
    TFLEX: 'TFLEX',
    EFLEX: 'EFLEX',
    MFLEX: 'MFLEX',
    REGISTERED: 'registered',
    UPGRADED: 'upgraded',
    ACCEPT: 'accept',
    REVIEW: 'review',
};


const isAssetStatusValid = (asset) => {
    if (!stringUtils.isNullOrEmpty(asset.status)) {
        console.dir('AssetStatus: ');
        if (!(_.includes([LOC_STRS.REGISTERED, LOC_STRS.UPGRADED], asset.status.toLowerCase()))) {
            return ERROR_CODES.get('GAC0019');
        }
    } else {
        return ERROR_CODES.get('GAC0019');
    }

    return true;
};

const isLicenseModelValid = (asset) => {
    // Do not do NULL check on LicenseModel. TFLEX, EFLEX or MFLEX licenseModel
    if (!stringUtils.isNullOrEmpty(asset.licenseModel)) {
        console.dir('License Model: ');
        console.dir(asset.licenseModel);
        if (_.includes([LOC_STRS.TFLEX, LOC_STRS.EFLEX, LOC_STRS.MFLEX], asset.licenseModel.toUpperCase())) {
            return ERROR_CODES.get('GAC0020');
        }
    }

    return true;
};

const isExportStatusValid = (account) => {
    if (!stringUtils.isNullOrEmpty(account.accountExportControlStatus)) {
        console.dir('exportControlStatus: ', account.accountExportControlStatus.toLowerCase());
        if (!(_.includes([LOC_STRS.ACCEPT, LOC_STRS.REVIEW], account.accountExportControlStatus.toLowerCase()))) {
            return ERROR_CODES.get('GAC0023');
        }
    } else {
        return ERROR_CODES.get('GAC0023');
    }

    return true;
};

// Asset might be a single value, or array of values
const isValidAsset = (assetResp, initialPayload) => {
    let businessErr = [];
    let returnWithError = {
        isAssetValid: false,
        errors: businessErr,
    };

    //Asset does not exist. Fail
    if (assetResp.assetCode === 404) {
        businessErr.push(ERROR_CODES.get('GAC0029'));
        return returnWithError;
    }

    // If multiple assets provided && no productKey, throw errors
    if ((assetResp.asset.length > 1) && ((initialPayload.productKey === undefined) || (initialPayload.productKey === ''))) {
        console.log('Multiple Assets Found & Product Key is not given in input.')
            //if (stringUtils.isNullOrEmpty(initialPayload.productKey)) {}
        businessErr.push(ERROR_CODES.get('GAC0014'));
        return returnWithError;
    } // Multiple assets && productKey provided
    else if ((assetResp.asset.length > 1) && (initialPayload.productKey !== undefined)) {
        // Only return assets that are NOT invalid, match productKey, && serials match
        const filteredAssets = assetResp.asset.filter((item) => {
            console.log(item.serialNumber, initialPayload.serialNumber);
            return (item.status === 'Registered' || item.status === 'Upgraded') && item.productKey === initialPayload.productKey && item.serialNumber === initialPayload.serialNumber;
        });

        let matchedAsset = _.find(filteredAssets, function(item) {
            console.log('item assetNumber', item.serialNumber)
            console.log('Input serialNumber', initialPayload.serialNumber)
            console.log('item productKey', item.productKey)
            console.log('Input productKey', initialPayload.productKey)
            return (item.serialNumber === initialPayload.serialNumber) && (item.productKey === initialPayload.productKey)
        })

        if (matchedAsset === undefined) {
            console.log('Multiple Assets to given Product Key not match.')
            businessErr.push(ERROR_CODES.get('GAC0015'));
            return returnWithError;
        } else {
            assetResp.asset = matchedAsset // Got the Asset we are interested in.
            return [matchedAsset]
        }
    } else if ((assetResp.asset.length === 1) && (initialPayload.productKey !== undefined) && (initialPayload.productKey !== '')) {
        if (assetResp.asset[0].productKey !== initialPayload.productKey) {
            businessErr.push(ERROR_CODES.get('GAC0015'));
            return returnWithError;
        } else {
            assetResp.asset = assetResp.asset[0] // Got the first Asset we are interested in.
            return [assetResp.asset]
        }
    } else {
        // Matched because no product key is given
        assetResp.asset = assetResp.asset[0] // Got the Asset we are interested in.
        return [assetResp.asset]
    }
};

const businessValidation = (orchestrationRes, initialPayload) => {
    let businessErr = [];

    console.dir('Input to business validations: ', orchestrationRes);
    console.dir('initialPayload: ', initialPayload);
    try {
        // Multi Assets in a Serial Nulber. IC
        console.dir('Multi IC: orchestrationRes.asset', orchestrationRes.asset.serialNumber);
        console.dir('Multi IC: initialPayload.productKey ', initialPayload.productKey);
        let licenseModelValidation = isLicenseModelValid(orchestrationRes.asset);
        if (licenseModelValidation !== true) {
            businessErr.push(licenseModelValidation);
        }

        // Check Asset Status = 'Registered
        let statusValidation = isAssetStatusValid(orchestrationRes.asset);
        if (statusValidation !== true) {
            businessErr.push(statusValidation);
        }

        // Legal Status
        if (orchestrationRes.asset.underLegalReview !== undefined) {
            console.log('Legal Review: ', orchestrationRes.asset.underLegalReview);
            if (orchestrationRes.asset.underLegalReview) {
                businessErr.push(ERROR_CODES.get('GAC0025'));
            }
        } else { // TODO: Ask if this condition is required!
            businessErr.push(ERROR_CODES.get('GAC0025'));
        }

        // Deployment = Standalone
        // EAOT-1216
        if (orchestrationRes.asset.deployment !== undefined) {
            console.log('Deployment Model: ', orchestrationRes.asset.deployment);
            if (stringUtils.isNullOrEmpty(orchestrationRes.asset.deployment) || orchestrationRes.asset.deployment === 'A') {
                businessErr.push(ERROR_CODES.get('GAC0022'));
            }
            if (stringUtils.isNullOrEmpty(orchestrationRes.asset.deployment) || orchestrationRes.asset.deployment === 'N') {
                businessErr.push(ERROR_CODES.get('GAC0021'));
            }
        } else
            businessErr.push(ERROR_CODES.get('GAC0022'));


        // Account accountExportControlStatus #EAOT-1027
        // Specifics, if account.accountExportControlStatus is null throw error
        const exportValidation = isExportStatusValid(orchestrationRes.account);
        if (exportValidation !== true) {
            businessErr.push(exportValidation);
        }

        // Account embargo
        if (orchestrationRes.account !== undefined) {
            if (orchestrationRes.account.embargo !== false) {
                businessErr.push(ERROR_CODES.get('GAC0024'));
            }
        } else {
            businessErr.push(ERROR_CODES.get('GAC0024'));
        }
        // CLI End Date ##EAOT-1029 (In case of no-cli = Perpetual)
        console.log('Perpetual? CliStatusCode: Is 200 or 500 ?: ', orchestrationRes.cliSerialStatusCode);
        console.log('Current Date JS : Current Date : ', new Date().toISOString().substring(0, 10));
        if (orchestrationRes.asset !== undefined) {
            console.log('Current Date Check switching to "usageEndDate". ', orchestrationRes.asset.usageEndDate); //EAOT-1474
            if (orchestrationRes.asset.usageEndDate !== undefined && orchestrationRes.asset.usageEndDate !== null) {
                if (new Date().toISOString().substring(0, 10) >= new Date(orchestrationRes.asset.usageEndDate).toISOString().substring(0, 10)) {
                    console.log('Usage End Date: ', orchestrationRes.asset.usageEndDate);
                    console.log('Current Date >=:', new Date().toISOString().substring(0, 10));
                    businessErr.push(ERROR_CODES.get('GAC0018'));
                }
            }
        }
        /*
        if (orchestrationRes.cliSerialStatusCode === 500) {
            console.log('Current Date Check switching to "usageEndDate". CLI Does not exist. Perpetual: '); //EAOT-1474
            if (orchestrationRes.asset.usageEndDate !== undefined && orchestrationRes.asset.usageEndDate !== null) {
                if (new Date().toISOString().substring(0, 10) >= new Date(orchestrationRes.asset.usageEndDate).toISOString().substring(0, 10)) {
                    console.log('usage End Date: ', orchestrationRes.asset.usageEndDate);
                    console.log('Current Date >=:', new Date().toISOString().substring(0, 10));
                    businessErr.push(ERROR_CODES.get('GAC0018'));
                }
            }
        } else if (orchestrationRes.cliSerial.constructor !== Array) {
            console.dir('Current Date Check. Got an Array.', orchestrationRes.cliSerial.length);
            if ((new Date().toISOString().substring(0, 10) >= new Date(JSON.stringify(orchestrationRes.cliSerial.ServiceContract.EndDate)).toISOString().substring(0, 10))) {
                console.log('End Date: ', orchestrationRes.cliSerial.ServiceContract.EndDate);
                console.log('Current Date >=:', new Date().toISOString().substring(0, 10));
                businessErr.push(ERROR_CODES.get('GAC0018'));
            }
        } else {
            let expired = true;
            _.forEach(orchestrationRes.cliSerial, function(item) {
                console.log('Got the End Date:', item.ServiceContract.EndDate);
                console.log(item.ServiceContract.EndDate);
                console.dir('Current Date: ', (new Date().toISOString().substring(0, 10)));

                if (((new Date().toISOString().substring(0, 10)) <= (new Date(JSON.stringify(item.ServiceContract.EndDate)).toISOString().substring(0, 10)))) {
                    console.log('Iterating Over EndDate <=: ', item.ServiceContract.EndDate);
                    console.log('End Date Stringify Date?: ', new Date(JSON.stringify(item.ServiceContract.EndDate)).toISOString().substring(0, 10));
                    expired = false;
                    return false;
                }
            });
            if (expired) {
                businessErr.push(ERROR_CODES.get('GAC0018'));
            }
        }
        */
        // authEmail = getAssetContacts = SC on Asset/CM of ServiceContract
        if (orchestrationRes.assetContactContacts !== undefined) {
            if (!(_.find(orchestrationRes.assetContactContacts, function(item) {
                    let found = false
                        //console.log('emailAddress: ', item.emailAddress)
                    if (item.emailAddress !== undefined && item.emailAddress !== null) {
                        if (item.emailAddress.toLowerCase() === initialPayload.authEmail.toLowerCase()) {
                            found = true
                            console.log('AuthEmail found Role: ', item.role.toLowerCase())
                            console.log('AuthEmail found emailAddress: ', item.emailAddress.toLowerCase())
                        }
                    }
                    return found
                }))) {
                businessErr.push(ERROR_CODES.get('GAC0026'));
                console.log('AuthEmail email not found : ', initialPayload.authEmail)
            }
        } else {
            businessErr.push(ERROR_CODES.get('GAC0026'));
        }

        return (businessErr.length > 0) ? businessErr : true;
    } catch (allBusinessValidations) {
        console.dir('GAC0034, Unhandled Generic Business Exception');
        console.dir(allBusinessValidations);
        businessErr.push(ERROR_CODES.get('GAC0034'));

        // Let's return array of errors, assumes validation === false
        return businessErr;
    }
};

const assetAuthContactExist = (contactStatus, contactData) => {
    if (contactStatus === 404) {
        return [ERROR_CODES.get('GAC0026')];
    }
};



module.exports = {
    stringUtils: stringUtils,
    isValidAsset: isValidAsset,
    assetAuthContactExist: assetAuthContactExist,
    businessValidation: businessValidation,
    isExportStatusValid: isExportStatusValid,
    isAssetStatusValid: isAssetStatusValid,
    isLicenseModelValid: isLicenseModelValid
};