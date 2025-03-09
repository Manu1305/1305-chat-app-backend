const router = require('express-promise-router')();
const passport = require('passport');

const {
    requireApiKey,
    requireAuthToken,
} = require('../middleware/apiRequest');

const authenticationV1 = require('./v1/authentication');
const chatRouter = require('../v1/app/socket/chatSocketss/chatRouter')
require('../helpers/passport');
const requireAuth = passport.authenticate('accessTokenAuth', { session: false });

// const advertisementRoutes = require('../v1/app/controllers/advertisement/advertisement.routes');
// const appChatRoute = require('../v1/app/controllers/chat/chat.routes');

// const appV1 = require('./v1/app');

router.use(requireApiKey);
// require('../helpers/passport');

router.use('/v1/app/auth', authenticationV1);
router.use(requireAuthToken);
router.use(requireAuth);
router.use('/v1/app/chat', chatRouter)


module.exports = router;
