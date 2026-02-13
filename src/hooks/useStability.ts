"use client";

import { useEffect, useRef, useCallback } from 'react';

/**
 * useStability Hook
 * Centralized stable utilities for leak-proof component life-cycles.
 */
export const useStability = () => {
    const timers = useRef<NodeJS.Timeout[]>([]);

    /**
     * safeTimeout
     * A wrapper for setTimeout that automatically cleans up on unmount.
     */
    const safeTimeout = useCallback((fn: () => void, ms: number) => {
        const timeout = setTimeout(fn, ms);
        timers.current.push(timeout);
        return timeout;
    }, []);

    // Automatic cleanup for all registered timers
    useEffect(() => {
        return () => {
            timers.current.forEach(t => clearTimeout(t));
            timers.current = [];
        };
    }, []);

    return { safeTimeout };
};
