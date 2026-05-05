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

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is healthy." });
});

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
