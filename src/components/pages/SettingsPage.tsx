"use client";

import React, { useEffect, useState } from 'react';
import { Palette, Check, History, ChevronDown, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    applyTheme,
    bootstrapThemeSelection,
    DEFAULT_THEME,
    type ThemeVariant,
    type ThemeSelection,
    writeLocalThemeSelection
} from '@/lib/theme-preferences';
import {
    getElectronApi,
    isElectronRuntime,
    type AppSettings
} from '@/lib/electron-api';

interface SettingsConfig extends Omit<AppSettings, 'theme'> {
    theme: ThemeVariant;
}

type UpdateStatus = 'idle' | 'available' | 'downloading' | 'ready';

interface ToggleButtonProps {
    active: boolean;
    onToggle: () => void;
}

interface ThemeCardProps {
    id: ThemeVariant;
    name: string;
    active: boolean;
    onClick: () => void;
    previewColors: string[];
}

interface ChangelogItemProps {
    version: string;
    date: string;
    changes: string[];
    isLatest?: boolean;
}

const setThemeExplicitSelection = (selection: ThemeSelection) => {
    applyTheme(selection.theme);
    writeLocalThemeSelection(selection);
    const electron = getElectronApi();
    if (electron?.settings) {
        void electron.settings.set('theme', selection.theme);
        void electron.settings.set('themeUserSelected', selection.userSelected);
    }
};

