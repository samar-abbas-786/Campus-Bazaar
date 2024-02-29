const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  Price: {
    type: Number,
    require: true,
  },
  Contact_NO: {
    type: String,
    require: true,
  },
  // productImage: {
  //   type: String,
  //   require: true,
  // },
  ADDRESS: {
    type: String,
    require: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
