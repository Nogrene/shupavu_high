const express = require('express');
const router = express.Router();
const FeeRecord = require('../models/FeeRecord');
const Setting = require('../models/Setting');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private
router.get('/', protect, async (req, res) => {
    const fees = await FeeRecord.find({}).populate('student');
    res.json(fees);
});

// @desc    Get fee record by student ID
// @route   GET /api/fees/student/:id
// @access  Private
router.get('/student/:id', protect, async (req, res) => {
    let fee = await FeeRecord.findOne({ student: req.params.id }).populate('student');

    if (!fee) {
        // Initialize fee record if not exists
        const settings = await Setting.findOne();
        const totalFee = settings ? settings.totalFeePerSemester * 3 : 45000; // 3 semesters
        fee = new FeeRecord({
            student: req.params.id,
            payments: [],
            totalPaid: 0,
            balance: totalFee
        });
        await fee.save();
        fee = await FeeRecord.findOne({ student: req.params.id }).populate('student');
    }

    res.json(fee);
});

// @desc    Record payment
// @route   POST /api/fees/payment
// @access  Private
router.post('/payment', protect, async (req, res) => {
    const { studentId, amount, semester, year } = req.body;

    let fee = await FeeRecord.findOne({ student: studentId });
    const settings = await Setting.findOne();
    const totalFeePerYear = (settings ? settings.totalFeePerSemester : 15000) * 3;

    if (!fee) {
        fee = new FeeRecord({
            student: studentId,
            payments: [],
            totalPaid: 0,
            balance: totalFeePerYear
        });
    }

    fee.payments.push({ amount, semester, year });
    fee.totalPaid = fee.payments.reduce((acc, curr) => acc + curr.amount, 0);
    fee.balance = totalFeePerYear - fee.totalPaid;

    const updatedFee = await fee.save();

    // Update student clearance status
    if (fee.balance <= 0) {
        await Student.findByIdAndUpdate(studentId, { isCleared: true });
    } else {
        await Student.findByIdAndUpdate(studentId, { isCleared: false });
    }

    res.status(201).json(updatedFee);
});

module.exports = router;
