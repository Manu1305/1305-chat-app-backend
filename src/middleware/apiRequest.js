
const { respondError, respondFailure } = require('../helpers/response');
const statusCode = require('../helpers/statusCodes.json');
const localesKeys = require('../locales/keys.json');

module.exports = {

    requireApiKey: (req, _res, next) => {
        const apiKey = req.header('x-api-key');
        const appVersion = req.header('x-app-version');
        const deviceType = req.header('x-app-deviceType');

        if (!apiKey) return next(respondError('x-api-key is required in header', statusCode.FORBIDDEN));
        if (!appVersion) return next(respondError('x-app-version is required in header', statusCode.FORBIDDEN));
        if (appVersion != process.env.APP_VERSION) return next(respondError('app-version-not-matching', statusCode.FORBIDDEN));
        if (apiKey !== process.env.API_KEY) return next(respondError('invalid api-key', statusCode.FORBIDDEN));






        req.appVersion = appVersion;
        req.deviceType = deviceType;
        return next();
    },

    requireAuthToken: (req, res, next) => {
        if (!req.header('Authorization')) return respondFailure(res, localesKeys.auth.UNAUTHORIZED, statusCode.FORBIDDEN);
        return next();
    },
};
