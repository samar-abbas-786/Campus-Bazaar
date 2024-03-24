const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const productSchema = new mongoose.Schema({
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
// productSchema.pre("save", async function (next) {
//   if (!this.isModified("ADDRESS")) return next();
//   this.ADDRESS = await bcrypt.hash(this.ADDRESS, 12);
// });
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
