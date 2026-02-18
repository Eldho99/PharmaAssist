const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    pharmacyLocation: {
        lat: Number,
        lng: Number,
        name: String
    },
    status: {
        type: String,
        enum: ['assigned', 'picked_up', 'out_for_delivery', 'delivered'],
        default: 'assigned'
    },
    distance: String,
    estimatedTime: String,
    earnings: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', DeliverySchema);
