const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const Student = require('../models/Student');
const FeeRecord = require('../models/FeeRecord');
const { protect } = require('../middleware/authMiddleware');

// @desc    Export student list to Excel
// @route   GET /api/reports/students/excel
// @access  Private
router.get('/students/excel', protect, async (req, res) => {
    const { form, stream } = req.query;
    const filter = {};
    if (form) filter.form = form;
    if (stream) filter.stream = stream;

    const students = await Student.find(filter);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
        { header: 'Admission No', key: 'admissionNumber', width: 15 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Form', key: 'form', width: 10 },
        { header: 'Stream', key: 'stream', width: 10 },
        { header: 'Cleared', key: 'isCleared', width: 10 },
    ];

    students.forEach((s) => worksheet.addRow(s));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Export fee report to Excel
// @route   GET /api/reports/fees/excel
// @access  Private
router.get('/fees/excel', protect, async (req, res) => {
    const fees = await FeeRecord.find({}).populate('student');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fees');

    worksheet.columns = [
        { header: 'Student Name', key: 'studentName', width: 30 },
        { header: 'Admission No', key: 'admissionNumber', width: 15 },
        { header: 'Total Paid', key: 'totalPaid', width: 15 },
        { header: 'Balance', key: 'balance', width: 15 },
    ];

    fees.forEach((f) => {
        worksheet.addRow({
            studentName: f.student.name,
            admissionNumber: f.student.admissionNumber,
            totalPaid: f.totalPaid,
            balance: f.balance,
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=fees.xlsx');

    await workbook.xlsx.write(res);
    res.end();
});

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

module.exports = router;
