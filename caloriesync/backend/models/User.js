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
    required: false,
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
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});


userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// store refresh tokens for issued refresh tokens (simple approach)
// store a single refresh token per user (overwrite on login/register)
userSchema.add({
  refresh_token: {
    type: String,
    required: false,
    default: null
  }
});

export default mongoose.model('User', userSchema);