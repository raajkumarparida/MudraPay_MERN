import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate UPI ID from email before @
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '.');
    const upiId = `${emailPrefix}@mudra.pay`;

    // ✅ Generate OTP for email verification
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      upiId: upiId,
      verifyOtp: otp,  // ✅ Store OTP
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000  // ✅ 24 hours expiry
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Send welcome email with OTP
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: `Welcome to MudraPay - Verify Your Account`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Welcome to MudraPay!</h2>
            <p>Your account has been created successfully.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Your UPI ID:</strong> ${upiId}</p>
            </div>
            
            <h3 style="color: #6366f1;">Verify Your Email</h3>
            <p>Please use the following OTP to verify your email address:</p>
            
            <div style="background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 24 hours.</p>
            
            <p>Once verified, you can start receiving and sending payments!</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
          </div>
        `
    }

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Registration successful! Please check your email for verification OTP.",
      upiId: upiId,
      requiresVerification: true  // ✅ Flag to redirect to verification page
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res)=> {
    const {email, password} = req.body;

     if(!email || !password) {
        return res.json({success: false, message: 'Missing Details'})
    }

    try {
        const user = await userModel.findOne({ email })

        if(!user) {
            return res.json({
            success: false,
            message: "Invalid email or password" 
        })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.json({
            success: false,
            message: "Invalid email or password" })
        }

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })

        res.cookie('token', token, {
            httpOnly : true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success: true,
            message: "Login successful"
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message 
        })
    }
}

export const logout = async (req, res)=> {
    try {
        res.clearCookie('token', {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })

        return res.json({
            success: true,
            message: "Logged Out" 
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message 
        })
    }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified"
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Verify your MudraPay account`,
      text: `Your MudraPay verification OTP is ${otp}. It will expire in 24 hours.`
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Verification OTP sent to your email"
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body

    if(!userId || !otp) {
        return res.json({
            success: false,
            message: 'Missing Details'
        })
    }

    try {
        const user = await userModel.findById(userId)

        if(!user) {
            return res.json({
            success: false,
            message: 'User not found'
        })
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({
            success: false,
            message: 'Invalid OTP'
        })
        }

        if(user.verifyOtpExpireAt < Date.now()) {
            return res.json({
            success: false,
            message: 'OTP Expired'
        })
        }

        user.isAccountVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0;
        await user.save()
        
        return res.json({
            success: true,
            message: 'Email verified successfully'
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            isAdmin: user.isAdmin || false,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const sendResetOtp = async (req, res) => {
    const {email} = req.body

    if(!email) {
        return res.json({
            success: false,
            message: 'Email is required'
        })
    }

    try {
        const user = await userModel.findOne({ email })

        if(!user) {
            return res.json({
            success: false,
            message: 'User not found'
        })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: `Password Reset OTP`,
          text: `Your MudraPay password reset OTP is ${otp}. It will expire in 15 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({
          success: true,
          message: "Password Reset OTP sent to your email"
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
