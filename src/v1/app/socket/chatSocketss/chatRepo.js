const { createResponse } = require("../../../../helpers/response")
const userModel = require("../../../model/user.model")
const localeKeys = require("../../../../locales/keys.json");
const statusCode = require("../../../../helpers/statusCodes.json");
const chatList = require("../../../model/chat/chatList");
const chatMessage = require("../../../model/chat/chatMessage");
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const checkUser = async (id) => {
    try {
        return await userModel.findById(id)
    } catch (error) {
        createResponse(false, 'internal error', {}, error)
    }
}

const checkChat = async (chatId) => {
    try {
        return await chatList.findOne({ chatId: chatId })
    } catch (error) {

    }
}

const updateChatList = async (chatId, message, receiverId, unreadCount) => {
    try {
        // Find the chat document to determine if the receiverId is in the senderId or receiverId field
        const chat = await chatList.findOne({ chatId });

        if (!chat) {

            return null;
        }

        let updateData = {
            latestMessage: message,
            lastChatOn: new Date(),
            deletedBy: '',
        };

        // Check where the receiverId exists and update the appropriate unreadCount field
        if (chat.senderId.toString() === receiverId.toString()) {
            updateData['userChatDetail.unReadCount'] = unreadCount;
        } else if (chat.receiverId.toString() === receiverId.toString()) {
            updateData['reccieverChatDetail.unReadCount'] = unreadCount;
        } else {

            return null;
        }


        return await chatList.findOneAndUpdate(
            { chatId },
            { $set: updateData },
            { new: true }
        );

    } catch (error) {
        console.error("Error updating chat list:", error.message);
    }
};


const saveNewChat = async (senderId, receiverId, message, newChatId, unreadCount) => {
    try {
        return await chatList.create({
            senderId: senderId,
            receiverId: receiverId,
            chatId: newChatId,
            latestMessage: message,
            'reccieverChatDetail.unReadCount': unreadCount,
            lastChatOn: new Date(),
        })
    } catch (error) {

    }
}

const saveNewMessage = async (chatIds, senderId, receiverId, message, isMedia, file, seen) => {
    try {


        if (!chatIds || !senderId || !receiverId) {
            console.error("Missing required fields in saveNewMessage");
            return null;
        }

        const newMessage = await chatMessage.create({
            chatId: chatIds,
            senderId: senderId,
            receiverId: receiverId,
            message: isMedia ? "" : message, // Ensure message is not empty unless it's media
            isMedia: isMedia,
            file: isMedia ? file : null,
            seen: seen // Only save file if isMedia is true
        });


        return newMessage; // Return saved message for further processing

    } catch (error) {
        console.error("Error in saveNewMessage:", error);
        return null; // Return null on failure
    }
};


const getChatUsersList = async (id) => {
    if (!ObjectId.isValid(id)) return null;

    const userId = new ObjectId(id);

    try {
        const matchObj = {
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
            deletedBy: { $ne: userId },
        };

        const users = await chatList.aggregate([
            { $match: matchObj },
            {
                $project: {
                    user: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$receiverId',
                            else: '$senderId',
                        },
                    },
                    chatId: 1,
                    latestMessage: 1,
                    lastChatOn: 1,
                    isTyping: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$userChatDetail.isTyping',
                            else: '$reccieverChatDetail.isTyping',
                        },
                    },
                    unreadCount: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$userChatDetail.unReadCount',
                            else: '$reccieverChatDetail.unReadCount',
                        },
                    },
                    inChatScreen: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$userChatDetail.isInChatScreen',
                            else: '$reccieverChatDetail.isInChatScreen',
                        },
                    }
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: '$userInfo._id',
                    phoneNumber: '$userInfo.phoneNumber',
                    fullName: '$userInfo.fullName',
                    profilePicture: '$userInfo.profilePicture',
                    isOnline: '$userInfo.onlineStatus',
                    lastSeen: '$userInfo.lastSeen',
                    latestMessage: 1,
                    lastChatOn: 1,
                    chatId: 1,
                    isTyping: 1,
                    unreadCount: 1,
                    inChatScreen: 1,
                    chatBlocked: 1,
                    blockedBy: 1,
                },
            },
            { $sort: { lastChatOn: -1 } },
        ]);

        return users;
    } catch (error) {
        console.error('Error fetching chat users list:', error);
        return null;
    }
};



