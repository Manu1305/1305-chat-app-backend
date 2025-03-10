const { createResponse, respondFailure } = require("../../../../helpers/response")
const { checkUser, createCoupleAccount, updateUserByIdIsLogin, updateUserByIdIsLoginAndDeviceToken, updateLogout } = require("./auth.repo")
const localeKeys = require("../../../../locales/keys.json")
const statusCode = require("../../../../helpers/statusCodes.json")
const { getAuthTokens } = require("../../../../helpers/token")


const registerCouple = async (phone, code, fullName) => {
    try {


        const secretCode = 1305

        const existingUser = await checkUser(phone)
        if (existingUser) {

            return createResponse(false, localeKeys.auth.PHONE_NO_ALREADY_EXISTS, statusCode.CONFLICT)
        }
        if (secretCode != code) {
            return createResponse(false, localeKeys.auth.SECRETE_KEY_NOT_MATCH, statusCode.BAD_REQUEST)
        }

        const register = await createCoupleAccount(phone, fullName)
        return createResponse(true, localeKeys.auth.REGISTER_SUCCESSFULLY, statusCode.CREATED, register)

    } catch (error) {

        createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR)
    }
}

const login = async (phone, code, deviceToken) => {
    try {


        const secretCode = 1305

        const existingUser = await checkUser(phone)

        if (existingUser.length < 1) {

            return createResponse(false, localeKeys.auth.USER_NOT_FOUND, statusCode.NOT_FOUND)
        }
        if (secretCode != code) {
            return createResponse(false, localeKeys.auth.SECRETE_KEY_NOT_MATCH, statusCode.BAD_REQUEST)
        }

        await updateUserByIdIsLoginAndDeviceToken(existingUser._id, deviceToken);

        const tokenInfo = await checkUser(phone)

        const { accessToken, refreshToken } = getAuthTokens(tokenInfo._id, tokenInfo.isLogin);
        return createResponse(true, localeKeys.auth.LOG_IN_SUCCESSFULLY, statusCode.CREATED, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: tokenInfo
        })

    } catch (error) {

        createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR)
    }
}

const logout = async (phone) => {
    try {

        const existingUser = await checkUser(phone)

        if (existingUser.length < 1) {

            return createResponse(false, localeKeys.auth.USER_NOT_FOUND, statusCode.NOT_FOUND)
        }

        await updateLogout(existingUser._id);

        const tokenInfo = await checkUser(phone)

        return createResponse(true, localeKeys.auth.LOG_OUT_SUCCESSFULLY, statusCode.OK)

    } catch (error) {

        createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR)
    }
}
module.exports = { registerCouple, login, logout }