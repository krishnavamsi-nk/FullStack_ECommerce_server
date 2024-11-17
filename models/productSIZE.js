const mongoose = require("mongoose");

const productSizeSchema = mongoose.Schema({
  productSIZE: {
    type: String,
   default:null,
  }

});

// Virtual for getting the id
productSizeSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
productSizeSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.ProductSize = mongoose.model("ProductSize", productSizeSchema);
exports.productSizeSchema = productSizeSchema;
