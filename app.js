const http = require('http');

const mongoose = require('./src/db/mongoose');
const expressApp = require('./app.config');

// server setup
const port = process.env.PORT || 4000;
const server = http.createServer(expressApp);
const {setupSocket} = require('./src/v1/app/socket/socketChat')


const io = setupSocket(server);
global.io = io;

server.listen(port, (err) => {
    if (err) {
        console.log('error', err);
        process.exit(-1);
    }

    mongoose.connect();
    console.log('running on port', port);
});

module.exports = server;
