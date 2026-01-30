const User = require('../models/User');

// @route   GET /admin/users
// @desc    Get all users
// @access  Private (ADMIN)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
