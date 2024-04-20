const express = require("express");
const routes = express.Router();
const { productUpload } = require("../controllers/productController");

routes.post("/upload", upload.single("productImage"), productUpload);
