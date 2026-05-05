const Cart = require("./cart.model");
const Product = require("../products/product.model");
const AppError = require("../../utils/app-error");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "name slug images stock");

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const addItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product || !product.isPublished) throw new AppError("Product not available.", 404);
  if (product.stock < quantity) throw new AppError("Insufficient product stock.", 409);

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { upsert: true, new: true }
  );

  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);

  if (item) {
    item.quantity += quantity;
    item.priceSnapshot = product.price;
  } else {
    cart.items.push({ product: productId, quantity, priceSnapshot: product.price });
  }

  await cart.save();
  return getOrCreateCart(userId);
};

const updateItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);

  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);
  if (!item) throw new AppError("Cart item not found.", 404);

  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) throw new AppError("Insufficient product stock.", 409);

  item.quantity = quantity;
  item.priceSnapshot = product.price;
  await cart.save();
  return getOrCreateCart(userId);
};

const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return getOrCreateCart(userId);
};

const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
  return getOrCreateCart(userId);
};

module.exports = {
  getOrCreateCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
