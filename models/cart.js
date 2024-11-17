const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true, // Corrected 'require' to 'required'
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  prodId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

// Virtual for getting the id
cartSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
cartSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.Cart = mongoose.model("Cart", cartSchema, "carts");
