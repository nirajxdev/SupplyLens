import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "General"
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: false,
        min: 0
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    stockQuantity: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    minimumStockLevel: {
        type: Number,
        required: true,
        default: 5,
        min: 0
    },
    lowStockThreshold: {
        type: Number,
        required: false,
        default: 5,
        min: 0
    },
    safetyStock: {
        type: Number,
        default: 0,
        min: 0
    },
    reorderPoint: {
        type: Number,
        default: 0,
        min: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: false
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: false
    },
    organization: {
        type: String,
        default: 'Legacy Workspace'
    }
}, { timestamps: true });

// Pre-validate hook to handle initial field synchronization
productSchema.pre('validate', function() {
    if (this.unitPrice !== undefined && this.price === undefined) {
        this.price = this.unitPrice;
    } else if (this.price !== undefined && this.unitPrice === undefined) {
        this.unitPrice = this.price;
    }

    if (this.currentStock !== undefined && this.stockQuantity === undefined) {
        this.stockQuantity = this.currentStock;
    } else if (this.stockQuantity !== undefined && this.currentStock === undefined) {
        this.currentStock = this.stockQuantity;
    }

    if (this.minimumStockLevel !== undefined && this.lowStockThreshold === undefined) {
        this.lowStockThreshold = this.minimumStockLevel;
    } else if (this.lowStockThreshold !== undefined && this.minimumStockLevel === undefined) {
        this.minimumStockLevel = this.lowStockThreshold;
    }

    if (this.supplierId !== undefined && this.supplier === undefined) {
        this.supplier = this.supplierId;
    } else if (this.supplier !== undefined && this.supplierId === undefined) {
        this.supplierId = this.supplier;
    }
});

// Pre-save hook to keep fields in sync upon modifications
productSchema.pre('save', function() {
    if (this.isModified('unitPrice')) {
        this.price = this.unitPrice;
    } else if (this.isModified('price')) {
        this.unitPrice = this.price;
    }

    if (this.isModified('currentStock')) {
        this.stockQuantity = this.currentStock;
    } else if (this.isModified('stockQuantity')) {
        this.currentStock = this.stockQuantity;
    }

    if (this.isModified('minimumStockLevel')) {
        this.lowStockThreshold = this.minimumStockLevel;
    } else if (this.isModified('lowStockThreshold')) {
        this.minimumStockLevel = this.lowStockThreshold;
    }

    if (this.isModified('supplierId')) {
        this.supplier = this.supplierId;
    } else if (this.isModified('supplier')) {
        this.supplierId = this.supplier;
    }
});

productSchema.index({ organization: 1, sku: 1 }, { unique: true });
productSchema.index({ organization: 1, createdAt: -1 });
productSchema.index({ organization: 1, supplier: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ supplierId: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
