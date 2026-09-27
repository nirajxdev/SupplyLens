import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    status: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    expectedDeliveryDate: {
        type: Date
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    organization: {
        type: String,
        default: 'Legacy Workspace'
    }
}, { timestamps: true });

purchaseOrderSchema.index({ organization: 1, status: 1 });
purchaseOrderSchema.index({ organization: 1, supplier: 1, status: 1 });
purchaseOrderSchema.index({ organization: 1, expectedDeliveryDate: 1, status: 1 });
purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ expectedDeliveryDate: 1, status: 1 });

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
