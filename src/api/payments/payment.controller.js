const Order = require("../orders/order.model");
const Payment = require("./payment.model");
const AppError = require("../../utils/app-error");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");

const createPaymentIntent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new AppError("Order not found.", 404);

  const ownsOrder = order.user.toString() === req.user.id;
  if (!ownsOrder && req.user.role !== "admin") {
    throw new AppError("You are not authorized to pay this order.", 403);
  }

  const payment = await Payment.create({
    order: order.id,
    user: req.user.id,
    amount: order.grandTotal,
    status: order.paymentMethod === "cod" ? "requires_payment" : "processing",
    metadata: { note: "Replace this placeholder with a real payment provider integration." },
  });

  sendResponse(res, 201, "Payment intent created.", { payment });
});

const markPaymentSucceeded = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status: "succeeded" },
    { new: true }
  );
  if (!payment) throw new AppError("Payment not found.", 404);

  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: "paid",
    status: "paid",
    paidAt: new Date(),
  });

  sendResponse(res, 200, "Payment marked as succeeded.", { payment });
});

module.exports = {
  createPaymentIntent,
  markPaymentSucceeded,
};
