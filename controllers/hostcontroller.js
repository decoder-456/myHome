const fs = require("fs");
const path = require("path");
const Home = require("../models/Home");
const User = require("../models/User");
function deleteImageFile(photoUrl) {
  if (!photoUrl) return;
  // photoUrl is like "/uploads/filename.jpg"
  const filePath = path.join(__dirname, "..", photoUrl);
  fs.unlink(filePath, (err) => {
    if (err) console.log("⚠️ Could not delete image:", err.message);
  });
}
exports.addHome = (req, res, next) => {
  res.render("./host/addhome", {
    pageTitle: "Add Home to Airbnb",
    currentPage: "addHome",
    editing: false,
  });
};
exports.homeAdded = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    if (!req.file) {
      return res.status(400).send("Image upload failed");
    }

    const { houseName, price, location, rating, description } = req.body;

    const home = new Home({
      houseName,
      price,
      location,
      rating,
      description,
      photoUrl: "/uploads/" + req.file.filename,
      hostId: req.session.user.id,
    });
    await home.save();
    res.redirect("/");
  } catch (err) {
    console.log("❌ Error saving home:", err.message);
    res.status(500).send("Something went wrong");
  }
};
exports.editHome = async (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  if (!editing) {
    return res.redirect("/");
  }
  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.redirect("/host/home-list");
    }
    res.render("./host/addhome", {
      home: home,
      pageTitle: "Edit Home",
      currentPage: "home",
      editing: editing,
    });
  } catch (err) {
    console.log("❌ Error in editHome:", err);
    res.redirect("/host/home-list");
  }
};

exports.posteditHome = async (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  try {
    const home = await Home.findOne({ _id: id, hostId: req.session.user.id });
    if (!home) {
      return res.redirect("/host/home-list");
    }
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

    // If a new image was uploaded, delete the old one and use the new path
    if (req.file) {
      deleteImageFile(home.photoUrl);
      home.photoUrl = "/uploads/" + req.file.filename;
    }

    await home.save();
    res.redirect("/host/home-list");
  } catch (err) {
    console.log("❌ Error while updating home:", err);
    res.status(500).send("Update failed");
  }
};
exports.showHome = async (req, res, next) => {
  try {
    const registeredHome = await Home.find({ hostId: req.session.user.id });
    res.render("./host/hosthome-list", {
      homes: registeredHome,
      pageTitle: "Your Homes",
      currentPage: "homeList",
    });
  } catch (err) {
    console.log("❌ Error fetching homes:", err);
    res.status(500).send("Failed to load homes");
  }
};
exports.deleteHome = async (req, res) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findOneAndDelete({
      _id: homeId,
      hostId: req.session.user.id,
    });
    if (home) {
      deleteImageFile(home.photoUrl);
      await User.updateMany({}, { $pull: { favourites: homeId } });
    }
    res.redirect("/host/home-list");
  } catch (err) {
    console.log(err);
    res.status(500).send("Delete failed");
  }
};
