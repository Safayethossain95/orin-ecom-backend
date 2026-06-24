const express = require("express");
const authRoutes = require("../api/auth/auth.routes");
const cartRoutes = require("../api/cart/cart.routes");
const categoryRoutes = require("../api/categories/category.routes");
const couponRoutes = require("../api/coupons/coupon.routes");
const orderRoutes = require("../api/orders/order.routes");
const paymentRoutes = require("../api/payments/payment.routes");
const productRoutes = require("../api/products/product.routes");
const reviewRoutes = require("../api/reviews/review.routes");
const userRoutes = require("../api/users/user.routes");
const orderController = require("../api/orders/order.controller");
const { createOrderSchema } = require("../api/orders/order.validation");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const sendResponse = require("../utils/send-response");

const router = express.Router();

router.get("/health", (_req, res) => {
  sendResponse(res, 200, "API is healthy.");
});

// Legacy /create-order endpoint expected by some clients
router.post(
  "/create-order",
  protect,
  validate(createOrderSchema),
  orderController.createOrder,
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/coupons", couponRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
