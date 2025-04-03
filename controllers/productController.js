const Product = require("../models/productSchema");
const cloudinary = require("../utils/cloudinary");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    const token = req.cookies.token;
    res.render("show", { products, cookie: token });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
};

exports.uploadProduct = async (req, res) => {
  const { Name, Price, Contact_NO, ADDRESS, category, rent } = req.body;
  try {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "uploads" });
    const newItem = new Product({
      Name, Price, Contact_NO, ADDRESS, category, rent,
      productImage: { public_id: result.public_id, url: result.secure_url },
    });
    await newItem.save();
    res.status(201).redirect("/products");
  } catch (error) {
    console.error("Error adding new item:", error);
    res.status(500).send("Error adding new item");
  }
};