export function SettingsPage() {
    const [isDesktop] = useState(() => isElectronRuntime());
    const [config, setConfig] = useState<SettingsConfig>({
        autoUpdate: true,
        autoDownload: false,
        theme: DEFAULT_THEME,
        themeUserSelected: false
    });
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let disposed = false;

        const loadSettings = async () => {
            const electron = getElectronApi();
            const { settings, selection } = await bootstrapThemeSelection(electron);
            if (disposed) return;

            setConfig(prev => ({
                ...prev,
                ...(settings || {}),
                theme: selection.theme,
                themeUserSelected: selection.userSelected
            }));
        };

        void loadSettings();

        const electron = getElectronApi();
        if (isDesktop && electron?.updater) {
            const cleanupAvailable = electron.updater.on('update:available', () => setUpdateStatus('available'));
            const cleanupProgress = electron.updater.on('update:download-progress', (p) => {
                setUpdateStatus('downloading');
                setProgress(p);
            });
            const cleanupReady = electron.updater.on('update:ready', () => setUpdateStatus('ready'));

            return () => {
                disposed = true;
                cleanupAvailable();
                cleanupProgress();
                cleanupReady();
            };
        }

        return () => {
            disposed = true;
        };
    }, [isDesktop]);

    const handleConfigChange = <K extends keyof SettingsConfig>(key: K, value: SettingsConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));

        const electron = getElectronApi();
        if (electron?.settings) {
            void electron.settings.set(key, value);
        }

        if (key === 'theme') {
            setConfig(prev => ({ ...prev, themeUserSelected: true }));
            setThemeExplicitSelection({ theme: value as ThemeVariant, userSelected: true });
        }
    };

    return (
        <div className="flex flex-col gap-14 animate-in fade-in duration-500 pb-20">

            {/* THEME SECTION */}
            <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-1 px-2">
                    <div className="flex items-center gap-3">
                        <Palette size={16} className="text-melt-accent" />
                        <h3 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">THEME</h3>
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

            {isDesktop && (
                <>
                    {/* AUTO-UPDATE SECTION */}
                    <div className="flex flex-col gap-8 w-full">
                        <div className="flex flex-col gap-1 px-2">
                            <div className="flex items-center gap-3">
                                <RefreshCw size={16} className="text-melt-accent" />
                                <h3 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">AUTO-UPDATE</h3>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 px-2">
                            <div className="flex items-center justify-between p-6 border-l-2 border-melt-text-muted/10 bg-melt-surface/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-melt-text-heading uppercase tracking-widest">Automatic Checks</span>
                                    <span className="text-[10px] font-mono text-melt-text-label opacity-60">CHECK GITHUB FOR RELEASES ON STARTUP</span>
                                </div>
                                <ToggleButton
                                    active={config.autoUpdate}
                                    onToggle={() => handleConfigChange('autoUpdate', !config.autoUpdate)}
                                />
                            </div>

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

                            {/* STATUS READOUT */}
                            <div className="flex flex-col gap-4 p-6 border-l-2 border-melt-accent/20 bg-melt-accent/5 mt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-melt-accent uppercase tracking-widest">Update Status</span>
                                        <span className="text-[11px] font-mono text-melt-text-body uppercase">
                                            {updateStatus === 'idle' && 'Checked // Up to Date'}
                                            {updateStatus === 'available' && 'Update Found // Pending Download'}
                                            {updateStatus === 'downloading' && `Downloading // ${Math.round(progress)}%`}
                                            {updateStatus === 'ready' && 'Ready // Restart to Apply'}
                                        </span>
                                    </div>

                                    {updateStatus === 'available' && (
                                        <button
                                            onClick={() => getElectronApi()?.updater.download()}
                                            className="flex items-center gap-2 bg-melt-accent text-melt-frame px-4 h-7 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        >
                                            <Download size={12} />
                                            Download Now
                                        </button>
                                    )}

                                    {updateStatus === 'ready' && (
                                        <button
                                            onClick={() => getElectronApi()?.updater.quitAndInstall()}
                                            className="flex items-center gap-2 bg-melt-accent text-melt-frame px-4 h-7 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        >
                                            <RefreshCw size={12} className="animate-spin-slow" />
                                            Restart Now
                                        </button>
                                    )}
                                </div>

                                {updateStatus === 'downloading' && (
                                    <div className="w-full h-1 bg-melt-accent/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-melt-accent transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CHANGELOG SECTION */}
            <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-1 px-2">
                    <div className="flex items-center gap-3">
                        <History size={16} className="text-melt-accent" />
                        <h3 className="text-xs font-black text-melt-text-label uppercase tracking-[0.2em]">CHANGELOG</h3>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    <ChangelogItem
                        version="V0.1.1 PATCH"
                        date="2026-02-16"
                        changes={[
                            "Fixed GitHub Pages hydration issue that blocked sidebar interactions in web mode",
                            "Hidden desktop auto-update/background-download controls in web app settings",
                            "Delayed sidebar label reveal to avoid icon/text overlap during expand",
                            "Stabilized first sidebar hover after refresh so icon positions stay aligned",
                            "Fixed theme switching so selected themes apply immediately in web mode",
                            "Pinned desktop window controls so sidebar hover animation no longer shifts them",
                            "Fixed selected-tab accent indicator sticking during rapid hover/click interactions"
                        ]}
                        isLatest
                    />
                    <ChangelogItem
                        version="V0.1 ALPHA"
                        date="2026-02-10"
                        changes={[
                            "Renamed application to 'SB Toolbox'",
                            "Fixed window layout regression (Logo/Title sync)",
                            "Added 'Zombie Process' prevention (Hard exit)",
                            "Added 100ms Sidebar hover delay",
                            "Refined Theme Selection UI",
                            "Fixed tab animation clip bug"
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

function ToggleButton({ active, onToggle }: ToggleButtonProps) {
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

function ThemeCard({ id, name, active, onClick, previewColors }: ThemeCardProps) {
    return (
        <button
            data-theme-id={id}
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-start p-6 rounded-none border-l-2 transition-colors duration-300 text-left h-full",
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
                "text-xs font-black uppercase tracking-widest transition-colors",
                active ? "text-melt-accent" : "text-melt-text-label group-hover:text-melt-text-heading"
            )}>{name}</h4>
        </button>
    );
}

function ChangelogItem({ version, date, changes, isLatest = false }: ChangelogItemProps) {
    const [isOpen, setIsOpen] = useState(!!isLatest);

    return (
        <div className={cn(
            "flex flex-col border-l-2 transition-all duration-300",
            isOpen ? "pb-6" : "pb-0",
            isLatest ? "border-melt-accent" : "border-melt-text-muted/10 opacity-60 hover:opacity-100"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-6 text-left group"
            >
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-xs font-black uppercase tracking-widest transition-colors",
                        isLatest ? "text-melt-accent" : "text-melt-text-label group-hover:text-melt-text-heading"
                    )}>{version}</span>
                    {isLatest && (
                        <span className="text-[9px] font-bold bg-melt-accent/10 text-melt-accent px-2 py-0.5 rounded-full tracking-wider">
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
                            <span className="text-melt-accent/50 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                            <span className="leading-relaxed opacity-80">{change}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
