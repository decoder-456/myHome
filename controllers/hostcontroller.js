const Home = require("../models/Home");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");

// =======================
// HELPER: DELETE IMAGE
// =======================
async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("⚠️ Cloudinary delete failed:", err.message);
  }
}

// =======================
// ADD HOME PAGE
// =======================
exports.addHome = (req, res, next) => {
  res.render("./host/addhome", {
    pageTitle: "Add Home to Airbnb",
    currentPage: "addHome",
    editing: false,
  });
};

// =======================
// CREATE HOME
// =======================
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
      photoUrl: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // IMPORTANT for delete
      hostId: req.session.user.id,
    });

    await home.save();
    res.redirect("/");
  } catch (err) {
    console.log("❌ Error saving home:", err.message);
    res.status(500).send("Something went wrong");
  }
};

// =======================
// EDIT HOME PAGE
// =======================
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

// =======================
// UPDATE HOME
// =======================
exports.posteditHome = async (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  try {
    const home = await Home.findOne({
      _id: id,
      hostId: req.session.user.id,
    });

    if (!home) {
      return res.redirect("/host/home-list");
    }

    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

    // If new image uploaded → replace old
    if (req.file) {
      await deleteImageFromCloudinary(home.publicId);

      home.photoUrl = req.file.path;
      home.publicId = req.file.filename;
    }

    await home.save();
    res.redirect("/host/home-list");
  } catch (err) {
    console.log("❌ Error while updating home:", err);
    res.status(500).send("Update failed");
  }
};

// =======================
// SHOW HOST HOMES
// =======================
exports.showHome = async (req, res, next) => {
  try {
    const registeredHome = await Home.find({
      hostId: req.session.user.id,
    });

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

// =======================
// DELETE HOME
// =======================
exports.deleteHome = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    const home = await Home.findOneAndDelete({
      _id: homeId,
      hostId: req.session.user.id,
    });

    if (home) {
      await deleteImageFromCloudinary(home.publicId);

      await User.updateMany(
        {},
        {
          $pull: { favourites: homeId },
        },
      );
    }

    res.redirect("/host/home-list");
  } catch (err) {
    console.log("❌ Delete error:", err);
    res.status(500).send("Delete failed");
  }
};
