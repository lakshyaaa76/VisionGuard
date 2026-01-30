// This script should be run from the command line to create the first admin user.
// Example: npm run seed:admin "Your Name" "admin@example.com" "your-secure-password"

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in .env file. Please ensure it is set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error(`Error connecting to DB for seeding: ${err.message}`);
    process.exit(1);
  }
};

const createAdmin = async (name, email, password) => {
  if (!name || !email || !password) {
    console.error('Usage: npm run seed:admin "<name>" "<email>" "<password>"');
    process.exit(1);
  }

  try {
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (adminExists) {
      console.log('An admin user already exists. Aborting.');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    console.log(`Admin user '${name}' created successfully!`);
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  const [name, email, password] = process.argv.slice(2);
  await createAdmin(name, email, password);
};

run();
