const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const User = require("./models/userSchema");
const multer = require("multer");

// DataBase Connection
mongoose
  .connect("mongodb://localhost:27017/ADD_PRODUCT", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// MiddleWares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { Name, Price, date } = req.body;

  try {
    const newItem = await User.create({
      Name,
      Price,
      date,
      productImage: req.file.filename, // Corrected to use req.file.filename
    });
    console.log("New item added:", newItem);

    res.render("show", {
      newItem: newItem, // Pass newItem to show view for displaying
    });
  } catch (error) {
    console.error("Error adding new item:", error);
    res.status(500).send("Error adding new item");
  }
});

app.get("/", (req, res) => {
  return res.render("home");
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

// app.get("/api/user", async (req, res) => {
//   try {
//     const users = await User.find();
//     // Extract _id field from each user and send it in the response
//     const userIds = users.map((user) => user._id);
//     const newUser = await User.findById(userIds);
//     res.send(newUser);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).send("Error fetching users");
//   }
// });

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
