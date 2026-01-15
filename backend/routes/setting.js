const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
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
        settings.totalFeePerSemester = req.body.totalFeePerSemester || settings.totalFeePerSemester;
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
});

module.exports = router;
