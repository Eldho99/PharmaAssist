const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const { auth, authorize } = require('../middleware/auth');

// Get all deliveries for the logged-in agent
router.get('/my-tasks', auth, authorize(['Delivery']), async (req, res) => {
    try {
        console.log('Fetching tasks for agent:', req.user.userId);
        const tasks = await Delivery.find({ agentId: req.user.userId })
            .populate({
                path: 'orderId',
                populate: { path: 'userId', select: 'name phone' }
            })
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error('Fetch tasks error:', err);
        res.status(500).send('Server error');
    }
});

// Seed mock data
router.post('/seed', auth, authorize(['Delivery']), async (req, res) => {
    try {
        console.log('Seeding for agent:', req.user.userId);
        const count = await Delivery.countDocuments({ agentId: req.user.userId });
        if (count === 0) {
            const mockDelivery = new Delivery({
                orderId: new mongoose.Types.ObjectId(),
                agentId: new mongoose.Types.ObjectId(req.user.userId),
                customerLocation: { lat: 9.9312, lng: 76.2673, address: 'Panampilly Nagar, Kochi' },
                pharmacyLocation: { lat: 9.9816, lng: 76.2999, name: 'Main Street Pharmacy' },
                status: 'assigned',
                distance: '4.2 km',
                estimatedTime: '15 mins',
                earnings: 45
            });
            await mockDelivery.save();
            console.log('Mock delivery created');
            return res.json(mockDelivery);
        }
        res.json({ message: 'Already has tasks' });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create task
router.post('/create', auth, async (req, res) => {
    try {
        const { orderId } = req.body;
        const User = require('../models/User');
        const agent = await User.findOne({ role: 'Delivery' });

        if (!agent) {
            console.log('No delivery agent found');
            return res.status(404).send('No delivery agent available');
        }

        const delivery = new Delivery({
            orderId,
            agentId: agent._id,
            customerLocation: { lat: 9.9444, lng: 76.2923, address: 'High Street, Kochi' },
            pharmacyLocation: { lat: 9.9816, lng: 76.2999, name: 'PharmaAssist Main Hub' },
            status: 'assigned',
            distance: '6.5 km',
            estimatedTime: '25 mins',
            earnings: 60
        });

        await delivery.save();
        console.log('Delivery task created and assigned to:', agent.name);
        res.json(delivery);
    } catch (err) {
        console.error('Create delivery error:', err);
        res.status(500).send(err.message);
    }
});

// Update status
router.patch('/:id/status', auth, authorize(['Delivery']), async (req, res) => {
    try {
        const { status } = req.body;
        const delivery = await Delivery.findOneAndUpdate(
            { _id: req.params.id, agentId: req.user.userId },
            { status },
            { new: true }
        );
        res.json(delivery);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
