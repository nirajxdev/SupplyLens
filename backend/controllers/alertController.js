import Notification from "../models/Notification.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

// @desc    Get all alerts (notifications)
// @route   GET /api/alerts
// @access  Private
// NOTE: read-only — overdue-order scan moved to POST /api/alerts/scan (cron). GET never writes.
export const getAlerts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const query = { organization: req.user.organization };
        if (req.query.read !== undefined) {
            query.read = req.query.read === "true";
        }

        const total = await Notification.countDocuments(query);
        // Sort HIGH -> MEDIUM -> LOW via aggregation weight, then newest first
        const alerts = await Notification.aggregate([
            { $match: query },
            { $addFields: { __pw: { $switch: { branches: [{ case: { $eq: ["$priority", "HIGH"] }, then: 0 }, { case: { $eq: ["$priority", "MEDIUM"] }, then: 1 }], default: 2 } } } },
            { $sort: { __pw: 1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { __pw: 0 } }
        ]);

        // Populate productId manually (aggregate doesn't populate)
        await Notification.populate(alerts, { path: "productId", select: "name sku" });

        res.status(200).json({
            success: true,
            data: alerts,
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

// @desc Scan overdue shipped orders and create SUPPLIER_DELAY alerts (call from cron/worker)
// @route POST /api/alerts/scan
export const scanOverdueOrders = async (req, res) => {
    try {
        const today = new Date();
        const overdueOrders = await PurchaseOrder.find({
            status: "shipped",
            expectedDeliveryDate: { $lt: today, $ne: null },
            organization: req.user.organization
        }).populate("supplier", "name").lean();

        let created = 0;
        for (const order of overdueOrders) {
            const existingAlert = await Notification.findOne({
                type: "SUPPLIER_DELAY",
                message: { $regex: order._id.toString() },
                organization: req.user.organization
            });
            if (!existingAlert) {
                const productId = order.items && order.items.length > 0 ? order.items[0].product : null;
                const formattedDate = order.expectedDeliveryDate.toISOString().split('T')[0];
                await Notification.create({
                    type: "SUPPLIER_DELAY",
                    message: `Order #${order._id} from ${order.supplier?.name || 'Unknown Supplier'} was expected on ${formattedDate} but has not been marked delivered.`,
                    priority: "HIGH",
                    productId: productId,
                    organization: req.user.organization
                });
                created++;
            }
        }
        res.status(200).json({ success: true, data: { scanned: overdueOrders.length, created } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
export const markAlertRead = async (req, res) => {
    try {
        const alert = await Notification.findOne({ _id: req.params.id, organization: req.user.organization });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found." });

        alert.read = true;
        await alert.save();

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};
