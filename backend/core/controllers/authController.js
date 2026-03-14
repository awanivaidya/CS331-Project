const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const options = {
  httpOnly: true,
  // secure: true
};

const normalizeUserType = (value) => {
  if (!value) return "Staff";
  if (["Manager", "Staff"].includes(value)) return value;
  return null;
};

const registerUser = async (req, res) => {
  const { username, email, fullname, password, role, type, assignedDomains } =
    req.body;
  if ([username, email, fullname, password].some((item) => item == null)) {
    return res.status(400).json({ error: "All fields required!" });
  }

  const userType = normalizeUserType(type || role);
  if (!userType) {
    return res
      .status(400)
      .json({ error: "type/role must be Manager or Staff" });
  }

  if (
    userType === "Staff" &&
    (!Array.isArray(assignedDomains) || assignedDomains.length === 0)
  ) {
    return res
      .status(400)
      .json({ error: "Staff must have at least one assigned domain" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    }).lean();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists!" });
    }

    const hash = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      username,
      email,
      password: hash,
      fullname,
      role: userType,
      type: userType,
      assignedDomains: userType === "Staff" ? assignedDomains : [],
    });

    const token = jwt.sign(
      {
        user_id: createdUser._id.toString(),
        username: createdUser.username,
      },
      process.env.JWT_SECRET,
    );

    return res
      .status(201)
      .cookie("token", token, options)
      .json({
        message: "User register successfully",
        user: {
          _id: createdUser._id,
          username: createdUser.username,
          email: createdUser.email,
          fullname: createdUser.fullname,
          role: createdUser.role,
          type: createdUser.type,
          assignedDomains: createdUser.assignedDomains,
        },
        token,
      });
  } catch (e) {
    console.error("Database error:", e);
    return res.status(500).json({ error: e.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  const { name, password } = req.body;

  if ([name, password].some((item) => item == null)) {
    return res.status(400).json({ error: "All Fields Required!" });
  }

  const user = await User.findOne({
    $or: [{ username: name }, { email: name }],
  }).lean();

  if (!user) {
    return res
      .status(400)
      .json({ error: "User with this username or email does not exist!" });
  }

  const check = await bcrypt.compare(password, user.password);

  if (!check) {
    return res.status(400).json({ error: "Incorrect password!" });
  }

  const token = jwt.sign(
    {
      user_id: user._id.toString(),
      username: user.username,
    },
    process.env.JWT_SECRET,
  );

  return res
    .status(200)
    .cookie("token", token, options)
    .json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        type: user.type,
        assignedDomains: user.assignedDomains || [],
      },
      token,
    });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", options);
  return res.status(200).json({ message: "User Logged Out!" });
};

const getCurrentUser = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
