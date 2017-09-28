const axios = require('axios');
const CryptoJS = require('crypto-js');

// Config
const config = require('../conf/conf');

const httpTimeStamp = () => {
    return Math.floor(Date.now() / 1000);
};

const httpMethods = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH'
};

// TODO: Test with test doubles!!
const reduceToString = (args) => {
    return args.reduce((accum, item) => {
        return accum + item;
    });
};


const httpSigHelper = (strsForSig) => {
    var base_str_partial = reduceToString(strsForSig);

    return (timestamp, otherStr) => {
        const base_str = base_str_partial + timestamp;
        var hmacsha256 = CryptoJS.HmacSHA256(base_str, otherStr);
        return api_signature = CryptoJS.enc.Base64.stringify(hmacsha256);
    };

}


module.exports = {
    crucibleGet: (url, data, connParams) => {
        var timestamp = new Date().getTime() / 1000 | 0;
        var base_str = config.oAuth.CB + connParams.access_token + timestamp;
        var hmacsha256 = CryptoJS.HmacSHA256(base_str, config.oAuth.CL_SEC);
        var api_signature = CryptoJS.enc.Base64.stringify(hmacsha256);

        // TODO: Move this to a config
        var headers = {
            Authorization: 'Bearer ' + connParams.access_token,
            CSN: 7777777777,
            signature: api_signature,
            timestamp: timestamp,
            sender: 'GAC'
        }

        var wholeUrl = '';

        if (data.length === 0) {
            wholeUrl = url;
        } else {
            wholeUrl = url + '/' + data;
        }

        // Return promise
        return axios.get(wholeUrl, {
            headers: headers,
            validateStatus: function(status) {
                return true; // default
            },
            timeout: 5000
        });
    },
    cruciblePost: (url, data, connParams) => {
        var timestamp = new Date().getTime() / 1000 | 0;
        var base_str = config.oAuth.CB + connParams.access_token + timestamp;
        var hmacsha256 = CryptoJS.HmacSHA256(base_str, config.oAuth.CL_SEC);
        var api_signature = CryptoJS.enc.Base64.stringify(hmacsha256);

        // TODO: Move this to a config
        var headers = {
            Authorization: 'Bearer ' + connParams.access_token,
            CSN: 7777777777,
            signature: api_signature,
            timestamp: timestamp,
            sender: 'GAC',
            accept: 'application/json',
            'content-type': 'application/json'
        }

        console.log(headers);

        // Return promise
        return axios({
            method: 'post',
            url: url,
            data: data,
            headers: headers,
            validateStatus: function(status) {
                return true; // default
            }
        })
    },
    cruciblePostPatchPut: (method, data, connParams, payload) => {
        const timestamp = httpTimeStamp();
        var api_signature = httpSigHelper(connParams, timestamp);

        // TODO: Move this to a config
        var headers = {
            Authorization: 'Bearer ' + connParams.access_token,
            CSN: 7777777777,
            signature: api_signature,
            timestamp: timestamp,
            sender: 'GAC'
        }
        return axios.get(config.URLs.PIRACY_URL + '/' + serialNumber, { headers: headers });
    },
    apigeeClient: (url, data, method, connParams) => {
        if (!httpMethods[method]) {
            throw Error('No Such HTTP Method!');
        }

        const timestamp = httpTimeStamp();
        var api_signature = httpSigHelper(connParams, timestamp);

        // TODO: Move this to a config
        var headers = {
            Authorization: 'Bearer ' + connParams.access_token,
            CSN: 7777777777,
            signature: api_signature,
            timestamp: timestamp,
            sender: 'GAC'
        }

        // Return promise
        return axios(url + '/' + data, {
            headers: headers
        });
    }
}