import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

export const calculateReorderPoint = async (productId, { persist = true } = {}) => {
    const product = await Product.findById(productId).populate('supplier');
    if (!product || !product.supplier) return 0;
    
    const supplier = product.supplier;
    
    // Count all outbound demand (SOLD + OUT), scoped to org, via aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const agg = await StockMovement.aggregate([
        {
            $match: {
                organization: product.organization,
                type: { $in: ["SOLD", "OUT"] },
                createdAt: { $gte: thirtyDaysAgo },
                $or: [{ product: product._id }, { productId: product._id }]
            }
        },
        { $group: { _id: null, totalSold: { $sum: "$quantity" } } }
    ]);
    
    const totalSold = agg[0]?.totalSold || 0;
    const averageDailyDemand = totalSold / 30;
    
    const reorderPoint = Math.ceil((averageDailyDemand * (supplier.averageDeliveryDays || 0)) + (product.safetyStock || 0));
    
    if (persist) {
        product.reorderPoint = reorderPoint;
        await product.save();
    }
    
    return reorderPoint;
};

export const recalculateSupplierScore = async (supplierId) => {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return 0;
    
    const deliveredCount = await PurchaseOrder.countDocuments({ supplier: supplierId, status: "delivered", organization: supplier.organization });
    if (deliveredCount === 0) return 100; // default if no delivered orders
    
    // Use deliveredAt when available, fall back to updatedAt
    const onTimeCount = await PurchaseOrder.countDocuments({
        supplier: supplierId,
        status: "delivered",
        organization: supplier.organization,
        $or: [
            { expectedDeliveryDate: null },
            { expectedDeliveryDate: { $exists: false } },
            {
                $expr: {
                    $lte: [
                        { $ifNull: ["$deliveredAt", "$updatedAt"] },
                        "$expectedDeliveryDate"
                    ]
                }
            }
        ]
    });
    
    const onTimeRate = (onTimeCount / deliveredCount) * 100;
    supplier.reliabilityScore = Math.round(onTimeRate);
    await supplier.save();
    
    return supplier.reliabilityScore;
};
