require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { userRouter } = require("./routes/userrouter");
const { hostRouter } = require("./routes/hostrouter");
const hostControllers = require("./controllers/error");
const rootDir = require("./utils/path");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/authrouter");
const upload = require("./middleware/multer");

const app = express();
const MONGO_URI = process.env.MONGO_URI;

// ✅ session store FIX
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

// ✅ uploads path
const uploadPath = path.join(__dirname, "uploads");

// ✅ serve uploaded files
app.use("/uploads", express.static(uploadPath));

// ✅ session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

// ✅ locals middleware
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.userType = req.session.user ? req.session.user.userType : null;
  res.locals.userName = req.session.user ? req.session.user.firstName : null;
  next();
});

// ✅ upload route (correct usage)
app.post("/upload", upload.single("photoUrl"), (req, res) => {
  console.log(req.file); // debug
  res.send("Uploaded successfully");
});

// ✅ view engine
app.set("view engine", "ejs");
app.set("views", "views");

// ✅ body parser
app.use(express.urlencoded({ extended: true }));

// ✅ static public
app.use(express.static(path.join(rootDir, "public")));

// ✅ routes
app.use(userRouter);
app.use(hostRouter);
app.use(authRouter);

// ✅ 404
app.use(hostControllers.page404);

// ✅ server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("❌ ERROR:", err.message));
