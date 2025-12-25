import userModel from '../models/userModel.js';
import cashbackRedemptionModel from '../models/cashbackRedemptionModel.js';

// User: Request cashback redemption
export const requestCashbackRedemption = async (req, res) => {
  try {
    const { userId, cashbackAmount, userUpiId } = req.body;

    if (!cashbackAmount || !userUpiId) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Minimum redemption: 100 cashback points
    if (cashbackAmount < 100) {
      return res.json({
        success: false,
        message: 'Minimum redemption amount is 100 cashback points'
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has enough cashback
    if (user.totalCashback < cashbackAmount) {
      return res.json({
        success: false,
        message: `Insufficient cashback. You have ₹${user.totalCashback} available`
      });
    }

    // Check for pending requests
    const pendingRequest = await cashbackRedemptionModel.findOne({
      userId,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.json({
        success: false,
        message: 'You already have a pending redemption request'
      });
    }

    // Calculate INR amount (100 cashback = 1 INR)
    const inrAmount = cashbackAmount / 100;

    // Deduct cashback from user
    user.totalCashback -= cashbackAmount;
    await user.save();

    // Create redemption request
    const redemptionRequest = new cashbackRedemptionModel({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      cashbackAmount,
      inrAmount,
      userUpiId,
      status: 'pending'
    });

    await redemptionRequest.save();

    res.json({
      success: true,
      message: `Redemption request submitted! You will receive ₹${inrAmount} once approved`,
      redemption: {
        cashbackAmount,
        inrAmount,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Request redemption error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// User: Get redemption history
export const getUserRedemptions = async (req, res) => {
  try {
    const { userId } = req.body;

    const redemptions = await cashbackRedemptionModel
      .find({ userId })
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      redemptions
    });

  } catch (error) {
    console.error('Get user redemptions error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all redemption requests
export const getAllRedemptionRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status && status !== 'all' ? { status } : {};
    
    const requests = await cashbackRedemptionModel
      .find(filter)
      .sort({ requestedAt: -1 });

    const stats = {
      total: await cashbackRedemptionModel.countDocuments(),
      pending: await cashbackRedemptionModel.countDocuments({ status: 'pending' }),
      approved: await cashbackRedemptionModel.countDocuments({ status: 'approved' }),
      completed: await cashbackRedemptionModel.countDocuments({ status: 'completed' }),
      rejected: await cashbackRedemptionModel.countDocuments({ status: 'rejected' })
    };

    res.json({
      success: true,
      requests,
      stats
    });

  } catch (error) {
    console.error('Get redemption requests error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Approve redemption request
export const approveRedemption = async (req, res) => {
  try {
    const { userId, redemptionId } = req.body;

    const admin = await userModel.findById(userId);
    
    if (!admin || !admin.isAdmin) {
      return res.json({
        success: false,
        message: 'Admin access required'
      });
    }

    const redemption = await cashbackRedemptionModel.findById(redemptionId);

    if (!redemption) {
      return res.json({
        success: false,
        message: 'Redemption request not found'
      });
    }

    if (redemption.status !== 'pending') {
      return res.json({
        success: false,
        message: `Request is already ${redemption.status}`
      });
    }

    redemption.status = 'approved';
    redemption.approvedAt = new Date();
    redemption.approvedBy = {
      adminId: admin._id,
      adminName: admin.name
    };

    await redemption.save();

    res.json({
      success: true,
      message: 'Redemption request approved',
      redemption
    });

  } catch (error) {
    console.error('Approve redemption error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Complete redemption (after payment sent)
export const completeRedemption = async (req, res) => {
  try {
    const { userId, redemptionId, transactionProof } = req.body;

    const admin = await userModel.findById(userId);
    
    if (!admin || !admin.isAdmin) {
      return res.json({
        success: false,
        message: 'Admin access required'
      });
    }

    const redemption = await cashbackRedemptionModel.findById(redemptionId);

    if (!redemption) {
      return res.json({
        success: false,
        message: 'Redemption request not found'
      });
    }

    if (redemption.status !== 'approved') {
      return res.json({
        success: false,
        message: 'Request must be approved first'
      });
    }

    redemption.status = 'completed';
    redemption.completedAt = new Date();
    redemption.transactionProof = transactionProof || '';

    await redemption.save();

    res.json({
      success: true,
      message: 'Redemption marked as completed',
      redemption
    });

  } catch (error) {
    console.error('Complete redemption error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Reject redemption request
export const rejectRedemption = async (req, res) => {
  try {
    const { userId, redemptionId, reason } = req.body;

    const admin = await userModel.findById(userId);
    
    if (!admin || !admin.isAdmin) {
      return res.json({
        success: false,
        message: 'Admin access required'
      });
    }

    const redemption = await cashbackRedemptionModel.findById(redemptionId);

    if (!redemption) {
      return res.json({
        success: false,
        message: 'Redemption request not found'
      });
    }

    if (redemption.status !== 'pending') {
      return res.json({
        success: false,
        message: `Request is already ${redemption.status}`
      });
    }

    // Refund cashback to user
    const user = await userModel.findById(redemption.userId);
    if (user) {
      user.totalCashback += redemption.cashbackAmount;
      await user.save();
    }

    redemption.status = 'rejected';
    redemption.rejectionReason = reason || 'No reason provided';
    redemption.approvedBy = {
      adminId: admin._id,
      adminName: admin.name
    };

    await redemption.save();

    res.json({
      success: true,
      message: 'Redemption request rejected and cashback refunded',
      redemption
    });

  } catch (error) {
    console.error('Reject redemption error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};