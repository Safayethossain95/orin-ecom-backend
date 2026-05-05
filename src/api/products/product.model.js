const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    images: [String],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    attributes: { type: Map, of: String },
    tags: [{ type: String, trim: true }],
    ratingsAverage: { type: Number, min: 1, max: 5, default: 5 },
    ratingsQuantity: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

productSchema.pre("save", function setSlug(next) {
  if (this.isModified("name")) {
    this.slug = slugify(`${this.name}-${this.sku}`, { lower: true, strict: true });
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
