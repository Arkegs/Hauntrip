const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not contain fordibben characters'
    },
    rules:{
        escapeHTML: {
            validate(value, helpers){
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);


module.exports.userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().regex(/^(?=.{5,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9-]+(?<![_.])$/).required().escapeHTML(),
        password: Joi.string().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9-]+(?<![_.])$/).required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        birthdate: Joi.date().required()
    })
});

module.exports.mysterySchema = Joi.object({
    mystery: Joi.object({
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        geometry: Joi.string().required().escapeHTML()
    }
    ).required()
});

module.exports.updateMysterySchema = Joi.object({
    mystery: Joi.object({
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }
    ).required()
});

module.exports.evidenceSchema = Joi.object({
    evidence: Joi.object({
        title: Joi.string().required().escapeHTML(),
        body: Joi.string().required().escapeHTML(),
        conclusion: Joi.string().required().escapeHTML()
    }
    ).required()
});

module.exports.spookinessSchema = Joi.object({
    spookiness: Joi.object({
        value: Joi.number().integer().min(1).max(5).required()
    }
    ).required()
});