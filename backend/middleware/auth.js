const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticateJWT = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findById(req.user.id);
    if (!user || user.status !== 'ACTIVE') {
        return res.status(401).json({ msg: 'User not active or not found, authorization denied' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
