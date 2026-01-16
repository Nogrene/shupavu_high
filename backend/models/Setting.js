const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    streams: { type: [String], default: ['N', 'E', 'S', 'W'] },
    totalFeePerTerm: { type: Number, default: 15000 },
    schoolMotto: { type: String, default: 'Usiwe Mjinga' },
    schoolName: { type: String, default: 'Shupavu High' },
    currentTerm: { type: Number, default: 1, enum: [1, 2, 3] },
    currentYear: { type: Number, default: new Date().getFullYear() }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
