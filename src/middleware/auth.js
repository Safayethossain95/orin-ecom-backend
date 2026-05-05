const User = require("../api/users/user.model");
const AppError = require("../utils/app-error");
const asyncHandler = require("../utils/async-handler");
const { verifyToken } = require("../utils/jwt");

const getBearerToken = (req) => {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return req.cookies?.accessToken;
};

const protect = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new AppError("Authentication required.", 401);
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user || !user.isActive) {
    throw new AppError("User no longer exists or is inactive.", 401);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError("Password changed recently. Please log in again.", 401);
  }

  req.user = user;
  next();
});

module.exports = protect;
