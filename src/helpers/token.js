// node modules
const jwt = require('jsonwebtoken');

const getJWTToken = (userId, isLogin, expireInSeconds, secret) => {
    const options = expireInSeconds ? { expiresIn: expireInSeconds } : {};
    return jwt.sign({ userId, isLogin }, secret, options);
};

module.exports = {

    getAuthTokens: (userId, isLogin, isRefresh) => ({
        accessToken: getJWTToken(userId, isLogin, parseInt((process.env.JWT_EXPIRE_SECONDS), 10), process.env.JWT_SECRET),
        refreshToken: isRefresh ? null : getJWTToken(userId, isLogin, null, process.env.JWT_REFRESH_SECRET),
    }),
};
