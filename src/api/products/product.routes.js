const express = require("express");
const productController = require("./product.controller");
const {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} = require("./product.validation");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.get("/", validate(listProductsSchema), productController.listProducts);
router.get("/:id", productController.getProduct);

router.use(protect, authorize(ROLES.SELLER, ROLES.ADMIN));
router.post("/", validate(createProductSchema), productController.createProduct);
router.patch("/:id", validate(idParam), validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", validate(idParam), productController.deleteProduct);

module.exports = router;
