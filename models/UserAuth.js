const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true, minlength: 2 },
        lastName: { type: String, required: true, trim: true, minlength: 2 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['', 'client', 'freelancer', 'admin'], default: '' }
    },
    { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
    return {
        id: this._id.toString(),
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        role: this.role,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);
