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
            name: 'DAVE',
            email: 'admin@shupavu.ac.ke',
            password: 'admin123',
            role: 'Admin',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DAVE'
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
            totalFeePerTerm: 15000,
        });

        // Generate Students
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Emily', 'James', 'Jessica', 'William', 'Elizabeth', 'Joseph', 'Mary', 'Charles', 'Patricia', 'Daniel', 'Jennifer', 'Matthew', 'Linda'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        let studentCount = 1;
        const streams = ['N', 'E', 'S', 'W'];
        const forms = [1, 2, 3, 4];

        console.log('Generating students...');

        for (const form of forms) {
            for (const stream of streams) {
                console.log(`Seeding Form ${form} ${stream}...`);
                for (let i = 0; i < 20; i++) {
                    const admissionNumber = `S${String(studentCount).padStart(4, '0')}`;
                    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

                    const student = await Student.create({
                        admissionNumber,
                        name,
                        form,
                        stream,
                        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${admissionNumber}`,
                        isCleared: Math.random() > 0.3 // Randomly set some as not cleared
                    });

                    // Initialize Fee Record
                    await FeeRecord.create({
                        student: student._id,
                        payments: [],
                        totalPaid: 0,
                        balance: settings.totalFeePerTerm * 3, // Assuming 3 terms
                    });

                    studentCount++;
                }
            }
        }

        console.log(`Total students seeded: ${studentCount - 1}`);
        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
