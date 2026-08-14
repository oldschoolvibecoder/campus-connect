const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }, type: { type: String, required: true, trim: true },
    date: { type: Date, required: true }, location: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 400 }
}, { timestamps: true });
module.exports = mongoose.model('Event', EventSchema);
