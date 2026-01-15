const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Setting = require('./models/Setting');
const FeeRecord = require('./models/FeeRecord');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Student.deleteMany();
        await Setting.deleteMany();
        await FeeRecord.deleteMany();

        // Create Admin
        const admin = await User.create({
            name: 'School Admin',
            email: 'admin@shupavu.ac.ke',
            password: 'admin123',
            role: 'Admin',
        });

        // Create Teacher
        await User.create({
            name: 'Jane Teacher',
            email: 'jane@shupavu.ac.ke',
            password: 'teacher123',
            role: 'Teacher',
        });

        // Create Initial Settings
        const settings = await Setting.create({
            streams: ['N', 'E', 'S', 'W'],
            totalFeePerSemester: 15000,
        });

        // Create some students
        const students = [
            { admissionNumber: 'S001', name: 'John Doe', form: 1, stream: 'N' },
            { admissionNumber: 'S002', name: 'Mary Smith', form: 2, stream: 'E' },
            { admissionNumber: 'S003', name: 'Peter Pan', form: 1, stream: 'W' },
        ];

        for (const s of students) {
            const createdStudent = await Student.create(s);

            // Initialize Fee Record
            await FeeRecord.create({
                student: createdStudent._id,
                payments: [],
                totalPaid: 0,
                balance: settings.totalFeePerSemester * 3,
            });
        }

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
