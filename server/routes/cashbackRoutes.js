import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  requestCashbackRedemption,
  getUserRedemptions,
  getAllRedemptionRequests,
  approveRedemption,
  completeRedemption,
  rejectRedemption
} from "../controllers/cashbackControllers.js";

const cashbackRouter = express.Router();

// User routes
cashbackRouter.post('/request-redemption', userAuth, requestCashbackRedemption);
cashbackRouter.get('/my-redemptions', userAuth, getUserRedemptions);

// Admin routes
cashbackRouter.get('/redemption-requests', userAuth, getAllRedemptionRequests);
cashbackRouter.post('/approve-redemption', userAuth, approveRedemption);
cashbackRouter.post('/complete-redemption', userAuth, completeRedemption);
cashbackRouter.post('/reject-redemption', userAuth, rejectRedemption);

export default cashbackRouter;