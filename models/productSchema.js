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
    public_id: {
      type: String,
      required: [true, "Please provide the product image public_id"],
    },
    url: {
      type: String,
      required: [true, "Please provide the product image url"],
    },
  },
  ADDRESS: {
    type: String,
    required: true,
  },
  expired: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
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
