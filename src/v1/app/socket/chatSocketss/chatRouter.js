// modules

const router = require('express-promise-router')();
const chatController = require('./chatController');

router.get('/list/:chatId/:skip/:limit',chatController.getAllMessages)

module.exports = router;
