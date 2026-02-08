const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullname: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

const AuthUser = mongoose.model("AuthUser", authUserSchema);

export default AuthUser;
