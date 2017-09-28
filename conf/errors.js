const ERRORS = new Map;

const GAC0001 = 'GAC0001';
const GAC0002 = 'GAC0002';
const GAC0003 = 'GAC0003';
const GAC0004 = 'GAC0004';
const GAC0005 = 'GAC0005';

const GAC0006 = 'GAC0006';
const GAC0007 = 'GAC0007';
const GAC0008 = 'GAC0008';
const GAC0009 = 'GAC0009';
const GAC0010 = 'GAC0010';

const GAC0011 = 'GAC0011';
const GAC0012 = 'GAC0012';
const GAC0013 = 'GAC0013';
const GAC0014 = 'GAC0014';
const GAC0015 = 'GAC0015';

const GAC0016 = 'GAC0016';
const GAC0017 = 'GAC0017';
const GAC0018 = 'GAC0018';
const GAC0019 = 'GAC0019';
const GAC0020 = 'GAC0020';

const GAC0021 = 'GAC0021';
const GAC0022 = 'GAC0022';
const GAC0023 = 'GAC0023';
const GAC0024 = 'GAC0024';
const GAC0025 = 'GAC0025';

const GAC0026 = 'GAC0026';
const GAC0028 = 'GAC0028';
const GAC0027 = 'GAC0027';
const GAC0029 = 'GAC0029';
const GAC0030 = 'GAC0030';

const GAC0031 = 'GAC0031';
const GAC0032 = 'GAC0032';
const GAC0033 = 'GAC0033';
const GAC0034 = 'GAC0034';
const GAC0035 = 'GAC0035';

const GAC0036 = 'GAC0036';

const GAC0037 = 'GAC0037';
const GAC0038 = 'GAC0038';
const GAC0039 = 'GAC0039';
const GAC0040 = 'GAC0040';

const requiredBaseStr = 'Required field is missing: ';

// TODO: Next
const createErrorObj = (map, code, detail) => {
    map.set(code, {
        code: code,
        detail: detail
    });
};

ERRORS.set(GAC0001, {
    code: 'AC-01',
    detail: 'Input Error: Invalid Format for Case Origin'
});
ERRORS.set(GAC0002, {
    code: 'AC-02',
    detail: 'Input Error: Invalid Format for Case Sub Origin'
});
ERRORS.set(GAC0003, {
    code: 'AC-03',
    detail: 'Input Error: Invalid Format for Requester Email format'
});
ERRORS.set(GAC0004, {
    code: 'AC-04',
    detail: 'Input Error: Invalid Format for Authorized Email format'
});
ERRORS.set(GAC0005, {
    code: 'AC-05',
    detail: 'Asset Error: Serial # is Invalid'
});
ERRORS.set(GAC0006, {
    code: 'AC-06',
    detail: 'General Field Exceptions'
});
ERRORS.set(GAC0007, {
    code: 'AC-07',
    detail: 'Asset Error: Invalid Request Code'
});
ERRORS.set(GAC0008, {
    code: 'AC-08',
    detail: requiredBaseStr + "[Requester's First Name]"
});
ERRORS.set(GAC0009, {
    code: 'AC-09',
    detail: requiredBaseStr + "[Requester's Last Name]"
});
ERRORS.set(GAC0010, {
    code: 'AC-10',
    detail: requiredBaseStr + "[Requester's Email id]"
});
ERRORS.set(GAC0011, {
    code: 'AC-11',
    detail: requiredBaseStr + "[Authorized Email id]"
});
ERRORS.set(GAC0012, {
    code: 'AC-12',
    detail: requiredBaseStr + "[Request Code]"
});
ERRORS.set(GAC0013, {
    code: 'AC-13',
    detail: requiredBaseStr + "[Serial #]"
});
ERRORS.set(GAC0014, {
    code: 'AC-14',
    detail: "Asset Error: Multiple Assets"
});
ERRORS.set(GAC0015, {
    code: 'AC-15',
    detail: "Asset Error: Product Key and Serial Not Found"
});
ERRORS.set(GAC0016, {
    code: 'AC-16',
    detail: 'Asset Error: Overactivated'
});
ERRORS.set(GAC0017, {
    code: 'AC-17',
    detail: 'Asset Error: Expired (Student)'
});
ERRORS.set(GAC0018, {
    code: 'AC-18',
    detail: 'Asset Error: Expired'
});
ERRORS.set(GAC0019, {
    code: 'AC-19',
    detail: 'Asset Error: Invalid Status'
});
ERRORS.set(GAC0020, {
    code: 'AC-20',
    detail: 'Asset Error: Invalid License Model'
});
ERRORS.set(GAC0021, {
    code: 'AC-21',
    detail: 'Asset Error: Multi-User'
});
ERRORS.set(GAC0022, {
    code: 'AC-22',
    detail: 'Asset Error: Invalid Deployment'
});
ERRORS.set(GAC0023, {
    code: 'AC-23',
    detail: 'Account Error: Export Control Block'
});
ERRORS.set(GAC0024, {
    code: 'AC-24',
    detail: 'Account Error: Embargo'
});
ERRORS.set(GAC0025, {
    code: 'AC-25',
    detail: 'Asset Error: Legal Review'
});
ERRORS.set(GAC0026, {
    code: 'AC-26',
    detail: 'Contact Error: Unauthorized'
});
ERRORS.set(GAC0027, {
    code: 'AC-27',
    detail: 'Asset Error: Pirated'
});
ERRORS.set(GAC0028, {
    code: 'AC-28',
    detail: 'System Error: Validations'
});
ERRORS.set(GAC0029, {
    code: 'AC-29',
    detail: 'Asset Error: Serial # not found in our backend system'
});
ERRORS.set(GAC0030, {
    code: 'AC-30',
    detail: 'System Error: Crucible'
});
ERRORS.set(GAC0031, {
    code: 'AC-31',
    detail: 'System Error: Unknown'
});
ERRORS.set(GAC0032, {
    code: 'AC-32',
    detail: 'System Error: GetAssetActivationCode'
});
ERRORS.set(GAC0033, {
    code: 'AC-33',
    detail: 'System Error: Unknown'
});
ERRORS.set(GAC0034, {
    code: 'AC-34',
    detail: 'System Error: Validations'
});
ERRORS.set(GAC0035, {
    code: 'AC-35',
    detail: 'System Error: OAuth'
});
ERRORS.set(GAC0036, {
    code: 'AC-36',
    detail: 'System Error: Crucible'
});
ERRORS.set(GAC0037, {
    code: 'AC-37',
    detail: 'Asset Error: FLEXnet short request code is invalid'
});
ERRORS.set(GAC0038, {
    code: 'AC-38',
    detail: 'Asset Error: FLEXnet short request code does not match the configured ASR file'
});
ERRORS.set(GAC0039, {
    code: 'AC-39',
    detail: 'Asset Error: Expired. The term absolute date is not greater than (todays date + 2)'
});
ERRORS.set(GAC0040, {
    code: 'AC-40',
    detail: 'Asset Error: Invalid Serial Number from SBL Backend System'
});

module.exports = ERRORS;