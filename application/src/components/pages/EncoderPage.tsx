"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSBEncoder, SBActionInfo } from '@/hooks/useSBEncoder';
import { SBEditor } from '@/components/editor/SBEditor';
import { useSBHistory } from '@/hooks/useSBHistory';
import { cn } from '@/lib/utils';
import {
    ChevronDown, FileJson, FolderCode,
    Zap, Trash2, CheckCircle2, AlertCircle, FileUp,
    Terminal, Braces, Code2, Search, Link as LinkIcon,
    Unlink as UnlinkIcon, Plus, FolderUp, Loader2, Copy,
    Check
} from 'lucide-react';
import { useStability } from '@/hooks/useStability';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ActionBtn } from '@/components/ui/ActionBtn';
import { MeltPortal } from '@/components/ui/MeltPortal';

// --- INDUSTRIAL ITEM STRIP COMPONENT ---
const ScriptStrip = ({
    name,
    onDelete,
    availableActions,
    targetId,
    onLink
}: {
    name: string,
    onDelete: () => void,
    availableActions: SBActionInfo[],
    targetId: string | null,
    onLink: (actionId: string | null) => void
}) => {
    const [isLinking, setIsLinking] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredActions = useMemo(() => {
        return availableActions.filter(a =>
            (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.id || '').toLowerCase().includes(search.toLowerCase())
        );
    }, [availableActions, search]);

    const targetAction = useMemo(() =>
        availableActions.find(a => a.id === targetId),
        [availableActions, targetId]);

    useGSAP(() => {
        if (isLinking) {
            gsap.fromTo(dropdownRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });

            // Scroll internal container to top, NOT the whole page
            setTimeout(() => {
                if (containerRef.current) {
                    const scrollContainer = containerRef.current.closest('.overflow-y-auto') as HTMLElement;
                    if (scrollContainer) {
                        const relativeTop = containerRef.current.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop;
                        scrollContainer.scrollTo({
                            top: relativeTop,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 10);
        }
    }, { dependencies: [isLinking], scope: containerRef });

    return (
        <div ref={containerRef} className="group relative transition-all duration-300">
            <div className="flex items-center justify-between p-3 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Code2 size={16} className="text-melt-accent shrink-0" />
                    <span className="text-[11px] font-bold text-melt-text-label truncate">{String(name)}</span>

                    <button
                        onClick={() => setIsLinking(!isLinking)}
                        className={cn(
                            "flex items-center gap-2 px-0 py-1.5 rounded-none text-[8px] font-mono font-black uppercase tracking-widest transition-all hover:opacity-100",
                            targetAction
                                ? "text-emerald-500/50"
                                : (targetId ? "text-amber-500/60" : "text-rose-500/40")
                        )}
                    >
                        {targetId ? <Zap size={10} fill={targetAction ? "currentColor" : "none"} className={cn(!targetAction && "opacity-50")} /> : <AlertCircle size={10} />}
                        {targetAction ? "Linked" : (targetId ? "Invalid Target" : "Unlinked")}
                        <ChevronDown size={10} className={cn("transition-transform opacity-30", isLinking && "rotate-180")} />
                    </button>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onDelete} className="p-2 text-melt-text-muted hover:text-red-400 transition-all active:scale-90">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Inline Quick-Linker (No Modal) */}
            {isLinking && (
                <div ref={dropdownRef} className="ml-5 overflow-hidden">
                    <div className="p-0 border-b border-transparent transition-colors">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-melt-accent/50" size={14} />
                            <input
                                autoFocus
                                spellCheck="false"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="FILTER"
                                className="w-full bg-transparent py-4 pl-12 pr-4 text-[10px] text-melt-text-body outline-none transition-all font-black uppercase tracking-[0.2em] placeholder:opacity-20"
                            />
                        </div>
                    </div>
                    <div className="p-4 pt-2 space-y-1">
                        {filteredActions.length === 0 ? (
                            <p className="text-[10px] text-melt-text-muted py-2 px-2 italic uppercase">No matching actions found</p>
                        ) : (
                            <>
                                <button
                                    onClick={() => { onLink(null); setIsLinking(false); }}
                                    className="w-full text-left px-3 py-2 rounded-none text-[9px] font-black text-red-500/50 hover:text-red-500 transition-all uppercase tracking-[0.2em]"
                                >
                                    [ UNLINK FILE ]
                                </button>
                                {filteredActions.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => { onLink(a.id); setIsLinking(false); }}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-none text-[10px] flex items-center justify-between transition-all group/item border-l",
                                            targetId === a.id
                                                ? "border-melt-accent text-melt-text-heading"
                                                : "border-transparent text-melt-text-muted hover:text-melt-text-body"
                                        )}
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <span className="font-black uppercase tracking-[0.15em] leading-tight truncate">{a.name}</span>
                                            <span className="opacity-30 text-[8px] font-mono uppercase tracking-widest truncate">ID: {a.id}</span>
                                        </div>
                                        {targetId === a.id && <Zap size={10} fill="currentColor" className="text-emerald-500/40" />}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- INDUSTRIAL ITEM STRIP COMPONENT ---

export function EncoderPage({ initialValue }: { initialValue?: string }) {
    const { encode, error, availableActions, parseActions } = useSBEncoder() as any;
    const { addToHistory } = useSBHistory();
    const { safeTimeout } = useStability();
    const [jsonTemplate, setJsonTemplate] = useState<string>(initialValue || '');
    const [isDraggingScripts, setIsDraggingScripts] = useState(false);

    useEffect(() => {
        if (initialValue) {
            setJsonTemplate(initialValue);
            // Optional: Auto-validate or trigger something if needed
        }
    }, [initialValue]);
    const [scripts, setScripts] = useState<Record<string, string>>({});
    const [linkMap, setLinkMap] = useState<Record<string, string>>({});
    const [result, setResult] = useState<string>('');
    const [encodingMode, setEncodingMode] = useState<'file' | 'string' | null>(null);
    const [isDraggingJson, setIsDraggingJson] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleJsonDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingJson(true);
    };

    const handleJsonDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingJson(false);
    };

    const handleJsonDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingJson(false);
        const files = Array.from(e.dataTransfer.files);
        const jsonFiles = files.filter(f => f.name.endsWith('.json') || f.name.endsWith('.sb') || f.name.endsWith('.txt'));
        if (jsonFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setJsonTemplate(content);
                showToast("JSON Template Loaded");
            };
            reader.readAsText(jsonFiles[0]);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        safeTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        try {
            const newMap = { ...linkMap };
            let changed = false;
            Object.keys(scripts || {}).forEach(fileName => {
                if (!newMap[fileName]) {
                    const baseName = fileName.replace('.cs', '').toLowerCase();
                    const match = (availableActions || []).find((a: any) =>
                        (a.name || '').toLowerCase() === baseName ||
                        (a.id || '').toLowerCase() === baseName
                    );
                    if (match) {
                        newMap[fileName] = match.id;
                        changed = true;
                    }
                }
            });
            if (changed) setLinkMap(newMap);
        } catch (e) {
            console.error("Auto-matcher error", e);
        }
    }, [scripts, availableActions, linkMap]);

    useEffect(() => {
        if (jsonTemplate.trim()) parseActions(jsonTemplate);
    }, [jsonTemplate, parseActions]);

    useEffect(() => {
        if (result && resultRef.current) {
            safeTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [result, safeTimeout]);

    const handleAddJSON = async () => {
        const electron = (window as any).electron;
        if (electron?.fs) {
            try {
                const newFiles = await electron.fs.selectFiles({
                    filters: [{ name: 'JSON Export', extensions: ['json', 'sb', 'txt'] }]
                });
                if (newFiles) {
                    const firstContent = Object.values(newFiles)[0] as string;
                    setJsonTemplate(firstContent);
                    showToast("JSON Template Loaded");
                }
            } catch (err: any) {
                showToast(err.message || "Failed to select file", "error");
            }
        }
    };

    const handleAddScripts = async (mode: 'files' | 'folder') => {
        const electron = (window as any).electron;
        if (electron?.fs) {
            try {
                const newScripts = mode === 'folder'
                    ? await electron.fs.selectFolder()
                    : await electron.fs.selectFiles();

                if (newScripts) {
                    setScripts(prev => ({ ...prev, ...newScripts }));
                    showToast(`Loaded ${Object.keys(newScripts).length} scripts`);
                }
            } catch (err: any) {
                showToast(err.message || "Failed to load scripts", "error");
            }
        }
    };

    const handleScriptDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingScripts(true);
    };

    const handleScriptDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingScripts(false);
    };

    const handleScriptDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingScripts(false);
        const files = Array.from(e.dataTransfer.files);
        const csFiles = files.filter(f => f.name.endsWith('.cs'));

        if (csFiles.length === 0) return;

        const newScripts: Record<string, string> = {};
        let count = 0;

        for (const file of csFiles) {
            try {
                const text = await file.text();
                newScripts[file.name] = text;
                count++;
            } catch (err) {
                console.error("Failed to read file", file.name, err);
            }
        }

        if (count > 0) {
            setScripts(prev => ({ ...prev, ...newScripts }));
            showToast(`Loaded ${count} script(s)`);
        }
    };

    const handleEncode = (mode: 'file' | 'string') => {
        if (!jsonTemplate) {
            showToast("Requires JSON template", 'error');
            return;
        }

        setEncodingMode(mode);
        safeTimeout(() => {
            try {
                const data = JSON.parse(jsonTemplate);
                const encoded = encode(data, scripts || {}, linkMap || {});
                if (encoded) {
                    setResult(encoded);

                    // Add to history
                    const meta = data.meta || data;
                    addToHistory({
                        type: 'encode',
                        name: meta.name || 'Untitled Export',
                        author: meta.author || 'Unknown',
                        version: meta.version || '0.0.0',
                        rawString: encoded,
                        stats: {
                            actions: (data.actions || data.data?.actions || []).length,
                            scripts: Object.keys(scripts || {}).length
                        }
                    });

                    if (mode === 'string') {
                        showToast("Encoded successfully!");
                    } else {
                        handleDownloadSB(encoded);
                    }
                } else {
                    showToast(error || "Encoding failed", 'error');
                }
            } catch (e: any) {
                showToast(e.message || "Encoding failed", 'error');
            } finally {
                setEncodingMode(null);
            }
        }, 500);
    };

    const handleDownloadSB = (content: string) => {
        try {
            const data = JSON.parse(jsonTemplate);
            const fileName = `${data.name || 'melt_export'}.sb`;
            const blob = new Blob([content], { type: 'text/plain' });
            saveAs(blob, fileName);
            showToast("SB file downloaded!");
        } catch (e) {
            showToast("Save failed", 'error');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(String(result));
            showToast("Copied to clipboard!");
        } catch (err: any) {
            showToast("Clipboard copy failed", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between hidden lg:flex h-8">
                        <div className="flex items-center gap-3">
                            <Braces size={20} className="text-melt-accent" />
                            <h2 className="text-[11px] font-black text-melt-text-label uppercase tracking-[0.2em]">JSON Template</h2>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "relative group transition-all duration-300 h-[600px] border-b border-transparent hover:border-b-melt-accent/50 focus-within:border-b-melt-accent/50",
                            isDraggingJson && "border-b-melt-accent/50"
                        )}
                        onDragOver={handleJsonDragOver}
                        onDragLeave={handleJsonDragLeave}
                        onDrop={handleJsonDrop}
                    >
                        <SBEditor
                            value={jsonTemplate}
                            language="json"
                            theme="melt-theme"
                            onChange={(v: string | undefined) => setJsonTemplate(v || '')}
                        />
                        {!jsonTemplate && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3 z-0">
                                <span className="text-[10px] font-bold text-melt-text-muted uppercase tracking-[0.2em] opacity-40">PASTE EXPORT JSON HERE</span>
                                <div className="flex items-center w-48 gap-4 opacity-20">
                                    <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                    <span className="text-[10px] font-bold text-melt-text-muted uppercase tracking-[0.2em]">OR</span>
                                    <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
                                </div>
                                <span className="text-[10px] font-bold text-melt-text-muted uppercase tracking-[0.2em] opacity-40">DRAG JSON FILE HERE</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between hidden lg:flex h-8">
                        <div className="flex items-center gap-3">
                            <Code2 size={20} className="text-melt-accent" />
                            <h2 className="text-[11px] font-black text-melt-text-label uppercase tracking-[0.2em]">.CS FILES</h2>
                        </div>
                    </div>

                    <div
                        onDragOver={handleScriptDragOver}
                        onDragLeave={handleScriptDragLeave}
                        onDrop={handleScriptDrop}
                        className={cn(
                            "relative group transition-all duration-700 ease-in-out flex flex-col border-b border-transparent hover:border-b-melt-accent/50 min-h-[600px]",
                            isDraggingScripts && "border-b-melt-accent/50"
                        )}
                    >
                        {Object.keys(scripts).length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-melt-text-muted/20 py-20">
                                <FolderCode size={48} strokeWidth={1} />
                                <p className="text-[10px] uppercase font-bold tracking-[0.3em]">Drop .cs files here</p>
                            </div>
                        ) : (
                            <div className="flex-1">
                                {Object.keys(scripts).map(name => (
                                    <ScriptStrip
                                        key={name}
                                        name={name}
                                        availableActions={availableActions}
                                        targetId={linkMap[name] || null}
                                        onDelete={() => {
                                            const s = { ...scripts }; delete s[name]; setScripts(s);
                                            const m = { ...linkMap }; delete m[name]; setLinkMap(m);
                                        }}
                                        onLink={(id) => setLinkMap(prev => ({ ...prev, [name]: id as string }))}
                                    />
                                ))}
                            </div>
                        )}

                        {Object.keys(scripts).length > 0 && (
                            <div className="mt-auto px-5 py-3 flex items-center justify-between pointer-events-none animate-in fade-in duration-500">
                                <span className="text-[8px] font-black text-melt-text-muted/40 uppercase tracking-[0.3em] font-mono">{Object.keys(scripts).length} FILES</span>
                                <span className="text-[8px] font-black text-emerald-500/20 uppercase tracking-[0.3em] font-mono">{Object.values(linkMap).filter(v => !!v).length} LINKED</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(jsonTemplate && Object.keys(scripts).length > 0) && (
                <MeltPortal hostId="melt-footer-host">
                    <div
                        className="absolute bottom-10 left-0 right-0 z-[100] px-10 pointer-events-none"
                    >
                        <div className="relative w-full animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-auto">
                            <div className="flex flex-col lg:flex-row items-center justify-between w-full min-h-[52px] gap-4 lg:gap-0 py-4 lg:py-0">
                                {/* LEFT SEGMENT */}
                                <div className="h-[1px] flex-1 bg-melt-text-muted/10 hidden lg:block" />
                                <ActionBtn
                                    label={encodingMode === 'file' ? "Processing..." : "Encode To .SB File"}
                                    icon={encodingMode === 'file' ? Loader2 : FileUp}
                                    onClick={() => handleEncode('file')}
                                />
                                <div className="h-[1px] flex-1 bg-melt-text-muted/10 hidden lg:block" />

                                {/* CENTER DIVIDER */}
                                <div className="flex items-center h-full gap-6 shrink-0">
                                    <div className="h-[1px] w-8 lg:w-12 bg-melt-text-muted/10" />
                                    <div className="px-4 py-2 bg-melt-surface text-[10px] font-black text-melt-text-muted uppercase tracking-[0.6em] translate-y-[-1px] shrink-0">OR</div>
                                    <div className="h-[1px] w-8 lg:w-12 bg-melt-text-muted/10" />
                                </div>

                                {/* RIGHT SEGMENT */}
                                <div className="flex-1 flex items-center h-full gap-6">
                                    <div className="h-[1px] flex-1 bg-melt-text-muted/10 hidden lg:block" />
                                    <ActionBtn
                                        label={encodingMode === 'string' ? "Processing..." : "Encode to Import String"}
                                        icon={encodingMode === 'string' ? Loader2 : Terminal}
                                        onClick={() => handleEncode('string')}
                                    />
                                    <div className="h-[1px] flex-1 bg-melt-text-muted/10 hidden lg:block" />
                                </div>
                            </div>
                        </div>
                    </div>
                </MeltPortal>
            )}

            {result && (
                <div ref={resultRef} className="flex flex-col gap-4 py-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex items-center justify-between h-8">
                        <div className="flex items-center gap-3">
                            <Terminal size={20} className="text-melt-accent/40" />
                            <h2 className="text-[11px] font-black text-melt-text-label uppercase tracking-[0.2em]">Encoded Result</h2>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 group/copy px-0 py-1 transition-all duration-700 ease-in-out border-b border-transparent hover:border-melt-accent"
                        >
                            <span className="text-[9px] font-mono font-black text-melt-text-muted/60 group-hover/copy:text-melt-accent uppercase tracking-[0.2em] transition-colors">COPY EXPORT STRING</span>
                            <Copy size={11} className="text-melt-text-muted/40 group-hover/copy:text-melt-accent/60 transition-colors" />
                        </button>
                    </div>

                    <div className="relative group transition-all duration-700 ease-in-out border-b border-transparent hover:border-b-melt-accent/50 h-[300px]">
                        <textarea
                            readOnly
                            value={result}
                            spellCheck="false"
                            className="w-full h-full bg-transparent p-6 text-[10px] font-mono text-melt-text-body/50 outline-none resize-none leading-loose break-all custom-scrollbar transition-all duration-700 ease-in-out"
                        />
                    </div>
                </div>
            )}

            {toast && (
                <MeltPortal hostId="melt-portal-host">
                    <div className={cn("fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 shrink-0 z-[100] border border-melt-text-muted/10", toast.type === 'success' ? "bg-melt-accent text-melt-surface" : "bg-red-500/80 text-melt-text-heading")}>
                        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span className="text-[9px] font-black tracking-widest uppercase">{String(toast.message)}</span>
                    </div>
                </MeltPortal>
            )}
        </div>
    );
}
