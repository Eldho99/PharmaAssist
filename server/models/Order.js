const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [{
        name: String,
        quantity: { type: Number, default: 30 }
    }],
    status: { type: String, enum: ['pending', 'processed', 'dispatched', 'delivered'], default: 'pending' },
    type: { type: String, default: 'refill' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
