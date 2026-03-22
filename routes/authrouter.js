const express = require("express");
const authRouter = express.Router();
const { body } = require("express-validator");
const authControllers = require("../controllers/authController");
const User = require("../models/User");
const signupValidators = [
  // First Name
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2–50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters"),

  // Last Name
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2–50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters"),

  // Email
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter a valid email")
    .isLength({ max: 100 })
    .withMessage("Email too long")
    .custom(async (email) => {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return Promise.reject("Email already in use");
      }
      return true;
    }),

  // Password
  body("password")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be 8-64 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Must contain at least one special character")
    .not()
    .matches(/\s/)
    .withMessage("Password must not contain spaces"),

  // Confirm Password
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // User Type
  body("userType")
    .trim()
    .isIn(["guest", "host"])
    .withMessage("User type must be either Guest or Host"),

  // Terms & Conditions
  body("terms")
    .custom((value) => value === true || value === "on")
    .withMessage("You must accept the terms and conditions"),
];

authRouter.get("/signup", authControllers.getsignup);
authRouter.post("/signup", signupValidators, authControllers.postSignup);
authRouter.get("/login", authControllers.getLogin);
authRouter.post("/login", authControllers.postLogin);
authRouter.post("/logout", authControllers.postLogout);
exports.authRouter = authRouter;
