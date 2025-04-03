const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
    req.flash("msg", "Successfully signed up");
    res.redirect("/");
  } catch (error) {
    console.error("Error adding new user:", error);
    req.flash("msg", "Something went wrong");
    res.status(500).send("Error adding new user");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.correctPassword(password, user.password)) {
    return res.status(401).send("Invalid email or password");
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
  res.status(200).redirect("/");
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).redirect("/");
};
