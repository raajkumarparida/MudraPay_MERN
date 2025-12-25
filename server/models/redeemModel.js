import mongoose from "mongoose";

const redeemSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    length: 10
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isRedeemed: {
    type: Boolean,
    default: false
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: String,
    email: String
  },
  redeemedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: String,
    upiId: String
  },
  redeemedAt: {
    type: Date,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const redeemModel = mongoose.models.redeem || mongoose.model("redeem", redeemSchema);

export default redeemModel;