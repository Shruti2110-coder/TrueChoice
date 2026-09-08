require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// Compare by hostname, so CORS_ORIGIN accepts either a full origin
// ("https://truechoice-web.onrender.com") or a bare host that a platform
// like Render injects ("truechoice-web.onrender.com").
const toHost = (value) => {
    if (!value) return '';
    try {
        return new URL(value.includes('://') ? value : `https://${value}`).host;
    } catch {
        return '';
    }
};

const allowedHosts = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((entry) => toHost(entry.trim()))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');

            // `!origin` covers curl / same-origin requests
            if (!origin || isLocalhost || allowedHosts.includes(toHost(origin))) {
                return callback(null, true);
            }

            callback(new Error(`Origin ${origin} is not allowed by CORS`));
        }
    })
);

app.use(express.json());

// routes
const userRoutes = require('./routes/userRoutes');
const candidateRoute = require('./routes/candidateRoute');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoute);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend connected!' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Catch-all error handler, so a thrown error never leaks a stack trace
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start listening only once Mongo is actually reachable
const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

start();
