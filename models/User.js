const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true, minlength: 4, select: false },
    department: { type: String, trim: true, maxlength: 80, default: 'Engineering' },
    year: { type: String, trim: true, maxlength: 30, default: '2nd Year' },
    skills: [{ type: String, trim: true, maxlength: 40 }],
    interests: [{ type: String, trim: true, maxlength: 40 }],
    bio: { type: String, trim: true, maxlength: 300, default: '' },
    rating: { type: Number, default: 4.8, min: 0, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
