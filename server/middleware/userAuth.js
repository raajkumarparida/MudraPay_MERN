import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({
        success: false,
        message: 'Not Authorized. Login Again.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Ensure req.body exists
    if (!req.body) req.body = {};

    req.body.userId = decoded.id;
    next();

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export default userAuth;