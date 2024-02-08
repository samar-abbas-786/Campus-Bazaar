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
  date: {
    type: String,
    require: true,
  },
  productImage: {
    type: String,
    require: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
