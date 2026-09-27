import express from "express";
import { stockIn, stockOut, getStockHistory, stockSell, stockAdjust } from "../controllers/stockController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const stockRouter = express.Router();

// All stock mutations require an authenticated role — previously /in /out were open to any role.
stockRouter.post("/in", protect, authorize("staff", "manager", "admin"), stockIn);
stockRouter.post("/out", protect, authorize("staff", "manager", "admin"), stockOut);
stockRouter.post("/sell", protect, authorize("staff", "manager", "admin"), stockSell);
stockRouter.post("/adjust", protect, authorize("manager", "admin"), stockAdjust);
stockRouter.get("/history/:productId", protect, getStockHistory);

export default stockRouter;
