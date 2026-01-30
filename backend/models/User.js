const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['CANDIDATE', 'PROCTOR', 'ADMIN'],
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
