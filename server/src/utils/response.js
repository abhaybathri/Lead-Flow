const success = (res, message, data = null, statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

const error = (res, message, statusCode = 500, errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, error };
