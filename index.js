const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const User = require("./models/userSchema");
const Signup = require("./models/signupSchema");
const multer = require("multer");

// DataBase Connection for ADD_PRODUCT

mongoose.connect("mongodb://localhost:27017/ADD_PRODUCT").then(() => {
  console.log("MONGODB1 CONNECTED");
});

// MiddleWares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set filename to be current timestamp + original file extension
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
    const newItem = await User.create({
      Name,
      Price,
      date,
      Contact_NO,
      ADDRESS,
      // productImage: req.file.filename, // Corrected to use req.file.filename
    });
    console.log("New item added:", newItem);

    res.render("next_show", {
      newItem: newItem, // Pass newItem to next_show view for displaying
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
    const users = await User.find();
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

app.post("/button", (req, res) => {
  res.render("home");
});
app.post("/sign", (req, res) => {
  res.render("signup");
});

//SignUp Post Requuest
app.post("/signup", async (req, res) => {
  const { Name, email, password } = req.body;

  try {
    // Create a new user using the Signup model from the ADD_PRODUCT_SIGNUP_DB connection
    const newUser = await Signup.create({
      Name,
      email,
      password,
    });
    console.log("New User added:", newUser);

    res.render("next_show");
  } catch (error) {
    console.error("Error adding new user:", error);
    res.status(500).send("Error adding new user");
  }
});
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
