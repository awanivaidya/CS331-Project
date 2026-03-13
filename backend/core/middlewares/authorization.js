const isManager = (req) => {
  const role = req.user?.type || req.user?.role;
  return role === "Manager";
};

const managerOnly = (req, res, next) => {
  if (!isManager(req)) {
    return res.status(403).json({ error: "Manager access required" });
  }
  return next();
};

module.exports = {
  managerOnly,
};
