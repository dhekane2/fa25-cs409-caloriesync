import User from "../models/User.js";
import Meal from "../models/Meal.js";
import dayjs from "dayjs";

export async function getDashboardProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password_hash -refresh_token");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMonthlyStats(req, res) {
  const { year, month } = req.query;
  const userId = req.user.id;

  const start = dayjs(`${year}-${month}-01`);
  const end = start.endOf("month");

  const agg = await Meal.aggregate([
    {
      $match: {
        user_id: userId,
        logged_at: { $gte: start.toDate(), $lte: end.toDate() }
      }
    },
    {
      $group: {
        _id: { $dayOfMonth: "$logged_at" },
        total: { $sum: "$total_calorie_count" }
      }
    }
  ]);

  const days = [];
  for (let i = 1; i <= end.date(); i++) {
    const found = agg.find(a => a._id === i);
    days.push({
      date: `${year}-${month}-${String(i).padStart(2, "0")}`,
      in_current_month: true,
      total_calories: found?.total || 0,
    });
  }

  res.json({
    year,
    month,
    days,
  });
}

export async function getWeeklyStats(req, res) {
  const { start_date } = req.query;
  const userId = req.user.id;

  const start = dayjs(start_date);
  const end = start.add(6, "day");

  const meals = await Meal.aggregate([
    {
      $match: {
        user_id: userId,
        logged_at: { $gte: start.toDate(), $lte: end.toDate() }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$logged_at" } },
        total: { $sum: "$total_calorie_count" }
      }
    }
  ]);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = start.add(i, "day").format("YYYY-MM-DD");
    const record = meals.find(m => m._id === date);

    days.push({
      date,
      total_calories: record?.total || 0,
    });
  }

  res.json({
    week_start: start_date,
    week_end: end.format("YYYY-MM-DD"),
    days,
  });
}
