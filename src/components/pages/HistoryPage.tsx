"use client";

import React, { useState } from 'react';
import { useSBHistory, HistoryItem } from '@/hooks/useSBHistory';
import { IndustrialStrip } from '@/components/ui/IndustrialStrip';
import { ActionBtn } from '@/components/ui/ActionBtn';
import { MeltPortal } from '@/components/ui/MeltPortal';
import {
    History, Clock, Trash2, RotateCcw,
    FileUp, Archive, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStability } from '@/hooks/useStability';

interface HistoryPageProps {
    onRestore: (type: 'decode' | 'encode', rawString: string) => void;
}

export function HistoryPage({ onRestore }: HistoryPageProps) {
    const { history, removeFromHistory, clearHistory } = useSBHistory();
    const { safeTimeout } = useStability();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        safeTimeout(() => setToast(null), 3000);
    };

    const formatDate = (timestamp: number) => {
        if (!timestamp || isNaN(new Date(timestamp).getTime())) {
            return "UNKNOWN DATE";
        }
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(timestamp));
    };

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
            clearHistory();
            showToast("History cleared");
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <History size={18} className="text-melt-accent" />
                    <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">OPERATIONAL LOGS</h2>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-[9px] font-black uppercase text-red-400/60 hover:text-red-400 transition-all flex items-center gap-2 tracking-[0.2em]"
                    >
                        <Trash2 size={12} /> CLEAR ALL
                    </button>
                )}
            </div>

            {/* History List */}
            <div className="flex flex-col gap-2">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                        <Archive size={48} strokeWidth={1} />
                        <p className="text-[10px] uppercase font-bold tracking-[0.3em]">No history items found</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <HistoryStrip
                            key={item.id}
                            item={item}
                            formatDate={formatDate}
                            onRestore={() => onRestore(item.type, item.rawString)}
                            onDelete={() => {
                                removeFromHistory(item.id);
                                showToast("Item removed");
                            }}
                        />
                    ))
                )}
            </div>

            {/* Toast */}
            {toast && (
                <MeltPortal hostId="melt-portal-host">
                    <div className={cn(
                        "fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 shrink-0 z-[100] border border-melt-accent/10",
                        toast.type === 'success' ? "bg-melt-accent text-melt-surface" : "bg-red-500/80 text-melt-text-heading"
                    )}>
                        <CheckCircle2 size={16} />
                        <span className="text-[9px] font-black tracking-widest uppercase">{String(toast.message)}</span>
                    </div>
                </MeltPortal>
            )}
        </div>
    );
}

function HistoryStrip({ item, formatDate, onRestore, onDelete }: {
    item: HistoryItem,
    formatDate: (t: number) => string,
    onRestore: () => void,
    onDelete: () => void
}) {
    const isDecode = item.type === 'decode';

    return (
        <IndustrialStrip
            label={item.name}
            icon={isDecode ? FileUp : Archive}
            statusColor="text-melt-text-body"
            rightElement={
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[9px] font-black text-melt-text-muted uppercase tracking-widest">{String(item.type)}</span>
                        <span className="text-[8px] font-bold text-melt-text-muted/40 uppercase">{formatDate(item.timestamp)}</span>
                    </div>
                    <button
                        onClick={onRestore}
                        className="p-2 text-melt-text-muted hover:text-melt-accent transition-all active:scale-90"
                        title="Restore"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-melt-text-muted hover:text-red-400 transition-all active:scale-90"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            }
        >
            <div className="p-6 bg-transparent border-t border-melt-text-muted/10 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">Version</span>
                    <span className="text-xs font-bold text-melt-text-label">{String(item.version)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">Author</span>
                    <span className="text-xs font-bold text-melt-text-label">{String(item.author)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">Actions</span>
                    <span className="text-xs font-bold text-melt-text-label">{String(item.stats?.actions || 0)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">Scripts</span>
                    <span className="text-xs font-bold text-melt-text-label">{String(item.stats?.scripts || 0)}</span>
                </div>
            </div>
            <div className="px-6 pb-6 bg-transparent border-b border-melt-text-muted/10">
                <div className="h-px w-full bg-melt-text-muted/10 mb-4" />
                <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">Data Snippet</span>
                    <div className="bg-melt-void/50 p-3 rounded border border-melt-text-muted/10 font-mono text-[10px] text-melt-text-label break-all line-clamp-2">
                        {String(item.rawString)}
                    </div>
                </div>
            </div>
        </IndustrialStrip>
    );
}
