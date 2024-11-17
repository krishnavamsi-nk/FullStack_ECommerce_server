const mongoose = require("mongoose");

const mylistSchema = mongoose.Schema({
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
mylistSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
mylistSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.Mylist = mongoose.model("Mylist", mylistSchema, "mylists");
