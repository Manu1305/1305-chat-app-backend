// modules

const router = require('express-promise-router')();
const authController = require('./auth.controller');
const passport = require('passport');

router.post('/register', authController.register);
// router.post('/verifyaccount', authController.verifyAccount);
// router.post('/resend-otp', authController.resendVerificationCode);
router.post('/login', authController.login);

const requireAuth = passport.authenticate('accessTokenAuth', { session: false });
// const requireRefreshAuth = passport.authenticate('refreshTokenAuth', { session: false });
const { requireAuthToken } = require('../../../../middleware/apiRequest');

// router.get('/refresh-token', requireAuthToken, requireRefreshAuth, authController.refreshToken);
router.get('/logout', requireAuth, authController.logout);
// router.delete('/delete-account', requireAuth, authController.deleteAccount);

module.exports = router;
