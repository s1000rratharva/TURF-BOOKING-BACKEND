import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ---- Env validation ----
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NODE_ENV } = process.env;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay credentials are missing in .env file!");
  if (NODE_ENV === "production") {
    console.error("❌ Cannot start server without Razorpay credentials in production.");
    process.exit(1);
  }
}

// ---- Razorpay instance ----
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ---- Health check ----
app.get("/", (_req, res) => {
  res.send("Turf Booking API is running ✅");
});

// ---- Create Order ----
app.post("/create-order", async (req, res) => {
  try {
    const { amount, activity, date, slots } = req.body;

    const amountNum = Number(amount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Valid amount (₹) is required" });
    }

    const options = {
      amount: Math.round(amountNum * 100), // paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        activity: activity || "",
        date: date || "",
        slots: Array.isArray(slots) ? slots.join(",") : slots || "",
      },
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created:", order.id);

    return res.status(200).json(order);
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    return res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
