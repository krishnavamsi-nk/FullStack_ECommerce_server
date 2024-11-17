const mongoose = require("mongoose");

const productRamsSchema = mongoose.Schema({
  productRAM: {
    type: String,
   default:null,
  }

});

// Virtual for getting the id
productRamsSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
productRamsSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.ProductRams = mongoose.model("ProductRam", productRamsSchema);
exports.productRamsSchema = productRamsSchema;
