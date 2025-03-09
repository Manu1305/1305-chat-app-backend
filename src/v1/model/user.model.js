// node modules
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({

    phoneNumber: { type: Number, default: '' },
    fullName: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    deviceToken: { type: String, default: '' },
    status: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: Number, default: '' },
    userType: { type: Number, default: 1 },
    isLogin: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: true },
    lastSeen: { type: Date, default: new Date() },
}, { timestamps: true });


// do not return password


module.exports = mongoose.model('User', userSchema);
