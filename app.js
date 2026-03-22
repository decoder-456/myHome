require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const MongoDBStore = require("connect-mongodb-session")(session);
const { userRouter } = require("./routes/userrouter");
const { hostRouter } = require("./routes/hostrouter");
const hostControllers = require("./controllers/error");
const rootDir = require("./utils/path");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/authrouter");
const app = express();
const MONGO_URI = process.env.MONGO_URI;
const store = new MongoDBStore({ uri: MONGO_URI, collection: "sessions" });
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.userType = req.session.user ? req.session.user.userType : null;
  res.locals.userName = req.session.user ? req.session.user.firstName : null;
  next();
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log("MULTER SESSION:", req.session);
    const userId = req.session.user?.id || "guest";
    cb(null, userId.toString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage, fileFilter }).single("photoUrl"));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));
app.use(userRouter);
app.use(hostRouter);
app.use(authRouter);
app.use(hostControllers.page404);
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
