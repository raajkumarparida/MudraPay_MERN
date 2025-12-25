import mongoose from "mongoose";

const cashbackRedemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  cashbackAmount: {
    type: Number,
    required: true
  },
  inrAmount: {
    type: Number,
    required: true
  },
  userUpiId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  approvedBy: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    adminName: String
  },
  rejectionReason: {
    type: String
  },
  transactionProof: {
    type: String // UTR number or transaction ID
  }
}, {
  timestamps: true
});

const cashbackRedemptionModel = mongoose.models.cashbackRedemption || 
  mongoose.model("cashbackRedemption", cashbackRedemptionSchema);

export default cashbackRedemptionModel;