import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  height: {
    type: Number,
    required: true,
    min: 70 // height in centimeters  
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  goal_weight: {
    type: Number,
    required: true,
    min: 0
  },
  
  goal_timeframe_value: { 
    type: Number,
    required: true
  },

  goal_timeframe_unit:  { 
    type: String, 
    enum: ["days", "weeks", "months"],
    required: true
  },
  
  refresh_token: {
    type: String,
    required: false,
    default: null
  }
  
}, {
  timestamps: true 
});


export default mongoose.model('User', userSchema);