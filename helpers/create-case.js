const conf = require('../conf/conf');
const axios = require('axios');
const https = require('https');
const AWS = require('aws-sdk');
const uuid = require("uuid");

AWS.config.update({
    region: process.env.region || conf.STRS.REGION
})
const kinesis = new AWS.Kinesis();

const createClosedCase = ((config) => {
    return (requestBody, orchestrationResponse) => {
        const createCaseBody = {
            serialNumber: requestBody.serialNumber,
            requestCode: requestBody.requestCode,
            description: requestBody.case.description,
            email: requestBody.authEmail,
            requesterEmail: requestBody.reqEmail,
            caseType: 'GAC',
            fName: requestBody.reqFirstName,
            lName: requestBody.reqLastName,
            productKey: orchestrationResponse.asset.productKey,
            supportedProduct: orchestrationResponse.supportedProduct,
            currentProductYear: orchestrationResponse.asset.version,
            origin: requestBody.case.origin,
            subOrigin: requestBody.case.subOrigin,
            activationCode: requestBody.activationCode,
            subject: 'Otto_Activation',
            topic: 'Request Activation Code',
            type: 'Installation, Activation & Registration',
            systemName: 'VA',
            caseStatus: requestBody.case.failureStatus || 'Closed - Solved'
        };

        const reqCaseData = requestBody.case;

        // We are here because case is an object in the payload, if value provided, overwrite default value
        Object.keys(reqCaseData).forEach((item) => {
            createCaseBody[item] = reqCaseData[item];
        });

        let params = {
            Data: JSON.stringify(createCaseBody),
            /* required */
            PartitionKey: uuid.v4(),
            /* required */
            StreamName: conf.STRS.CASENAME
        };
        kinesis.putRecord(params, (err, data) => {
            if (err) {
                console.dir('-------ERROR-IN-CLOSED-CASE-CREATION------');
                console.dir(err)
            }
            if (data) {
                console.log('>>> Input Params: ', params);
                console.dir('------------------CLOSED-CASE--CREATED--------------');
                console.dir(data)
            }
        })
    };
})(conf);

const createPiracyCase = ((config) => {
    return (requestBody, orchestrationResponse) => {
        // TODO: In this event, we now have to create a sfdc case, there is some custom logic...
        const createCaseBody = {
            serialNumber: requestBody.serialNumber,
            requestCode: requestBody.requestCode,
            email: requestBody.authEmail,
            requesterEmail: requestBody.reqEmail,
            caseType: 'GAC',
            fName: requestBody.reqFirstName,
            lName: requestBody.reqLastName,
            productKey: requestBody.productKey,
            origin: requestBody.case.origin,
            subOrigin: requestBody.case.subOrigin,
            description: requestBody.case.description,
            topic: 'Request Activation Code',
            type: 'Installation, Activation & Registration',
            systemName: 'VA',
            caseStatus: requestBody.case.failureStatus || 'Closed - Solved'
        };

        createCaseBody.subject = 'Pirated Serial Number - ' + createCaseBody.serialNumber;
        let params = {
            Data: JSON.stringify(createCaseBody),
            /* required */
            PartitionKey: uuid.v4(),
            /* required */
            StreamName: conf.STRS.CASENAME
        };
        kinesis.putRecord(params, (err, data) => {
            console.log('Calling Kinesis')
            if (err) {
                console.dir('-------ERROR-IN-PIRACY-CASE-CREATION------');
                console.dir(err)
            }
            if (data) {
                console.log('>>> Input Params: ', params);
                console.dir('------------------PIRACY-CASE-CREATED--------------');
                console.dir(data)
            }
        })
    };
})(conf);

module.exports = {
    createPiracyCase: createPiracyCase,
    createClosedCase: createClosedCase
};