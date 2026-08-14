const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: ['Books', 'Notes', 'Lab Equipment', 'Stationery', 'Calculators', 'Engineering Tools', 'Other'] },
    price: { type: Number, min: 0, default: 0 },
    listingType: { type: String, enum: ['Sell', 'Buy', 'Exchange'], default: 'Sell' },
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'Good' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Active', 'Reserved', 'Closed'], default: 'Active' }
}, { timestamps: true });

ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ category: 1, status: 1 });
module.exports = mongoose.model('Item', ItemSchema);
