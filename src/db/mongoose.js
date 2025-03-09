// core modules

const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

mongoose.connection.on('connected', () => {
    console.log('info MongoDB is connected');
});

mongoose.connection.on('error', (err) => {
    console.log('error', err);
    process.exit(-1);
});

mongoose.set('strictQuery', true);

exports.connect = () => {
    mongoose.connect(process.env.DB_URL, {


    });
    return mongoose.connection;
};
