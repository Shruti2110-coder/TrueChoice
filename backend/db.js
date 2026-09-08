require('dotenv').config();
const mongoose = require('mongoose');

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

db.on('disconnected', () => {
    console.warn('Disconnected from MongoDB');
});

// Connect explicitly so the server can wait for (and fail loudly on) the connection
const connectDB = async () => {
    const mongoURL = process.env.MONGODB_URL;

    if (!mongoURL) {
        throw new Error(
            'MONGODB_URL is not set. Copy backend/.env.example to backend/.env and fill it in.'
        );
    }

    // Fail fast with a readable message instead of hanging for the 30s default
    await mongoose.connect(mongoURL, {
        serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 10000
    });
    return db;
};

module.exports = { db, connectDB };
