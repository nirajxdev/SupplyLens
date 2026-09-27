import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import { calculateReorderPoint } from "../utils/inventoryUtils.js";


// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
    try {
        // Synchronize request body parameters
        if (req.body.unitPrice !== undefined && req.body.price === undefined) {
            req.body.price = req.body.unitPrice;
        } else if (req.body.price !== undefined && req.body.unitPrice === undefined) {
            req.body.unitPrice = req.body.price;
        }

        if (req.body.currentStock !== undefined && req.body.stockQuantity === undefined) {
            req.body.stockQuantity = req.body.currentStock;
        } else if (req.body.stockQuantity !== undefined && req.body.currentStock === undefined) {
            req.body.currentStock = req.body.stockQuantity;
        }

        if (req.body.minimumStockLevel !== undefined && req.body.lowStockThreshold === undefined) {
            req.body.lowStockThreshold = req.body.minimumStockLevel;
        } else if (req.body.lowStockThreshold !== undefined && req.body.minimumStockLevel === undefined) {
            req.body.minimumStockLevel = req.body.lowStockThreshold;
        }

        if (req.body.supplierId !== undefined && req.body.supplier === undefined) {
            req.body.supplier = req.body.supplierId;
        } else if (req.body.supplier !== undefined && req.body.supplierId === undefined) {
            req.body.supplierId = req.body.supplier;
        }

        const { name, sku, description, category, price, stockQuantity, lowStockThreshold, supplier } = req.body;

        if (!name || !sku || price === undefined || !supplier) {
            return res.status(400).json({ success: false, message: "Please provide name, sku, price, and supplier." });
        }

        const numericPrice = Number(price);
        const numericStock = stockQuantity !== undefined ? Number(stockQuantity) : 0;
        const numericThreshold = lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5;

        if (isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ success: false, message: "Price must be a valid non-negative number." });
        }
        if (isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({ success: false, message: "Stock quantity must be a valid non-negative number." });
        }
        if (isNaN(numericThreshold) || numericThreshold < 0) {
            return res.status(400).json({ success: false, message: "Low stock threshold must be a valid non-negative number." });
        }

        const productExists = await Product.findOne({ sku, organization: req.user.organization });
        if (productExists) {
            return res.status(409).json({ success: false, message: "Product with this SKU already exists." });
        }

        const supplierExists = await Supplier.findOne({ _id: supplier, organization: req.user.organization });
        if (!supplierExists) {
            return res.status(404).json({ success: false, message: "Supplier not found." });
        }

        let product = await Product.create({
            name,
            sku,
            description,
            category,
            price: numericPrice,
            unitPrice: numericPrice,
            currentStock: numericStock,
            stockQuantity: numericStock,
            minimumStockLevel: numericThreshold,
            lowStockThreshold: numericThreshold,
            supplier,
            supplierId: supplier,
            user: req.user._id,
            organization: req.user.organization
        });

        product = await product.populate("supplier", "name email contactPerson phone");

        res.status(201).json({ success: true, data: product, product });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "SKU already exists in this organization." });
        }
        if (error?.name === 'CastError' || error?.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Invalid product data." });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'name', 'price', 'currentStock', 'stockQuantity', 'updatedAt']);
export const getProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const sortBy = ALLOWED_SORT_FIELDS.has(req.query.sortBy) ? req.query.sortBy : "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

        const total = await Product.countDocuments({ organization: req.user.organization });
        const products = await Product.find({ organization: req.user.organization })
            .populate("supplier", "name email contactPerson phone")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({ 
            success: true, 
            data: products,
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

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, organization: req.user.organization }).populate("supplier", "name email contactPerson phone");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const ALLOWED_PRODUCT_UPDATE_FIELDS = new Set([
    'name', 'sku', 'description', 'category',
    'price', 'unitPrice',
    'currentStock', 'stockQuantity',
    'minimumStockLevel', 'lowStockThreshold',
    'safetyStock', 'reorderPoint',
    'supplier', 'supplierId'
]);
const sanitizeUpdate = (body) => {
    const clean = {};
    for (const key of Object.keys(body || {})) {
        if (key.startsWith('$') || key.includes('.')) continue;
        if (!ALLOWED_PRODUCT_UPDATE_FIELDS.has(key)) continue;
        clean[key] = body[key];
    }
    return clean;
};
export const updateProduct = async (req, res) => {
    try {
        const body = sanitizeUpdate(req.body);
        // Synchronize request body parameters
        if (body.unitPrice !== undefined && body.price === undefined) {
            body.price = body.unitPrice;
        } else if (body.price !== undefined && body.unitPrice === undefined) {
            body.unitPrice = body.price;
        }

        if (body.currentStock !== undefined && body.stockQuantity === undefined) {
            body.stockQuantity = body.currentStock;
        } else if (body.stockQuantity !== undefined && body.currentStock === undefined) {
            body.currentStock = body.stockQuantity;
        }

        if (body.minimumStockLevel !== undefined && body.lowStockThreshold === undefined) {
            body.lowStockThreshold = body.minimumStockLevel;
        } else if (body.lowStockThreshold !== undefined && body.minimumStockLevel === undefined) {
            body.minimumStockLevel = body.lowStockThreshold;
        }

        if (body.supplierId !== undefined && body.supplier === undefined) {
            body.supplier = body.supplierId;
        } else if (body.supplier !== undefined && body.supplierId === undefined) {
            body.supplierId = body.supplier;
        }

        let product = await Product.findOne({ _id: req.params.id, organization: req.user.organization });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (body.supplier !== undefined) {
            const supplierExists = await Supplier.findOne({ _id: body.supplier, organization: req.user.organization });
            if (!supplierExists) {
                return res.status(404).json({ success: false, message: "Supplier not found." });
            }
        }

        if (body.price !== undefined) {
            const price = Number(body.price);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ success: false, message: "Price must be a valid non-negative number." });
            }
            body.price = price;
            body.unitPrice = price;
        }

        if (body.stockQuantity !== undefined) {
            const stockQuantity = Number(body.stockQuantity);
            if (isNaN(stockQuantity) || stockQuantity < 0) {
                return res.status(400).json({ success: false, message: "Stock quantity must be a valid non-negative number." });
            }
            body.stockQuantity = stockQuantity;
            body.currentStock = stockQuantity;
        }

        if (body.lowStockThreshold !== undefined) {
            const lowStockThreshold = Number(body.lowStockThreshold);
            if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
                return res.status(400).json({ success: false, message: "Low stock threshold must be a valid non-negative number." });
            }
            body.lowStockThreshold = lowStockThreshold;
            body.minimumStockLevel = lowStockThreshold;
        }

        product = await Product.findOneAndUpdate(
            { _id: req.params.id, organization: req.user.organization },
            { $set: body },
            { new: true, runValidators: true }
        ).populate("supplier", "name email contactPerson phone");

        res.status(200).json({ success: true, data: product, product });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "SKU already exists in this organization" });
        }
        if (error?.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, organization: req.user.organization });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: "Product removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create a new stock movement
