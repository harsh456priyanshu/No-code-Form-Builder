const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

async function registerController(req, res) {
  const { username, email, password } = req.body;

  try {
    // Checks if either the username OR the email already exists
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const user = await userModel.create({
      username,
      email,
      password: await bcrypt.hash(password, 10)
    });

    return res.status(201).json({ message: "User registered successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error });
  }
}

async function loginController(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "User LoggedIn Successfully",
      user: {
        username: user.username,
        email: user.email,
        id: user._id
      },
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error });
  }
}

module.exports = {
  registerController,
  loginController
};