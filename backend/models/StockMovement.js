import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    type: {
        // Canonical: IN, OUT, ADJUSTMENT, SOLD, RETURNED, DAMAGED, TRANSFERRED.
        // Lowercase in/out/adjustment accepted for backward compat and normalized.
        type: String,
        enum: ["in", "out", "adjustment", "IN", "OUT", "ADJUSTMENT", "SOLD", "RETURNED", "DAMAGED", "TRANSFERRED"],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true // e.g., "Supplier Shipment", "Sale", "Damage", "Manual Correction"
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    organization: {
        type: String,
        default: 'Legacy Workspace'
    }
}, { timestamps: true });

// Pre-validate hook for initial field synchronization
stockMovementSchema.pre('validate', function(next) {
    if (this.productId !== undefined && this.product === undefined) {
        this.product = this.productId;
    } else if (this.product !== undefined && this.productId === undefined) {
        this.productId = this.product;
    }

    if (this.performedBy !== undefined && this.user === undefined) {
        this.user = this.performedBy;
    } else if (this.user !== undefined && this.performedBy === undefined) {
        this.performedBy = this.user;
    }

    // Normalize legacy lowercase types to canonical uppercase
    if (this.type === 'in') this.type = 'IN';
    else if (this.type === 'out') this.type = 'OUT';
    else if (this.type === 'adjustment') this.type = 'ADJUSTMENT';

    if (!this.product && !this.productId) {
        return next(new Error('Product reference is required'));
    }
    if (!this.user && !this.performedBy) {
        return next(new Error('User reference is required'));
    }
    next();
});

// Pre-save hook to keep fields in sync upon modifications
stockMovementSchema.pre('save', function() {
    if (this.isModified('productId')) {
        this.product = this.productId;
    } else if (this.isModified('product')) {
        this.productId = this.product;
    }

    if (this.isModified('performedBy')) {
        this.user = this.performedBy;
    } else if (this.isModified('user')) {
        this.performedBy = this.user;
    }
});

stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ organization: 1, type: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;
