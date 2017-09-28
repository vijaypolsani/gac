'use strict'
const gac = require('./component');

exports.handler = (event, context, callback) => {
    console.log('Incoming Payload: ', event)
    if (typeof event === 'string' || event instanceof String)
        event = JSON.parse(event)
    const payloadData = {
        serialNumber: event.serialNumber,
        reqFirstName: event.requester.firstName,
        reqLastName: event.requester.lastName,
        reqEmail: event.requester.email,
        authEmail: event.authEmail,
        productKey: event.productKey,
        requestCode: event.requestCode,
        overActivationReason: event.overActivationReason,
        description: event.description
    };
    if (event.case) {
        payloadData.case = event.case;
    }

    try {
        console.log('Invoking GAC Microservice........')
        gac(payloadData)
            .then((val) => {
                callback(null, val);
            }).catch((err) => {
                callback(null, err);
            });
    } catch (e) {
        callback(null, e);
    }
};