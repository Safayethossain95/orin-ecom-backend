const express = require("express");
const orderController = require("./order.controller");
const { createOrderSchema, updateOrderStatusSchema } = require("./order.validation");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.use(protect);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/my-orders", orderController.listMyOrders);
router.get("/:id", validate(idParam), orderController.getOrder);

router.use(authorize(ROLES.ADMIN));
router.get("/", orderController.listOrders);
router.patch("/:id/status", validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
