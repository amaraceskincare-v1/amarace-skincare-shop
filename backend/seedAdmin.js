const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
            isVerified: true,
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
