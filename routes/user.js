const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { imagesupload } = require("../models/imagesupload");

const multer = require("multer");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var categoryEditId = null;
var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname); // Including original name for clarity
  },
});

const upload = multer({ storage: storage });

router.get("/get/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve order count",
      error: error.message,
    });
  }
});

router.post("/upload", upload.array("images"), async (req, res) => {
  imagesArr = [];
  try {
    if (categoryEditId) {
      const category = await Category.findById(categoryEditId);
      const imageArr = category.images;
      // console.log("inside Category the images :",category.images);
      console.log("initial img Array :", imageArr);
      const images = imageArr;

      if (images.length !== 0) {
        // Attempt to delete previous images if they exist
        for (const image of images) {
          try {
            fs.unlinkSync(`uploads/${image}`);
          } catch (err) {
            console.error(
              `Failed to delete file: ${image}, error: ${err.message}`
            );
          }
        }
        categoryEditId = "";
      }
    }

    for (let i = 0; i < req.files.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return;
          }
          imagesArr.push(result.secure_url);
          try {
            fs.unlinkSync(`uploads/${req.files[i].filename}`);
          } catch (err) {
            console.error(
              `Failed to delete file: ${req.files[i].filename}, error: ${err.message}`
            );
          }
        }
      );
    }

    let imagesuploaded = new imagesupload({
      images: imagesArr,
    });

    imagesuploaded = await imagesuploaded.save();
    return res.status(200).json({ uploadedImages: imagesArr });
  } catch (error) {
    console.error("Error in upload route:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.post("/signup", async (req, res) => {
  const { name, phone, email, password, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    const existingPhone = await User.findOne({ phone: phone });

    // Check if the user already exists
    if (existingUser || existingPhone) {
      // Return immediately to prevent further execution
      return res.status(201).json({
        status: false,
        msg: "User with this email and Phone number already exists!",
      });
    }

    // Hash the password before saving it
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user

    const result = await User.create({
      name: name,
      phone: phone,
      email: email,
      password: hashPassword,
      isAdmin: isAdmin,
    });

    // Create a JWT token
    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    // Send the success response with the user data and token
    return res.status(200).json({
      user: result,
      token: token,
    });
  } catch (error) {
    // Log and handle the error
    console.log(error);
    return res.status(500).json({ status: false, msg: "Something went wrong" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(201).json({ success: false, msg: "User not Found" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res
        .status(201)
        .json({ success: false, msg: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );
    return res.status(200).json({
      user: existingUser,
      token: token,
      msg: "User Authenticated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const userList = await User.find();

    // Check if userList is empty
    if (userList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    return res.status(200).json({ success: true, users: userList });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Use `findById` for _id field
    if (!user) {
      return res.status(404).json({ msg: "No User Found!" });
    }
    return res.status(200).json(user); // Send the user data if found
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Something went wrong", error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, msg: "The User is Deleted!" });
      } else {
        return res.status(404).json({ success: false, msg: "User Not Found" });
      }
    })
    .catch((err) => {
      return res
        .send(500)
        .json({ msg: "Something Went Wrong", success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.put("/changePassword/:id", async (req, res) => {
  const { password, newPass } = req.body;

  const userExist = await User.findById(req.params.id);
  if (!userExist) {
    res.status(404).json({ success: false, msg: "User Not Found!" });
  }

  const matchPassword = await bcrypt.compare(password, userExist.password);

  if (!matchPassword) {
    return res.json({ success: false, msg: "Current Password wrong!" });
  }

  let newPassword;

  if (newPass) {
    newPassword = bcrypt.hashSync(newPass, 10);
  } else {
    newPassword = userExist.password;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: userExist.name,
      email: userExist.email,
      password: newPassword,
      phone: userExist.phone,
      images: userExist.images,
    },
    { new: true }
  );

  if (!user) {
    return res
      .status(404)
      .json({ success: false, msg: "The User Cannot be Updated" });
  }

  return res.send(user);
});

router.put("/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  const userExist = await User.findById(req.params.id);

  let newPassword;

  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.password;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      email: email,
      password: newPassword,
      phone: phone,
      images: imagesArr,
    },
    { new: true }
  );

  if (!user) {
    return res.status(400).send("The User Cannot be Updated");
  }

  res.send(user);
});



router.post("/authWithGoogle", async (req, res) => {
  const { name, phone, email, password, images, isAdmin } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new user
      result = await User.create({
        name,
        phone,
        email,
        password, // You might want to hash the password before storing it
        images,
        isAdmin,
      });

          // Create a JWT token
    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

      
      console.log("user:",result._id)

      res.status(201).json({
        user:{
          _id: result._id,
          name: result.name,
          email: result.email,
          isAdmin: result.isAdmin,
        },
        token: token,
        msg: "User registered and logged in successfully!",
      });
    } else {
      // If the user exists, generate token for them
      console.log("userId:",user);
      res.status(200).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token: jwt.sign({ email: user.email, id: user._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY),
        msg: "User logged in successfully!",
      });
    }
  } catch (error) {
    console.error("Error with Google Auth:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
