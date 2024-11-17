// Cloudinary
const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = {
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
};
cloudinary.config(cloudinaryConfig);

module.exports =cloudinary;
