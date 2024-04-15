const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  Price: {
    type: Number,
    require: [true, "Please provide the price"],
  },
  Contact_NO: {
    type: String,
    require: true,
  },
  productImage: {
    type: String,
  },
  ADDRESS: {
    type: String,
    require: true,
  },
  expired:{
    type:Boolean,
    default:false,
  },
  cretedAt: {
    type: Date,
    default: Date.now,
  },
});

// productSchema.pre("save", async function (next) {
//   if (!this.isModified("ADDRESS")) return next();
//   this.ADDRESS = await bcrypt.hash(this.ADDRESS, 12);
// });
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
