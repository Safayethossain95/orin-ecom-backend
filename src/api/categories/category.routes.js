const express = require("express");
const categoryController = require("./category.controller");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.validation");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.get("/", categoryController.listCategories);

router.use(protect, authorize(ROLES.ADMIN));
router.post("/", validate(createCategorySchema), categoryController.createCategory);
router.patch("/:id", validate(idParam), validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", validate(idParam), categoryController.deleteCategory);

module.exports = router;
