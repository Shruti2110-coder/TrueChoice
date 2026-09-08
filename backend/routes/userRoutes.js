const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');

const MIN_PASSWORD_LENGTH = 6;

// Only these fields may ever come from the request body.
// `roles` is deliberately excluded so nobody can sign themselves up as an admin.
const pickSignupFields = (body = {}) => ({
    name: body.name,
    age: body.age === '' || body.age === undefined || body.age === null ? undefined : Number(body.age),
    email: body.email,
    mobile: body.mobile,
    address: body.address,
    aadharCardNumber: body.aadharCardNumber,
    password: body.password,
    roles: 'voter'
});

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const data = pickSignupFields(req.body);

        if (!data.name || !data.aadharCardNumber || !data.password) {
            return res.status(400).json({ error: 'Name, Aadhar number and password are required' });
        }

        if (data.password.length < MIN_PASSWORD_LENGTH) {
            return res
                .status(400)
                .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        const saved = await new User(data).save();

        const token = generateToken({ id: saved.id, roles: saved.roles });

        // saved.toJSON() strips the password hash (see models/user.js)
        res.status(201).json({ user: saved, token });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'That Aadhar number is already registered' });
        }

        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ error: err.message });
        }

        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar number and password are required' });
        }

        const user = await User.findOne({ aadharCardNumber });
        if (!user) {
            return res.status(401).json({ error: 'Invalid Aadhar number or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Aadhar number or password' });
        }

        const token = generateToken({ id: user.id, roles: user.roles });

        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PROFILE
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE PASSWORD
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ error: 'Both currentPassword and newPassword are required' });
        }

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            return res
                .status(400)
                .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = await user.comparePassword(currentPassword);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
