"use client";

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export const ActionBtn = ({ label, icon: Icon, onClick, disabled, maxWidth = 288 }: { label: string, icon: any, onClick: () => void | Promise<void>, disabled?: boolean, maxWidth?: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [stableCenter, setStableCenter] = useState<number | null>(null);

    useGSAP(() => {
        if (isHovered) {
            gsap.to(textRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
            gsap.to(iconRef.current, {
                y: 0,
                scale: 1.6,
                rotate: -10,
                duration: 0.4,
                ease: "back.out(1.7)",
                overwrite: "auto",
                force3D: false
            });
            gsap.to(bgRef.current, {
                opacity: 1,
                duration: 0.3,
                overwrite: "auto"
            });
            gsap.to(btnRef.current, {
                color: "var(--melt-surface)",
                duration: 0.3,
                overwrite: "auto"
            });
        } else {
            gsap.to(textRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
            gsap.to(iconRef.current, {
                y: 35,
                scale: 2.5,
                rotate: 0,
                duration: 0.5,
                ease: "power2.inOut",
                overwrite: "auto"
            });
            gsap.to(bgRef.current, {
                opacity: 0,
                duration: 0.3,
                overwrite: "auto"
            });
            gsap.to(btnRef.current, {
                color: "var(--melt-accent)",
                duration: 0.3,
                overwrite: "auto"
            });
            gsap.to(containerRef.current, { width: maxWidth, duration: 0.6, ease: "elastic.out(1, 0.8)", overwrite: "auto" });
        }
    }, { dependencies: [isHovered, maxWidth], scope: containerRef });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isHovered || stableCenter === null || !containerRef.current) return;
        const dx = Math.abs(e.clientX - stableCenter);
        const targetWidth = Math.max(52, (dx + 20) * 2);
        const clampedWidth = Math.min(maxWidth, targetWidth);
        gsap.to(containerRef.current, {
            width: clampedWidth,
            duration: 0.1,
            ease: "none",
            overwrite: true,
            roundProps: "width"
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setStableCenter(rect.left + rect.width / 2);
        }
    };

    return (
        <div
            ref={containerRef}
            style={{ width: maxWidth }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => { setIsHovered(false); setStableCenter(null); }}
            onMouseMove={handleMouseMove}
            className="h-[52px] relative flex items-center justify-center shrink-0 will-change-[width]"
        >
            <button
                ref={btnRef}
                onClick={async () => {
                    if (disabled) return;
                    try {
                        const result = onClick();
                        if (result instanceof Promise) {
                            await result;
                        }
                    } catch (err: any) {
                        const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
                        console.log('%c[ACTION_BTN_REJECTION]', 'color: #f66; font-weight: bold', {
                            label,
                            error: err,
                            message,
                            stack: err?.stack || new Error().stack
                        });
                    }
                }}
                className={cn(
                    "relative w-full h-full rounded-2xl border-none outline-none shadow-none active:scale-95 overflow-hidden whitespace-nowrap bg-clip-padding px-8",
                    disabled ? "cursor-default" : "cursor-pointer"
                )}
                style={{
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--melt-accent)'
                }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 bg-melt-accent opacity-0 pointer-events-none"
                />
                <div
                    className="absolute left-1/2 top-0 h-full -translate-x-1/2 pointer-events-none"
                    style={{ width: maxWidth }}
                >
                    <div
                        ref={textRef}
                        className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        {label}
                    </div>
                </div>

                <div
                    ref={iconRef}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center"
                >
                    <Icon size={16} />
                </div>
            </button>
        </div>
    );
}
