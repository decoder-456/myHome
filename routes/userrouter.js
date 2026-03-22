const express = require("express");
const userRouter = express.Router();
const storeControllers = require("../controllers/storecontroller");
const { isGuest, isLoggedIn } = require("../middleware/auth");

userRouter.get("/", storeControllers.showHome);
userRouter.get("/explore", isGuest, storeControllers.exploreHome);
userRouter.get("/store/favourite-home", isGuest, storeControllers.getFavourite);
userRouter.post("/favourite", isGuest, storeControllers.postFavourite);
userRouter.post("/del-favourite/:homeId", isGuest, storeControllers.postdelFavourite);
userRouter.get("/store/home-booking", isLoggedIn, storeControllers.bookedHome);
userRouter.get("/store/home/:id", isLoggedIn, storeControllers.homedetail);

exports.userRouter = userRouter;
