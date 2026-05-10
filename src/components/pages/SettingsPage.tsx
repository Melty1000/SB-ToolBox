"use client";

import React, { useEffect, useState } from 'react';
import { Palette, Check, History, ChevronDown, RefreshCw, Download, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHANGELOG } from '@/lib/changelog';

export function SettingsPage() {
    const [config, setConfig] = useState(() => ({
        autoUpdate: true,
        autoDownload: false,
        theme: '' // Wait for useEffect to read actual DOM/stored state
    }));
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'downloading' | 'ready'>('idle');
    const [progress, setProgress] = useState(0);
    const [isElectron, setIsElectron] = useState(false);
    const [isPortable, setIsPortable] = useState(false);
    const [portableReadyPath, setPortableReadyPath] = useState('');

    useEffect(() => {
        (window as any).debugUpdateStatus = (status: 'idle' | 'available' | 'downloading' | 'ready') => {
            setUpdateStatus(status);
        };

        const loadSettings = async () => {
            if ((window as any).electron?.settings) {
                const settings = await (window as any).electron.settings.getAll();
                setConfig(settings);
                document.documentElement.setAttribute('data-theme', settings.theme);
                localStorage.setItem('melt-theme', settings.theme);
            } else {
                // Read the theme initialized by layout.tsx (or fallback if missing)
                const savedTheme = localStorage.getItem('melt-theme') || 'graphite-gold';
                setConfig(prev => ({ ...prev, theme: savedTheme }));
                document.documentElement.setAttribute('data-theme', savedTheme);
            }
            setIsElectron(!!(window as any).electron);
            if ((window as any).electron?.app) {
                const portable = await (window as any).electron.app.isPortable();
                setIsPortable(portable);
            }
        };
        loadSettings();

        if ((window as any).electron?.updater) {
            const cleanupAvailable = (window as any).electron.updater.on('update:available', () => setUpdateStatus('available'));
            const cleanupProgress = (window as any).electron.updater.on('update:download-progress', (p: number) => {
                setUpdateStatus('downloading');
                setProgress(p);
            });
            const cleanupReady = (window as any).electron.updater.on('update:ready', () => setUpdateStatus('ready'));
            const cleanupPortableReady = (window as any).electron.updater.on(
                'update:portable-ready',
                (filePath: string) => {
                    setPortableReadyPath(filePath);
                    setUpdateStatus('ready');
                }
            );

            return () => {
                cleanupAvailable();
                cleanupProgress();
                cleanupReady();
                cleanupPortableReady();
            };
        }
    }, []);

    const handleConfigChange = (key: string, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));

        if ((window as any).electron?.settings) {
            (window as any).electron.settings.set(key, value);
        }

        if (key === 'theme') {
            localStorage.setItem('melt-theme', value);
            document.documentElement.setAttribute('data-theme', value);
        }
    };

    return (
        <div className="flex flex-col gap-14 pb-20">

            {/* THEME SECTION */}
            <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-1 px-2">
                    <div className="flex items-center gap-3">
                        <Palette size={18} className="text-melt-accent" />
                        <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">THEME</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <ThemeCard
                        id="graphite-gold"
                        name="Graphite | Gold"
                        active={config.theme === 'graphite-gold'}
                        onClick={() => handleConfigChange('theme', 'graphite-gold')}
                        previewColors={['#0c0c0e', '#F2AF0D']}
                    />
                    <ThemeCard
                        id="graphite-cobalt"
                        name="Graphite | Cobalt"
                        active={config.theme === 'graphite-cobalt'}
                        onClick={() => handleConfigChange('theme', 'graphite-cobalt')}
                        previewColors={['#0c0c0e', '#1D4267']}
                    />
                    <ThemeCard
                        id="slate-gold"
                        name="Slate | Gold"
                        active={config.theme === 'slate-gold'}
                        onClick={() => handleConfigChange('theme', 'slate-gold')}
                        previewColors={['#0E1115', '#F2AF0D']}
                    />
                    <ThemeCard
                        id="slate-cobalt"
                        name="Slate | Cobalt"
                        active={config.theme === 'slate-cobalt'}
                        onClick={() => handleConfigChange('theme', 'slate-cobalt')}
                        previewColors={['#0E1115', '#1D4267']}
                    />
                </div>
            </div>

            {/* AUTO-UPDATE SECTION */}
            {isElectron && <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-1 px-2">
                    <div className="flex items-center gap-3">
                        <RefreshCw size={18} className="text-melt-accent" />
                        <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">AUTO-UPDATE</h2>
                    </div>
                    {isPortable && (
                        <span className="text-[8px] font-black text-melt-text-muted uppercase tracking-widest">
                            Portable // Downloads to Folder
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-4 px-2">
                    <div className="flex items-center justify-between p-6 border-l-2 border-melt-text-muted/10 bg-melt-surface/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-melt-text-heading uppercase tracking-widest">Automatic Checks</span>
                            <span className="text-[10px] font-mono text-melt-text-label opacity-60">
                                {isPortable
                                    ? 'CHECKS ON STARTUP — IF A NEW VERSION IS FOUND, IT DOWNLOADS TO YOUR DOWNLOADS FOLDER'
                                    : 'CHECK GITHUB FOR RELEASES ON STARTUP'}
                            </span>
                        </div>
                        <ToggleButton
                            active={config.autoUpdate}
                            onToggle={() => handleConfigChange('autoUpdate', !config.autoUpdate)}
                        />
                    </div>

                    {!isPortable && (
                        <div className="flex items-center justify-between p-6 border-l-2 border-melt-text-muted/10 bg-melt-surface/10">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-melt-text-heading uppercase tracking-widest">Background Download</span>
                                <span className="text-[10px] font-mono text-melt-text-label opacity-60">DOWNLOAD NEW VERSIONS AUTOMATICALLY</span>
                            </div>
                            <ToggleButton
                                active={config.autoDownload}
                                onToggle={() => handleConfigChange('autoDownload', !config.autoDownload)}
                            />
                        </div>
                    )}

                    {/* STATUS READOUT */}
                    <div className={cn(
                        "flex flex-col gap-4 pl-4 py-2 border-l mt-2",
                        updateStatus === 'idle' ? "border-melt-accent" : "border-red-500"
                    )}>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                    updateStatus === 'idle' ? "text-melt-accent" : "text-red-500"
                                )}>Update Status</span>
                                <span className="text-[10px] font-mono text-melt-text-label uppercase opacity-80">
                                    {updateStatus === 'idle' && 'CURRENTLY UP TO DATE'}
                                    {updateStatus === 'available' && 'UPDATE FOUND / PENDING'}
                                    {updateStatus === 'downloading' && `DOWNLOADING [ ${Math.round(progress)}% ]`}
                                    {updateStatus === 'ready' && (isPortable ? 'SAVED TO DOWNLOADS' : 'READY TO RESTART')}
                                </span>
                            </div>

                            {updateStatus === 'available' && (
                                <button
                                    onClick={() => (window as any).electron.updater.download()}
                                    className="flex items-center gap-2 bg-melt-accent text-melt-frame px-4 h-7 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    <Download size={12} />
                                    Download Now
                                </button>
                            )}

                            {updateStatus === 'ready' && !isPortable && (
                                <button
                                    onClick={() => (window as any).electron.updater.quitAndInstall()}
                                    className="flex items-center gap-2 bg-melt-accent text-melt-frame px-4 h-7 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    <RefreshCw size={12} className="animate-spin-slow" />
                                    Restart Now
                                </button>
                            )}
                            {updateStatus === 'ready' && isPortable && (
                                <button
                                    onClick={() => (window as any).electron.shell.showInFolder(portableReadyPath)}
                                    className="flex items-center gap-2 bg-melt-accent text-melt-frame px-4 h-7 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    <FolderOpen size={12} />
                                    Show in Explorer
                                </button>
                            )}
                        </div>

                        {updateStatus === 'downloading' && (
                            <div className="w-full h-1 bg-melt-accent rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-melt-accent transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>}

            {/* CHANGELOG SECTION */}
            <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-1 px-2">
                    <div className="flex items-center gap-3">
                        <History size={18} className="text-melt-accent" />
                        <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">CHANGELOG</h2>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    {CHANGELOG.map((entry, i) => (
                        <ChangelogItem
                            key={entry.version}
                            version={entry.version}
                            date={entry.date}
                            changes={entry.changes}
                            isLatest={i === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ToggleButton({ active, onToggle }: any) {
    return (
        <button
            onClick={onToggle}
            className={cn(
                "relative w-10 h-5 transition-colors duration-300 rounded-full",
                active ? "bg-melt-accent" : "bg-melt-text-muted/20"
            )}
        >
            <div className={cn(
                "absolute top-1 w-3 h-3 bg-melt-frame rounded-full transition-all duration-300",
                active ? "left-6" : "left-1"
            )} />
        </button>
    );
}

function ThemeCard({ name, description, active, onClick, previewColors }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-start px-6 py-3 rounded-none border-l-2 transition-colors duration-300 text-left",
                active
                    ? "border-melt-accent bg-transparent"
                    : "border-melt-text-muted/10 hover:border-melt-text-muted/20"
            )}
        >
            <div className="flex w-full justify-between items-start mb-4">
                <div className="flex gap-2">
                    {previewColors.map((c: string, i: number) => (
                        <div key={i} className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: c }} />
                    ))}
                </div>
                {active && <Check size={14} className="text-melt-accent animate-in zoom-in duration-300" strokeWidth={3} />}
            </div>

            <h4 className={cn(
                "text-xs font-black uppercase tracking-widest mb-2 transition-colors",
                active ? "text-melt-accent" : "text-melt-text-label group-hover:text-melt-text-heading"
            )}>{name}</h4>

        </button>
    );
}

