const express = require("express");
const authController = require("./auth.controller");
const { loginSchema, registerSchema } = require("./auth.validation");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.me);

module.exports = router;
