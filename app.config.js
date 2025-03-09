const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');

const rateLimit = require('express-rate-limit');
require('./src/config/env.config');

const routes = require('./src/routes');
const { respond } = require('./src/helpers/response.js');

const corsOptions = {
    origin: '*',
    exposedHeaders: 'Content-Type, X-Auth-Token',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1800,
    standardHeaders: true,
    legacyHeaders: false,
});

// express instance
const expressApp = express();

// middlewares
expressApp.use(helmet());
expressApp.use(helmet.hidePoweredBy());
expressApp.use(mongoSanitize());

expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());
expressApp.use(limiter);
expressApp.use(cors(corsOptions));

expressApp.set('trust proxy', 2);
const upload = multer({
    limits: {
        fileSize: process.env.MAXFILESIZE,
    },
});

// routes
expressApp.use('/api', upload.any(), routes, (err, res) => {
    const status = err.status || 400;
    return res.status(status).json({
        success: false,
        message: 'You\'re entered invalid url',
    });
});

// routes
expressApp.use('/', (_req, res) => res.status(200).send({
    success: true,
    message: 'Welcome to my-own-chat-app /(may your url is wrong or something missing)',
}));

expressApp.use((err, _req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const error = err;
    const status = err.statusCode || err.status || 500;
    console.error(err);
    if (error.message) {
        return respond(res, { status: false, message: error.message ? error.message.replace('Error: ', '') : err.statusMessage, statusCode: status });
    }
    return next();
});

module.exports = expressApp;
