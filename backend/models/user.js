const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    email: { type: String },
    mobile: { type: String },
    address: { type: String },
    aadharCardNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    isVoted: { type: Boolean, default: false }
});

// Hash password before saving
userSchema.pre('save', async function() {
    try {
        if (!this.isModified('password')) return ;
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        ;
    } catch (error) {
        next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
