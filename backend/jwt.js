const jwt = require('jsonwebtoken');

const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '8h';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            'JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.'
        );
    }

    return secret;
};

// Middleware
const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' });
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Expected a "Bearer <token>" Authorization header' });
    }

    try {
        req.user = jwt.verify(token, getSecret());
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Generate Token
const generateToken = (userData) => {
    return jwt.sign(userData, getSecret(), { expiresIn: TOKEN_EXPIRY });
};

module.exports = { jwtAuthMiddleware, generateToken };
