const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../utils/emailService');

// Create order/refill request (Patient only)
router.post('/', auth, authorize(['Patient']), async (req, res) => {
    try {
        const { medicines } = req.body;
        const newOrder = new Order({
            userId: req.user.userId,
            medicines,
            type: 'refill'
        });
        await newOrder.save();
        res.json({ message: 'Order created', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get user orders (Patient only)
router.get('/', auth, authorize(['Patient']), async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).send('Server error'); }
});

// Get all orders (Pharmacist only)
router.get('/all', auth, authorize(['Pharmacist']), async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).send('Server error'); }
});

// Update order status (Pharmacist only) — sends email notification to patient
router.patch('/:id/status', auth, authorize(['Pharmacist']), async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // Fetch the patient's details to send email
        const patient = await User.findById(order.userId).select('name email');
        if (patient && patient.email) {
            sendOrderStatusEmail(patient.email, patient.name, order)
                .catch(err => console.error('[Email] Order status email failed:', err));
        }

        res.json(order);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
