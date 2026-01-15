const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer Storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Images only!');
        }
    },
});

// @desc    Get all students
// @route   GET /api/students
// @access  Private
router.get('/', protect, async (req, res) => {
    const students = await Student.find({});
    res.json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
});

// @desc    Add new student
// @route   POST /api/students
// @access  Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
    const { admissionNumber, name, form, stream } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    const studentExists = await Student.findOne({ admissionNumber });
    if (studentExists) {
        res.status(400).json({ message: 'Student with this admission number already exists' });
        return;
    }

    const student = new Student({
        admissionNumber,
        name,
        form,
        stream,
        photo,
    });

    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        student.name = req.body.name || student.name;
        student.admissionNumber = req.body.admissionNumber || student.admissionNumber;
        student.form = req.body.form || student.form;
        student.stream = req.body.stream || student.stream;
        if (req.file) {
            student.photo = `/uploads/${req.file.filename}`;
        }

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        await Student.deleteOne({ _id: student._id });
        res.json({ message: 'Student removed' });
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
});

module.exports = router;
