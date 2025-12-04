const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require("../models/candidate");

// check admin role
const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.roles === 'admin';
    } catch (err) {
        return false;
    }
};


// GET ALL CANDIDATES (for frontend voting page)
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'internal server error' });
  }
});


// ADD CANDIDATE
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const data = req.body;
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        res.status(200).json({ response });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

// UPDATE CANDIDATE
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const candidateID = req.params.candidateID;
        const updatedData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE CANDIDATE
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// VOTE ROUTE
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateID = req.params.candidateID;
        const userId = req.user.id;

        // find candidate
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' });
        }

        // find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        // admin cannot vote
        if (user.roles === 'admin') {
            return res.status(403).json({ message: 'admin cannot vote' });
        }

        // user can vote once
        if (user.isVoted) {
            return res.status(400).json({ message: 'you have already voted' });
        }

        // update candidate vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // update user
        user.isVoted = true;
        user.votedFor = candidateID;
        await user.save();

        res.json({ message: 'vote submitted', candidate });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

// vote count

router.get('/vote/count', async (req ,res)=>
{
    try{
        const candidate = await Candidate.find().sort({voteCount: -1 });

        const record = candidate.map((data)=>{

        
            return {
                party: data.party,
                count: data.voteCount
            }
    });

    return res.status(200).json(record)
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;
