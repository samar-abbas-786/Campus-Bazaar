const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please provide the email"],
  },
  day: {
    type: Number,
    required: [true, "Please provide the number of days"],
  },
  role: {
    type: String,
    required: [true, "Please provide Your Role"],
    // enum: ["Student", "Intern", "Professional", "Other"],
    // default: "Other",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rent = mongoose.model("Rent", rentSchema);

module.exports = Rent;
