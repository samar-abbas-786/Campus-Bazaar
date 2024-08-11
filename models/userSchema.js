const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please write your name"],
  },
  email: {
    type: String,
    required: [true, "Please write your email"],
    unique: true,
    // validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minLength: [5, "Password must contain atleast 5 characters"],
    maxLength: [30, "Password can contain atmost 30 characters"],
    select: false,
  },
});
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   // console.log("this.password :" + this.password);
// });
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
// vgcgcgggc
