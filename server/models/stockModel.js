import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerShare: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const stockHoldingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  averagePrice: {
    type: Number,
    required: true
  },
  totalInvested: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export const stockTransactionModel = mongoose.models.stockTransaction || 
  mongoose.model("stockTransaction", stockTransactionSchema);

export const stockHoldingModel = mongoose.models.stockHolding || 
  mongoose.model("stockHolding", stockHoldingSchema);