// @route   POST /api/products/:id/movements
// @access  Private
export const createStockMovement = async (req, res) => {
    try {
        let { type, quantity, reason } = req.body;
        const productId = req.params.id;

        if (type === undefined || quantity === undefined || !reason) {
            return res.status(400).json({ success: false, message: "Please provide type, quantity, and reason." });
        }

        // Normalize to canonical uppercase
        const rawType = String(type).toLowerCase();
        const typeMap = { in: 'IN', out: 'OUT', adjustment: 'ADJUSTMENT' };
        const normalizedType = typeMap[rawType] || String(type).toUpperCase();
        if (!['IN', 'OUT', 'ADJUSTMENT'].includes(normalizedType)) {
            return res.status(400).json({ success: false, message: "Invalid movement type. Must be 'in', 'out', or 'adjustment'." });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a valid non-negative number." });
        }

        const product = await Product.findOne({ _id: productId, organization: req.user.organization });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const baseStock = product.currentStock ?? product.stockQuantity ?? 0;
        // Adjust stock Quantity
        let newStock = baseStock;
        if (normalizedType === "IN") {
            newStock += parsedQuantity;
        } else if (normalizedType === "OUT") {
            if (baseStock < parsedQuantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock. Current stock is ${baseStock}.` });
            }
            newStock -= parsedQuantity;
        } else if (normalizedType === "ADJUSTMENT") {
            newStock = parsedQuantity;
        }

        const previousStock = baseStock;
        // Create the movement log (previousStock/newStock were missing → 500 before)
        const movement = await StockMovement.create({
            product: productId,
            productId,
            type: normalizedType,
            quantity: parsedQuantity,
            previousStock,
            newStock,
            reason,
            user: req.user._id,
            performedBy: req.user._id,
            organization: req.user.organization
        });

        // Update product stock quantity (keep both legacy fields in sync)
        product.currentStock = newStock;
        product.stockQuantity = newStock;
        await product.save();

        res.status(201).json({ success: true, data: { movement, currentStock: newStock }, movement, currentStock: newStock });
    } catch (error) {
        if (error?.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all stock movements for a specific product
// @route   GET /api/products/:id/movements
// @access  Private
export const getProductMovements = async (req, res) => {
    try {
        const productId = req.params.id;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const total = await StockMovement.countDocuments({ product: productId, organization: req.user.organization });
        const movements = await StockMovement.find({ product: productId, organization: req.user.organization })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({ 
            success: true, 
            data: movements,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

// @desc    Get reorder point for product (read-only — no DB writes on GET)
// @route   GET /api/products/:id/reorder-point
// @access  Private
export const getReorderPoint = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId, organization: req.user.organization }).populate('supplier').lean();
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const reorderPoint = await calculateReorderPoint(productId, { persist: false });
        
        // Average daily demand from outbound (SOLD + OUT)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const agg = await StockMovement.aggregate([
            { $match: { organization: req.user.organization, type: { $in: ["SOLD", "OUT"] }, createdAt: { $gte: thirtyDaysAgo }, $or: [{ product: product._id }, { productId: product._id }] } },
            { $group: { _id: null, totalSold: { $sum: "$quantity" } } }
        ]);
        const totalSold = agg[0]?.totalSold || 0;
        const averageDailyDemand = totalSold / 30;

        res.status(200).json({
            success: true,
            data: {
                reorderPoint,
                averageDailyDemand,
                supplierLeadDays: product.supplier ? product.supplier.averageDeliveryDays : 0,
                safetyStock: product.safetyStock
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

