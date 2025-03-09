const Joi = require('joi');

module.exports = {

    validateNewMessage: (input) => {
        const schema = Joi.object().keys({

            senderId: Joi.string().required(),
            receiverId: Joi.string().required(),
            message: Joi.string().required().allow(''),
            isMedia: Joi.boolean().required(),
            file: Joi.string().required().allow(''),
            chatId: Joi.string().allow(''),
            seen:Joi.boolean().required()
        });
        return schema.validate(input);
    },

    validateLikeMessage: (input) => {
        const schema = Joi.object().keys({
            receiverId: Joi.string().required(),
            messageId: Joi.string().required(),
            status: Joi.boolean().required(),
        });
        return schema.validate(input);
    },

    validateInChatScreen:(input)=> {
        const schema = Joi.object().keys({
            chatId: Joi.string().required(),
            userId: Joi.string().required(),
            status: Joi.boolean().required(),
})
          
        return schema.validate(input); 
    },
    validateLastSeen:(input)=>{
        const schema = Joi.object().keys({
            status: Joi.boolean().required(),})
            return schema.validate(input);
    }

};
