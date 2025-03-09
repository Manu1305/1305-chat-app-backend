const mongoose = require('mongoose');

const { Schema } = mongoose;

const chatListSchema = new Schema(
    {

        senderId: { type: Schema.Types.ObjectId, ref: 'User' },

        receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
        chatId: { type: String, default: '' },
        latestMessage: { type: String, default: '' },
        lastChatOn: { type: Date, default: new Date() },
        chatBlocked: { type: Boolean, default: false },
        blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        deletedBy: { type: String, default: '' },
        chatName: { type: String, default:''},
        groupImage: { type: String, default:''},
        dailyQuotes:{ type: String, default:''},
        userChatDetail: {
            _id: false,
            isInChatScreen: { type: Boolean, default: true },
            unReadCount: { type: Number, default: 0 },
            isTyping: { type: Boolean, default: false },
        },
        reccieverChatDetail: {
            _id: false,
            isInChatScreen: { type: Boolean, default: false },
            unReadCount: { type: Number, default: 0 },
            isTyping: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('ChatList', chatListSchema);
