import Meal from '../models/Meal.js';
import MealItem from '../models/MealItem.js';

export async function logMeal(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { items, logged_at } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Request body must include a non-empty `items` array' });
    }

    const normalizedItems = items.map((item) => ({
      item_name: item.item_name,
      quantity: item.quantity,
      calorie_count: item.calorie_count
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !item.item_name ||
        item.quantity == null ||
        item.calorie_count == null
    );

    if (hasInvalidItem) {
      return res.status(400).json({
        message: 'Each item must include `item_name`, `quantity`, and `calorie_count`'
      });
    }

    const createdItems = await MealItem.insertMany(normalizedItems);
    const itemIds = createdItems.map((doc) => doc._id);

    const mealData = {
      user_id: user.id,
      items: itemIds
    };

    if (logged_at) {
      mealData.logged_at = new Date(logged_at);
    }

    const meal = new Meal(mealData);
    await meal.save();
    await meal.populate('items');

    return res.status(201).json({
      message: 'Meal logged successfully',
      meal
    });
  } catch (err) {
    console.error('Error logging meal', err);
    return res.status(500).json({ message: 'Failed to log meal' });
  }
}

