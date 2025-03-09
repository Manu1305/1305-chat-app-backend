
const StatusCode = require('./statusCodes.json');

module.exports = {
    createResponse: (status, message, statusCode, data, err) => ({
        status,
        message,
        statusCode,
        data,
        err,
    }),

    respond: (res, {
        status, message, statusCode, data, err,
    }) => {
        let defaultMessage = null;
        if (status) {
            defaultMessage = 'query was successfull';
        } else {
            defaultMessage = 'something went wrong';
        }
        if (err) {

        }

        if (!data) {
            return res.status(statusCode).json({
                success: status,
                message: !message ? defaultMessage : message,
            });
        }
        return res.status(statusCode).json({
            success: status,
            message: !message ? defaultMessage : message,
            data,
        });
    },

    respondSuccess: (res, message, _status, data) => {
        const statusCode = StatusCode.OK;
        if (!data) {
            return res.status(statusCode).json({
                success: true,
                message: !message ? 'query was successfull' : message,
            });
        }

        return res.status(statusCode).json({
            success: true,
            message: !message ? 'query was successfull' : message,
            data,
        });
    },

    respondFailure: (res, message, statusCode, err) => module.exports.respond(res, module.exports.createResponse(false, message, statusCode, null, err)),

    respondError: (message, statusCode = StatusCode.BAD_REQUEST) => {
        const error = new Error(`${message}`);
        error.status = statusCode;

        return error;
    },

    urlNotFound: () => {

        const error = new Error('url not found, please check the documentation');
        error.status = StatusCode.NOT_FOUND;
        return error;
    },
};
