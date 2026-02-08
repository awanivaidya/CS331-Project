import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db_connection.js";

const options = {
  httpOnly: true,
  // secure: true
};

const registerUser = async (req, res) => {
  const { username, email, fullname, password, role } = req.body;
  if ([username, email, fullname, password, role].some((item) => item === null)) {
    throw Error("All fields required!");
  }
  try {
    const results = await pool.query(
      "SELECT count(*) FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (Number(results.rows[0]["count"]) > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists!" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password, fullname, role) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hash, fullname, role]
    );

    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    const token = jwt.sign(
      {
        user_id: result.rows[0]["id"],
        username,
      },
      process.env.JWT_SECRET
    );

    return res
      .status(201)
      .cookie("token", token)
      .json({ message: "User Register Successfully!" });
  } catch (e) {
    console.error("Database error:", e);
    return res.status(500).json({ error: "Database query error", e });
  }
};

const loginUser = async (req, res) => {
  const { name, password } = req.body;

  if ([name, password].some((item) => item === null)) {
    throw Error("All Fields Required!");
  }

  const results = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1",
    [name]
  );

  if (results.rows.length === 0) {
    return res
      .status(400)
      .json({ error: "User with this username or email does not exist!" });
  }

  const check = await bcrypt.compare(password, results.rows[0]["password"]);

  if (!check) {
    return res.status(400).json({ error: "Incorrect password!" });
  }

  const token = jwt.sign(
    {
      user_id: results.rows[0]["id"],
      username: results.rows[0]["username"],
    },
    process.env.JWT_SECRET
  );

  return res
    .status(200)
    .cookie("token", token)
    .json({ message: "User Logged In Successfully!" });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", options);
  return res.status(200).json({ message: "User Logged Out!" });
};

export { registerUser, loginUser, logoutUser };