function ChangelogItem({ version, date, changes, isLatest }: any) {
    const [isOpen, setIsOpen] = useState(!!isLatest);

    return (
        <div className={cn(
            "flex flex-col border-l-2 transition-all duration-300",
            isOpen ? "pb-6" : "pb-0",
            isLatest ? "border-melt-accent" : "border-melt-text-muted/10 opacity-60 hover:opacity-100"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-6 py-3 text-left group"
            >
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-xs font-black uppercase tracking-widest transition-colors",
                        isLatest ? "text-melt-accent" : "text-melt-text-label group-hover:text-melt-text-heading"
                    )}>{version}</span>
                    {isLatest && (
                        <span className="text-[9px] font-bold bg-melt-accent text-melt-surface px-2 py-0.5 rounded-full tracking-wider">
                            LATEST
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-melt-text-label group-hover:text-melt-text-muted transition-colors">{String(date)}</span>
                    <ChevronDown
                        size={14}
                        className={cn(
                            "text-melt-text-label transition-transform duration-300",
                            isOpen && "rotate-180 text-melt-accent"
                        )}
                    />
                </div>
            </button>

            {isOpen && (
                <ul className="flex flex-col gap-2 px-6 animate-in slide-in-from-top-1 fade-in duration-200">
                    {changes.map((change: string, i: number) => (
                        <li key={i} className="text-[11px] text-melt-text-body font-medium flex items-start gap-2">
                            <span className="text-melt-accent mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                            <span className="leading-relaxed opacity-80">{change}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
