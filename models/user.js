const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],

  phone: {
    type: String,
    // unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin:{
    type:Boolean,
    default:false,
  }
});

// Virtual for getting the id
userSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Fixed typo: toHexStirng to toHexString
});

// Make virtuals work with JSON
userSchema.set("toJSON", {
  virtuals: true,
});

// Exporting the model
exports.User = mongoose.model("User", userSchema, "users");
exports.userSchema = userSchema;
