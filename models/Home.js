const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    photoUrl: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Home", homeSchema);
