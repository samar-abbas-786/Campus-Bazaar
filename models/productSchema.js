const mongoose = require("mongoose");

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

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
