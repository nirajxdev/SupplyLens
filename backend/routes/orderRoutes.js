import express from "express";
import {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updateOrderStatus
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.route("/")
    .post(protect, authorize("admin", "manager"), createPurchaseOrder)
    .get(protect, getPurchaseOrders);

orderRouter.route("/:id")
    .get(protect, getPurchaseOrderById);

orderRouter.route("/:id/status")
    // Delivery inflates stock + supplier score — only manager/admin may mark delivered.
    // Staff may still move pending->shipped/cancelled (enforced in controller if needed).
    .put(protect, authorize("manager", "admin"), updateOrderStatus);

export default orderRouter;
