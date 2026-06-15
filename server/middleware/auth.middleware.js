const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken } = require("../utils/generateToken");

const protect = async (req, res, next) => {
  try {
    // Check Authorization header first (for production)
    let token = null;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.cookies.accessToken;
    }

    if (!token) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ message: "Not authorized" });

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user || user.refreshToken !== refreshToken)
        return res.status(401).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken(user._id);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      req.user = user;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };