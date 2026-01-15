// Add this to backend/routes/report.js

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    const totalStudents = await Student.countDocuments();

    const studentsPerForm = await Student.aggregate([
        { $group: { _id: '$form', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    const studentsPerStream = await Student.aggregate([
        { $group: { _id: '$stream', count: { $sum: 1 } } }
    ]);

    const feeStats = await FeeRecord.aggregate([
        {
            $group: {
                _id: null,
                totalCollected: { $sum: '$totalPaid' },
                totalBalance: { $sum: '$balance' }
            }
        }
    ]);

    const clearedCount = await Student.countDocuments({ isCleared: true });
    const notClearedCount = await Student.countDocuments({ isCleared: false });

    res.json({
        totalStudents,
        studentsPerForm,
        studentsPerStream,
        totalCollected: feeStats[0]?.totalCollected || 0,
        totalBalance: feeStats[0]?.totalBalance || 0,
        clearance: [
            { name: 'Cleared', value: clearedCount },
            { name: 'Not Cleared', value: notClearedCount }
        ]
    });
});
