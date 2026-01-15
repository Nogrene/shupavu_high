const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    admissionNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    form: { type: Number, required: true, enum: [1, 2, 3, 4] },
    stream: { type: String, required: true },
    photo: { type: String }, // Path to photo
    isCleared: { type: Boolean, default: false }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
