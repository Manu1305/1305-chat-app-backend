const http = require('http');

const mongoose = require('./src/db/mongoose');
const expressApp = require('./app.config');

// server setup
const port = process.env.PORT || 4000;
const server = http.createServer(expressApp);
const { setupSocket } = require('./src/v1/app/socket/socketChat')


const io = setupSocket(server);
global.io = io;

server.listen(port, (err) => {
    if (err) {

        process.exit(-1);
    }

    mongoose.connect();

});

module.exports = server;
