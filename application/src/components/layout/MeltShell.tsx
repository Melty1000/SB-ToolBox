"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/all';
import {
    FolderOpen,
    Archive,
    Heart,
    CircleHelp,
    History,
    Settings,
    Minus,
    Square,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeltSidebar } from '@/hooks/useMeltSidebar';
import { MELT_CONSTANTS } from '@/lib/melt-motion';

interface MeltShellProps {
    children: React.ReactNode;
    activePage: string;
    setActivePage: (page: string) => void;
}

export const MeltShell: React.FC<MeltShellProps> = ({ children, activePage = 'decoder', setActivePage }) => {
    const { isExpanded, setIsExpanded, shellRef } = useMeltSidebar(activePage);
    const [hasUpdate, setHasUpdate] = useState(false);
    const [updateReady, setUpdateReady] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Title Logic
    useEffect(() => {
        document.title = `SB ToolBox // ${activePage.toUpperCase()}`;
    }, [activePage]);

    const [config, setConfig] = useState<any>({ autoDownload: false });
    useEffect(() => {
        const loadSettings = async () => {
            if ((window as any).electron?.settings) {
                const settings = await (window as any).electron.settings.getAll();
                setConfig(settings);
            }
        };
        loadSettings();
    }, []);

    // Electron window handlers
    const handleMin = () => (window as any).electron?.minimize();
    const handleMax = () => (window as any).electron?.maximize();
    const handleClose = () => (window as any).electron?.close();

    const navConfig = [
        { id: 'decoder', icon: FolderOpen, label: "Decoder" },
        { id: 'encoder', icon: Archive, label: "Encoder" },
        { id: 'history', icon: History, label: "History" },
        { id: 'help', icon: CircleHelp, label: "Help Guide" },
        { id: 'support', icon: Heart, label: "Support" },
        { id: 'settings', icon: Settings, label: "Settings" },
    ];

    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        setIsDesktop(typeof window !== 'undefined' && !!(window as any).electron);

        if ((window as any).electron?.updater) {
            const cleanupAvailable = (window as any).electron.updater.on('update:available', () => {
                setHasUpdate(true);
            });
            const cleanupProgress = (window as any).electron.updater.on('update:download-progress', (progress: number) => {
                setDownloadProgress(progress);
            });
            const cleanupReady = (window as any).electron.updater.on('update:ready', () => {
                setUpdateReady(true);
                setHasUpdate(true);
            });

            return () => {
                cleanupAvailable();
                cleanupProgress();
                cleanupReady();
            };
        }
    }, []);

    return (
        <div
            ref={shellRef}
            className="grid h-screen w-screen bg-melt-frame overflow-hidden select-none relative"
            style={{
                gridTemplateColumns: '64px 1fr',
                gridTemplateRows: '40px 1fr',
            } as any}
        >
            {/* 0. BRANDING AREA - Simplified interaction for reliability */}
            <div
                className="col-start-1 row-start-1 row-span-2 h-[72px] drag-region z-[60] branding-overlay flex items-center justify-center cursor-pointer pointer-events-auto no-drag"
                style={{ width: 'var(--sidebar-width, 64px)' }}
                onClick={() => setActivePage('decoder')}
            >
                <div className="logo-container h-12 w-full relative grid place-items-center overflow-visible">
                    <img
                        src="/assets/logo-collapsed.svg"
                        alt="Mascot"
                        className="w-12 h-12 logo-main object-contain z-20 opacity-100"
                        style={{ gridArea: '1/1', transform: 'rotate(0deg)' }}
                        loading="eager"
                        decoding="sync"
                        {...({ fetchPriority: "high" } as any)}
                    />
                    <img
                        src="/assets/streamerbot-logo.svg"
                        alt="Links"
                        className="h-11 w-auto logo-reveal object-contain z-10 opacity-0"
                        style={{ gridArea: '1/1', transform: 'rotate(0deg)', opacity: 0 }}
                        loading="eager"
                        decoding="sync"
                    />
                </div>
            </div>

            {/* 1. SIDEBAR AREA */}
            <aside
                className="col-start-1 row-start-1 row-span-2 flex flex-col bg-melt-frame z-[55] transition-colors duration-300"
                style={{ width: 'var(--sidebar-width, 64px)' }}
                onMouseEnter={() => {
                    (window as any).sidebarHoverTimeout = setTimeout(() => setIsExpanded(true), 100);
                }}
                onMouseLeave={() => {
                    clearTimeout((window as any).sidebarHoverTimeout);
                    setIsExpanded(false);
                }}
            >
                <div className="h-[72px] w-full mb-0" />
                <nav className="flex-1 w-full px-3 space-y-1 flex flex-col relative">
                    {/* Synchronized React-Level Hydration for Zero-Fade Refresh */}
                    {(() => {
                        const navIds = ['decoder', 'encoder', 'history', 'help', 'support', 'settings'];
                        const activeIndex = navIds.indexOf(activePage);
                        return (
                            <div
                                className="absolute inset-x-3 h-10 bg-melt-accent rounded-md selection-drip z-0 pointer-events-none"
                                style={{
                                    transform: activeIndex !== -1 ? `translateY(${activeIndex * 44}px)` : 'none',
                                    opacity: activeIndex !== -1 ? 1 : 0,
                                    visibility: activeIndex !== -1 ? 'visible' : 'hidden'
                                } as any}
                            />
                        );
                    })()}
                    {navConfig.map((item) => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activePage === item.id}
                            onClick={() => setActivePage(item.id)}
                            isExpanded={isExpanded}
                            hasBadge={item.id === 'settings' && hasUpdate}
                        />
                    ))}
                </nav>
                <div className="w-full px-3 pb-4 space-y-1 flex flex-col items-center">
                    <div className="h-px w-full bg-melt-text-muted/10 mb-2 opacity-30" />
                    <div className="h-3 w-full relative version-container overflow-visible">
                        <div className="absolute inset-x-0 top-0 text-label-2xs text-melt-text-muted tracking-widest text-center whitespace-nowrap version-compact">
                            V0.1
                        </div>
                        <div className="absolute inset-x-0 top-0 text-label-2xs text-melt-text-muted tracking-widest text-center whitespace-nowrap version-expanded opacity-0">
                            V0.1 ALPHA
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. TITLE BAR AREA */}
            <header className="col-start-2 row-start-1 flex items-center justify-between pr-2 drag-region bg-melt-frame z-50">
                <div
                    className="flex items-center"
                    style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}
                >
                    <span className="text-label-xs text-melt-text-muted tracking-[0.3em] ml-6">
                        SB ToolBox // {String(activePage?.toUpperCase() || 'DECODER')}
                    </span>
                </div>
                {isDesktop && (
                    <div className="flex items-center no-drag">
                        <ControlBtn icon={Minus} onClick={handleMin} />
                        <ControlBtn icon={Square} onClick={handleMax} />
                        <ControlBtn icon={X} onClick={handleClose} isClose />
                    </div>
                )}
            </header>

            {/* 3. CONTENT AREA */}
            <main
                className="col-start-2 row-start-2 relative bg-melt-surface rounded-tl-[32px] overflow-hidden shadow-[inset_-2px_-2px_30px,0,0,var(--melt-shadow-opacity))] z-0 flex flex-col min-w-[calc(100vw-64px)]"
                style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}
            >
                <PageHeader activePage={activePage} />
                <div
                    id="content-viewport"
                    className="flex-1 w-full overflow-y-auto overflow-x-hidden p-10 pt-4 custom-scrollbar relative scrollbar-gutter-stable"
                    style={{ '--footer-height': '100px' } as React.CSSProperties}
                >
                    <div id="page-transition-wrapper" className="w-full min-h-full pb-12">
                        {children}
                    </div>
                </div>

                {/* Footer Portal Host: Inside content grid flow, but outside scrolling viewport */}
                <div id="melt-footer-host" className="w-full h-0 relative z-[100]" />
            </main>
            {/* Global Portal Host: Bypasses Page-Level Transforms */}
            <div id="melt-portal-host" className="contents" />

            {/* UPDATE TOASTS */}
            {hasUpdate && !updateReady && !config.autoDownload && activePage !== 'settings' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-6 bg-melt-surface border-l-4 border-melt-accent px-8 py-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-melt-accent uppercase tracking-widest leading-none">UPDATE AVAILABLE</span>
                        <span className="text-[10px] font-mono text-melt-text-label uppercase opacity-60">A NEW VERSION IS READY TO DOWNLOAD</span>
                    </div>
                    <button
                        onClick={() => setActivePage('settings')}
                        className="bg-melt-accent text-melt-frame px-5 h-8 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        VIEW IN SETTINGS
                    </button>
                    <button
                        onClick={() => setHasUpdate(false)}
                        className="text-melt-text-label hover:text-melt-text-heading"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {updateReady && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-6 bg-melt-surface border-l-4 border-melt-accent px-8 py-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-melt-accent uppercase tracking-widest leading-none">UPDATE READY</span>
                        <span className="text-[10px] font-mono text-melt-text-label uppercase opacity-60">RESTART TO APPLY CHANGES</span>
                    </div>
                    <button
                        onClick={() => (window as any).electron.updater.quitAndInstall()}
                        className="bg-melt-accent text-melt-frame px-5 h-8 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        RESTART NOW
                    </button>
                    <button
                        onClick={() => setUpdateReady(false)}
                        className="text-melt-text-label hover:text-melt-text-heading"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active, isExpanded, onClick, id, hasBadge }: any) => (
    <button
        onClick={onClick}
        id={`nav-item-${id}`}
        className={cn(
            "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-hidden",
            active ? "text-melt-frame" : "text-melt-text-label group-hover:text-melt-text-heading"
        )}
    >
        {/* Absolute Pivot for GSAP Morphing */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
                className="flex items-center justify-center min-w-[20px] h-full nav-icon-wrapper"
                style={{
                    transform: active ? 'rotate(-10deg) scale(1.25)' : 'rotate(0deg) scale(1)',
                    opacity: 1
                } as any}
            >
                <Icon
                    size={20}
                    strokeWidth={2.5}
                    className="nav-icon"
                />
                {hasBadge && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-melt-accent rounded-full border-2 border-melt-frame" />
                )}
            </span>
            <span
                className="absolute inset-0 text-label-xs whitespace-nowrap nav-text flex items-center justify-center h-full px-4 text-center pointer-events-none tracking-[0.4em]"
                style={{
                    opacity: isExpanded ? 1 : 0,
                    visibility: isExpanded ? 'visible' : 'hidden',
                    transform: 'translateY(-30px)'
                } as any}
            >
                {String(label).toUpperCase()}
            </span>
        </div>
    </button>
);

