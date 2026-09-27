import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";

// @desc    Get demand forecast for a product
// @route   GET /api/forecast/:productId
// @access  Private
export const getProductForecast = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findOne({ _id: productId, organization: req.user.organization });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Fetch past 90 days of outbound movements (SOLD + OUT — stockOut was ignored before)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const movements = await StockMovement.find({
            organization: req.user.organization,
            type: { $in: ["SOLD", "OUT"] },
            createdAt: { $gte: ninetyDaysAgo },
            $or: [{ product: product._id }, { productId: product._id }]
        }).sort({ createdAt: 1 }).lean();

        // Group by week (7-day buckets, floor — day 0 belongs to week 0)
        const weeklyData = [];
        for (let i = 0; i < 13; i++) {
            weeklyData.push({ weekStart: new Date(ninetyDaysAgo.getTime() + (i * 7 * 24 * 60 * 60 * 1000)), totalSold: 0 });
        }

        movements.forEach(m => {
            const diffTime = m.createdAt - ninetyDaysAgo;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let weekIndex = Math.floor(diffDays / 7);
            if (weekIndex < 0) weekIndex = 0;
            if (weekIndex > 12) weekIndex = 12; // cap to 12
            weeklyData[weekIndex].totalSold += m.quantity;
        });

        const dataPointsUsed = movements.length;
        const activeWeeks = weeklyData.filter(w => w.totalSold > 0);
        const totalWeeksActive = activeWeeks.length;

        // 1. Moving Average (4-week window, divide by actual weeks present)
        let maPredictedWeeklyDemand = 0;
        if (totalWeeksActive > 0) {
            const last4Weeks = weeklyData.slice(-4);
            const sumLast4 = last4Weeks.reduce((sum, w) => sum + w.totalSold, 0);
            const activeInWindow = last4Weeks.filter(w => w.totalSold > 0).length || 1;
            // Use min(4, active) to avoid 4x underestimate on sparse data
            maPredictedWeeklyDemand = Math.round(sumLast4 / Math.min(4, Math.max(activeInWindow, totalWeeksActive > 0 ? Math.min(totalWeeksActive, 4) : 1)));
        }

        // 2. Exponential Smoothing (alpha = 0.3), init to mean of active weeks (not week-0 which is often stale)
        const alpha = 0.3;
        const initES = totalWeeksActive > 0
            ? activeWeeks.reduce((s, w) => s + w.totalSold, 0) / totalWeeksActive
            : 0;
        let esPredictedWeeklyDemand = initES;
        for (let i = 0; i < weeklyData.length; i++) {
            esPredictedWeeklyDemand = (alpha * weeklyData[i].totalSold) + ((1 - alpha) * esPredictedWeeklyDemand);
        }
        esPredictedWeeklyDemand = Math.round(esPredictedWeeklyDemand);

        res.status(200).json({
            success: true,
            data: {
                productId: product._id,
                forecastDate: new Date(),
                methods: {
                    movingAverage: {
                        predictedWeeklyDemand: maPredictedWeeklyDemand,
                        predictedDailyDemand: Math.round(maPredictedWeeklyDemand / 7)
                    },
                    exponentialSmoothing: {
                        predictedWeeklyDemand: esPredictedWeeklyDemand,
                        predictedDailyDemand: Math.round(esPredictedWeeklyDemand / 7)
                    }
                },
                dataPointsUsed,
                weeksActive: totalWeeksActive,
                confidenceScore: Number((dataPointsUsed > 10 ? 0.8 : (dataPointsUsed > 5 ? 0.5 : 0.2)).toFixed(2)),
                warning: totalWeeksActive < 4 ? "Insufficient data — less than 4 weeks of sales history" : null
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
