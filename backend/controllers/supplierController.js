import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private
export const createSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;

        if (!name || !contactPerson || !email || !phone || !address) {
            return res.status(400).json({ success: false, message: "Please provide all required fields." });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email address." });
        }

        const supplierExists = await Supplier.findOne({ email: normalizedEmail, organization: req.user.organization });
        if (supplierExists) {
            return res.status(409).json({ success: false, message: "Supplier with this email already exists." });
        }

        const supplier = await Supplier.create({
            name: String(name).trim(),
            contactPerson: String(contactPerson).trim(),
            email: normalizedEmail,
            phone: String(phone).trim(),
            address: String(address).trim(),
            user: req.user._id,
            organization: req.user.organization
        });

        res.status(201).json({ success: true, data: supplier, supplier });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: "Supplier email already exists." });
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const total = await Supplier.countDocuments({ organization: req.user.organization });
        const suppliers = await Supplier.find({ organization: req.user.organization })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
            
        res.status(200).json({ 
            success: true, 
            data: suppliers,
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

// @desc    Get a single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ _id: req.params.id, organization: req.user.organization });

        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        res.status(200).json({ success: true, supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const ALLOWED_SUPPLIER_FIELDS = new Set(['name', 'contactPerson', 'email', 'phone', 'address', 'averageDeliveryDays', 'reliabilityScore']);
export const updateSupplier = async (req, res) => {
    try {
        let supplier = await Supplier.findOne({ _id: req.params.id, organization: req.user.organization });

        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        const clean = {};
        for (const k of Object.keys(req.body || {})) {
            if (k.startsWith('$') || k.includes('.')) continue;
            if (!ALLOWED_SUPPLIER_FIELDS.has(k)) continue;
            clean[k] = req.body[k];
        }
        if (clean.email) {
            clean.email = String(clean.email).toLowerCase().trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
                return res.status(400).json({ success: false, message: "Invalid email address." });
            }
        }
        supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id, organization: req.user.organization },
            { $set: clean },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: supplier, supplier });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: "Supplier email already exists." });
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ _id: req.params.id, organization: req.user.organization });

        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        await supplier.deleteOne();

        res.status(200).json({ success: true, message: "Supplier removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get supplier score breakdown
// @route   GET /api/suppliers/:id/score-breakdown
// @access  Private
export const getSupplierScoreBreakdown = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplier = await Supplier.findOne({ _id: supplierId, organization: req.user.organization }).lean();
        if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found." });

        const totalOrders = await PurchaseOrder.countDocuments({ supplier: supplierId, status: "delivered", organization: req.user.organization });
        const onTimeDeliveries = await PurchaseOrder.countDocuments({
            supplier: supplierId,
            status: "delivered",
            organization: req.user.organization,
            $or: [
                { expectedDeliveryDate: null },
                { expectedDeliveryDate: { $exists: false } },
                { $expr: { $lte: [{ $ifNull: ["$deliveredAt", "$updatedAt"] }, "$expectedDeliveryDate"] } }
            ]
        });
        
        const lateDeliveries = totalOrders - onTimeDeliveries;
        const onTimeRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 100;
        
        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                onTimeDeliveries,
                lateDeliveries,
                onTimeRate: Math.round(onTimeRate),
                reliabilityScore: supplier.reliabilityScore
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};