const path = require("path");
const connectDatabase = require("../src/database/mongoose");
const mongoose = require("mongoose");

async function run() {
  try {
    await connectDatabase();

    const ordersPath = path.join(__dirname, "static-orders.json");
    const orders = require(ordersPath);

    if (!Array.isArray(orders) || orders.length === 0) {
      console.error("No orders found in scripts/static-orders.json");
      process.exit(1);
    }

    // Insert raw documents using the native driver to avoid schema casting/validation
    const OrderCollection = mongoose.connection.collection("orders");
    const result = await OrderCollection.insertMany(orders);

    console.log(`Inserted ${result.insertedCount} orders.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
