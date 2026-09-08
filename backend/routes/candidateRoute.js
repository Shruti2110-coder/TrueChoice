const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require('../models/candidate');

// check admin role
const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return Boolean(user) && user.roles === 'admin';
    } catch (err) {
        console.error(err);
        return false;
    }
};

// Guard for the admin-only routes
const requireAdmin = async (req, res, next) => {
    if (!(await checkAdminRole(req.user.id))) {
        return res.status(403).json({ error: 'User does not have the admin role' });
    }
    next();
};

// LIVE VOTE COUNT - must stay above '/:candidateID' style routes
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });

        const record = candidates.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            count: candidate.voteCount
        }));

        res.status(200).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET ALL CANDIDATES
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: 1 });
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ADD CANDIDATE
router.post('/', jwtAuthMiddleware, requireAdmin, async (req, res) => {
    try {
        const { name, party, age } = req.body;

        // Never trust votes/voteCount from the request body
        const newCandidate = new Candidate({ name, party, age });
        const response = await newCandidate.save();

        res.status(201).json(response);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ error: err.message });
        }

        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE CANDIDATE
router.put('/:candidateID', jwtAuthMiddleware, requireAdmin, async (req, res) => {
    try {
        // Only apply the fields that were actually sent (omitUndefined was
        // removed in Mongoose 6, so build the update ourselves)
        const updates = {};
        for (const field of ['name', 'party', 'age']) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const response = await Candidate.findByIdAndUpdate(
            req.params.candidateID,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json(response);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ error: err.message });
        }

        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE CANDIDATE
router.delete('/:candidateID', jwtAuthMiddleware, requireAdmin, async (req, res) => {
    try {
        const response = await Candidate.findByIdAndDelete(req.params.candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json(response);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid candidate id' });
        }

        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// VOTE
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Claim the user's single vote atomically, so two concurrent requests
        // can't both pass an "already voted?" check and vote twice.
        const claimed = await User.findOneAndUpdate(
            { _id: userId, isVoted: false, roles: { $ne: 'admin' } },
            { $set: { isVoted: true, votedFor: candidateID } },
            { new: true }
        );

        if (!claimed) {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (user.roles === 'admin') {
                return res.status(403).json({ error: 'An admin cannot vote' });
            }
            return res.status(409).json({ error: 'You have already voted' });
        }

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            candidateID,
            { $push: { votes: { user: userId } }, $inc: { voteCount: 1 } },
            { new: true }
        );

        // Candidate disappeared between the two writes - give the user their vote back
        if (!updatedCandidate) {
            await User.updateOne({ _id: userId }, { $set: { isVoted: false, votedFor: null } });
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Vote submitted', candidate: updatedCandidate });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid candidate id' });
        }

        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
