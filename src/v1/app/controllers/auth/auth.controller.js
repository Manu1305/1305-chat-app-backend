// helpers
const {
    respond, respondError, respondFailure,
} = require('../../../../helpers/response');
const { getMessageFromValidationError } = require('../../../../helpers/utils');
const statusCode = require('../../../../helpers/statusCodes.json');
const localeKeys = require('../../../../locales/keys.json');

// validation
const {
    validateRegister,
    validateLogin,
} = require('./auth.validator');
const { registerCouple, login } = require('./auth.services');

module.exports = {
    /**
     * @method register
     * @description "This method only for user to register with phone number"
     * @api "POST  /register"
     * @access "Public"
     */

    register: async (req, res, next) => {
        try {
            const { body } = req;

            const { phoneNumber, secretCode, fullName } = body

            const { error } = validateRegister(body);
            if (error) {

                return next(respondError(getMessageFromValidationError(error)));
            }

            const response = await registerCouple(phoneNumber, secretCode, fullName);

            return next(respond(res, { ...response, message: response.message }));
        } catch (error) {
            console.error('app -> controller -> auth -> register  -> error', error);
            return next(
                respondFailure(
                    res,
                    localeKeys.global.SOMETHING_WENT_WRONG,
                    statusCode.INTERNAL_SERVER_ERROR,
                    error.message,
                ),
            );
        }
    },
    login: async (req, res, next) => {
        try {
            const { body } = req;

            const { phoneNumber, secretCode, deviceToken } = body

            const { error } = validateLogin(body);
            if (error) {

                return next(respondError(getMessageFromValidationError(error)));
            }

            const response = await login(phoneNumber, secretCode, deviceToken);

            return next(respond(res, { ...response, message: response.message }));
        } catch (error) {
            console.error('app -> controller -> auth -> login  -> error', error);
            return next(
                respondFailure(
                    res,
                    localeKeys.global.SOMETHING_WENT_WRONG,
                    statusCode.INTERNAL_SERVER_ERROR,
                    error.message,
                ),
            );
        }
    },
}