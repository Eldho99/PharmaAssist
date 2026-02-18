const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    extractedText: { type: String },
    medicines: [{
        name: String,
        dosage: String,
        frequency: String
    }],
    status: { type: String, enum: ['pending', 'processed', 'dispatched', 'delivered'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
