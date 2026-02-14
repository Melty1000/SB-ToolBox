"use client";

import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
    id: string;
    type: 'encode' | 'decode';
    timestamp: number;
    name: string;
    author: string;
    version: string;
    rawString: string;
    stats: {
        actions: number;
        scripts: number;
    };
}

const STORAGE_KEY = 'sb_tool_history';
const MAX_HISTORY = 50;

export const useSBHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Init history from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    // MIGRATION: Ensure all items have stats object and cleanse "undefined" strings
                    const migrated = parsed.map(item => {
                        const cleanse = (v: any, fallback: string) => (v === undefined || v === null || v === 'undefined' || v === '') ? fallback : v;
                        return {
                            ...item,
                            name: cleanse(item.name, 'Untitled Export'),
                            author: cleanse(item.author, 'Unknown'),
                            version: cleanse(item.version, '0.0.0'),
                            type: cleanse(item.type, 'decode'),
                            rawString: cleanse(item.rawString, ''),
                            timestamp: item.timestamp || Date.now(),
                            stats: item.stats || { actions: 0, scripts: 0 }
                        };
                    });
                    setHistory(migrated);
                }
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, [setHistory]);

    const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        setHistory(prev => {
            const id = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 15);

            const newItem: HistoryItem = {
                ...item,
                id,
                timestamp: Date.now()
            };
            const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeFromHistory = useCallback((id: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory
    };
};
