const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const FeeRecord = require('../models/FeeRecord');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }
    res.json(settings);
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
    let settings = await Setting.findOne();
    if (settings) {
        settings.streams = req.body.streams || settings.streams;
        settings.totalFeePerTerm = req.body.totalFeePerTerm || settings.totalFeePerTerm;
        settings.currentTerm = req.body.currentTerm || settings.currentTerm;
        settings.currentYear = req.body.currentYear || settings.currentYear;
        const updatedSettings = await settings.save();

        // Update all fee records and student clearance status
        const feePerTerm = updatedSettings.totalFeePerTerm;
        const currentTerm = updatedSettings.currentTerm;
        const annualFee = feePerTerm * 3;
        const requiredAmount = currentTerm * feePerTerm;

        const allFeeRecords = await FeeRecord.find({});
        for (const record of allFeeRecords) {
            record.balance = annualFee - record.totalPaid;
            await record.save();

            if (record.totalPaid >= requiredAmount) {
                await Student.findByIdAndUpdate(record.student, { isCleared: true });
            } else {
                await Student.findByIdAndUpdate(record.student, { isCleared: false });
            }
        }

        res.json(updatedSettings);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
});

module.exports = router;
