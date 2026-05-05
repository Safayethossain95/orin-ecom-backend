const express = require("express");
const userController = require("./user.controller");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.use(protect);

router.patch("/me", userController.updateMe);

router.use(authorize(ROLES.ADMIN));
router.get("/", userController.listUsers);
router.get("/:id", validate(idParam), userController.getUser);
router.patch("/:id/deactivate", validate(idParam), userController.deactivateUser);

module.exports = router;
