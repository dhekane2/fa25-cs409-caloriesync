import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total_calorie_count: {
    type: Number,
    required: true,
    min: 0
  },
  logged_at: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Meal', mealSchema);