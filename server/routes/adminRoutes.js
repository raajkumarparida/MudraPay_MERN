import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  createRedeemCode,
  getAllRedeemCodes,
  getRedeemStats
} from "../controllers/adminControllers.js";

const adminRouter = express.Router();

// All admin routes protected with adminAuth
adminRouter.post('/create-redeem-code', adminAuth, createRedeemCode);
adminRouter.get('/redeem-codes', adminAuth, getAllRedeemCodes);
adminRouter.get('/redeem-stats', adminAuth, getRedeemStats);

export default adminRouter;