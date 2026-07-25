const userService = require('../services/user.service');
const { success, error } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return success(res, 'Users fetched successfully', { users });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return success(res, 'User created successfully', { user }, 201);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return error(res, 'isActive must be a boolean', 400);
    }
    const user = await userService.updateUserStatus(req.params.userId, isActive);
    if (!user) return error(res, 'User not found', 404);
    return success(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, updateUserStatus };
