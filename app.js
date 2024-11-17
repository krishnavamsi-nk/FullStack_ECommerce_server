const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
const path = require("path");

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Categories API!");
});

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Static files
app.use(bodyParser.json()); // JSON parsing middleware
app.use(cors()); // Enable CORS

// Routes
const categoryRoutes = require("./routes/category");
const imagesRoutes = require("./routes/imagesupload");
const productRoutes = require("./routes/product");
const ProductWeightRoutes = require("./routes/productWeight");
const ProductRamsRoutes = require("./routes/productRAMS");
const productSIZERoutes = require("./routes/productSIZE");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const reviewsRoutes = require("./routes/reviews");
const listRoutes = require("./routes/mylist");
const orderRoutes = require("./routes/order");
const checkoutRoutes = require("./routes/checkout");
const bannerRoutes = require("./routes/banner");
const searchRoutes = require("./routes/searchpage");

// Route Middleware
app.use("/api/category", categoryRoutes);
app.use("/api/imagesupload", imagesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/productWeight", ProductWeightRoutes);
app.use("/api/productRams", ProductRamsRoutes);
app.use("/api/productSize", productSIZERoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/review", reviewsRoutes);
app.use("/api/mylist", listRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/search", searchRoutes);

// Database Connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database Connection is ready...");

    // Start the server only after the database connection is successful
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit process if the database connection fails
  });

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err.stack);
  res.status(500).json({ message: "An unexpected error occurred", error: err.message });
});
