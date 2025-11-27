import express from 'express';
import { logMeal } from '../controllers/mealController.js';

const mealRouter = express.Router();

// POST /meals
// Expects JSON body: { items: [{ item_name, quantity, calorie_count }], logged_at?: string }
mealRouter.post('/', logMeal);

export default mealRouter;

