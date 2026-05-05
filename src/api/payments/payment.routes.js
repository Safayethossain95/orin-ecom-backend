const express = require("express");
const paymentController = require("./payment.controller");
const ROLES = require("../../constants/roles");
const authorize = require("../../middleware/authorize");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam, objectId } = require("../../validators/common");
const { z } = require("zod");

const router = express.Router();

router.use(protect);

router.post(
  "/orders/:orderId/intent",
  validate(z.object({ params: z.object({ orderId: objectId }) })),
  paymentController.createPaymentIntent
);
router.patch(
  "/:id/succeed",
  validate(idParam),
  authorize(ROLES.ADMIN),
  paymentController.markPaymentSucceeded
);

module.exports = router;
