const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const Product = require("./models/productSchema");
const User = require("./models/userSchema");
const multer = require("multer");
const os = require("os");
const cluster = require("cluster");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { setuser, getuser } = require("./service/auth");
const cookieParser = require("cookie-parser");
const { restrictedToLoggedInUserOnly } = require("./middleware/auth");
// DataBase Connection for ADD_PRODUCT

mongoose.connect("mongodb://localhost:27017/ADD_PRODUCT").then(() => {
  console.log("MONGODB1 CONNECTED");
});

// MiddleWares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// upload and create a new item
app.post("/upload", upload.single("productImage"), async (req, res) => {
  console.log("req.file:", req.file);
  // if (!req.file) {
  //   return res.status(400).send("No file uploaded.");
  // }

  const { Name, Price, date, Contact_NO, ADDRESS } = req.body;

  try {
    const newItem = await Product.create({
      Name,
      Price,
      date,
      Contact_NO,
      ADDRESS,
      // productImage: req.file.filename, // Corrected to use req.file.filename
    });
    console.log("New item added:", newItem);

    res.render("next_show", {
      newItem: newItem,
    });
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
    const users = await Product.find();
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
app.post("/signup/user", async (req, res) => {
  const { Name, email, password } = req.body;

  try {
    const newUser = await User.create({ Name, email, password });

    console.log("New User added:", newUser);

    // Render the signup page
    res.render("signup");
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
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Invalid email or password
    return res.render("login");
  }

  // Generate a unique session ID
  const sessionId = uuidv4();

  // Save the session ID associated with the user
  setuser(sessionId, user);

  // Set the session ID as a cookie
  res.cookie("uid", sessionId);

  // Redirect the user to the homepage or any other authorized page
  res.render("add");
});

app.get("/allProducts", (req, res) => {
  res.render("next_show");
});
app.get("/signup/get", (req, res) => {
  res.render("signup");
});

app.get("/add", restrictedToLoggedInUserOnly, (req, res) => {
  res.render("add");
});
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
//Check if Password is Correct

// const isCorrectPassword = await bcrypt.compare(password, user.password);
// if (!isCorrectPassword) {
//   res.status(401).send("Invalid password)");
// }
// const mySecretKey = process.env.SECRET_KEY;
// Payload to generate JWT

// const payload = {
//   name: user.name,
//   email: user.email,
//   password: user.password,
// };

// const token = jwt.sign(payload, mySecretKey, { expiresIn: "5days" });
// console.log(token);
