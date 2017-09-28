const Joi = require('joi');

const oAuthSchema = Joi.object().keys({
    access_token: Joi.string().alphanum().min(20).max(36).required(),
    expires_in: Joi.number().max(899).required(),
    token_type: Joi.string().required(),
});

module.exports = {
    oAuthSchema: oAuthSchema,
};