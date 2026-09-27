import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        default: 'staff'
    },
    organization: {
        type: String,
        default: 'Legacy Workspace'
    }
}, { timestamps: true });

userSchema.index({ organization: 1, email: 1 }, { unique: true });
userSchema.index({ organization: 1, role: 1 });

const User = mongoose.model('User', userSchema);

export default User;