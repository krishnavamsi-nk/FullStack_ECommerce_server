const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const products = req.body.products;

  console.log("The Product:", products);

  // Map products to line items
  const lineItems = products.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.name?.substr(0, 30) + "...",
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));

  // Step 1: Create the customer in Stripe
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: JSON.stringify(lineItems),
    },
  });

  // Step 2: Create the session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: lineItems,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    success_url: `${process.env.CLIENT_BASE_URL}/payment/complete/{CHECKOUT_SESSION_ID}`,
    cancel_url: "http://localhost:3000/cancel",
  });

  console.log("Session created:", session);

  // Step 3: Retrieve the session to ensure payment_intent is populated
  const updatedSession = await stripe.checkout.sessions.retrieve(session.id);
  const paymentIntentId = updatedSession.payment_intent;

  if (!paymentIntentId) {
    console.log("Warning: Payment Intent ID is still null.");
  } else {
    console.log("Payment Intent ID:", paymentIntentId);
  }

  // Step 4: Create the new order with the paymentIntentId
  const newOrder = new Order({
    name: req.body.data.name,
    phoneNumber: req.body.data.phoneNumber,
    address: req.body.data.address,
    pincode: req.body.data.zipCode,
    amount: req.body.data.amount,
    paymentId: session.id,  // Now populated with the actual payment intent ID
    email: req.body.data.email,
    userId: req.body.userId,
    products: req.body.products,
    date: req.body.data.date || new Date(),
  });

  // Step 5: Save the order
  const savedOrder = await newOrder.save();

  // Step 6: Send response back to frontend
  res.json({ id: session.id, paymentId: paymentIntentId });
});


router.get("/payment/complete", async (req, res) => {
  const result = await Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  res.status(200).json(result);
});

router.get("/cancel", (req, res) => {
  res.redirect("/");
});

module.exports = router;
