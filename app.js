require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const MongoDBStore = require("connect-mongodb-session")(session);

const { userRouter } = require("./routes/userrouter");
const { hostRouter } = require("./routes/hostrouter");
const { authRouter } = require("./routes/authrouter");
const hostControllers = require("./controllers/error");

const rootDir = require("./utils/path");

const app = express();

// ENV
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// SESSION STORE
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

// SESSION MIDDLEWARE
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

// GLOBAL VARIABLES (for EJS)
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.userType = req.session.user ? req.session.user.userType : null;
  res.locals.userName = req.session.user ? req.session.user.firstName : null;
  next();
});

// =======================
// VIEW ENGINE & MIDDLEWARE
// =======================

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

// =======================
// ROUTES
// =======================

app.use(userRouter);
app.use(hostRouter);
app.use(authRouter);

// 404
app.use(hostControllers.page404);

// =======================
// DATABASE + SERVER
// =======================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running`);
    });
  })
  .catch((err) => {
    console.log("❌ ERROR:", err.message);
  });
