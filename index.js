const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const Product = require("./models/productSchema");
const User = require("./models/userSchema");
const multer = require("multer");
const auth = require("./middleware/auth");
// const os = require("os");
// const cluster = require("cluster");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const { setuser, getuser } = require("./service/auth");
const cookieParser = require("cookie-parser");
// const { restrictedToLoggedInUserOnly } = require("./middleware/auth");
// DataBase Connection for ADD_PRODUCT

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MONGODB1 CONNECTED");
});

const products = [
  {
    name: "Dummy",
    price: "100",
    contact_no: "0700000000",
    address: "dummy",
  },
];

// MiddleWares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
// app.use((req, res, next) => {
//   // console.log(req.headers.authorization);
// });

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
  const { Name, Price, Contact_NO, ADDRESS } = req.body;
  try {
    const newItem = new Product({
      Name,
      Price,
      Contact_NO,
      ADDRESS,
      productImage: req.file.filename,
    });
    await newItem.save();
    res.status(201).json(" file uploaded successfully .");
    console.log("New item added:", newItem);

    res.render("show");
  } catch (error) {
    console.error("Error adding new item:", error);
    res.status(500).send("Error adding new item");
  }
});

app.get("/", (req, res) => {
  return res.render("index");
});

app.get("/api/user", async (req, res) => {
  try {
    const users = await Product.find({ expired: false });
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

app.post("/button", (req, res) => {
  res.render("home");
});
//SignUp Post Requuest
// const signToken = (id) => {
//   return;
// };
app.post("/signup/user", async (req, res, next) => {
  // const { name, email, password } = req.body;
  console.log(req.body);

  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
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

  // const correct = await user.correctPassword(password, user.password);

  if (!user || !user.correctPassword(password, user.password)) {
    return res.status(401).send("Invalid email or password");
  }

  res.status(200).send("User login successfully");

  // if (!user) return res.redirect("/login");
  // else {
  //   res.render("index");
  // }
});

// async function protect(req, res, next) {
//   let token;

//   if (
//     req.headers.Authorization &&
//     req.headers.Authorization.startsWith("samar")
//   ) {
//     token = req.headers.Authorization.split(" ")[1];
//   }
//   if (!token) {
//     return res.status(403).send("Access denied");
//   }
//   console.log(token);
//   next();
// }

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

// app.post("/addToCart", async (req, res) => {
//   const product = await Product.findByOne({ name: req.name });
//   products.push(product);
//   res.render("cart", { products: products });
// });

// app.post("/protect", ()=>{

// })

app.get("/allProducts", (req, res) => {
  const products = Product.find();
  res.render("show", { products: products });
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
