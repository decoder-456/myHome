const Home = require("../models/Home");
const User = require("../models/User");

exports.showHome = async (req, res) => {
  try {
    const registeredHome = await Home.find();
    res.render("./store/index", {
      homes: registeredHome,
      pageTitle: "Home",
      currentPage: "home",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.exploreHome = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) return res.redirect("/login");
    const registeredHome = await Home.find();
    res.render("./store/home-list", {
      homes: registeredHome,
      pageTitle: "Explore",
      currentPage: "explore",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getFavourite = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate("favourites");
    res.render("store/favourite-list", {
      homes: user.favourites,
      pageTitle: "Saved Homes",
      currentPage: "favourite",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.postFavourite = async (req, res) => {
  const { homeId } = req.body;
  try {
    const user = await User.findById(req.session.user.id);
    const alreadySaved = user.favourites.some((id) => id.toString() === homeId);
    if (!alreadySaved) {
      user.favourites.push(homeId);
      await user.save();
    }
    res.redirect("/store/favourite-home");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.postdelFavourite = async (req, res) => {
  const homeId = req.params.homeId;
  try {
    await User.findByIdAndUpdate(req.session.user.id, { $pull: { favourites: homeId } });
    res.redirect("/store/favourite-home");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.bookedHome = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate("favourites");
    res.render("./store/home-booking", {
      homes: user.favourites,
      pageTitle: "Saved Homes",
      currentPage: "bookingHome",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.homedetail = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) return res.status(404).send("Home not found");
    res.render("store/home-details", {
      home,
      pageTitle: home.houseName,
      currentPage: req.params.id,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
