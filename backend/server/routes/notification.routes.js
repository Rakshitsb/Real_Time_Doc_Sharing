import express from "express";
import { listNotifications, markRead } from "../controllers/communication.controller.js";
import { ensureAuthenticated } from "../middleware/auth.middleware.js";

const notificationRouter = express.Router();

notificationRouter.use(ensureAuthenticated);
notificationRouter.get("/", listNotifications);
notificationRouter.post("/read", markRead);

export default notificationRouter;
