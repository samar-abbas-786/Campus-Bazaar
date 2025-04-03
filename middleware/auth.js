const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userSchema");
async function protect(req, res, next) {
  let token;

  token = req.cookies.token;
  console.log(token);

  if (!token) {
    return res.status(403).render("signup");
  }

  try {
    // Verify JWT token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );
    // console.log(decoded);

    // const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user by ID from decoded token
    const user = await User.findById(decoded.id);
    console.log(user);

    if (!user) {
      return res.status(403).render("signup");
    }

    // Attach user object to the request for further processing
    req.user = user;
    next();
  } catch (error) {
    // Handle errors
    console.error("Error verifying token:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { protect };
