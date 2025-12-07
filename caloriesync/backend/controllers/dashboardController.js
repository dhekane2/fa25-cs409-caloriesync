import User from "../models/User.js";
import Meal from "../models/Meal.js";
import dayjs from "dayjs";
import mongoose from "mongoose";

export async function getDashboardProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "-password_hash -refresh_token"
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateDashboardProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      email,
      phone,
      age,
      gender,
      height,
      currentWeight,
      goalWeight,
      goalTimeValue,
      goalTimeUnit,
    } = req.body || {};

    const update = {};

    if (typeof name === "string" && name.trim()) {
      const [first, ...rest] = name.trim().split(" ");
      update.first_name = first;
      update.last_name = rest.join(" ") || "";
    }

    if (typeof email === "string" && email.trim()) {
      update.email = email.trim();
    }

    if (typeof phone === "string") {
      update.phone_number = phone.trim();
    }

    if (age != null) {
      const ageNum = Number(age);
      if (!Number.isNaN(ageNum) && ageNum > 0) {
        update.age = ageNum;
      }
    }

    if (typeof gender === "string" && gender.trim()) {
      update.gender = gender;
    }

    if (height != null) {
      const heightNum = Number(height);
      if (!Number.isNaN(heightNum) && heightNum > 0) {
        update.height = heightNum;
      }
    }

    if (currentWeight != null) {
      const w = Number(currentWeight);
      if (!Number.isNaN(w) && w >= 0) {
        update.weight = w;
      }
    }

    if (goalWeight != null) {
      const gw = Number(goalWeight);
      if (!Number.isNaN(gw) && gw >= 0) {
        update.goal_weight = gw;
      }
    }

    if (goalTimeValue != null) {
      const tv = Number(goalTimeValue);
      if (!Number.isNaN(tv) && tv > 0) {
        update.goal_timeframe_value = tv;
      }
    }

    if (typeof goalTimeUnit === "string" && goalTimeUnit.trim()) {
      const unit = goalTimeUnit.toLowerCase();
      if (unit === "day" || unit === "days") {
        update.goal_timeframe_unit = "days";
      } else if (unit === "week" || unit === "weeks") {
        update.goal_timeframe_unit = "weeks";
      } else if (unit === "month" || unit === "months") {
        update.goal_timeframe_unit = "months";
      }
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password_hash -refresh_token");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating dashboard profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMonthlyStats(req, res) {
  const { year, month } = req.query;
  const userId = req.user?.id;

  if (!userId){
    return res.status(401).json({ message: "Unauthorized" });
  }

  if(!year || !month){
    return  res.status(400).json({ message: "Year and month are required" });
  }

  const start = dayjs(`${year}-${month}-01`).startOf("day");
  if(!start.isValid()){
    return res.status(400).json({ message: "Invalid year or month" });
  }
  const end = start.endOf("month");


  const agg = await Meal.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        logged_at: { $gte: start.toDate(), $lte: end.toDate() }
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$logged_at" },
        total: { $sum: "$total_calorie_count" }
      },
    },
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

  try{
    const { start_date } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!start_date) {
      return res.status(400).json({ message: "Missing start_date" });
    }

    const start = dayjs(start_date).startOf("day");
    if (!start.isValid()) {
      return res.status(400).json({ message: "Invalid start_date" });
    }
    const end = start.add(6, "day").endOf("day");

    const meals = await Meal.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          logged_at: { $gte: start.toDate(), $lte: end.toDate() }
        },
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
      const dateStr = start.add(i, "day").format("YYYY-MM-DD");
      const record = meals.find(m => m._id === dateStr);

      days.push({
        date: dateStr,
        total_calories: record?.total || 0,
      });
    }

    res.json({
      week_start: start.format("YYYY-MM-DD"),
      week_end: end.format("YYYY-MM-DD"),
      days,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
