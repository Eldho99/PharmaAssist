const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String }, // e.g. "500mg"
    frequency: { type: String }, // e.g. "Twice a day"
    times: [{ type: String }], // e.g. ["08:00", "20:00"]
    stock: { type: Number, default: 0 },
    refillThreshold: { type: Number, default: 5 },
    lastRefilled: { type: Date },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medicine', MedicineSchema);
