import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// configs
import { corsOptions } from "./config/corsOption.js";

// auth routes
import authRouter from "./routes/auth.js";
import apiRouter from "./routes/index.js";
import mealRouter from "./routes/meal.js";

import { authenticateJWT } from './middlewares/authMiddleware.js';


// ####################################### 
// ####################################### 

const app = express();
const PORT = process.env.PORT || 4000;

// #######################################
// middlewares
// #######################################  
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// #######################################
// Routes
// #######################################  
app.use('/auth', authRouter);
// Apply authentication middleware for all API routes mounted after this line.
// This keeps authentication logic separate from auth routes (login/register/refresh).
app.use(authenticateJWT);

// this is a test api
app.use('/user', apiRouter);

// Meal logging and tracking APIs
app.use('/meals', mealRouter);


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
