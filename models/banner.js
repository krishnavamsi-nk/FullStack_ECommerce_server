const mongoose = require("mongoose");

const homeBannerSchema = mongoose.Schema({
  images: [{
    type: String,
    required: true,
  },]
});

// Virtual for getting the id
homeBannerSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
homeBannerSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.HomeBanner = mongoose.model(
  "HomeBanner",
  homeBannerSchema,
  "homebanners"
);
