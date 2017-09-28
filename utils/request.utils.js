const CryptoJS = require('crypto-js');

// Config
const config = require('../conf/conf');

const reduceToString = (args) => {
    return args.reduce((accum, item) => {
        return accum + item;
    });
};

const httpTimeStamp = () => {
    return Math.floor(Date.now() / 1000);
};

const httpSigHelper = (strsForSig) => {
        var base_str_partial = reduceToString(strsForSig);
        return (timestamp) => {
            const base_str = base_str_partial + timestamp;
            console.log(base_str)
            var hmacsha256 = CryptoJS.HmacSHA256(base_str, config.oAuth.CL_SEC);
            return api_signature = CryptoJS.enc.Base64.stringify(hmacsha256);
        };
    }
    // Apply config