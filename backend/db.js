require('dotenv').config();
const mongoose = require('mongoose');


const mongoURL = process.env.MONGODB_URL;

// setupe MongoDB connection
mongoose.connect(mongoURL);


const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected to mongodb server');
});

db.on('error', (err) => {
    console.log('MongoDB connection error', err);
})

module.exports = db;