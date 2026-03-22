const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.getsignup = (req, res) => {
  res.render("./auth/signup", {
    pageTitle: "Sign Up",
    currentPage: "signup",
    errors: [],
    oldInput: {},
  });
};
exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("./auth/signup", {
      pageTitle: "Sign Up",
      currentPage: "signup",
      errors: errors.array(),
      oldInput: req.body,
    });
  }
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.getLogin = (req, res) => {
  res.render("./auth/login", {
    pageTitle: "Log In",
    currentPage: "login",
    errors: [],
    oldInput: {},
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).render("./auth/login", {
        pageTitle: "Log In",
        currentPage: "login",
        errors: [{ msg: "Invalid email or password" }],
        oldInput: { email },
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("./auth/login", {
        pageTitle: "Log In",
        currentPage: "login",
        errors: [{ msg: "Invalid email or password" }],
        oldInput: { email },
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = {
      id: user._id.toString(),
      firstName: user.firstName,
      userType: user.userType,
    };
    req.session.save((err) => {
      if (err) {
        return res.status(500).send("Session save failed");
      }
      res.redirect("/");
    });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
