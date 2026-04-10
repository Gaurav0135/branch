import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminOnly = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      req.user = { id: decoded.id, role: decoded.role };
      return next();
    }

    const user = await User.findById(decoded.id).select("name email role").lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};