const PageHeader = ({ activePage }: { activePage: string }) => {
    const headerRef = useRef<HTMLDivElement>(null);

    const pageData: any = {
        decoder: {
            title: "STREAMER.BOT EXPORT STRINGS & FILES",
            subtitle: ["DECODE", "INSPECT", "REFINE", "RE-ENCODE"]
        },
        encoder: {
            title: "STREAMER.BOT EXPORT TEMPLATES & SCRIPTS",
            subtitle: ["ASSEMBLE", "ENCODE", "BUNDLE"]
        },
        history: {
            title: "USER HISTORY & EXPORT CACHE",
            subtitle: ["LOGS", "BACKUPS", "RECOVERY"]
        },
        help: {
            title: "DOCUMENTATION & COMMAND GUIDE",
            subtitle: ["KNOWLEDGE", "REFERENCE", "SYNTAX"]
        },
        support: {
            title: "SUPPORT ME",
            subtitle: ["SOCIALS", "CONTACT", "ABOUT ME"]
        },
        settings: {
            title: "APPLICATION PREFERENCES",
            subtitle: ["THEME", "LOCAL", "UPDATES"]
        }
    };

    const current = pageData[activePage] || pageData.decoder;

    useGSAP(() => {
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1, overwrite: "auto" }
        );
    }, { dependencies: [activePage] });

    return (
        <header
            ref={headerRef}
            className="flex items-center gap-4 w-full px-10 pt-8 pb-4 shrink-0"
        >
            <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-melt-text-body text-xs font-bold tracking-[0.2em] uppercase opacity-80 mr-[-0.2em]">
                    {String(current.title)}
                </div>
                <div className="flex items-center gap-3 text-melt-text-label text-[11px] font-bold tracking-[0.3em] uppercase mr-[-0.3em]">
                    {current.subtitle.map((item: string, i: number) => (
                        <React.Fragment key={i}>
                            <span>{String(item)}</span>
                            {i < current.subtitle.length - 1 && (
                                <span className="text-melt-text-muted px-2 opacity-50">•</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="h-[1px] flex-1 bg-melt-text-muted/10" />
        </header>
    );
};

const ControlBtn = ({ icon: Icon, onClick, isClose }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-10 h-7 flex items-center justify-center transition-all duration-200 rounded-md mx-0.5",
            isClose ? "hover:bg-red-500/80 hover:text-melt-text-heading text-melt-text-label" : "hover:bg-melt-accent/10 text-melt-text-muted hover:text-melt-text-label"
        )}
    >
        <Icon size={14} />
    </button>
);
