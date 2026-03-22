const express = require("express");
const hostRouter = express.Router();
const hostControllers = require("../controllers/hostcontroller");
const { isHost } = require("../middleware/auth");

hostRouter.get("/host/add-home", isHost, hostControllers.addHome);
hostRouter.post("/add-home", isHost, hostControllers.homeAdded);
hostRouter.get("/host/home-list", isHost, hostControllers.showHome);
hostRouter.post("/host/delete-home/:homeId", isHost, hostControllers.deleteHome);
hostRouter.get("/add-home/:homeId", isHost, hostControllers.editHome);
hostRouter.post("/edit-home", isHost, hostControllers.posteditHome);

exports.hostRouter = hostRouter;
