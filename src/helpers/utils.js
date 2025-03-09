const crypto = require('crypto')
const random = require('simple-random-number-generator');
const { Expo } = require('expo-server-sdk');


const expo = new Expo();

module.exports = {

  getMessageFromValidationError: (error) => error.details[0].message.replace(/"/g, ''),


  generateChatId: () => {
    const params = {
      min: 100000,
      max: 900000,
      integer: true,
    };

    const randSixDigit = random(params);

    const randStringDigit = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CHID${randSixDigit}${randStringDigit}`;
  },

  sendPushNotification: async (deviceToken, senderName, message) => {
    const notificationMessage = {
      to: deviceToken,
      sound: 'default',
      title: `New message from ${senderName}`,
      body: message,
      data: { senderName, message },
    };

    try {
      const ticketChunk = await expo.sendPushNotificationsAsync([notificationMessage]);

    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}