const conf = require('../conf/conf');
const ERRORS = require('../conf/errors');
const _ = require('lodash');


function GacException(message, data) {
    this.status = 400
    this.meta = conf.STRS.META
    this.errors = data;
    //this.message = message;
}

const gacSiebelErrUnwrap = (errObj) => {
    const soapFaultErrorMsg = 'Envelope.Body.Fault.detail.SOAPFault.Fault.ErrorMsg';
    const shortReqCodeInvalid = 'FLEXnet short request code is invalid';
    const flexNetError = 'FLEXnet short request code does not match the configured ASR file'
    const perpetualAssetError = 'The term absolute date is not greater than todays date + 2'
    const invalidSerial = 'Invalid Serial Number'
    const overActivation = 'latest activity of each machine is greater than'

    // TODO: Unwrap object and return array

    if (_.get(errObj, soapFaultErrorMsg)) { // Check if object path exist
        const errMsg = errObj.Envelope.Body.Fault.detail.SOAPFault.Fault.ErrorMsg;

        if (errMsg.includes(shortReqCodeInvalid)) {
            return [ERRORS.get('GAC0037')];
        } else if (errMsg.includes(flexNetError)) {
            return [ERRORS.get('GAC0038')];
        } else if (errMsg.includes(perpetualAssetError)) {
            return [ERRORS.get('GAC0039')];
        } else if (errMsg.includes(invalidSerial)) {
            return [ERRORS.get('GAC0040')];
        } else if (errMsg.includes(overActivation)) {
            return [ERRORS.get('GAC0016')];
        } else {
            return [ERRORS.get('GAC0033')];
        }
    } else {
        return [ERRORS.get('GAC0033')];
    }
};

module.exports = {
    gacSiebelErrUnwrap: gacSiebelErrUnwrap,
    GacException: GacException
}