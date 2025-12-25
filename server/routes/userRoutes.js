import express from "express";
import userAuth from "../middleware/userAuth.js";
import { 
  getUserData, 
  updateBalance, 
  getBalance,
  sendMoney,
  getTransactionHistory,
  getRecentTransactions,
  verifyUpiId,
  verifyUpiPin,
  updateUpiPin,
  getLeaderboard,
  redeemGiftCode,
  verifyRedeemCode,
  redeemCode 
} from "../controllers/userControllers.js";

const userRouter = express.Router();

// User data routes
userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-balance', userAuth, updateBalance);
userRouter.get('/balance', userAuth, getBalance);

// Transaction routes
userRouter.post('/send-money', userAuth, sendMoney);
userRouter.get('/transactions', userAuth, getTransactionHistory);
userRouter.get('/recent-transactions', userAuth, getRecentTransactions);
userRouter.post('/verify-upi', userAuth, verifyUpiId);

// UPI PIN routes
userRouter.post('/verify-upi-pin', userAuth, verifyUpiPin);
userRouter.post('/update-upi-pin', userAuth, updateUpiPin);

// Leaderboard route  // NEW
userRouter.get('/leaderboard', userAuth, getLeaderboard);

// Redeem routes
userRouter.post('/redeem-code', userAuth, redeemGiftCode);
userRouter.post('/verify-redeem-code', userAuth, verifyRedeemCode);
userRouter.post('/redeem-code', userAuth, redeemCode);

export default userRouter;