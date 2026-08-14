const mongoose = require('mongoose');
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    semester: { type: String, required: true, trim: true, maxlength: 30 },
    department: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
NoteSchema.index({ subject: 1, semester: 1, createdAt: -1 });
module.exports = mongoose.model('Note', NoteSchema);
