import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealItem',
    }],
    required: true,
    validate: v => v.length > 0
  },
  total_calorie_count: {
    type: Number,
    min: 0
  },
  logged_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

mealSchema.pre("save", async function (next) {
  const MealItem = mongoose.model("MealItem");

  const mealItems = await MealItem.find({
    _id: { $in: this.items }
  });

  this.total_calorie_count = mealItems.reduce(
    (sum, item) => sum + item.calorie_count,
    0
  );

  next();
});


export default mongoose.model('Meal', mealSchema);