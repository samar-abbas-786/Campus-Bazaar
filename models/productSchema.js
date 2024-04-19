const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: [true, "Please provide the price"],
  },
  Contact_NO: {
    type: Number,
    required: true,
  },
  productImage: {
    type: String,
    required: [true, "Please provide the product image"],
  },
  ADDRESS: {
    type: String,
    required: true,
  },
  expired: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ["Electronics", "Education", "Fashion/Lifestyle", "All", "Other"],
    default: "All",
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
