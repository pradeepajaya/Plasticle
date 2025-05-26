const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    console.log("Raw token:", token);
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    console.log("Decoded user:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res.status(400).json({ message: "Invalid Token" });
  }
};
