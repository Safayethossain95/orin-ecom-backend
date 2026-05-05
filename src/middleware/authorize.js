const AppError = require("../utils/app-error");

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You are not authorized to perform this action.", 403));
  }

  next();
};

module.exports = authorize;
