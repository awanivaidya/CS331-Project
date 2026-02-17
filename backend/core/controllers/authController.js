const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const options = {
  httpOnly: true,
  // secure: true
};

const registerUser = async (req, res) => {
  const { username, email, fullname, password, role } = req.body;
  if ([username, email, fullname, password, role].some((item) => item == null)) {
    return res.status(400).json({ error: "All fields required!" });
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
      role,
    });

    const token = jwt.sign(
      {
        user_id: createdUser._id.toString(),
        username,
      },
      process.env.JWT_SECRET
    );

    return res
      .status(201)
      .cookie("token", token, options)
      .json({ message: "User Register Successfully!" });
  } catch (e) {
    console.error("Database error:", e);
    return res.status(500).json({ error: "Database query error", e });
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
    process.env.JWT_SECRET
  );

  return res
    .status(200)
    .cookie("token", token, options)
    .json({ message: "User Logged In Successfully!" });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", options);
  return res.status(200).json({ message: "User Logged Out!" });
};

module.exports = { registerUser, loginUser, logoutUser };
