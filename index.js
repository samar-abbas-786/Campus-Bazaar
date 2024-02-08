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
    cb(null, "uploads/"); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set filename to be current timestamp + original file extension
  },
});
const upload = multer({ storage: storage });

// Route to handle file upload and create a new item
app.post("/upload", upload.single("productImage"), async (req, res) => {
  console.log("req.file:", req.file); // Debug: Check if req.file is populated
  if (!req.file) {
    return res.status(400).send("No file uploaded."); // Send error response if no file uploaded
  }

  const { Name, Price, date } = req.body;
  const productImage = req.file.path; // Get the path of the uploaded image
  console.log("Uploaded file path:", productImage); // Debug: Check the uploaded file path
  try {
    const newItem = await User.create({
      Name,
      Price,
      date,
      productImage,
    });
    console.log("New item added:", newItem);
    res.render("show", {
      //   data: url.replace(/'/g, ""),
      data: productImage,
    });
    console.log(productImage);
  } catch (error) {
    console.error("Error adding new item:", error);
    res.status(500).send("Error adding new item");
  }
});

// Route to render the home page with the upload form
app.get("/", (req, res) => {
  return res.render("home");
});

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
