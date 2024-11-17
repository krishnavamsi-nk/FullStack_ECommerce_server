const mongoose = require("mongoose");

const productWeightSchema = mongoose.Schema({
  productWEIGHT: {
    type: String,
   default:null,
  }

});

// Virtual for getting the id
productWeightSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
productWeightSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.ProductWeight = mongoose.model("ProductWeight", productWeightSchema);
exports.productWeightSchema = productWeightSchema;
