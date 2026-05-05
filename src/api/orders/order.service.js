const Cart = require("../cart/cart.model");
const Coupon = require("../coupons/coupon.model");
const couponService = require("../coupons/coupon.service");
const Order = require("./order.model");
const Product = require("../products/product.model");
const AppError = require("../../utils/app-error");

const createOrderFromCart = async (userId, payload) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new AppError("Cart is empty.", 400);

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isPublished) {
      throw new AppError("One or more cart products are unavailable.", 409);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`${product.name} has insufficient stock.`, 409);
    }

    subtotal += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      image: product.images?.[0],
      seller: product.seller,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const { coupon, discount } = await couponService.getValidCoupon(payload.couponCode, subtotal);
  const shippingTotal = subtotal >= 100 ? 0 : 10;
  const taxTotal = Number(((subtotal - discount) * 0.08).toFixed(2));
  const grandTotal = Math.max(subtotal - discount + shippingTotal + taxTotal, 0);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod || "cod",
    couponCode: coupon?.code,
    subtotal,
    discountTotal: discount,
    shippingTotal,
    taxTotal,
    grandTotal,
  });

  await Product.bulkWrite(
    orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }))
  );

  if (coupon) await Coupon.findByIdAndUpdate(coupon.id, { $inc: { usedCount: 1 } });
  cart.items = [];
  await cart.save();

  return order;
};

const listMyOrders = (userId) =>
  Order.find({ user: userId }).populate("items.product", "slug images").sort("-createdAt");

const listOrders = () => Order.find().populate("user", "name email").sort("-createdAt");

const getOrder = async (orderId, user) => {
  const order = await Order.findById(orderId).populate("user", "name email");
  if (!order) throw new AppError("Order not found.", 404);

  const ownsOrder = order.user._id.toString() === user.id;
  if (!ownsOrder && user.role !== "admin") {
    throw new AppError("You are not authorized to view this order.", 403);
  }

  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const updates = { status };
  if (status === "delivered") updates.deliveredAt = new Date();
  if (status === "paid") {
    updates.paymentStatus = "paid";
    updates.paidAt = new Date();
  }

  const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
  if (!order) throw new AppError("Order not found.", 404);
  return order;
};

module.exports = {
  createOrderFromCart,
  listMyOrders,
  listOrders,
  getOrder,
  updateOrderStatus,
};
