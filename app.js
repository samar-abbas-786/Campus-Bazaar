const express = require("express");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serving static files
app.use(express.static("public"));

// Render index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Handle form submission
app.post("/submit", upload.single("photo"), (req, res) => {
  const { name, email } = req.body;
  const photo = req.file.filename; // Uploaded file name

  // Render another EJS file with submitted data
  res.render("profile", { name, email, photo });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
