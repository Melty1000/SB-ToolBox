"use client";

import React, { useState, useRef } from 'react';
import { useSBEncoder } from '@/hooks/useSBEncoder';
import { useSBHistory } from '@/hooks/useSBHistory';
import { SBEditor } from '@/components/editor/SBEditor';
import { cn } from '@/lib/utils';
import {
    FileUp, CheckCircle2, PackageOpen, Info, Code2, Package,
    Bolt, Layers, Fingerprint, Terminal, Clock, Server, Plug, List, Users,
    Check
} from 'lucide-react';
import { useStability } from '@/hooks/useStability';
import { ActionBtn } from '@/components/ui/ActionBtn';
import { IndustrialStrip } from '@/components/ui/IndustrialStrip';
import { MeltPortal } from '@/components/ui/MeltPortal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function DecoderPage({ initialValue }: { initialValue?: string }) {
    const {
        decodedData, extractedScripts, stats,
        decode, encode, setDecodedData, setExtractedScripts, updateStats
    } = useSBEncoder();
    const { safeTimeout } = useStability();

    const [inputValue, setInputValue] = useState(initialValue || '');

    // Focus input and decode if initialValue is provided
    React.useEffect(() => {
        if (initialValue) {
            setInputValue(initialValue);
            // Auto-trigger decode for better UX
            decode(initialValue);
        }
    }, [initialValue, decode]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Performance Optimization: Debounced Metadata Buffer
    const [localMetadata, setLocalMetadata] = useState<{ name: string, author: string, version: string, description: string }>({
        name: '', author: '', version: '', description: ''
    });
    const [isDirty, setIsDirty] = useState(false);
    const [hasBundled, setHasBundled] = useState(false);
    const [hasExported, setHasExported] = useState(false);
    // Unified Sync Lock to prevent circular loops
    const syncLockRef = useRef(false);
    const lastSyncedMetaRef = useRef<string>('');

    // Populate local buffer when data is loaded (Master -> Local)
    React.useEffect(() => {
        if (!decodedData || syncLockRef.current) return;

        try {
            const currentRoot = decodedData.data || decodedData;
            const meta = decodedData.meta || currentRoot;

            const incomingMeta = {
                name: String(meta.name || currentRoot.name || ''),
                author: String(meta.author || currentRoot.author || ''),
                version: String(meta.version || currentRoot.version || ''),
                description: String(meta.description || currentRoot.description || '')
            };

            const incomingStr = JSON.stringify(incomingMeta);
            if (incomingStr !== lastSyncedMetaRef.current) {
                lastSyncedMetaRef.current = incomingStr;
                setLocalMetadata(incomingMeta);
            }
        } catch (e) {
            console.error("METADATA_INCOMING_SYNC_FAIL:", e);
        }
    }, [decodedData]);

    // Sync local changes to master state (Local -> Master)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!decodedData) return;

            try {
                const currentRoot = decodedData.data || decodedData;
                const meta = decodedData.meta || currentRoot;

                if (meta.name !== localMetadata.name ||
                    meta.author !== localMetadata.author ||
                    meta.version !== localMetadata.version ||
                    meta.description !== localMetadata.description) {

                    syncLockRef.current = true;

                    const newData = JSON.parse(JSON.stringify(decodedData));
                    const target = newData.data || newData;
                    const targetMeta = newData.meta || target;

                    targetMeta.name = localMetadata.name;
                    targetMeta.author = localMetadata.author;
                    targetMeta.version = localMetadata.version;
                    targetMeta.description = localMetadata.description;

                    lastSyncedMetaRef.current = JSON.stringify(localMetadata);

                    setDecodedData(newData);
                    updateStats(newData);
                    setIsDirty(true);

                    // Re-engage sync after the next commit cycle
                    setTimeout(() => { syncLockRef.current = false; }, 50);
                }
            } catch (e) {
                console.error("METADATA_OUTGOING_SYNC_FAIL:", e);
            }
        }, 300); // 300ms for slightly snappier feel
        return () => clearTimeout(timer);
    }, [localMetadata, updateStats]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        safeTimeout(() => setToast(null), 3000);
    };

    const { addToHistory } = useSBHistory();

    const isProcessingRef = React.useRef(false);

    const handleDecode = () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            // Reset sync markers before decode
            lastSyncedMetaRef.current = '';
            setLocalMetadata({ name: '', author: '', version: '', description: '' });

            const result = decode(inputValue);
            if (result) {
                const { data, stats: newStats } = result;
                // Metadata can be at: data.meta, data (top level), or data.data
                const meta = data.meta || data;
                const metadata = {
                    name: String(meta.name || data.name || ''),
                    author: String(meta.author || data.author || ''),
                    version: String(meta.version || data.version || ''),
                    description: String(meta.description || data.description || '')
                };
                setLocalMetadata(metadata);

                // Add to history
                addToHistory({
                    type: 'decode',
                    name: metadata.name || metadata.author || 'Untitled Export',
                    author: metadata.author || 'Unknown',
                    version: metadata.version || '0.0.0',
                    rawString: inputValue,
                    stats: {
                        actions: newStats.actions,
                        scripts: newStats.scripts
                    }
                });

                // Reset dirty state on fresh decode
                isInitialLoad.current = true;
                setIsDirty(false);
                setHasBundled(false);
                setHasExported(false);

                showToast("Successfully decoded!");
            } else {
                showToast("Decode failed - check your input string", 'error');
            }
        } catch (e) {
            console.error("DECODE_BARRIER_FAIL:", e);
            showToast("Critical process failure", "error");
        } finally {
            isProcessingRef.current = false;
        }
    };

    const handleMetadataChange = (field: string, value: string) => {
        setLocalMetadata(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) setInputValue(e.target.result as string);
            };
            reader.readAsText(file);
        }
    };

    const isInitialLoad = useRef(false);

    // Reset states on any data change (edit) and mark as dirty
    React.useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        setHasBundled(false);
        setHasExported(false);
        // Removed: setExpandedFile(null); // This was causing the editor to collapse on every keystroke
    }, [decodedData, extractedScripts]);

    const [expandedFile, setExpandedFile] = useState<string | null>(null);
    const toggleFile = (id: string) => {
        setExpandedFile(prev => prev === id ? null : id);
    };

    const isAnyExpanded = !!expandedFile;

    const handleBundle = async () => {
        if (!decodedData) return;
        const result = encode(decodedData, extractedScripts);
        if (result) {
            try {
                await navigator.clipboard.writeText(String(result));
                setHasBundled(true);
                showToast("Re-encoded to import string and copied to clipboard!");
            } catch (err: any) {
                console.error("CLIPBOARD_REJECTION:", err);
                showToast("Failed to copy to clipboard", "error");
            }
        } else {
            showToast("Failed to bundle - check console", "error");
        }
    };

    const handleZipExport = async () => {
        if (!decodedData) return;
        try {
            const zip = new JSZip();
            zip.file("export.json", JSON.stringify(decodedData, null, 2));

            const scriptsFolder = zip.folder("Scripts");
            Object.entries(extractedScripts).forEach(([name, content]) => {
                scriptsFolder?.file(name, content);
            });

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, `${localMetadata.name || 'sb_export'}.zip`);

            setHasExported(true);
            showToast("Exported to ZIP!");
        } catch (e) {
            showToast("Export failed", 'error');
        }
    };

    return (
        <div className="flex flex-col gap-4 pb-20">

            {/* ROW 1: INPUT STRING (Integrated) */}
            <div className="flex flex-col gap-4 px-2 pt-0">
                <div className="flex items-center gap-3">
                    <FileUp size={18} className="text-melt-accent" />
                    <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">INPUT STRING OR .SB</h2>
                </div>
                <div
                    className={cn(
                        "relative group transition-all duration-300",
                        isDragging && "scale-[1.02] border-melt-accent/50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        spellCheck="false"
                        className={cn(
                            "w-full bg-transparent border-b border-transparent py-3 px-4 text-sm font-mono text-melt-text-heading outline-none resize-none leading-relaxed focus:border-melt-accent/50 scrollbar-track-focus transition-all duration-700 ease-in-out custom-scrollbar z-10 relative",
                            decodedData ? "h-32" : "h-40",
                            isDragging && "border-melt-accent bg-melt-accent/5"
                        )}
                    />
                    {!inputValue && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3 z-0">
                            <span className="text-[10px] font-bold text-melt-text-muted/40 uppercase tracking-[0.2em]">PASTE SB IMPORT STRING HERE</span>
                            <div className="flex items-center w-48 gap-4">
                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                <span className="text-[10px] font-bold text-melt-text-muted/20 uppercase tracking-[0.2em]">OR</span>
                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                            </div>
                            <span className="text-[10px] font-bold text-melt-text-muted/40 uppercase tracking-[0.2em]">DRAG SB IMPORT FILE HERE</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 2: ACTION BAR (Tight) */}
            {inputValue.trim().length > 0 && (
                <div className="relative w-full py-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center w-full h-[52px] gap-6">
                        <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                        <ActionBtn
                            label={decodedData ? "Decoded" : "Decode"}
                            icon={decodedData ? CheckCircle2 : PackageOpen}
                            onClick={handleDecode}
                        />
                        <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                    </div>
                </div>
            )}

            {/* RESULTS SECTION */}
            {decodedData && (
                <div className="flex flex-col gap-8 px-4">

                    {/* ROW 3: STATS BAR (Filtered, 2-Row Grid if >5) */}
                    {(() => {
                        const allStats = [
                            { icon: Bolt, label: "Actions", value: stats.actions, color: "text-yellow-500" },
                            { icon: Layers, label: "Subactions", value: stats.subActions, color: "text-blue-500" },
                            { icon: Code2, label: "Scripts", value: stats.scripts, color: "text-green-500" },
                            { icon: Fingerprint, label: "Triggers", value: stats.triggers, color: "text-red-500" },
                            { icon: Terminal, label: "Commands", value: stats.commands, color: "text-purple-500" },
                            { icon: Clock, label: "Timed Actions", value: stats.timedActions, color: "text-orange-500" },
                            { icon: Server, label: "WS Servers", value: stats.wsServers, color: "text-emerald-500" },
                            { icon: Plug, label: "WS Clients", value: stats.wsClients, color: "text-sky-500" },
                            { icon: List, label: "Queues", value: stats.queues, color: "text-indigo-500" },
                            { icon: Users, label: "Groups", value: stats.groups, color: "text-melt-text-label" },
                        ];
                        const filtered = allStats.filter(s => s.value > 0);

                        return (
                            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4">
                                {filtered.map((s, i) => (
                                    <InlineStat key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />
                                ))}
                            </div>
                        );
                    })()}

                    {/* ROW 4: EXPORT AREA (Integrated) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Info size={18} className="text-melt-accent" />
                            <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">INSPECT & REFINE</h2>
                        </div>

                        {/* Metadata Section (Clean, No Card) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                            <MetadataInput label="Name" value={localMetadata.name} onChange={(v) => handleMetadataChange('name', v)} />
                            <MetadataInput label="Author" value={localMetadata.author} onChange={(v) => handleMetadataChange('author', v)} />
                            <MetadataInput label="Version" value={localMetadata.version} onChange={(v) => handleMetadataChange('version', v)} />
                            <MetadataInput label="Description" value={localMetadata.description} onChange={(v) => handleMetadataChange('description', v)} />
                        </div>

                        {/* Content List (JSON & Scripts) */}
                        <div
                            className={cn(
                                "flex flex-col gap-1",
                                expandedFile ? "pb-[60vh]" : "pb-12"
                            )}
                        >
                            {/* JSON Export View */}
                            {(!expandedFile || expandedFile === 'export.json') && (
                                <IndustrialStrip
                                    label="export.json"
                                    icon={FileUp}
                                    isExpanded={expandedFile === 'export.json'}
                                    onExpandChange={() => toggleFile('export.json')}
                                >
                                    <div className="w-full h-[calc(100vh_-_300px)] pl-[20px] relative">
                                        <SBEditor
                                            value={JSON.stringify(decodedData, null, 2)}
                                            language="json"
                                            theme="melt-theme"
                                            onChange={(v) => {
                                                if (v) {
                                                    try {
                                                        const parsed = JSON.parse(v);
                                                        setDecodedData(parsed);
                                                        updateStats(parsed);
                                                        setIsDirty(true);
                                                    } catch (e) { /* Invalid JSON, ignore */ }
                                                }
                                            }}
                                        />
                                    </div>
                                </IndustrialStrip>
                            )}

                            {/* Scripts List */}
                            {Object.keys(extractedScripts).length === 0 ? (
                                (!expandedFile && (
                                    <div className="p-6 text-center text-melt-text-muted italic text-[10px] uppercase tracking-widest opacity-50">
                                        No C# Scripts found in export.
                                    </div>
                                ))
                            ) : (
                                Object.keys(extractedScripts).map(scriptName => (
                                    <IndustrialStrip
                                        key={scriptName}
                                        label={scriptName}
                                        icon={Code2}
                                        isExpanded={expandedFile === scriptName}
                                        onExpandChange={() => toggleFile(scriptName)}
                                    >
                                        <div className="w-full h-[calc(100vh_-_300px)] pl-[20px] relative">
                                            <SBEditor
                                                value={extractedScripts[scriptName]}
                                                language="csharp"
                                                theme="melt-theme"
                                                onChange={(v) => {
                                                    if (v) {
                                                        setExtractedScripts(prev => ({ ...prev, [scriptName]: v }));
                                                        setIsDirty(true);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </IndustrialStrip>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ROW 5: ACTION BAR (Persistent Floating Footer) - Teleported to application root */}
                    {/* ROW 5: ACTION BAR (Persistent Floating Footer) - Teleported to local host in MeltShell */}
                    <MeltPortal hostId="melt-portal-host">
                        <div
                            className="fixed bottom-0 right-[12px] h-[100px] bg-melt-surface z-[100] px-10 flex items-center justify-center pointer-events-auto"
                            style={{ left: 'var(--sidebar-width, 64px)' }}
                        >
                            <div className="relative w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-center w-full min-h-[52px] py-4">
                                    {isDirty ? (
                                        <div className="flex w-full h-full items-center gap-6">
                                            {/* LEFT SEGMENT (Center @ 25%) */}
                                            <div className="flex-1 flex items-center gap-6">
                                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                                <ActionBtn
                                                    label={hasExported ? "EXPORTED" : "EXPORT TO ZIP"}
                                                    icon={hasExported ? CheckCircle2 : FileUp}
                                                    onClick={handleZipExport}
                                                    maxWidth={200}
                                                />
                                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                            </div>

                                            {/* CENTER DIVIDER */}
                                            <div className="shrink-0 px-4 py-2 text-[10px] font-black text-melt-text-muted uppercase tracking-[0.6em] translate-y-[-1px]">
                                                OR
                                            </div>

                                            {/* RIGHT SEGMENT (Center @ 75%) */}
                                            <div className="flex-1 flex items-center gap-6">
                                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                                <ActionBtn
                                                    label={hasBundled ? "RE-ENCODED" : "RE-ENCODE"}
                                                    icon={hasBundled ? CheckCircle2 : Package}
                                                    onClick={handleBundle}
                                                    maxWidth={200}
                                                />
                                                <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full min-h-[52px] flex-1 gap-6">
                                            <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                            <ActionBtn
                                                label={hasExported ? "EXPORTED" : "EXPORT TO ZIP"}
                                                icon={hasExported ? CheckCircle2 : FileUp}
                                                onClick={handleZipExport}
                                            />
                                            <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </MeltPortal>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <MeltPortal hostId="melt-portal-host">
                    <div className={cn(
                        "fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 shrink-0 z-[150] border border-melt-text-muted/10",
                        toast.type === 'success' ? "bg-melt-accent text-melt-surface" : "bg-red-500 text-melt-text-heading"
                    )}>
                        <CheckCircle2 size={16} />
                        <span className="text-[9px] font-black tracking-widest uppercase">{String(toast.message)}</span>
                    </div>
                </MeltPortal>
            )}
        </div>
    );
}

// Inline stat: Icon + Value + Label, no background/border
function InlineStat({ icon: Icon, label, value, color }: any) {
    return (
        <div className="flex items-center gap-4">
            <Icon size={20} className={cn("shrink-0", color)} />
            <span className="text-base font-black text-melt-text-muted">{String(value)}</span>
            <span className="text-xs font-bold text-melt-text-label uppercase tracking-[0.3em]">{label}</span>
        </div>
    );
}

function MetadataInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-2 flex-1 group">
            <label className="text-xs font-bold text-melt-text-label uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck="false"
                className="w-full bg-transparent border-b border-transparent px-1 py-3 text-sm font-mono text-melt-text-body outline-none focus:border-melt-accent/50 focus:bg-melt-surface transition-all"
                placeholder="..."
            />
        </div>
    );
}
