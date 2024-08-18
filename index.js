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
  const Suggestion = require("./models/suggestionSchema");

  const multer = require("multer");
  const { protect } = require("./middleware/auth");
  const jwt = require("jsonwebtoken");
  require("dotenv").config();
  const cookieParser = require("cookie-parser");
  const cloudinary = require("./utils/cloudinary");
  const session = require("express-session");
  const flush = require("connect-flash");
  const Rent = require("./models/rentSchema");

  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MONGODB CONNECTED");
  });
  // console.log(`The Id is: ${process.pid}`);
  const array = [];
  // MiddleWares

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000,
      },
    })
  );
  app.use(flush());
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
  const upload = multer(
    { storage: storage },
    { limits: { fileSize: 5 * 1024 * 1024 } }
  );

  // upload and create a new item
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
      res.status(201).json("File uploaded successfully.");
    } catch (error) {
      console.error("Error adding new item:", error);
      res.status(500).send("Error adding new item");
    }
  });

  app.get("/about_section", (req, res) => {
    const token = req.cookies.token;
    return res.render("about", { cookie: token });
  });

  app.get("/", (req, res) => {
    // console.log("Cookies:", req.cookies.token); // Log cookies to the console
    const token = req.cookies.token; // Retrieve the cookie
    res.render("index", { cookie: token }); // Pass the cookie to the template
  });

  app.get("/api/user/", async (req, res) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      const token = req.cookies.token;
      // Render the 'show' EJS template and pass the products array to it
      return res.render("show", {
        products: products,
        cloud_name: process.env.cloud_name,
        cookie: token,
      });
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

    // console.log(req.body);
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
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
      });
      console.log(req.cookies.token);
      req.flash("msg", "Successfully signed");
      res.redirect("/");
      // Render the signup page
    } catch (error) {
      console.error("Error adding new user:", error);
      req.flash("msg", " Something Went Wrong");

      res.status(500).send("Error adding new user");
    }
  });

  app.post("/submitsuggestion", async (req, res) => {
    const { suggestion } = req.body;
    try {
      const newSuggestion = await Suggestion.create({
        suggestion,
      });
      res.status(200).render("thanks");
    } catch (error) {
      console.error("Error adding new suggestion:", error);
      res.status(500).send("Error adding new suggestion");
    }
  });

  app.get("/getOne/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        // Product with the given ID not found
        return res.status(404).send("Product not found");
      }
      const token = req.cookies.token;
      res.render("details", { product: product, cookie: token });
    } catch (error) {
      // Handle any errors that occur during the execution
      console.error("Error fetching product:", error);
      res.status(500).send("Error fetching product");
    }
  });

  app.get("/rent-form/:id", async (req, res) => {
    const id = req.params.id;
    const item = await Product.findById(id);
    const token = req.cookies.token;
    return res.render("rent", { item: item, cookie: token });
  });
  // app.get("/rent/:id", async (req, res) => {
  //   const id = req.params.id;
  //   const item = await Product.findById(id);
  //   res.render("rent", { item: item });
  // });

  app.post("/rent-post/:id", async (req, res) => {
    const { Name, email, day, role } = req.body;
    const id = req.params.id;
    const product = await Product.findById(id);
    // console.log(product);
    const rentItem = await Rent.create({ Name, email, day, role });
    res
      .status(200)
      .render("payment2", { product: product, rentItem: rentItem });
  });

  app.get("/logout", async (req, res) => {
    res.clearCookie("token");
    // res.redirect("/login");
    res.status(200).json("Logout Successfully");
  });

  app.get("/login", (req, res) => {
    const token = req.cookies.token;
    res.render("login", { cookie: token });
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

  //Add To Cart

  app.get("/addtocart/:id", async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.token;
    try {
      const product = await Product.findById(id);
      if (product) {
        array.push(product);
        res.render("cart", { array: array, cookie: token });
      } else {
        // Product not found
        res.status(404).send("Product not found");
      }
    } catch (error) {
      // Error occurred while fetching product
      console.error("Error fetching product:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  //DeleteRequest for Product

  app.delete("/remove/:id", async (req, res) => {
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
    const token = req.cookies.token;
    return res.render("show", { products: products, cookie: token });
  });
  app.get("/explore", async (req, res) => {
    const products = await Product.find({});
    const token = req.cookies.token;
    return res.render("show", { products: products, cookie: token });
  });
  app.get("/signup/get", (req, res) => {
    res.render("signup");
  });
  app.get("/home", (req, res) => {
    // const token = req.cookies.token;
    // res.render("index", { user: req.user, cookie: token });
    res.redirect("/");
  });
  app.get("/suggest", (req, res) => {
    const token = req.cookies.token;
    return res.render("suggestion", { cookie: token });
  });

  app.get("/user", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(500).json("Token Not Found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      res.status(500).json("No decoded found");
    }
    // console.log(decoded.id);
    const user = await User.findById(decoded.id);
    // console.log(user);
    res.render("profile1", { user: user });
  });

  app.get("/add", (req, res) => {
    const token = req.cookies.token;
    res.render("add", { cookie: token });
  });
  app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
  });
}
