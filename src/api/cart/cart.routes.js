const express = require("express");
const cartController = require("./cart.controller");
const { addCartItemSchema, updateCartItemSchema } = require("./cart.validation");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = express.Router();

router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.patch("/items/:productId", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

module.exports = router;
