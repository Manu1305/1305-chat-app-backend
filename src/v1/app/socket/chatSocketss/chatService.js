const localeKeys = require("../../../../locales/keys.json")
const statusCode = require("../../../../helpers/statusCodes.json");
const { createResponse, respondError } = require("../../../../helpers/response");
const { updateChatList, saveNewChat, saveNewMessage, checkUser, getChatUsersList, checkChat, getAllChatMessagesFromRepo, updateInchatScreen, getReceiverId, updateStatusOnline, updateMessageSeen, checkUnreadCount } = require("./chatRepo");
const { generateChatId, sendPushNotification } = require("../../../../helpers/utils");
const { default: rateLimit } = require("express-rate-limit");
const chatList = require("../../../model/chat/chatList");
const { default: Expo } = require("expo-server-sdk");


const sendMessage = async (body) => {
    try {


        const { senderId, receiverId, message, isMedia, file, chatId, seen } = body;

        // Fetch sender and receiver details concurrently

        const [senderDetails, receiverDetails] = await Promise.all([
            checkUser(senderId),
            checkUser(receiverId)
        ]);

        if (!senderDetails) {

            return createResponse(false, localeKeys.chat.SENDER_ID_NOT_FOUND, statusCode.NOT_FOUND);
        }

        if (!receiverDetails) {

            return createResponse(false, localeKeys.chat.RECIEVER_ID_NOT_FOUND, statusCode.NOT_FOUND);
        }

        // Check if chat exists and update or create accordingly

        const existChat = await checkChat(chatId);
        const newChatId = existChat ? chatId : generateChatId();

        if (existChat) {
            const unreadCount = await checkUnreadCount(chatId, receiverId)



            await updateChatList(chatId, message, receiverId, unreadCount);
        } else {

            await saveNewChat(senderId, receiverId, message, newChatId, 1);
        }

        // Set file only if it's a media message
        if (isMedia) {
            body.file = file;
        }


        const saveMessage = await saveNewMessage(newChatId, senderId, receiverId, message, isMedia, file, seen);


        // Populate sender and receiver details in the saved message

        await Promise.all([
            saveMessage.populate({ path: "senderId", select: "fullName profilePicture phoneNumber" }),
            saveMessage.populate({ path: "receiverId", select: "fullName profilePicture phoneNumber" })
        ]);

        // Send push notification if the receiver has a valid Expo push token
        const { deviceToken } = receiverDetails;
        if (deviceToken?.startsWith("ExponentPushToken[")) {

            await sendPushNotification(deviceToken, senderDetails.fullName, message);
        } else {

        }
        const unreadCount = await checkUnreadCount(chatId, receiverId)



        await updateChatList(chatId, message, receiverId, unreadCount);


        return createResponse(true, localeKeys.chat.MESSAGE_SEND_SUCCESS, statusCode.OK, saveMessage);

    } catch (error) {
        console.error("Error in sendMessage function:", error);
        return createResponse(
            false,
            localeKeys.global.SOMETHING_WENT_WRONG,
            statusCode.INTERNAL_SERVER_ERROR,
            {},
            error
        );
    }
};



const getChatList = async (id) => {
    try {
        const userExist = await checkUser(id)
        if (userExist.length < 1) {
            return createResponse(false, localeKeys.auth.USER_NOT_FOUND, statusCode.NOT_FOUND)
        }

        const chatUsersList = await getChatUsersList(id)

        return chatUsersList
    } catch (error) {
        console.error("Error in sendMessage function:", error);
        return createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error);
    }
}

const getAllChatMessages = async (skip, Limit, chatId) => {
    try {

        let checkChatId = await checkChat(chatId)
        if (checkChatId.length < 1) {
            return createResponse(false, localeKeys.chat.CHAT_ID_NOT_FOUND, statusCode.NOT_FOUND)
        }
        const chatMessages = await getAllChatMessagesFromRepo(skip, Limit, chatId)

        return createResponse(true, localeKeys.chat.MESSAGE_FETCHED_SUCCESSFULLY, statusCode.OK, chatMessages)
    } catch (error) {
        return createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error);
    }
}

const userInChatScreenUpdate = async (userId, chatId, status) => {
    try {


        // Step 1: Check if the chat ID exists
        let checkChatId = await checkChat(chatId);


        if (checkChatId.length < 1) {

            return createResponse(false, localeKeys.chat.CHAT_ID_NOT_FOUND, statusCode.NOT_FOUND);
        }

        // Step 2: Determine whether the user is the sender or receiver
        let setObjct = { 'userChatDetail.isInChatScreen': status };
        if (String(checkChatId.senderId) === String(userId)) {

            setObjct = { 'reccieverChatDetail.isInChatScreen': status };
        } else {

        }


        // Step 3: Update the chat screen status
        await updateInchatScreen(chatId, setObjct);
        if (status === true) {
            await updateMessageSeen(chatId, userId)

        }
        else {

        }

        // Step 4: Return the result
        return {
            isInChatScreen: status,
            chatId: chatId
        };

    } catch (error) {
        console.error('Error in userInChatScreenUpdate:', error);
    }
};

const updateLastSeenData = async (userId, status) => {
    try {

        const lastSeen = await updateStatusOnline(userId, status)
        return lastSeen;
    } catch (error) {
        return createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error);
    }
}
const findReceiverId = async (userId) => {
    try {

        const receiverIdFromChat = await getReceiverId(userId)
        return receiverIdFromChat
    } catch (error) {

    }
}

module.exports = { findReceiverId, sendMessage, getChatList, getAllChatMessages, userInChatScreenUpdate, updateLastSeenData }