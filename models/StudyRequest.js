const mongoose = require('mongoose');

const StudyRequestSchema = new mongoose.Schema({
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    topic: { type: String, required: true, trim: true, maxlength: 150 },
    semester: { type: String, required: true, trim: true, maxlength: 30 },
    prepLevel: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Exam Ready'] },
    location: { type: String, trim: true, maxlength: 120, default: 'Campus Library' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Open', 'Full', 'Closed'], default: 'Open' }
}, { timestamps: true });

StudyRequestSchema.index({ createdAt: -1 });
module.exports = mongoose.model('StudyRequest', StudyRequestSchema);
