import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import entities
import User from "./models/User.js";
import Meal from "./models/Meal.js";
import MealItem from "./models/MealItem.js";

// test auth

dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "calorisync-api" });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    }
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}
startServer();
