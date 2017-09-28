const ENV_GAC = process.env.ENV_GAC || 'STAGE';

// Strings
const STAGE = 'STAGE';
const DEV = 'DEV';
const PRD = 'PRD';

let oAuthUrl;
let clId;
let clSec;
let PIRACY_URL;
let ASSET_URL;
let CONTACT_URL;
let ACCOUNT_URL;
let ASSET_CONTACTS_URL;
let CLI_SERIAL_URL;
let GAC_URL;
let CREATE_CASE_URL;

// TODO: Move to DATABASE
if (ENV_GAC === 'PRD') {
    oAuthUrl = 'https://enterprise-api.autodesk.com/v2/oauth/generateaccesstoken?grant_type=client_credentials';
    clId = '';
    clSec = '';
    REGION = 'us-east-1';

    PIRACY_URL = 'https://enterprise-api.autodesk.com/eis-abus/v1';
    ASSET_URL = 'https://enterprise-api.autodesk.com/data/assets';
    CONTACT_URL = 'https://enterprise-api.autodesk.com/data/contacts';
    ACCOUNT_URL = 'https://enterprise-api.autodesk.com/data/accounts';
    ASSET_CONTACTS_URL = 'https://enterprise-api.autodesk.com/v1/asset/contacts';
    CLI_SERIAL_URL = 'https://enterprise-api.autodesk.com/v1/getServiceContractDetail';
    GAC_URL = 'https://enterprise-api.autodesk.com/v1/activationcode';
}

if (ENV_GAC === 'STAGE') {
    oAuthUrl = 'https://enterprise-api-stg.autodesk.com/v2/oauth/generateaccesstoken?grant_type=client_credentials';
    clId = '';
    clSec = '';
    REGION = 'us-west-2';

    PIRACY_URL = 'https://enterprise-api-stg.autodesk.com/eis-abus/v1';
    ASSET_URL = 'https://enterprise-api-stg.autodesk.com/data/assets';
    CONTACT_URL = 'https://enterprise-api-stg.autodesk.com/data/contacts';
    ACCOUNT_URL = 'https://enterprise-api-stg.autodesk.com/data/accounts';
    ASSET_CONTACTS_URL = 'https://enterprise-api-stg.autodesk.com/v1/asset/contacts';
    CLI_SERIAL_URL = 'https://enterprise-api-stg.autodesk.com/v1/getServiceContractDetail';
    GAC_URL = 'https://enterprise-api-stg.autodesk.com/v1/activationcode';
}
if (ENV_GAC === 'DEV') {
    oAuthUrl = 'https://enterprise-api-dev.autodesk.com/v2/oauth/generateaccesstoken?grant_type=client_credentials';
    clId = '';
    clSec = '';
    REGION = 'us-east-1';

    PIRACY_URL = 'https://autodesk-eis-np-dev.apigee.net/eis-abus/v1';
    ASSET_URL = 'https://autodesk-eis-np-dev.apigee.net/data/assets';
    CONTACT_URL = 'https://autodesk-eis-np-dev.apigee.net/data/contacts';
    ACCOUNT_URL = 'https://autodesk-eis-np-dev.apigee.net/data/accounts';
    ASSET_CONTACTS_URL = 'https://autodesk-eis-np-dev.apigee.net/v1/asset/contacts';
    CLI_SERIAL_URL = 'https://autodesk-eis-np-dev.apigee.net/v1/getServiceContractDetail';
    GAC_URL = 'https://autodesk-eis-np-dev.apigee.net/v1/activationcode';
}

const CB = 'www.autodesk.com';
const CSN = 5122424540;
const META = {
    "copyright": "Copyright 2017 Autodesk, Inc",
    "docs": "http://dev.eis-abus-webservices.autodesk.com/docs"
}

module.exports = {
    ENV_GAC: ENV_GAC,
    oAuth: {
        URL: oAuthUrl,
        CL_ID: clId,
        CL_SEC: clSec,
        CB: CB,
        CSN: CSN,
        SENDER: 'GAC'
    },
    URLs: {
        PIRACY_URL: PIRACY_URL,
        ASSET_URL: ASSET_URL,
        CONTACT_URL: CONTACT_URL,
        ACCOUNT_URL: ACCOUNT_URL,
        ASSET_CONTACTS_URL: ASSET_CONTACTS_URL,
        CREATE_CASE_URL: CREATE_CASE_URL,
        GAC_URL: GAC_URL,
        CLI_SERIAL_URL: CLI_SERIAL_URL,
    },
    STRS: {
        STAGE: STAGE,
        DEV: DEV,
        PRD: PRD,
        BASIC: 'Basic',
        REGION: REGION,
        META: META,
        CASENAME: 'case-creation'
    },
};