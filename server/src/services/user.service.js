const User = require('../models/User');

const getAllUsers = async () => {
  return User.find().select('-password').sort({ createdAt: -1 });
};

const createUser = async (data) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw { statusCode: 409, message: 'Email already exists' };
  return User.create(data);
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');
  return user;
};

module.exports = { getAllUsers, createUser, updateUserStatus };
