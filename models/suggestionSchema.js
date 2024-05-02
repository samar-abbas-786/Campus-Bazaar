const mongoose = require("mongoose");
const suggestionSchema = new mongoose.Schema({
  suggestion: {
    type: String,
    required: [true, "Please write your suggestion"],
  },
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);
module.exports = Suggestion;
// vgcgcgggc
