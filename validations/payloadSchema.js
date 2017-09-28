const Joi = require('joi');
const _ = require('lodash');
const ERROR_MESSAGES = require('../conf/errors');


const payloadSchema = Joi.object().keys({
    reqFirstName: Joi.string().required(),
    reqLastName: Joi.string().required(),
    reqEmail: Joi.string().email().required(),
    authEmail: Joi.string().email().required(),
    serialNumber: Joi.string().min(12).max(12).required(),
    productKey: Joi.string().empty(''),
    requestCode: Joi.string().min(39).required(),
    overActivationReason: Joi.string().empty(''),
    description: Joi.string().empty(''),
    case: {
        origin: Joi.string().required(),
        subOrigin: Joi.string().required(),
        failureStatus: Joi.string().empty(''),
        description: Joi.string().empty('')
    }
});


// Set default config
const joiValidationConfig = { abortEarly: false };
const joiValidate = ((config) => {
    return (data, schema) => {
        return Joi.validate(data, schema, config);
    };
})(joiValidationConfig);

const processErrorObj = (validationRes) => {
    //console.log('**** validationRes:', validationRes.error.details)
    var payLoadErrors = validationRes.error.details.map((item) => {
        console.log('PAYLOAD-FIELD-ERROR:', item.path);
        if (fieldToErrorMessage[item.path] !== undefined) //EAOT-1213
            return fieldToErrorMessage[item.path][item.type];
        //else return ERROR_MESSAGES.get('GAC0037')
    })
    return payLoadErrors;
}

const doesPayloadHaveErrs = (payloadValidation) => {
    if (payloadValidation.error !== null) {
        return _.compact(processErrorObj(payloadValidation)); //EAOT-1213
    }
    return false;
};

// Customize errors returned;
const fieldToErrorMessage = {
    reqFirstName: {
        'any.empty': ERROR_MESSAGES.get('GAC0008'),
        'any.required': ERROR_MESSAGES.get('GAC0008')
    },
    reqLastName: {
        'any.empty': ERROR_MESSAGES.get('GAC0009'),
        'any.required': ERROR_MESSAGES.get('GAC0009')
    },
    reqEmail: {
        'any.empty': ERROR_MESSAGES.get('GAC0010'),
        'any.required': ERROR_MESSAGES.get('GAC0010'),
        'string.email': ERROR_MESSAGES.get('GAC0003'),
    },
    authEmail: {
        'any.empty': ERROR_MESSAGES.get('GAC0011'),
        'any.required': ERROR_MESSAGES.get('GAC0011'),
        'string.email': ERROR_MESSAGES.get('GAC0004'),
    },
    requestCode: {
        'any.empty': ERROR_MESSAGES.get('GAC0012'),
        'string.min': ERROR_MESSAGES.get('GAC0007'),
        'string.max': ERROR_MESSAGES.get('GAC0007'),
        'any.required': ERROR_MESSAGES.get('GAC0012'),
    },
    serialNumber: {
        'any.required': ERROR_MESSAGES.get('GAC0013'),
        'any.empty': ERROR_MESSAGES.get('GAC0013'),
        'string.max': ERROR_MESSAGES.get('GAC0005'),
        'string.min': ERROR_MESSAGES.get('GAC0005'),
    },
    'case.subOrigin': {
        'any.required': ERROR_MESSAGES.get('GAC0002'),
        'any.empty': ERROR_MESSAGES.get('GAC0002'),
    },
    'case.origin': {
        'any.required': ERROR_MESSAGES.get('GAC0001'),
        'any.empty': ERROR_MESSAGES.get('GAC0001'),
    }
};

module.exports = {
    payloadSchema: payloadSchema,
    fieldToErrorMessage: fieldToErrorMessage,
    doesPayloadHaveErrs: doesPayloadHaveErrs,
    joiValidate: joiValidate,
    processErrorObj: processErrorObj
};