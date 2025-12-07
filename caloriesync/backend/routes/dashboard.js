import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { 
  getDashboardProfile,
  updateDashboardProfile,
  getMonthlyStats,
  getWeeklyStats
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/profile", authenticateJWT,getDashboardProfile);
router.patch("/profile", authenticateJWT, updateDashboardProfile);
router.get("/monthly", authenticateJWT, getMonthlyStats);
router.get("/weekly", authenticateJWT, getWeeklyStats);

export default router;
