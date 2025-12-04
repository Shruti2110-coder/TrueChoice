const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    party: { type: String, required: true },
    age: { type: Number, required: true },

    // add these 👇
    votes: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    voteCount: { type: Number, default: 0 }
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;

