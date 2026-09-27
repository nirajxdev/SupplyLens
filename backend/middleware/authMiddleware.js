import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user and attach it to the request object (excluding the password)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Backward-compat: map legacy 'warehouse_staff' to 'staff' (DB should be migrated).
        // NOTE: removed silent 'user' -> 'admin' upgrade (was privilege escalation).
        if (req.user.role === 'warehouse_staff') {
            req.user.role = 'staff';
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const authorize = (...roles) => {
    // Flatten roles in case an array was passed (e.g. authorize(['admin', 'manager']))
    const allowedRoles = roles.flat();
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        next();
    };
};
