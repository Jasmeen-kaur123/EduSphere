const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const secret = process.env.JWT_SECRET || 'secretkey'
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};