const os = require("os");
const cluster = require("cluster");

const total_cpu = os.availableParallelism();
// console.log(total);

if (cluster.isPrimary) {
  for (let i = 0; i < total_cpu; i++) {
    cluster.fork();
  }
} else {
  const express = require("express");
  const app = express();
  // const { v4: uuidv4 } = require("uuid");
  const mongoose = require("mongoose");
  const path = require("path");
  const PORT = process.env.PORT || 5000;
  const bodyParser = require("body-parser");
  const Product = require("./models/productSchema");
  const User = require("./models/userSchema");
  const multer = require("multer");
  const auth = require("./middleware/auth");
  const jwt = require("jsonwebtoken");
  require("dotenv").config();
  const cookieParser = require("cookie-parser");

  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MONGODB1 CONNECTED");
  });
  console.log(`The Id is: ${process.pid}`);

  // MiddleWares

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "uploads")));
  // console.log(__dirname);

  // View Engine
  app.set("view engine", "ejs");
  app.set("views", path.resolve("./views"));

  // Multer Setup
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage: storage });

  // upload and create a new item
  app.post("/upload", upload.single("productImage"), async (req, res) => {
    const { Name, Price, Contact_NO, ADDRESS, category } = req.body;
    try {
      const newItem = new Product({
        Name,
        Price,
        Contact_NO,
        ADDRESS,
        productImage: req.file.filename,
        category,
      });
      await newItem.save();
      // return res.render("show");
      res.status(201).json(" file uploaded successfully .");
      console.log("New item added:", newItem);

      return res.render("show");
    } catch (error) {
      console.error("Error adding new item:", error);
      res.status(500).send("Error adding new item");
    }
  });
  app.get("/about_section", (req, res) => {
    return res.render("about");
  });

  app.get("/", (req, res) => {
    return res.render("index");
  });

  app.get("/api/user/", async (req, res) => {
    try {
      const products = await Product.find({});

      // Render the 'show' EJS template and pass the products array to it
      return res.render("show", { products: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Error fetching products");
    }
  });

  app.get("/go-to-cart/:id?", async (req, res) => {
    try {
      const cart_products = await Product.findById(req.params.id);
      return res.render("cart", { cart_products: cart_products });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  });

  app.get("/select/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const selected_products = await Product.find({ category });
      return res.status(200).json({ selected_products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Error fetching products");
    }
  });

  app.post("/button", (req, res) => {
    res.render("home");
  });

  app.post("/signup/user", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);
    try {
      const newUser = await User.create({
        name,
        email,
        password,
      });

      // console.log("New User added:", newUser);
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      // Render the signup page
      res.status(200).json({
        status: "success",
        token,
        user: newUser,
      });
    } catch (error) {
      console.error("Error adding new user:", error);
      res.status(500).send("Error adding new user");
    }
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    if (!user || !user.correctPassword(password, user.password)) {
      return res.status(401).send("Invalid email or password");
    }
    res.status(200).send("User login successfully");
  });

  //DeleteRequest for Product

  app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      res.send(deletedUser);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Error deleting user");
    }
  });

  app.get("/allProducts", async (req, res) => {
    const products = await Product.find({});
    return res.render("show", { products: products });
  });
  app.get("/signup/get", (req, res) => {
    res.render("signup");
  });
  app.get("/home", (req, res) => {
    res.render("index");
  });

  app.get("/add", (req, res) => {
    res.render("add");
  });
  app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
  });
}
