const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { auth, authorize } = require('../middleware/auth');

// Get all medicines for user (Patient only)
router.get('/', auth, authorize(['Patient']), async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.user.userId });
        res.json(medicines);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Add a medicine
router.post('/', auth, authorize(['Patient']), async (req, res) => {
    try {
        const newMedicine = new Medicine({
            ...req.body,
            userId: req.user.userId
        });
        const medicine = await newMedicine.save();
        res.json(medicine);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update medicine (e.g. mark as taken)
router.patch('/:id/take', auth, authorize(['Patient']), async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        if (medicine.stock > 0) {
            medicine.stock -= 1;
        }

        await medicine.save();
        res.json(medicine);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete medicine
router.delete('/:id', auth, authorize(['Patient']), async (req, res) => {
    try {
        await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: 'Medicine deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
