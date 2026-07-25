const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const login = async (email, password, res) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw { statusCode: 401, message: 'Invalid email or password' };
  if (!user.isActive) throw { statusCode: 403, message: 'Account is deactivated' };

  const valid = await user.comparePassword(password);
  if (!valid) throw { statusCode: 401, message: 'Invalid email or password' };

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userObj = user.toJSON();
  return { user: userObj, accessToken, refreshToken };
};

const refresh = async (token, res) => {
  if (!token) throw { statusCode: 401, message: 'Refresh token required' };

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw { statusCode: 401, message: 'Invalid or expired refresh token' };
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw { statusCode: 401, message: 'User not found or inactive' };

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

const logout = (res) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};

module.exports = { login, refresh, logout };
