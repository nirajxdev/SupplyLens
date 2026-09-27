import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    averageDeliveryDays: {
        type: Number,
        default: 0,
        min: 0
    },
    reliabilityScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
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

supplierSchema.index({ organization: 1, email: 1 }, { unique: true });
supplierSchema.index({ organization: 1, createdAt: -1 });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;