const getAllChatMessagesFromRepo = async (skip, Limit, chatId) => {
    try {
        return chatMessage.find({ chatId: chatId }).skip(Number(skip)).limit(Number(Limit)).sort({ createdAt: -1 })
    } catch (error) {
        return createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)
    }

}

const updateInchatScreen = async (chatId, setObj) => {
    try {
        return await chatList.updateOne({ chatId }, { $set: setObj })

    } catch (error) {
        return createResponse(false, localeKeys.global.SOMETHING_WENT_WRONG, statusCode.INTERNAL_SERVER_ERROR, {}, error)
    }
}
const updateStatusOnline = async (userId, status) => {
    try {
        const lastSeen = new Date();

        if (status) {
            await userModel.findByIdAndUpdate(userId, { onlineStatus: status });
        } else {
            await userModel.findByIdAndUpdate(userId, { onlineStatus: status, lastSeen });
        }


        return lastSeen;

    } catch (error) {
        console.error('Error updating online status:', error);
        return null; // Return a fallback value in case of an error
    }
};

const getReceiverId = async (userId) => {
    try {
        // Step 1: Prepare the match object for aggregation
        const matchObj = {
            $or: [
                { senderId: new ObjectId(String(userId)) },
                { receiverId: new ObjectId(String(userId)) },
            ],
        };

        // Step 2: Execute the aggregation query
        const users = await chatList.aggregate([{ $match: matchObj }]);

        // Step 3: Filter the users to get the receiver IDs
        const filteredUsers = [];
        for (const user of users) {
            const otherUserId = String(user.senderId) === String(userId)
                ? user.receiverId
                : user.senderId;

            filteredUsers.push({
                chatId: user.chatId,
                otherUser: otherUserId.toString(),
            });
        }
        return filteredUsers;

    } catch (error) {
        console.error('Error in getReceiverId:', error);
        return [];
    }
};

const updateMessageSeen = async (chatId, userId) => {
    try {
        if (!chatId || !userId) {
            console.warn('Invalid chatId or userId:', { chatId, userId });
            return;
        }



        // Mark all unseen messages as seen
        const result = await chatMessage.updateMany(
            { chatId: chatId, receiverId: userId, seen: false },
            { $set: { seen: true } }
        );

        // Fetch the chat details
        const chat = await chatList.findOne({ chatId });
        if (!chat) {
            console.warn('Chat not found for chatId:', chatId);
            return;
        }

        // Determine which field to update based on the userId
        let updateData = {};
        if (chat.senderId.toString() === userId.toString()) {
            updateData = { 'userChatDetail.unReadCount': 0 };
        } else if (chat.receiverId.toString() === userId.toString()) {
            updateData = { 'reccieverChatDetail.unReadCount': 0 };
        } else {

            return;
        }

        // Update the chat list to reset the unread count
        await chatList.findOneAndUpdate(
            { chatId },
            { $set: updateData },
            { new: true }
        );

        if (result.modifiedCount > 0) {

        } else {

        }
    } catch (error) {
        console.error('Error updating message seen status for chatId:', chatId, 'and userId:', userId, error);
    }
};



const checkUnreadCount = async (chatId, receiverId) => {
    try {
        const count = await chatMessage.find({ chatId: chatId, receiverId: receiverId, seen: false }).countDocuments()
        return count;
    } catch (error) {
        console.error('Error updating message seen status:', error);
    }
}


module.exports = { checkUnreadCount, checkUser, checkChat, updateChatList, saveNewChat, saveNewMessage, getChatUsersList, getAllChatMessagesFromRepo, updateInchatScreen, updateStatusOnline, getReceiverId, updateMessageSeen }