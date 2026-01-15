const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    streams: { type: [String], default: ['N', 'E', 'S', 'W'] },
    totalFeePerSemester: { type: Number, default: 15000 },
    schoolMotto: { type: String, default: 'Usiwe Mjinga' },
    schoolName: { type: String, default: 'Shupavu High' }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
