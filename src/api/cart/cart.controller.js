const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");
const cartService = require("./cart.service");

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreateCart(req.user.id);
  sendResponse(res, 200, "Cart fetched.", { cart });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body.productId, req.body.quantity);
  sendResponse(res, 200, "Item added to cart.", { cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body.quantity);
  sendResponse(res, 200, "Cart item updated.", { cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  sendResponse(res, 200, "Cart item removed.", { cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  sendResponse(res, 200, "Cart cleared.", { cart });
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
