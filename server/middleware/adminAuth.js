import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.json({
                success: false,
                message: 'Not authorized. Admin access required.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.json({
                success: false,
                message: 'Invalid token.'
            });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found.'
            });
        }

        if (!user.isAdmin) {
            return res.json({
                success: false,
                message: 'Admin access required.'
            });
        }

        // Store user in req object
        req.user = {
            id: decoded.id,
            isAdmin: true
        };

        // Only assign to req.body if body exists (to support POST requests)
        if (req.body) {
            req.body.userId = decoded.id;
            req.body.isAdmin = true;
        }

        next();

    } catch (error) {
        console.error('Admin auth middleware error:', error);

        return res.json({
            success: false,
            message: 'Admin authentication failed'
        });
    }
};

export default adminAuth;
