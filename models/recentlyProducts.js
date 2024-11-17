const mongoose = require("mongoose");

const recentlyViewedProductsSchema = mongoose.Schema({
  prodId: {
    type: String,
    required: true, // Corrected typo
  },
  name: {
    type: String,
    required: true, // Corrected typo
  },
  subCat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true, // Corrected typo
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  catName: {
    type: String,
    default: "",
  },
  subCatId: {
    type: String,
    default: "",
  },
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  countInStock: {
    type: Number,
    required: true,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    required: true,
  },
  productRAM: [
    {
      type: String,
      default: null, // Consider using [] instead of null for arrays
    },
  ],

  productSIZE: [
    {
      type: String,
      default: null, // Consider using [] instead of null for arrays
    },
  ],

  productWEIGHT: [
    {
      type: String,
      default: null, // Consider using [] instead of null for arrays
    },
  ],

  stock: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Virtuals for transforming _id to id
recentlyViewedProductsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
recentlyViewedProductsSchema.set("toJSON", { virtuals: true });

// Export model and schema
exports.RecentlyProducts = mongoose.model("RecentlyProducts", recentlyViewedProductsSchema, "recentlyProducts");
exports.recentlyViewedProductsSchema = recentlyViewedProductsSchema;
