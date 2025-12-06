import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { 
  getDashboardProfile,
  getMonthlyStats,
  getWeeklyStats
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/profile", authenticateJWT, getDashboardProfile);
router.get("/monthly", authenticateJWT, getMonthlyStats);
router.get("/weekly", authenticateJWT, getWeeklyStats);

export default router;
