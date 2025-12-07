import dayjs from 'dayjs';
import mongoose from 'mongoose';
import Meal from '../models/Meal.js';
import MealItem from '../models/MealItem.js';

// Create-or-replace meals for a given day.
export async function logMeal(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { items, logged_at } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Request body must include a non-empty `items` array',
      });
    }

    // Normalize and validate each item
    const normalizedItems = items.map((item) => ({
      item_name: item.item_name,
      quantity: item.quantity,
      calorie_count: item.calorie_count,
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !item.item_name ||
        item.quantity == null ||
        item.calorie_count == null ||
        item.quantity <= 0 ||
        item.calorie_count < 0,
    );

    if (hasInvalidItem) {
      return res.status(400).json({
        message:
          'Each item must include `item_name` (string), `quantity` (number > 0), and `calorie_count` (number >= 0)',
      });
    }

    // Determine the day we are logging for
    const baseMoment = logged_at ? dayjs(logged_at) : dayjs();
    if (!baseMoment.isValid()) {
      return res.status(400).json({ message: 'Invalid logged_at value' });
    }

    const start = baseMoment.startOf('day');
    const end = baseMoment.endOf('day');

    // Find existing meals for this user on this day
    const existingMeals = await Meal.find({
      user_id: new mongoose.Types.ObjectId(user.id),
      logged_at: { $gte: start.toDate(), $lte: end.toDate() },
    }).populate('items');

    // Flatten existing items for comparison
    const existingFlat = [];
    existingMeals.forEach((meal) => {
      meal.items.forEach((item) => {
        existingFlat.push({
          item_name: item.item_name,
          quantity: item.quantity,
          calorie_count: item.calorie_count,
        });
      });
    });

    const canonicalize = (arr) =>
      arr
        .map((i) => ({
          item_name: String(i.item_name || '').trim(),
          quantity: Number(i.quantity),
          calorie_count: Number(i.calorie_count),
        }))
        .sort((a, b) => {
          const n = a.item_name.localeCompare(b.item_name);
          if (n !== 0) return n;
          if (a.quantity !== b.quantity) return a.quantity - b.quantity;
          return a.calorie_count - b.calorie_count;
        });

    const canonExisting = canonicalize(existingFlat);
    const canonNew = canonicalize(normalizedItems);

    const isSame =
      canonExisting.length === canonNew.length &&
      canonExisting.every(
        (v, idx) =>
          v.item_name === canonNew[idx].item_name &&
          v.quantity === canonNew[idx].quantity &&
          v.calorie_count === canonNew[idx].calorie_count,
      );

    if (isSame) {
      return res.status(200).json({
        message: 'No changes to meals for this date',
      });
    }

    // Delete existing meals + their items for this date
    if (existingMeals.length > 0) {
      const existingItemIds = existingMeals.flatMap((meal) =>
        meal.items.map((item) => item._id),
      );

      if (existingItemIds.length > 0) {
        await MealItem.deleteMany({ _id: { $in: existingItemIds } });
      }

      await Meal.deleteMany({
        _id: { $in: existingMeals.map((m) => m._id) },
      });
    }

    // Create new meal items in database
    const createdItems = await MealItem.insertMany(normalizedItems);
    const itemIds = createdItems.map((doc) => doc._id);

    // Prepare meal data
    const mealData = {
      user_id: user.id,
      items: itemIds,
      logged_at: baseMoment.toDate(),
    };

    const meal = new Meal(mealData);
    await meal.save();

    // Populate items to include full item details in response
    await meal.populate('items');

    const statusCode = existingMeals.length > 0 ? 200 : 201;
    const message = existingMeals.length > 0 ? 'Meal updated successfully' : 'Meal logged successfully';

    return res.status(statusCode).json({
      message,
      meal: {
        _id: meal._id,
        user_id: meal.user_id,
        items: meal.items.map((item) => ({
          _id: item._id,
          item_name: item.item_name,
          quantity: item.quantity,
          calorie_count: item.calorie_count,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        total_calorie_count: meal.total_calorie_count,
        logged_at: meal.logged_at,
        createdAt: meal.createdAt,
        updatedAt: meal.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error logging meal:', err);
    return res.status(500).json({
      message: 'Failed to log meal',
    });
  }
}

// Fetch flattened meal items for a given user + date (YYYY-MM-DD)
export async function fetchMealsForDate(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Missing date' });
    }

    const day = dayjs(date);
    if (!day.isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const start = day.startOf('day');
    const end = day.endOf('day');

    const meals = await Meal.find({
      user_id: new mongoose.Types.ObjectId(user.id),
      logged_at: { $gte: start.toDate(), $lte: end.toDate() },
    }).populate('items');

    const items = [];
    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        items.push({
          id: item._id.toString(),
          item_name: item.item_name,
          quantity: item.quantity,
          calorie_count: item.calorie_count,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      });
    });

    return res.json({
      date,
      items,
    });
  } catch (err) {
    console.error('Error fetching meals for date:', err);
    return res.status(500).json({ message: 'Failed to fetch meals' });
  }
}

