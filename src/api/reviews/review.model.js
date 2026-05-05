const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.statics.calculateProductRatings = async function calculateProductRatings(productId) {
  const Product = require("../products/product.model");
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        quantity: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsQuantity: stats[0]?.quantity || 0,
    ratingsAverage: stats[0]?.average || 5,
  });
};

reviewSchema.post("save", function updateRatings() {
  this.constructor.calculateProductRatings(this.product);
});

reviewSchema.post("findOneAndDelete", function updateRatings(doc) {
  if (doc) doc.constructor.calculateProductRatings(doc.product);
});

module.exports = mongoose.model("Review", reviewSchema);
