import userModel from "../models/userModel.js";
import redeemModel from "../models/redeemModel.js";

// Get user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        balance: user.balance,
        credited: user.credited,
        debited: user.debited,
        totalCashback: user.totalCashback,  //NEW
        isUser: user.isUser,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update balance
export const updateBalance = async (req, res) => {
  try {
    const { userId, amount, type } = req.body;

    if (!userId || !amount || !type) {
      return res.json({
        success: false,
        message: "Missing required fields"
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.json({
        success: false,
        message: "Invalid amount"
      });
    }

    if (type === 'credit') {
      user.balance = Number(user.balance) + numAmount;
      user.credited = Number(user.credited) + numAmount;
    } else if (type === 'debit') {
      if (Number(user.balance) < numAmount) {
        return res.json({
          success: false,
          message: "Insufficient balance"
        });
      }
      user.balance = Number(user.balance) - numAmount;
      user.debited = Number(user.debited) + numAmount;
    } else {
      return res.json({
        success: false,
        message: "Invalid transaction type"
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Balance ${type === 'credit' ? 'credited' : 'debited'} successfully`,
      userData: {
        balance: user.balance,
        credited: user.credited,
        debited: user.debited
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get balance
export const getBalance = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      balance: {
        total: user.balance,
        credited: user.credited,
        debited: user.debited,
        totalCashback: user.totalCashback
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

//NEW: Verify UPI PIN
export const verifyUpiPin = async (req, res) => {
  try {
    const { userId } = req.body;
    const { upiPin } = req.body;

    if (!upiPin) {
      return res.json({
        success: false,
        message: "UPI PIN is required"
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Verify PIN
    if (user.upiPin !== upiPin) {
      return res.json({
        success: false,
        message: "Incorrect UPI PIN"
      });
    }

    res.json({
      success: true,
      message: "UPI PIN verified"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

//UPDATED: Send money with cashback and UPI PIN verification
export const sendMoney = async (req, res) => {
  try {
    const { userId } = req.body;
    const { recipientUpiId, amount, description, upiPin } = req.body;

    if (!recipientUpiId || !amount || !upiPin) {
      return res.json({
        success: false,
        message: "Recipient UPI ID, amount, and UPI PIN are required"
      });
    }

    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.json({
        success: false,
        message: "Invalid amount. Must be a positive number"
      });
    }

    // Get sender
    const sender = await userModel.findById(userId);
    if (!sender) {
      return res.json({
        success: false,
        message: "Sender not found"
      });
    }

    // Verify UPI PIN
    if (sender.upiPin !== upiPin) {
      return res.json({
        success: false,
        message: "Incorrect UPI PIN"
      });
    }

    const senderBalance = Number(sender.balance);
    
    if (senderBalance < numAmount) {
      return res.json({
        success: false,
        message: `Insufficient balance. Available: ₹${senderBalance.toFixed(2)}`
      });
    }

    // Get recipient
    const recipient = await userModel.findOne({ upiId: recipientUpiId });
    if (!recipient) {
      return res.json({
        success: false,
        message: "Recipient UPI ID not found"
      });
    }

    if (sender._id.equals(recipient._id)) {
      return res.json({
        success: false,
        message: "Cannot send money to yourself"
      });
    }

    // Calculate random cashback (1% to 5%)
    const cashbackPercent = Math.floor(Math.random() * 5) + 1; // Random 1-5%
    const cashbackAmount = Number((numAmount * cashbackPercent / 100).toFixed(2));

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create transaction object
    const transaction = {
      transactionId,
      from: {
        userId: sender._id,
        name: sender.name,
        upiId: sender.upiId
      },
      to: {
        userId: recipient._id,
        name: recipient.name,
        upiId: recipient.upiId
      },
      amount: numAmount,
      cashback: cashbackAmount,          // Cashback amount
      cashbackPercent: cashbackPercent,  // Cashback percentage
      type: 'debit',
      status: 'success',
      description: description || 'Payment',
      timestamp: new Date()
    };

    // Update sender
    sender.balance = Number(sender.balance) - numAmount;  // Add cashback to balance
    sender.debited = Number(sender.debited) + numAmount;
    sender.totalCashback = Number(sender.totalCashback) + cashbackAmount;  // Track total cashback
    sender.transactions.push(transaction);

    // Update recipient
    recipient.balance = Number(recipient.balance) + numAmount;
    recipient.credited = Number(recipient.credited) + numAmount;
    recipient.transactions.push({
      ...transaction,
      type: 'credit',
      cashback: 0,  // Recipient doesn't get cashback
      cashbackPercent: 0
    });

    // Save both
    await sender.save();
    await recipient.save();

    console.log('Payment successful with cashback:', {
      from: sender.upiId,
      to: recipient.upiId,
      amount: numAmount,
      cashback: cashbackAmount,
      cashbackPercent: cashbackPercent,
      senderNewBalance: sender.balance
    });

    res.json({
      success: true,
      message: "Payment successful",
      transaction: {
        transactionId,
        amount: numAmount,
        cashback: cashbackAmount,
        cashbackPercent: cashbackPercent,
        recipient: recipient.name,
        balance: sender.balance
      }
    });

  } catch (error) {
    console.error('Send money error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// NEW: Update UPI PIN
export const updateUpiPin = async (req, res) => {
  try {
    const { userId } = req.body;
    const { oldPin, newPin } = req.body;

    if (!oldPin || !newPin) {
      return res.json({
        success: false,
        message: "Old PIN and new PIN are required"
      });
    }

    if (newPin.length < 4 || newPin.length > 6) {
      return res.json({
        success: false,
        message: "UPI PIN must be 4-6 digits"
      });
    }

    if (!/^\d+$/.test(newPin)) {
      return res.json({
        success: false,
        message: "UPI PIN must contain only numbers"
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (user.upiPin !== oldPin) {
      return res.json({
        success: false,
        message: "Incorrect old PIN"
      });
    }

    user.upiPin = newPin;
    await user.save();

    res.json({
      success: true,
      message: "UPI PIN updated successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const { limit = 50, skip = 0 } = req.query;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const transactions = user.transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({
      success: true,
      transactions,
      total: user.transactions.length
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get recent transactions
export const getRecentTransactions = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const transactions = user.transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get leaderboard (top cashback earners)
export const getLeaderboard = async (req, res) => {
  try {
    // Get all users sorted by totalCashback
    const users = await userModel
      .find({ isUser: true })
      .select('name upiId totalCashback')
      .sort({ totalCashback: -1 })
      .limit(100); // Top 100 users

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      upiId: user.upiId,
      totalCashback: user.totalCashback
    }));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Verify UPI ID exists
export const verifyUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      return res.json({
        success: false,
        message: "UPI ID is required"
      });
    }

    const user = await userModel.findOne({ upiId });

    if (!user) {
      return res.json({
        success: false,
        message: "UPI ID not found"
      });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        upiId: user.upiId
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Redeem a gift code
export const redeemGiftCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const { code } = req.body;

    if (!code) {
      return res.json({
        success: false,
        message: "Please enter a redeem code"
      });
    }

    // Find redeem code
    const redeemCode = await redeemModel.findOne({ code: code.toUpperCase() });

    if (!redeemCode) {
      return res.json({
        success: false,
        message: "Invalid redeem code"
      });
    }

    // Check if already redeemed
    if (redeemCode.isRedeemed) {
      return res.json({
        success: false,
        message: "This code has already been redeemed"
      });
    }

    // Get user details
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create transaction
    const transaction = {
      transactionId,
      from: {
        userId: null,
        name: 'MudraPay',
        upiId: 'system@mudra.pay'
      },
      to: {
        userId: user._id,
        name: user.name,
        upiId: user.upiId
      },
      amount: redeemCode.amount,
      cashback: 0,
      cashbackPercent: 0,
      type: 'credit',
      status: 'success',
      description: `Redeemed gift code: ${code}`,
      timestamp: new Date()
    };

    // Update user balance and add transaction
    user.balance = Number(user.balance) + Number(redeemCode.amount);
    user.credited = Number(user.credited) + Number(redeemCode.amount);
    user.transactions.push(transaction);
    await user.save();

    // Mark code as redeemed
    redeemCode.isRedeemed = true;
    redeemCode.redeemedBy = {
      userId: user._id,
      name: user.name,
      upiId: user.upiId
    };
    redeemCode.redeemedAt = new Date();
    await redeemCode.save();

    res.json({
      success: true,
      message: `₹${redeemCode.amount} credited to your account!`,
      transaction: {
        transactionId,
        amount: redeemCode.amount,
        balance: user.balance,
        description: redeemCode.description
      }
    });

  } catch (error) {
    console.error('Redeem code error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Verify redeem code (check if valid and not redeemed)
export const verifyRedeemCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({
        success: false,
        message: "Please enter a code"
      });
    }

    const redeemCode = await redeemModel.findOne({ code: code.toUpperCase() });

    if (!redeemCode) {
      return res.json({
        success: false,
        message: "Invalid code"
      });
    }

    if (redeemCode.isRedeemed) {
      return res.json({
        success: false,
        message: "Code already redeemed"
      });
    }

    res.json({
      success: true,
      message: "Valid code",
      redeemCode: {
        code: redeemCode.code,
        amount: redeemCode.amount,
        description: redeemCode.description
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

export const redeemCode = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!code) {
      return res.json({
        success: false,
        message: 'Please enter a redeem code'
      });
    }

    console.log('Redeeming code:', code, 'for user:', userId);

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    // Find redeem code
    const redeemCodeDoc = await redeemModel.findOne({ code: code.toUpperCase() });

    if (!redeemCodeDoc) {
      return res.json({
        success: false,
        message: 'Invalid redeem code'
      });
    }

    // Check if already redeemed
    if (redeemCodeDoc.isRedeemed) {
      return res.json({
        success: false,
        message: 'This code has already been redeemed'
      });
    }

    // Update user balance
    user.balance += redeemCodeDoc.amount;
    user.credited += redeemCodeDoc.amount;
    await user.save();

    // Mark code as redeemed
    redeemCodeDoc.isRedeemed = true;
    redeemCodeDoc.redeemedBy = {
      userId: user._id,
      name: user.name,
      upiId: user.upiId
    };
    redeemCodeDoc.redeemedAt = new Date();
    await redeemCodeDoc.save();

    console.log('Code redeemed successfully:', {
      code: code,
      amount: redeemCodeDoc.amount,
      user: user.name
    });

    return res.json({
      success: true,
      message: `Successfully redeemed ₹${redeemCodeDoc.amount}!`,
      amount: redeemCodeDoc.amount,
      newBalance: user.balance
    });

  } catch (error) {
    console.error('Redeem code error:', error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};