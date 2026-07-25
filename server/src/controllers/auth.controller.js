const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password, res);
    return success(res, 'Login successful', result);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const logout = (req, res) => {
  authService.logout(res);
  return success(res, 'Logged out successfully');
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.refresh(token, res);
    return success(res, 'Token refreshed', result);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const me = (req, res) => {
  return success(res, 'User fetched', { user: req.user });
};

module.exports = { login, logout, refresh, me };
