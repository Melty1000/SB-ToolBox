"use client";

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export const ActionBtn = ({
    label,
    desc,
    icon: Icon,
    onClick,
    disabled,
    maxWidth = 300
}: {
    label: string,
    desc?: string,
    icon: any,
    onClick: () => void | Promise<void>,
    disabled?: boolean,
    maxWidth?: number
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const isFirstRender = useRef(true);

    const color = "var(--melt-accent)";

    useGSAP(() => {
        if (disabled) {
            // Force default state if disabled, ignore hover
            gsap.set([textRef.current, iconRef.current, bgRef.current, linkRef.current], { clearProps: "all" });
            gsap.set(iconRef.current, { top: "50%", yPercent: -50, left: "16px", xPercent: 0, scale: 1.55, rotate: 0, color: color });
            return;
        }

        if (isHovered) {
            // Hover: Slide text out right, move icon to center
            gsap.to(textRef.current, { x: 40, opacity: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
            gsap.to(iconRef.current, {
                top: "50%",
                yPercent: -50,
                left: "50%",
                xPercent: -50,
                scale: 1.55,
                rotate: -8,
                duration: 0.5,
                ease: "back.out(1.7)",
                color: "var(--melt-surface)",
                overwrite: "auto"
            });
            gsap.to(bgRef.current, {
                opacity: 1,
                duration: 0.3,
                overwrite: "auto"
            });
            gsap.to(linkRef.current, {
                color: "var(--melt-surface)",
                duration: 0.3,
                overwrite: "auto"
            });
        } else {
            // Default: Icon Left, Text Right
            const method = isFirstRender.current ? gsap.set : gsap.to;
            const dur = isFirstRender.current ? {} : { duration: 0.5, ease: "power2.inOut" };
            const durShort = isFirstRender.current ? {} : { duration: 0.3 };
            isFirstRender.current = false;

            method(textRef.current, { x: 0, opacity: 1, overwrite: "auto", ...dur });
            method(iconRef.current, {
                top: "50%",
                yPercent: -50,
                left: "16px",
                xPercent: 0,
                scale: 1.55,
                rotate: 0,
                color: color,
                overwrite: "auto",
                ...dur
            });
            method(bgRef.current, {
                opacity: 0,
                overwrite: "auto",
                ...durShort
            });
            method(linkRef.current, {
                color: "var(--melt-text-label)",
                overwrite: "auto",
                ...durShort
            });
        }
    }, { dependencies: [isHovered, disabled, color], scope: containerRef });

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-[52px] w-fit relative flex items-center justify-center shrink-0 group/link"
        >
            <button
                ref={linkRef}
                onClick={async () => {
                    if (disabled) return;
                    try {
                        const result = onClick();
                        if (result instanceof Promise) {
                            await result;
                        }
                    } catch (err: any) {
                        console.error("ActionBtn error:", err);
                    }
                }}
                disabled={disabled}
                className={cn(
                    "relative w-full h-full rounded-2xl outline-none flex items-center p-0 overflow-hidden transition-colors group/link",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
                style={{
                    backgroundColor: 'transparent',
                    color: "var(--melt-text-label)"
                }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    style={{ backgroundColor: color }}
                />

                {/* Animated Icon - Left Justified by Default (Absolute) */}
                <div
                    ref={iconRef}
                    className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none origin-center"
                    style={{ color }}
                >
                    <Icon size={18} />
                </div>

                {/* Text Label - Normal layout width, pads left for the icon */}
                <div className="flex flex-col justify-center items-end pointer-events-none pl-14 pr-6 py-4">
                    <div
                        ref={textRef}
                        className="flex flex-col items-end text-right"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 leading-tight whitespace-nowrap">
                            {label}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
};
