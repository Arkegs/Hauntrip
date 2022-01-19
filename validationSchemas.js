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
                //if (clean !== value) return helpers.error('string.escapeHTML', { value })
                console.log(clean);
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
        email: Joi.string().max(50).required().escapeHTML(),
        birthdate: Joi.date().required()
    }).required(),
    'g-recaptcha-response': Joi.string()
});

module.exports.mysterySchema = Joi.object({
    mystery: Joi.object({
        title: Joi.string().max(70).required().escapeHTML(),
        description: Joi.string().max(5500).required().escapeHTML(),
        geometry: Joi.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/).required().escapeHTML()
    }).required(),
    'g-recaptcha-response': Joi.string()
});

module.exports.updateMysterySchema = Joi.object({
    mystery: Joi.object({
        title: Joi.string().max(70).required().escapeHTML(),
        description: Joi.string().max(5500).required().escapeHTML(),
    }).required(),
    'g-recaptcha-response': Joi.string()
});

module.exports.evidenceSchema = Joi.object({
    evidence: Joi.object({
        title: Joi.string().max(70).required().escapeHTML(),
        body: Joi.string().max(3000).required().escapeHTML(),
        conclusion: Joi.string().required().escapeHTML()
    }).required(),
    'g-recaptcha-response': Joi.string()
});

module.exports.spookinessSchema = Joi.object({
    spookiness: Joi.object({
        value: Joi.number().integer().min(1).max(5).required()
    }
    ).required()
});

module.exports.reportSchema = Joi.object({
    report: Joi.object({
        report: Joi.string().max(1500).required().escapeHTML()
    }
    ).required()
});

module.exports.newPasswordSchema = Joi.object({
    password: Joi.object({
        password: Joi.string().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9-]+(?<![_.])$/).required().escapeHTML()
    }
    ).required()
});