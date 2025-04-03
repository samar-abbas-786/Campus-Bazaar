const express = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");
const { protect } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", productController.getAllProducts);
router.post("/upload", protect, upload.single("productImage"), productController.uploadProduct);

module.exports = router;
