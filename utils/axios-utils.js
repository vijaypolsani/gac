const ERRORS = require('../conf/errors');
const conf = require('../conf/conf');

const axiosErrorHandler = function(error) {
    if (error.response) {
        console.log('------------------OUTSIDE-OF-200-----------------', new Date(), ' ----------');
        if (error.response.status && (error.response.status > 500)) {
            // TODO: Change this nasty bit!!
            let data = [errors.push(ERRORS.get('GAC0036'))]
            data.meta = conf.STRS.META
            data.status = 400
            return data
        }
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
    console.log(error);
};

module.exports = {
    axiosErrorHandler: axiosErrorHandler
}