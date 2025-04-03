const express = require("express");
const suggestionController = require("../controllers/suggestionController");
const router = express.Router();

router.post("/submit", suggestionController.submitSuggestion);

module.exports = router;
