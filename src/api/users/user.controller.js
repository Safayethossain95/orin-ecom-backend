const User = require("./user.model");
const AppError = require("../../utils/app-error");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort("-createdAt");
  sendResponse(res, 200, "Users fetched.", { users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  sendResponse(res, 200, "User fetched.", { user });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar", "addresses", "wishlist"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, "Profile updated.", { user });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new AppError("User not found.", 404);

  sendResponse(res, 200, "User deactivated.", { user });
});

module.exports = {
  listUsers,
  getUser,
  updateMe,
  deactivateUser,
};
