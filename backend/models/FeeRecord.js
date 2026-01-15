const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    semester: { type: Number, required: true, enum: [1, 2, 3] },
    year: { type: Number, default: new Date().getFullYear() }
});

const feeRecordSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    payments: [paymentSchema],
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
}, { timestamps: true });

const FeeRecord = mongoose.model('FeeRecord', feeRecordSchema);
module.exports = FeeRecord;
