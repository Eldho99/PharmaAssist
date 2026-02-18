const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { auth, authorize } = require('../middleware/auth');

// Get all prescriptions (Pharmacist only)
router.get('/all', auth, authorize(['Pharmacist']), async (req, res) => {
    try {
        const prescriptions = await Prescription.find().populate('userId', 'name email').sort({ uploadedAt: -1 });
        res.json(prescriptions);
    } catch (err) { res.status(500).send('Server error'); }
});

// Update status (Pharmacist only)
router.patch('/:id/status', auth, authorize(['Pharmacist']), async (req, res) => {
    try {
        const { status } = req.body;
        const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(prescription);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
