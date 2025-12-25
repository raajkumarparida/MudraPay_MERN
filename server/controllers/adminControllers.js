import redeemModel from "../models/redeemModel.js";
import userModel from "../models/userModel.js";

// Generate unique 10-digit alphanumeric code
const generateRedeemCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Create redeem code
export const createRedeemCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Get admin user details
    const admin = await userModel.findById(userId);
    if (!admin) {
      return res.json({
        success: false,
        message: "Admin not found"
      });
    }

    // Generate unique code
    let code = generateRedeemCode();
    let codeExists = await redeemModel.findOne({ code });
    
    // Regenerate if code already exists
    while (codeExists) {
      code = generateRedeemCode();
      codeExists = await redeemModel.findOne({ code });
    }

    // Create redeem code
    const redeemCode = new redeemModel({
      code,
      amount,
      description: description || `Gift code worth ₹${amount}`,
      createdBy: {
        userId: admin._id,
        name: admin.name,
        email: admin.email
      }
    });

    await redeemCode.save();

    res.json({
      success: true,
      message: "Redeem code created successfully",
      redeemCode: {
        code: redeemCode.code,
        amount: redeemCode.amount,
        description: redeemCode.description
      }
    });

  } catch (error) {
    console.error('Create redeem code error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get all redeem codes (admin only)
export const getAllRedeemCodes = async (req, res) => {
  try {
    const redeemCodes = await redeemModel.find().sort({ timestamp: -1 });

    res.json({
      success: true,
      redeemCodes
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get redeem code statistics
export const getRedeemStats = async (req, res) => {
  try {
    const totalCodes = await redeemModel.countDocuments();
    const redeemedCodes = await redeemModel.countDocuments({ isRedeemed: true });
    const pendingCodes = await redeemModel.countDocuments({ isRedeemed: false });
    
    const totalAmount = await redeemModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const redeemedAmount = await redeemModel.aggregate([
      { $match: { isRedeemed: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalCodes,
        redeemedCodes,
        pendingCodes,
        totalAmount: totalAmount[0]?.total || 0,
        redeemedAmount: redeemedAmount[0]?.total || 0,
        pendingAmount: (totalAmount[0]?.total || 0) - (redeemedAmount[0]?.total || 0)
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};