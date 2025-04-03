const Suggestion = require("../models/suggestionSchema");

exports.submitSuggestion = async (req, res) => {
  const { suggestion } = req.body;
  const token = req.cookies.token;
  try {
    await Suggestion.create({ suggestion });
    res.status(200).render("thanks", { cookie: token });
  } catch (error) {
    console.error("Error adding new suggestion:", error);
    res.status(500).send("Error adding new suggestion");
  }
};
