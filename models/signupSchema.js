const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  email: {
    type: Number,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  // productImage: {
  //   type: String,
  //   require: true,
  // },
  //   ADDRESS: {
  //     type: String,
  //     require: true,
  //   },
});

const Signup = mongoose.model("Signup", signupSchema);
module.exports = Signup;
