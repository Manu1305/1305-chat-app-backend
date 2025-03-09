const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatSchema = new Schema(
    {
        chatId: { type: String, default: '' },
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, default: '', trim: true },
        file: { type: String, default: '' },
        isMedia: { type: Boolean, default: false },
        seen: { type: Boolean, default: false },
        deletedBy: { type: String, default: '' },

    },
    {
        timestamps: true,
    },
);
module.exports = mongoose.model('ChatMessage', ChatSchema);
