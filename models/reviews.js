const mongoose = require("mongoose");

const reviewsSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },

  review: {
    type: String,
    required: true, // Corrected 'require' to 'required'
  },
  customerId: {
    type: String,
    required: true, // Corrected 'require' to 'required'
  },
  customerRating: {
    type: Number,
    required: true,
    default:1,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for getting the id
reviewsSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
reviewsSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.Reviews = mongoose.model("Reviews", reviewsSchema,"reviews");
