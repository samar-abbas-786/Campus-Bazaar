const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  email: {
    type: String, // Changed from Number to String
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

const Signup = mongoose.model("Signup", signupSchema);
module.exports = Signup;
