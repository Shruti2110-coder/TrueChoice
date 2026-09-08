const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    age: { type: Number },
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    address: { type: String, trim: true },
    aadharCardNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    roles: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    isVoted: { type: Boolean, default: false },
    votedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', default: null }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Never let the password hash reach the client
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
