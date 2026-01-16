const express = require('express');
const router = express.Router();
const FeeRecord = require('../models/FeeRecord');
const Setting = require('../models/Setting');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

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
        const totalFee = settings ? settings.totalFeePerTerm * 3 : 45000; // 3 terms
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

router.post('/payment', protect, async (req, res) => {
    const { studentId, amount, term, year } = req.body;

    let fee = await FeeRecord.findOne({ student: studentId });
    const settings = await Setting.findOne();
    const feePerTerm = settings ? settings.totalFeePerTerm : 15000;
    const currentTerm = settings ? settings.currentTerm : 1;
    const annualFee = feePerTerm * 3;

    if (!fee) {
        fee = new FeeRecord({
            student: studentId,
            payments: [],
            totalPaid: 0,
            balance: annualFee
        });
    }

    // Add payment
    fee.payments.push({ amount, term, year });

    // Recalculate total paid
    fee.totalPaid = fee.payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Update balance (annual)
    fee.balance = annualFee - fee.totalPaid;

    const updatedFee = await fee.save();

    // Check clearance based on CURRENT TERM
    // Cleared if TotalPaid >= (CurrentTerm * FeePerTerm)
    const requiredAmount = currentTerm * feePerTerm;

    if (fee.totalPaid >= requiredAmount) {
        await Student.findByIdAndUpdate(studentId, { isCleared: true });
    } else {
        await Student.findByIdAndUpdate(studentId, { isCleared: false });
    }

    res.status(201).json(updatedFee);
});

// @desc    Update a payment
// @route   PUT /api/fees/payment/:studentId/:paymentId
// @access  Private/Admin
router.put('/payment/:studentId/:paymentId', protect, admin, async (req, res) => {
    const { amount, term, year } = req.body;
    let fee = await FeeRecord.findOne({ student: req.params.studentId });

    if (fee) {
        const payment = fee.payments.id(req.params.paymentId);
        if (payment) {
            payment.amount = amount !== undefined ? Number(amount) : payment.amount;
            payment.term = term !== undefined ? Number(term) : payment.term;
            payment.year = year !== undefined ? Number(year) : payment.year;

            // Recalculate
            fee.totalPaid = fee.payments.reduce((acc, curr) => acc + curr.amount, 0);
            const settings = await Setting.findOne();
            const feePerTerm = settings ? settings.totalFeePerTerm : 15000;
            const currentTerm = settings ? settings.currentTerm : 1;
            const annualFee = feePerTerm * 3;
            fee.balance = annualFee - fee.totalPaid;

            await fee.save();

            // Update clearance
            const requiredAmount = currentTerm * feePerTerm;
            if (fee.totalPaid >= requiredAmount) {
                await Student.findByIdAndUpdate(req.params.studentId, { isCleared: true });
            } else {
                await Student.findByIdAndUpdate(req.params.studentId, { isCleared: false });
            }

            res.json(fee);
        } else {
            res.status(404).json({ message: 'Payment record not found' });
        }
    } else {
        res.status(404).json({ message: 'Fee record not found' });
    }
});

// @desc    Delete a payment
// @route   DELETE /api/fees/payment/:studentId/:paymentId
// @access  Private/Admin
router.delete('/payment/:studentId/:paymentId', protect, admin, async (req, res) => {
    let fee = await FeeRecord.findOne({ student: req.params.studentId });

    if (fee) {
        fee.payments = fee.payments.filter(p => p._id.toString() !== req.params.paymentId);

        // Recalculate
        fee.totalPaid = fee.payments.reduce((acc, curr) => acc + curr.amount, 0);
        const settings = await Setting.findOne();
        const feePerTerm = settings ? settings.totalFeePerTerm : 15000;
        const currentTerm = settings ? settings.currentTerm : 1;
        const annualFee = feePerTerm * 3;
        fee.balance = annualFee - fee.totalPaid;

        await fee.save();

        // Update clearance
        const requiredAmount = currentTerm * feePerTerm;
        if (fee.totalPaid >= requiredAmount) {
            await Student.findByIdAndUpdate(req.params.studentId, { isCleared: true });
        } else {
            await Student.findByIdAndUpdate(req.params.studentId, { isCleared: false });
        }

        res.json(fee);
    } else {
        res.status(404).json({ message: 'Fee record not found' });
    }
});

module.exports = router;
