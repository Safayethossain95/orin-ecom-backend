const User = require("../users/user.model");
const AppError = require("../../utils/app-error");
const { signToken } = require("../../utils/jwt");

const createTokenResponse = (user) => ({
  token: signToken({ id: user._id, role: user.role }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

const register = async (payload) => {
  const user = await User.create(payload);
  return createTokenResponse(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account is inactive.", 403);
  }

  return createTokenResponse(user);
};

module.exports = {
  register,
  login,
};
