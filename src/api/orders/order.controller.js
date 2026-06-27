const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");
const orderService = require("./order.service");
const connectToDatabase = require("../../database/mongoose");

const createOrder = asyncHandler(async (req, res) => {
  await connectToDatabase();
  const order = await orderService.createOrderFromCart(req.user.id, req.body);
  sendResponse(res, 201, "Order created.", { order, orderId: order._id });
});

const createDirectOrder = asyncHandler(async (req, res) => {
  await connectToDatabase();
  const order = await orderService.createDirectOrder(req.user.id, req.body);
  sendResponse(res, 201, "Order created.", { order, orderId: order._id });
});

const listMyOrders = asyncHandler(async (req, res) => {
  await connectToDatabase();
  const orders = await orderService.listMyOrders(req.user.id);
  sendResponse(res, 200, "Orders fetched.", { orders });
});

const listOrders = asyncHandler(async (_req, res) => {
  await connectToDatabase();
  const orders = await orderService.listOrders();
  sendResponse(res, 200, "Orders fetched.", { orders });
});

const getOrder = asyncHandler(async (req, res) => {
  await connectToDatabase();
  const order = await orderService.getOrder(req.params.id, req.user);
  sendResponse(res, 200, "Order fetched.", { order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  await connectToDatabase();
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status,
  );
  sendResponse(res, 200, "Order status updated.", { order });
});

module.exports = {
  createOrder,
  createDirectOrder,
  listMyOrders,
  listOrders,
  getOrder,
  updateOrderStatus,
};
