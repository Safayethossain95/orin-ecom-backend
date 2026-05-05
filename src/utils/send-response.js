const sendResponse = (res, statusCode, message, data = undefined, meta = undefined) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    meta,
  });
};

module.exports = sendResponse;
