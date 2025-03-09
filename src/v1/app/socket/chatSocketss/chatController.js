const { createResponse, respond } = require("../../../../helpers/response");
const { getMessageFromValidationError } = require("../../../../helpers/utils");
const localMessage = require('../../../../locales/keys.json')
const statusCode = require('../../../../helpers/statusCodes.json');
const {


  getChatList,
  getAllChatMessages,
  userInChatScreenUpdate,
  findReceiverId,
  updateLastSeenData,
  sendMessage,
} = require("./chatService");
const { validateNewMessage, validateInChatScreen, validateLastSeen } = require("./validateMessage");

module.exports = {
  newMessage: async (body) => {
    try {
      const { error } = validateNewMessage(body);

      if (error) {
        return { status: false, data: getMessageFromValidationError(error) };
      }

      const response = await sendMessage(body);

      return response;
    } catch (err) {
      return { status: false, data: "Error sending message" };
    }
  },
  normalChatList: async (userId) => {
    try {
      const response = await getChatList(userId);
      return response;
    } catch (error) {

      return { status: false, data: "Error getting chat List" };
    }
  },

  getAllMessages: async (req, res) => {
    try {
      const { skip, limit, chatId } = req.params;

      const response = await getAllChatMessages(skip, limit, chatId);
      return respond(res, { ...response, message: response.message });
    } catch (error) {

      return createResponse(false, localMessage.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)
    }
  },

  userInChatScreen: async (userId, chatId, status) => {
    try {
      const body = { userId: userId, chatId: chatId, status: status }
      const { error } = validateInChatScreen(body)
      if (error) {
        return { status: false, data: getMessageFromValidationError(error) };
      }

      const response = await userInChatScreenUpdate(userId, chatId, status);
      return response
    } catch (error) {

      return createResponse(false, localMessage.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)

    }
  }
  ,
  updateLastSeen: async (userId, status) => {
    try {
      // const {error} = validateLastSeen(status)
      // if (error) {
      //   
      //   return { status: false, data: getMessageFromValidationError(error) };}
      const response = await updateLastSeenData(userId, status);
      return response
    } catch (error) {

      return createResponse(false, localMessage.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)

    }
  },

  findReceiverSocket: async (userId) => {
    try {

      const response = await findReceiverId(userId);

      return response
    } catch (error) {

      return createResponse(false, localMessage.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)

    }
  }
};
