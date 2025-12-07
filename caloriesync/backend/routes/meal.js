import express from 'express';
import { logMeal, fetchMealsForDate } from '../controllers/mealController.js';
import { usdaSearch } from '../controllers/nutritionController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const mealRouter = express.Router();

// POST /meals
// Expects JSON body: { items: [{ item_name, quantity, calorie_count }], logged_at?: string }
mealRouter.post('/', logMeal);

// GET /meals/by-date?date=YYYY-MM-DD
mealRouter.get('/by-date', authenticateJWT, fetchMealsForDate);

// GET /meals/usda_search?query=apple
// Nutrition search is scoped to the tracking/meal area.
mealRouter.get('/usda_search', usdaSearch);

export default mealRouter;

