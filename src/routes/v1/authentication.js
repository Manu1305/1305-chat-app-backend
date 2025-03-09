const router = require('express-promise-router')();

const appAuthRoutes = require('../../v1/app/controllers/auth/auth.routes.js');

router.use(appAuthRoutes);

module.exports = router;
