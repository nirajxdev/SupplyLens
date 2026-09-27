import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
    try {
        const org = req.user.organization || 'Legacy Workspace';
        const page = Math.min(parseInt(req.query.page) || 1, 10000);
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const skip = (page - 1) * limit;
        const total = await User.countDocuments({ organization: org });
        const users = await User.find({ organization: org }).select('-password').skip(skip).limit(limit).lean();
        res.json({ success: true, data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error("Error in getAllUsers:", error?.message || error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'manager', 'staff'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const org = req.user.organization || 'Legacy Workspace';
        // Scope to same organization — prevents cross-tenant escalation
        const user = await User.findOne({ _id: id, organization: org });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-demotion lockout
        if (String(user._id) === String(req.user._id) && user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ organization: org, role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot demote the last admin' });
            }
        }
        // Prevent demoting last admin
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ organization: org, role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot demote the last admin' });
            }
        }

        user.role = role;
        await user.save();

        res.json({ success: true, message: 'User role updated', data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Error in updateUserRole:", error?.message || error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
