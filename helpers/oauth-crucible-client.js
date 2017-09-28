const axios = require('axios');
const CryptoJS = require('crypto-js');

// Config
const config = require('../conf/conf');

module.exports = {
    oAuthClient: () => {
        let timestamp = new Date().getTime() / 1000 | 0;
        const credStr = config.oAuth.CL_ID + ':' + config.oAuth.CL_SEC;
        const utf8Str = CryptoJS.enc.Utf8.parse(credStr); // Parse string first
        const base64Str = CryptoJS.enc.Base64.stringify(utf8Str);

        // Generate signature header
        const baseStr = config.oAuth.CB + config.oAuth.CL_ID + timestamp;
        const hmacsha256 = CryptoJS.HmacSHA256(baseStr, config.oAuth.CL_SEC);
        const signature = CryptoJS.enc.Base64.stringify(hmacsha256);

        // TODO: Move this to a config
        let reqHeaders = {
            Authorization: config.STRS.BASIC + ' ' + base64Str,
            CSN: config.oAuth.CSN,
            signature: signature,
            timestamp: timestamp,
            sender: config.oAuth.SENDER,
        };
        return axios.post(config.oAuth.URL, {}, { headers: reqHeaders });
    },
};