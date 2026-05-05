const env = require("../config/env");
const connectDatabase = require("../database/mongoose");
const Cart = require("../api/cart/cart.model");
const Category = require("../api/categories/category.model");
const Coupon = require("../api/coupons/coupon.model");
const Order = require("../api/orders/order.model");
const Payment = require("../api/payments/payment.model");
const Product = require("../api/products/product.model");
const Review = require("../api/reviews/review.model");
const User = require("../api/users/user.model");
const ROLES = require("../constants/roles");

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Cart.deleteMany(),
    Category.deleteMany(),
    Coupon.deleteMany(),
    Order.deleteMany(),
    Payment.deleteMany(),
    Product.deleteMany(),
    Review.deleteMany(),
    User.deleteMany(),
  ]);

  const [admin, seller] = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin123!",
      role: ROLES.ADMIN,
    },
    {
      name: "Seller User",
      email: "seller@example.com",
      password: "Seller123!",
      role: ROLES.SELLER,
    },
  ]);

  const electronics = await Category.create({
    name: "Electronics",
    description: "Phones, computers, and gadgets.",
  });

  await Product.create([
    {
      name: "Wireless Headphones",
      description: "Noise-isolating Bluetooth headphones with long battery life.",
      brand: "Acme",
      sku: "ACME-HEAD-001",
      category: electronics.id,
      seller: seller.id,
      images: ["https://example.com/headphones.jpg"],
      price: 79.99,
      compareAtPrice: 99.99,
      stock: 50,
      tags: ["audio", "wireless"],
      isPublished: true,
    },
    {
      name: "USB-C Hub",
      description: "Multi-port USB-C hub with HDMI, USB-A, and card reader.",
      brand: "Acme",
      sku: "ACME-HUB-001",
      category: electronics.id,
      seller: seller.id,
      images: ["https://example.com/hub.jpg"],
      price: 39.99,
      stock: 100,
      tags: ["adapter", "computer"],
      isPublished: true,
    },
  ]);

  await Coupon.create({
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 25,
    maxDiscountAmount: 50,
    usageLimit: 500,
  });

  console.log(`Seed complete for ${env.mongoUri}`);
  console.log("Admin: admin@example.com / Admin123!");
  console.log("Seller: seller@example.com / Seller123!");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
