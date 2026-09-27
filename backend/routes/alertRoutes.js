import express from "express";
import { getAlerts, markAlertRead, scanOverdueOrders } from "../controllers/alertController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const alertRouter = express.Router();

alertRouter.get("/", protect, getAlerts);
alertRouter.post("/scan", protect, authorize("admin", "manager"), scanOverdueOrders);
alertRouter.put("/:id/read", protect, markAlertRead);
alertRouter.patch("/:id", protect, markAlertRead);

export default alertRouter;
