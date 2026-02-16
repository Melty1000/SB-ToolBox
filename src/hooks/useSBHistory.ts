"use client";

import { useState, useCallback } from 'react';

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

const normalizeHistory = (value: unknown): HistoryItem[] => {
    if (!Array.isArray(value)) return [];

    return value.map((item) => {
        const record = (item ?? {}) as Partial<HistoryItem>;
        const cleanse = (field: unknown, fallback: string) => {
            if (field === undefined || field === null || field === 'undefined' || field === '') {
                return fallback;
            }
            return String(field);
        };

        return {
            ...record,
            id: cleanse(record.id, typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
            name: cleanse(record.name, 'Untitled Export'),
            author: cleanse(record.author, 'Unknown'),
            version: cleanse(record.version, '0.0.0'),
            type: cleanse(record.type, 'decode') === 'encode' ? 'encode' : 'decode',
            rawString: cleanse(record.rawString, ''),
            timestamp: typeof record.timestamp === 'number' ? record.timestamp : Date.now(),
            stats: record.stats || { actions: 0, scripts: 0 }
        };
    });
};

const readInitialHistory = (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return normalizeHistory(parsed);
    } catch (e) {
        console.error("Failed to parse history", e);
        return [];
    }
};

export const useSBHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>(readInitialHistory);

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
