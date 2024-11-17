const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Ensure this is uncommented to load environment variables

const app = express();
const path = require("path");

app.get("/", (req, res) => {
  res.send("Welcome to the Categories API!"); // Response for root URL
});

// Middleware

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.raw({ type: "application/json" }));

// Routes
const categoryRoutes = require("./routes/category");
const imagesRoutes = require("./routes/imagesupload");
const productRoutes = require("./routes/product");

const ProductWeightRoutes = require("./routes/productWeight");
const ProductRamsRoutes = require("./routes/productRAMS");
const productSIZERoutes = require("./routes/productSIZE");
const userRoutes = require("./routes/user");
const cart = require("./routes/cart");
const reviewsRoutes = require("./routes/reviews");
const listRoutes = require("./routes/mylist");
const orderRoutes = require("./routes/order");
const checkoutRoutes = require("./routes/checkout");
const bannerRoutes = require("./routes/banner");
const searchRouters = require("./routes/searchpage");
// const authJwt = require("./helper/jwt");



// app.use(authJwt());
app.use("/api/category", categoryRoutes);
app.use("/api/imagesupload", imagesRoutes);
app.use("/api/product", productRoutes);

app.use("/api/productWeight", ProductWeightRoutes);
app.use("/api/productRams", ProductRamsRoutes);
app.use("/api/productSize", productSIZERoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cart);
app.use("/api/review", reviewsRoutes);
app.use("/api/mylist", listRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/search", searchRouters);

// Database Connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is ready...");

    // Start the server after the database is connected
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "An unexpected error occurred" });
});