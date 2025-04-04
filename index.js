const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 8000;
const bodyParser = require("body-parser");

const Product = require("./models/productSchema");
const User = require("./models/userSchema");
const Suggestion = require("./models/suggestionSchema");
const Rent = require("./models/rentSchema");

const multer = require("multer");
const { protect } = require("./middleware/auth");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const cookieParser = require("cookie-parser");
const cloudinary = require("./utils/cloudinary");
const session = require("express-session");
const flash = require("connect-flash");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
});

// Middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// In-memory cart (for demo purposes)
const cartArray = [];

// Routes
app.get("/", (req, res) => res.render("index", { cookie: req.cookies.token }));

app.get("/about_section", (req, res) =>
  res.render("about", { cookie: req.cookies.token })
);

app.get("/api/user", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.render("show", {
      products,
      cloud_name: process.env.cloud_name,
      cookie: req.cookies.token,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error fetching products");
  }
});

app.post("/upload", upload.single("productImage"), async (req, res) => {
  const { Name, Price, Contact_NO, ADDRESS, category, rent } = req.body;

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });

    const newItem = new Product({
      Name,
      Price,
      Contact_NO,
      ADDRESS,
      productImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      category,
      rent,
    });

    await newItem.save();
    console.log("New item added:", newItem);
    res.status(201).redirect("/allProducts");
  } catch (err) {
    console.error("Error adding new item:", err);
    res.status(500).send("Error adding new item");
  }
});

app.post("/signup/user", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    req.flash("msg", "Successfully signed");
    res.redirect("/");
  } catch (err) {
    console.error("Error signing up user:", err);
    req.flash("msg", "Something went wrong");
    res.status(500).send("Error adding new user");
  }
});

app.post("/submitsuggestion", async (req, res) => {
  const { suggestion } = req.body;
  try {
    await Suggestion.create({ suggestion });
    res.status(200).render("thanks", { cookie: req.cookies.token });
  } catch (err) {
    console.error("Error adding suggestion:", err);
    res.status(500).send("Error adding suggestion");
  }
});

app.get("/getOne/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("details", { product, cookie: req.cookies.token });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Error fetching product");
  }
});

app.get("/rent-form/:id", async (req, res) => {
  const item = await Product.findById(req.params.id);
  res.render("rent", { item, cookie: req.cookies.token });
});

app.post("/rent-post/:id", async (req, res) => {
  const { Name, email, day, role } = req.body;
  const product = await Product.findById(req.params.id);
  const rentItem = await Rent.create({ Name, email, day, role });
  res.render("payment2", { product, rentItem });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.correctPassword(password, user.password)) {
    return res.status(401).send("Invalid email or password");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }).redirect("/");
});

app.get("/addtocart/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      cartArray.push(product);
      res.render("cart", { array: cartArray, cookie: req.cookies.token });
    } else {
      res.status(404).send("Product not found");
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/remove/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.send(deletedUser);
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});

app.get("/allProducts", async (req, res) => {
  const products = await Product.find({});
  res.render("show", { products, cookie: req.cookies.token });
});

app.get("/explore", async (req, res) => {
  const products = await Product.find({});
  res.render("show", { products, cookie: req.cookies.token });
});

app.get("/signup/get", (req, res) => res.render("signup"));

app.get("/home", (req, res) => res.redirect("/"));

app.get("/suggest", (req, res) =>
  res.render("suggestion", { cookie: req.cookies.token })
);

app.get("/user", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Token Not Found");

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) return res.status(401).send("Invalid Token");

  const user = await User.findById(decoded.id);
  res.render("profile1", { user });
});

app.get("/add", protect, (req, res) => {
  res.render("add", { cookie: req.cookies.token });
});

// Start Server
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
