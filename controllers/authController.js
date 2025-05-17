const User = require("../models/Users");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getRegisterForm = (req, res) => {
  res.render("register", { layout: "auth", title: "Register" });
};

exports.getLoginForm = (req, res) => {
  res.render("login", { layout: "auth", title: "Login" });
};

exports.registerUser = async (req, res) => {
  const { username, email, password, bio} = req.body;
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, bio });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).send("Registration Error");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body; // Added rememberMe

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid password");

    const expiresIn = rememberMe ? "21d" : "1d"; // Extend session to 3 weeks if checked
    const maxAge = rememberMe ? 21 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; 

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge
    });

    res.redirect("/home");
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).send("Login Error");
  }
};
exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};