const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const bcrypt = require('bcrypt');

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saved = await newUser.save();

        const payload = { id: saved.id };
        const token = generateToken(payload);

        res.status(200).json({ response: saved, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        const user = await User.findOne({ aadharCardNumber });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = { id: user.id };
        const token = generateToken(payload);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// PROFILE
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// UPDATE PASSWORD
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const match = await user.comparePassword(currentPassword);
        if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
