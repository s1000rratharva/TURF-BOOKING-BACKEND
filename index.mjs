import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({ origin: "*" })); // Allow requests from any origin
app.use(express.json()); // Parse JSON request bodies

// ✅ Check environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay credentials are missing in .env file!");
}

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Razorpay Order API
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created:", order.id);

    return res.status(200).json(order);
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    return res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
