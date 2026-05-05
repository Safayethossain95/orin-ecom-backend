const env = require("../../config/env");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");
const authService = require("./auth.service");

const setTokenCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.env === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + env.jwtCookieExpiresInDays * 24 * 60 * 60 * 1000),
  });
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  setTokenCookie(res, result.token);
  sendResponse(res, 201, "Registration successful.", result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setTokenCookie(res, result.token);
  sendResponse(res, 200, "Login successful.", result);
});

const me = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Current user fetched.", { user: req.user });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken");
  sendResponse(res, 200, "Logout successful.");
});

module.exports = {
  register,
  login,
  me,
  logout,
};
