import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

// @desc    Get dashboard aggregated stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        // Execute all independent queries concurrently
        const [
            totalProducts,
            valueAggregate,
            lowStockCount,
            pendingReordersCount,
            productsNeedingReorder,
            overdueOrders,
            totalPos,
            deliveredPos,
            priorityAlerts
        ] = await Promise.all([
            Product.countDocuments({ organization: req.user.organization }),
            Product.aggregate([
                { $match: { organization: req.user.organization } },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ["$price", "$stockQuantity"] } }
                    }
                }
            ]),
            Product.countDocuments({
                organization: req.user.organization,
                $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
            }),
            PurchaseOrder.countDocuments({
                organization: req.user.organization,
                status: { $in: ["pending", "shipped"] }
            }),
            Product.countDocuments({
                organization: req.user.organization,
                $expr: { $lte: ["$currentStock", "$minimumStockLevel"] }
            }),
            PurchaseOrder.find({
                organization: req.user.organization,
                status: "shipped",
                expectedDeliveryDate: { $lt: new Date(), $ne: null }
            }).distinct("supplier"),
            PurchaseOrder.countDocuments({ status: { $ne: "cancelled" }, organization: req.user.organization }),
            PurchaseOrder.countDocuments({ status: "delivered", organization: req.user.organization }),
            Product.find({
                organization: req.user.organization,
                $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
            })
            .populate("supplier", "name email contactPerson phone")
            .sort({ stockQuantity: 1 })
            .limit(10)
        ]);

        const totalInventoryValue = valueAggregate[0]?.totalValue || 0;
        const suppliersWithDelays = overdueOrders.length;

        // Success Rate Calculation (ratio of delivered purchase orders to total non-cancelled POs)
        const successRateValue = totalPos > 0 
            ? Number(((deliveredPos / totalPos) * 100).toFixed(1))
            : 0;

        // Format alerts: return structured data, let frontend format currency/dates
        const formattedAlerts = priorityAlerts.map(product => {
            const isCritical = product.stockQuantity === 0;
            return {
                dot: isCritical ? "red" : "yellow",
                title: isCritical ? "Critical Stock Depletion" : "Low Stock Alert",
                sub: `${product.name} · SKU: ${product.sku} (Stock: ${product.stockQuantity}/${product.lowStockThreshold})`,
                productId: product._id,
                createdAt: product.updatedAt
            };
        });

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalInventoryValue,
                totalInventoryValueFormatted: `$${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                lowStockCount,
                pendingReordersCount,
                productsNeedingReorder,
                suppliersWithDelays,
                successRate: successRateValue,
                successRateFormatted: `${successRateValue.toFixed(1)}%`
            },
            alerts: formattedAlerts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
