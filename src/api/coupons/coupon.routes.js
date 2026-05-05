const express = require("express");
const couponController = require("./coupon.controller");
const { createCouponSchema, updateCouponSchema } = require("./coupon.validation");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/", couponController.listCoupons);
router.post("/", validate(createCouponSchema), couponController.createCoupon);
router.patch("/:id", validate(idParam), validate(updateCouponSchema), couponController.updateCoupon);
router.delete("/:id", validate(idParam), couponController.deleteCoupon);

module.exports = router;
