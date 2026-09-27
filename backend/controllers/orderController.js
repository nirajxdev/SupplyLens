import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import Notification from "../models/Notification.js";
import { calculateReorderPoint, recalculateSupplierScore } from "../utils/inventoryUtils.js";

// @desc    Create a new purchase order
// @route   POST /api/orders
// @access  Private
export const createPurchaseOrder = async (req, res) => {
    try {
        const { supplier, items, expectedDeliveryDate } = req.body;

        if (!supplier || !items || !items.length) {
            return res.status(400).json({ success: false, message: "Please provide supplier and at least one item." });
        }
        if (items.length > 100) {
            return res.status(400).json({ success: false, message: "Too many items (max 100)." });
        }

        const supplierExists = await Supplier.findOne({ _id: supplier, organization: req.user.organization }).lean();
        if (!supplierExists) {
            return res.status(404).json({ success: false, message: "Supplier not found." });
        }

        // Validate items and calculate totalAmount — single batched product fetch (no N+1)
        const productIds = [...new Set(items.map(i => String(i.product)))];
        const products = await Product.find({ _id: { $in: productIds }, organization: req.user.organization }).lean();
        const productMap = new Map(products.map(p => [String(p._id), p]));
        let totalAmount = 0;
        const cleanItems = [];
        const seen = new Set();
        for (const item of items) {
            if (!item.product || item.quantity === undefined || item.unitPrice === undefined) {
                return res.status(400).json({ success: false, message: "Each item must have a product ID, quantity, and unitPrice." });
            }
            const qty = Number(item.quantity);
            const price = Number(item.unitPrice);
            if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
                return res.status(400).json({ success: false, message: "Quantity must be > 0, unit price must be >= 0." });
            }
            if (seen.has(String(item.product))) {
                return res.status(400).json({ success: false, message: "Duplicate product in order items." });
            }
            seen.add(String(item.product));
            const product = productMap.get(String(item.product));
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.product} not found.` });
            }
            totalAmount += qty * price;
            cleanItems.push({ product: item.product, quantity: qty, unitPrice: price });
        }

        const purchaseOrder = await PurchaseOrder.create({
            supplier,
            items: cleanItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            expectedDeliveryDate,
            user: req.user._id,
            organization: req.user.organization
        });

        res.status(201).json({ success: true, data: purchaseOrder, purchaseOrder });
    } catch (error) {
        if (error?.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid id" });
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all purchase orders
// @route   GET /api/orders
// @access  Private
export const getPurchaseOrders = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const total = await PurchaseOrder.countDocuments({ organization: req.user.organization });
        const purchaseOrders = await PurchaseOrder.find({ organization: req.user.organization })
            .populate("supplier", "name contactPerson email phone")
            .populate("items.product", "name sku category price")
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({ 
            success: true, 
            data: purchaseOrders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc Get single purchase order
// @route GET /api/orders/:id
export const getPurchaseOrderById = async (req, res) => {
    try {
        const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization })
            .populate("supplier", "name contactPerson email phone")
            .populate("items.product", "name sku category price")
            .lean();
        if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        if (error?.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid order id" });
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update purchase order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Please provide a valid status: pending, shipped, delivered, cancelled." });
        }

        const purchaseOrder = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
        if (!purchaseOrder) {
            return res.status(404).json({ success: false, message: "Purchase order not found." });
        }

        // Enforce terminal status transition rules
        const prevStatus = purchaseOrder.status;
        if (prevStatus === "delivered") {
            return res.status(400).json({ success: false, message: "Delivered purchase orders cannot be modified." });
        }
        if (prevStatus === "cancelled") {
            return res.status(400).json({ success: false, message: "Cancelled purchase orders cannot be modified." });
        }

        // Check if status is transitioning to delivered
        if (status === "delivered" && prevStatus !== "delivered") {
            // Process and reconcile stock for all items — atomic $inc per product
            for (const item of purchaseOrder.items) {
                const parsedQuantity = Number(item.quantity);
                const product = await Product.findOneAndUpdate(
                    { _id: item.product, organization: req.user.organization },
                    { $inc: { currentStock: parsedQuantity, stockQuantity: parsedQuantity } },
                    { new: true }
                );
                if (product) {
                    const newStock = product.currentStock;
                    const previousStock = newStock - parsedQuantity;
                    
                    // Create log movement
                    await StockMovement.create({
                        productId: product._id,
                        product: product._id,
                        type: "IN",
                        quantity: parsedQuantity,
                        previousStock,
                        newStock,
                        reason: `Order #${purchaseOrder._id} delivered`,
                        performedBy: req.user._id,
                        user: req.user._id,
                        organization: req.user.organization
                    });

                    // Recalculate reorderPoint
                    await calculateReorderPoint(product._id);

                    // Mark REORDER_RECOMMENDED alerts as read for this product
                    await Notification.updateMany(
                        { productId: product._id, type: "REORDER_RECOMMENDED", read: false, organization: req.user.organization },
                        { $set: { read: true } }
                    );
                }
            }
            
            // Recalculate supplier score + stamp deliveredAt (used for on-time calc)
            purchaseOrder.deliveredAt = new Date();
            await recalculateSupplierScore(purchaseOrder.supplier);
        }

        purchaseOrder.status = status;
        await purchaseOrder.save();

        res.status(200).json({ success: true, data: purchaseOrder, purchaseOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
