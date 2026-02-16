"use client";

import React from 'react';
import { createPortal } from 'react-dom';

/**
 * MeltPortal: Teleports elements to the root portal host.
 * This bypasses transform-contexts that break 'position: fixed'.
 */
export const MeltPortal: React.FC<{ children: React.ReactNode; hostId?: string }> = ({ children, hostId = 'melt-portal-host' }) => {
    if (typeof document === 'undefined') return null;

    const portalRoot = document.getElementById(hostId);
    if (!portalRoot) return <>{children}</>; // Fallback if host not found

    return createPortal(children, portalRoot);
};
