const express = require("express");
const hostRouter = express.Router();

const hostControllers = require("../controllers/hostcontroller");
const { isHost } = require("../middleware/auth");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// =======================
// CLOUDINARY STORAGE
// =======================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => {
      const userId = req.session.user?.id || "guest";
      return userId + "-" + Date.now();
    },
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

// =======================
// ROUTES
// =======================

hostRouter.get("/host/add-home", isHost, hostControllers.addHome);
hostRouter.post(
  "/add-home",
  isHost,
  upload.single("photoUrl"),
  hostControllers.homeAdded,
);

hostRouter.get("/host/home-list", isHost, hostControllers.showHome);

hostRouter.post(
  "/host/delete-home/:homeId",
  isHost,
  hostControllers.deleteHome,
);

hostRouter.get("/add-home/:homeId", isHost, hostControllers.editHome);

hostRouter.post(
  "/edit-home",
  isHost,
  upload.single("photoUrl"),
  hostControllers.posteditHome,
);

module.exports = { hostRouter };
