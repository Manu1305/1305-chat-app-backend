const Joi = require('joi');

module.exports = {

    validateRegister: (input) => {
        const schema = Joi.object().keys({
            phoneNumber: Joi.string()
                .valid('8943293217', '9019263607')
                .required()
                .messages({
                    "any.only": "Only your special number is allowed, love ❤️",
                    "string.empty": "Please enter your sweet number 💕"
                }),
            secretCode: Joi.string().required().messages({
                "string.empty": "Don't forget our little secret 🔐",
            }),
            fullName: Joi.string().required().messages({
                "string.empty": "Your beautiful name is needed 🌸",
            }),
        });

        return schema.validate(input, { 
            abortEarly: false,
        });
    },

    validateLogin: (input) => {
        const schema = Joi.object().keys({
            phoneNumber: Joi.string()
                .valid('8943293217', '9019263607')
                .required()
                .messages({
                    "any.only": "Only your special number is allowed, darling ❤️",
                    "string.empty": "Please enter your sweet number 💕"
                }),
            secretCode: Joi.string().required().messages({
                "string.empty": "Don't forget our little secret 🔐",
            }),
            deviceToken: Joi.string().required().messages({
                "string.empty": "Device token is required to keep us connected 🌐",
            }),
        });

        return schema.validate(input, {
            abortEarly: false,
        });
    },
};
