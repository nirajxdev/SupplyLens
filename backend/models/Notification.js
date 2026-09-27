import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["LOW_STOCK", "REORDER_RECOMMENDED", "SUPPLIER_DELAY"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    read: {
        type: Boolean,
        default: false
    },
    organization: {
        type: String,
        default: 'Legacy Workspace'
    }
}, { timestamps: true });

notificationSchema.index({ organization: 1, read: 1, createdAt: -1 });
notificationSchema.index({ read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
