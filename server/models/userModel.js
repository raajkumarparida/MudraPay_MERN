import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: String,
    upiId: String
  },
  to: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: String,
    upiId: String
  },
  amount: {
    type: Number,
    required: true
  },
  cashback: {           //Cashback amount earned
    type: Number,
    default: 0
  },
  cashbackPercent: {    //Cashback percentage
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success'
  },
  description: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  upiId: { type: String, required: true, unique: true },
  upiPin: { type: String, default: "1234" },
  balance: { type: Number, default: 0 },
  credited: { type: Number, default: 0 },
  debited: { type: Number, default: 0 },
  totalCashback: { type: Number, default: 0 },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  transactions: [transactionSchema]
}, {
  timestamps: true
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;