const { createResponse } = require("../../../../helpers/response");
const userModel = require("../../../model/user.model");
const localeKeys = require("../../../../locales/keys.json");
const statusCode = require("../../../../helpers/statusCodes.json");

module.exports = {
  checkUser: async (phone) => {
    try {
      let user = await userModel.findOne({ phoneNumber: phone, });
      return user;
    } catch (error) {
      return createResponse(
        false,
        localeKeys.global.SOMETHING_WENT_WRONG,
        statusCode.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },
  createCoupleAccount: async (phone, fullName) => {
    try {

      return await userModel.create({ phoneNumber: phone, fullName });
    } catch (error) {

      return createResponse(
        false,
        localeKeys.global.SOMETHING_WENT_WRONG,
        statusCode.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },
  updateUserByIdIsLoginAndDeviceToken: async (id, deviceToken) => {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { isLogin: true, deviceToken: deviceToken },
        { new: true }
      );
    } catch (error) {

      return createResponse(
        false,
        localeKeys.global.SOMETHING_WENT_WRONG,
        statusCode.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },
  updateLogout: async (id) => {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { isLogin: false, deviceToken: '', onlineStatus:false},
        { new: true }
      );
    } catch (error) {

      return createResponse(
        false,
        localeKeys.global.SOMETHING_WENT_WRONG,
        statusCode.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },
};
