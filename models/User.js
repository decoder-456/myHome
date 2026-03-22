const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true },
    userType:  { type: String, enum: ["guest", "host"], required: true },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Home" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
