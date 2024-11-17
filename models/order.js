const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    default:"Pending",
    // required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
      },
      name: {
        type: String,
      },
      images: {
        type: String,
      },
      price: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
      total: {
        type: Number,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for getting the id
orderSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
orderSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.Order = mongoose.model("Order", orderSchema, "orders");
