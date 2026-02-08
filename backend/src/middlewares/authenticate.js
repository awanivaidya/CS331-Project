import jwt from "jsonwebtoken";

const authenticateToken = async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access Denied!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ error: "Invalid Token!" });
    req.user = user;
    next();
  });
};

export { authenticateToken };
