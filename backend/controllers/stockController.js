import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Notification from "../models/Notification.js";
import { calculateReorderPoint } from "../utils/inventoryUtils.js";

// @desc    Stock In (Receive Inventory)
// @route   POST /api/stock/in
// @access  Private
export const stockIn = async (req, res) => {
    try {
        const { productId, quantity, reason } = req.body;

        if (!productId || quantity === undefined || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide productId, quantity, and reason."
            });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid positive number."
            });
        }

        // Atomic increment to prevent lost updates
        const product = await Product.findOneAndUpdate(
            { _id: productId, organization: req.user.organization },
            { $inc: { currentStock: parsedQuantity, stockQuantity: parsedQuantity } },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const newStock = product.currentStock;
        const previousStock = newStock - parsedQuantity;

        // Create log record
        const movement = await StockMovement.create({
            productId,
            product: productId,
            type: "IN",
            quantity: parsedQuantity,
            previousStock,
            newStock,
            reason,
            performedBy: req.user._id,
            user: req.user._id,
            organization: req.user.organization
        });

        res.status(201).json({
            success: true,
            data: {
                movement,
                currentStock: newStock
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// @desc    Stock Out (Reduce Inventory / Sales)
// @route   POST /api/stock/out
// @access  Private
export const stockOut = async (req, res) => {
    try {
        const { productId, quantity, reason } = req.body;

        if (!productId || quantity === undefined || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide productId, quantity, and reason."
            });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid positive number."
            });
        }

        // Atomic conditional decrement — prevents oversell on concurrent requests
        const product = await Product.findOneAndUpdate(
            { _id: productId, organization: req.user.organization, currentStock: { $gte: parsedQuantity } },
            { $inc: { currentStock: -parsedQuantity, stockQuantity: -parsedQuantity } },
            { new: true }
        );

        if (!product) {
            const exists = await Product.findOne({ _id: productId, organization: req.user.organization });
            if (!exists) return res.status(404).json({ success: false, message: "Product not found." });
            return res.status(400).json({ success: false, message: `Insufficient stock. Current stock is ${exists.currentStock}.` });
        }

        const newStock = product.currentStock;
        const previousStock = newStock + parsedQuantity;

        // Create log record
        const movement = await StockMovement.create({
            productId,
            product: productId,
            type: "OUT",
            quantity: parsedQuantity,
            previousStock,
            newStock,
            reason,
            performedBy: req.user._id,
            user: req.user._id,
            organization: req.user.organization
        });

        // Low-stock notifications (dedupe: one unread per product)
        if (newStock <= (product.minimumStockLevel ?? 5)) {
            const existing = await Notification.findOne({ type: "LOW_STOCK", productId: product._id, read: false, organization: req.user.organization });
            if (!existing) {
                await Notification.create({
                    type: "LOW_STOCK",
                    message: `Low Stock Alert: ${product.name} has reached critical level (${newStock} units left).`,
                    priority: "HIGH",
                    productId: product._id,
                    organization: req.user.organization
                });
            }
        } else if (newStock <= (product.reorderPoint || 0)) {
            const existing = await Notification.findOne({ type: "REORDER_RECOMMENDED", productId: product._id, read: false, organization: req.user.organization });
            if (!existing) {
                await Notification.create({
                    type: "REORDER_RECOMMENDED",
                    message: `Reorder Recommended: ${product.name} is below reorder point (${newStock} units left).`,
                    priority: "MEDIUM",
                    productId: product._id,
                    organization: req.user.organization
                });
            }
        }

        res.status(201).json({
            success: true,
            data: {
                movement,
                currentStock: newStock
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// @desc    Get Stock History for a specific product
// @route   GET /api/stock/history/:productId
// @access  Private
export const getStockHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
        const skip = (page - 1) * limit;

        const product = await Product.findOne({ _id: productId, organization: req.user.organization });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const total = await StockMovement.countDocuments({ productId, organization: req.user.organization });
        const movements = await StockMovement.find({ productId, organization: req.user.organization })
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: movements,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// @desc    Record a Sale
// @route   POST /api/stock/sell
// @access  Private
export const stockSell = async (req, res) => {
    try {
        const { productId, quantity, customerRef, note } = req.body;
        // NOTE: saleDate ignored for createdAt (kept for compat); note merged into reason.
        
        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: "Please provide productId and quantity." });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive number." });
        }

        const product = await Product.findOneAndUpdate(
            { _id: productId, organization: req.user.organization, currentStock: { $gte: parsedQuantity } },
            { $inc: { currentStock: -parsedQuantity, stockQuantity: -parsedQuantity } },
            { new: true }
        );
        if (!product) {
            const exists = await Product.findOne({ _id: productId, organization: req.user.organization });
            if (!exists) return res.status(404).json({ success: false, message: "Product not found." });
            return res.status(400).json({ success: false, message: `Insufficient stock. Current stock is ${exists.currentStock}.` });
        }

        const newStock = product.currentStock;
        const previousStock = newStock + parsedQuantity;

        const movement = await StockMovement.create({
            productId,
            product: productId,
            type: "SOLD",
            quantity: parsedQuantity,
            previousStock,
            newStock,
            reason: [customerRef ? `Sale: ${customerRef}` : "Sale", note ? `- ${note}` : ""].filter(Boolean).join(" "),
            performedBy: req.user._id,
            user: req.user._id,
            organization: req.user.organization
        });

        // Check thresholds and create alerts (dedupe unread per product)
        if (newStock <= product.minimumStockLevel) {
            const existing = await Notification.findOne({ type: "LOW_STOCK", productId: product._id, read: false, organization: req.user.organization });
            if (!existing) {
            await Notification.create({
                type: "LOW_STOCK",
                message: `Low Stock Alert: ${product.name} has reached critical level (${newStock} units left).`,
                priority: "HIGH",
                productId: product._id,
                organization: req.user.organization
            });
            }
        } else if (newStock <= product.reorderPoint) {
            const existing = await Notification.findOne({ type: "REORDER_RECOMMENDED", productId: product._id, read: false, organization: req.user.organization });
            if (!existing) {
            await Notification.create({
                type: "REORDER_RECOMMENDED",
                message: `Reorder Recommended: ${product.name} is below reorder point (${newStock} units left).`,
                priority: "MEDIUM",
                productId: product._id,
                organization: req.user.organization
            });
            }
        }

        // Recalculate reorder point
        await calculateReorderPoint(product._id);

        res.status(201).json({
            success: true,
            data: { movement, currentStock: newStock }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Adjust Stock
// @route   POST /api/stock/adjust
// @access  Private
export const stockAdjust = async (req, res) => {
    try {
        const { productId, adjustmentType, quantity, reason, notes } = req.body;
        
        if (!productId || !adjustmentType || !quantity || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields: productId, adjustmentType, quantity, reason." });
        }

        const normalizedAdj = String(adjustmentType).toUpperCase().trim();
        if (!["ADD", "REMOVE"].includes(normalizedAdj)) {
            return res.status(400).json({ success: false, message: "adjustmentType must be ADD or REMOVE." });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive number." });
        }

        const delta = normalizedAdj === "ADD" ? parsedQuantity : -parsedQuantity;
        const filter = { _id: productId, organization: req.user.organization };
        if (delta < 0) filter.currentStock = { $gte: parsedQuantity };

        const product = await Product.findOneAndUpdate(
            filter,
            { $inc: { currentStock: delta, stockQuantity: delta } },
            { new: true }
        );
        if (!product) {
            const exists = await Product.findOne({ _id: productId, organization: req.user.organization });
            if (!exists) return res.status(404).json({ success: false, message: "Product not found." });
            return res.status(400).json({ success: false, message: "Adjustment would result in negative stock." });
        }

        const newStock = product.currentStock;
        const previousStock = newStock - delta;

        const movement = await StockMovement.create({
            productId,
            product: productId,
            type: "ADJUSTMENT",
            quantity: parsedQuantity,
            previousStock,
            newStock,
            reason: notes ? `${reason} - ${notes}` : reason,
            performedBy: req.user._id,
            user: req.user._id,
            organization: req.user.organization
        });

        res.status(201).json({
            success: true,
            data: { movement, currentStock: newStock }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
