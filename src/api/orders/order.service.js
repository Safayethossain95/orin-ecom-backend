const Cart = require("../cart/cart.model");
const Coupon = require("../coupons/coupon.model");
const couponService = require("../coupons/coupon.service");
const Order = require("./order.model");
const Product = require("../products/product.model");
const mongoose = require("mongoose");
const AppError = require("../../utils/app-error");

const createOrderFromCart = async (userId, payload) => {
  // Force-insert raw order document without validation when requested
  if (payload && payload.forceInsert) {
    const orderDoc = {
      user: userId,
      items: payload.items || [],
      shippingAddress:
        payload.shippingAddress ||
        (payload.name || payload.address || payload.phone
          ? {
              fullName: payload.name || undefined,
              phone: payload.phone || undefined,
              line1: payload.address || undefined,
            }
          : undefined),
      paymentMethod: payload.paymentMethod || undefined,
      couponCode: payload.couponCode || undefined,
      subtotal: payload.subtotal ?? 0,
      discountTotal: payload.discountTotal ?? 0,
      shippingTotal: payload.shipping?.charge ?? payload.shippingTotal ?? 0,
      taxTotal: payload.taxTotal ?? 0,
      grandTotal: payload.total ?? payload.grandTotal ?? 0,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    };

    const order = new Order(orderDoc);
    await order.save({ validateBeforeSave: false });
    return order;
  }
  // If payload provides items, build order from payload (direct purchase)
  if (payload && payload.items && payload.items.length > 0) {
    const {
      name,
      address,
      phone,
      items,
      subtotal: providedSubtotal,
      shipping,
      total,
      createdAt,
    } = payload;

    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const [index, item] of items.entries()) {
      const quantity = item.quantity ?? item.qty ?? 1;

      // Resolve product id or object from common shapes; accept ObjectId or SKU/slug
      let productDoc = null;
      const candidate =
        (item.product &&
          (typeof item.product === "string"
            ? item.product
            : item.product._id || item.product.id)) ||
        item.productId ||
        item._id ||
        item.id;

      if (!candidate) {
        throw new AppError(
          `Product identifier missing for item at index ${index}.`,
          400,
        );
      }

      const candidateStr = String(candidate);

      if (mongoose.Types.ObjectId.isValid(candidateStr)) {
        productDoc = await Product.findById(candidateStr);
      } else {
        // try SKU, slug, or common legacy numeric id fields
        productDoc =
          (await Product.findOne({ sku: candidateStr })) ||
          (await Product.findOne({ slug: candidateStr })) ||
          (await Product.findOne({ legacyId: candidateStr })) ||
          (await Product.findOne({ externalId: candidateStr }));
      }

      if (!productDoc || !productDoc.isPublished) {
        // create placeholder product id and record external identifier (always)
        const placeholderId = new mongoose.Types.ObjectId();
        const itemName = item.name || item.title || `Product ${candidateStr}`;
        const itemSku = item.sku || candidateStr;
        const itemPrice = item.price ?? item.amount ?? 0;
        calculatedSubtotal += itemPrice * quantity;
        orderItems.push({
          product: placeholderId,
          externalProductId: candidateStr,
          name: itemName,
          sku: itemSku,
          image: item.image || null,
          seller: userId,
          quantity,
          price: itemPrice,
        });
        continue;
      }

      // If stock is insufficient, mark to skip decrement but still create the item
      const skipStock = productDoc.stock < quantity;

      calculatedSubtotal += productDoc.price * quantity;
      orderItems.push({
        product: productDoc._id,
        name: productDoc.name,
        sku: productDoc.sku,
        image: productDoc.images?.[0],
        seller: productDoc.seller,
        quantity,
        price: productDoc.price,
        skipStock,
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: name,
        phone,
        line1: address,
        city: "N/A",
        postalCode: "N/A",
        country: "N/A",
      },
      paymentMethod: "cod",
      subtotal: providedSubtotal ?? calculatedSubtotal,
      discountTotal: 0,
      shippingTotal: shipping?.charge ?? 0,
      taxTotal: 0,
      grandTotal:
        total ??
        (providedSubtotal ?? calculatedSubtotal) + (shipping?.charge ?? 0),
      createdAt: createdAt ? new Date(createdAt) : undefined,
    });

    // decrement stock only for items that map to real products
    const stockUpdates = orderItems
      .filter((it) => !it.externalProductId && !it.skipStock)
      .map((it) => ({
        updateOne: {
          filter: { _id: it.product },
          update: { $inc: { stock: -it.quantity } },
        },
      }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    return order;
  }

  // Fallback: create order from current cart
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0)
    throw new AppError("Cart is empty.", 400);

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

  const { coupon, discount } = await couponService.getValidCoupon(
    payload.couponCode,
    subtotal,
  );
  const shippingTotal = subtotal >= 100 ? 0 : 10;
  const taxTotal = Number(((subtotal - discount) * 0.08).toFixed(2));
  const grandTotal = Math.max(
    subtotal - discount + shippingTotal + taxTotal,
    0,
  );

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

  const stockUpdatesCart = orderItems
    .filter((it) => !it.externalProductId && !it.skipStock)
    .map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

  if (stockUpdatesCart.length > 0) {
    await Product.bulkWrite(stockUpdatesCart);
  }

  if (coupon)
    await Coupon.findByIdAndUpdate(coupon.id, { $inc: { usedCount: 1 } });
  cart.items = [];
  await cart.save();

  return order;
};

const listMyOrders = (userId) =>
  Order.find({ user: userId })
    .populate("items.product", "slug images")
    .sort("-createdAt");

const listOrders = () =>
  Order.find().populate("user", "name email").sort("-createdAt");

const getOrder = async (orderId, user) => {
  const order = await Order.findById(orderId).populate("user", "name email");
  if (!order) throw new AppError("Order not found.", 404);

  const ownsOrder = order.user._id.toString() === user.id;
  if (!ownsOrder && user.role !== "admin") {
    throw new AppError("You are not authorized to view this order.", 403);
  }

  return order;
};

const createDirectOrder = async (userId, payload) => {
  const { name, address, phone, items, subtotal, shipping, total, createdAt } =
    payload;

  // Force-insert without validation
  if (payload && payload.forceInsert) {
    const orderDoc = {
      user: userId,
      items: items || [],
      shippingAddress: {
        fullName: name || undefined,
        phone: phone || undefined,
        line1: address || undefined,
      },
      paymentMethod: payload.paymentMethod || undefined,
      subtotal: subtotal ?? 0,
      discountTotal: payload.discountTotal ?? 0,
      shippingTotal: shipping?.charge ?? payload.shippingTotal ?? 0,
      taxTotal: payload.taxTotal ?? 0,
      grandTotal: total ?? 0,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    };

    const order = new Order(orderDoc);
    await order.save({ validateBeforeSave: false });
    return order;
  }

  if (!items || items.length === 0)
    throw new AppError("Order items are required.", 400);

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress: {
      fullName: name,
      phone,
      line1: address,
      city: "N/A",
      postalCode: "N/A",
      country: "N/A",
    },
    paymentMethod: "cod",
    subtotal,
    discountTotal: 0,
    shippingTotal: shipping?.charge ?? 0,
    taxTotal: 0,
    grandTotal: total,
    createdAt: new Date(createdAt),
  });

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
  createDirectOrder,
  listMyOrders,
  listOrders,
  getOrder,
  updateOrderStatus,
};
