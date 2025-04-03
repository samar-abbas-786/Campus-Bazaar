const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flush = require("connect-flash");
const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const { protect } = require("./middleware/auth");

let redisClient;
(async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => {
    console.error(`Error-Redis : ${error}`);
  });
  await redisClient.connect();
})();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MONGODB CONNECTED"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);
app.use(flush());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/suggestions", suggestionRoutes);

app.get("/", (req, res) => {
  const token = req.cookies.token;
  res.render("index", { cookie: token });
});

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
