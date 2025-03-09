const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local');

// helpers

const statusCode = require('./statusCodes.json');
const localesKeys = require('../locales/keys.json');

// models
const User = require('../v1/model/user.model');
const { respondError } = require('./response');

// Create local strategy
const localOptions = { usernameField: 'phoneNumber', passReqToCallback: true };
const localLogin = new LocalStrategy(localOptions, (req, phoneNumber, done) => {
    User.find({ phoneNumber }, (err, user) => {
        if (err) {
            done(respondError(localesKeys.global.TRY_AGAIN, statusCode.INTERNAL_SERVER_ERROR), false);
        }
        if (!user) {
            return done(respondError(localesKeys.auth.PLEASE_REGISTER, statusCode.NOT_FOUND), false);
        }

        return null;
    });
});

// Setup options for JWT Strategy
const accessTokenAuthOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
};

const refreshTokenAuthOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_REFRESH_SECRET,
    passReqToCallback: true,
};

// Create JWT strategy
const getJWTStrategy = (options) =>
    new JwtStrategy(options, async (req, payload, done) => {
        try {


            const user = await User.findById(payload.userId); // Use async/await

            if (!user) {
                return done(respondError(localesKeys.auth.PLEASE_LOGIN, statusCode.UNAUTHORIZED), false);
            }

            if (!user.status) {
                return done(respondError(localesKeys.auth.USER_DEACTIVE, statusCode.CONFLICT), false);
            }

            if (user.deviceType !== req.deviceType) {
                await User.updateOne({ _id: user._id }, { $set: { deviceType: req.deviceType } });
                user.deviceType = req.deviceType;
            }

            done(null, user);
        } catch (error) {
            console.error('Error in passport JWT strategy:', error);
            done(respondError(localesKeys.global.TRY_AGAIN, statusCode.INTERNAL_SERVER_ERROR), false);
        }
    });


// Create JWT strategy
const accessTokenAuth = getJWTStrategy(accessTokenAuthOptions);
const refreshTokenAuth = getJWTStrategy(refreshTokenAuthOptions);

// Tell passport to use this strategy
passport.use(localLogin);
passport.use('accessTokenAuth', accessTokenAuth);
passport.use('refreshTokenAuth', refreshTokenAuth);
