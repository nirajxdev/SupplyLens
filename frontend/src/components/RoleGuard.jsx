import React from 'react';
import { useSelector } from 'react-redux';

const RoleGuard = ({ children, allowedRoles, showLocked = false }) => {
    const { user } = useSelector((state) => state.auth);

    if (!user || !allowedRoles.includes(user.role)) {
        if (!showLocked) return null;
        return (
            <span title={`Requires ${allowedRoles.join(' or ')} role`} style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>
                🔒 {allowedRoles.join('/')} only
            </span>
        );
    }

    return <>{children}</>;
};

export default RoleGuard;
