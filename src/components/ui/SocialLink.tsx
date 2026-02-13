"use client";

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface SocialLinkProps {
    label: string;
    icon: any;
    href: string;
    color?: string;
    maxWidth?: number;
}

export const SocialLink = ({
    label,
    icon: Icon,
    href,
    color = "var(--melt-accent)",
    maxWidth = 400
}: SocialLinkProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useGSAP(() => {
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
            gsap.to(textRef.current, { x: 0, opacity: 1, duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
            gsap.to(iconRef.current, {
                top: "50%",
                yPercent: -50,
                left: "16px",
                xPercent: 0,
                scale: 1.55,
                rotate: 0,
                duration: 0.5,
                ease: "power2.inOut",
                color: color,
                delay: 0.1, // Slight delay on color restoration for smoother feel
                overwrite: "auto"
            });
            gsap.to(bgRef.current, {
                opacity: 0,
                duration: 0.3,
                overwrite: "auto"
            });
            gsap.to(linkRef.current, {
                color: "var(--melt-text-label)",
                duration: 0.3,
                overwrite: "auto"
            });
        }
    }, { dependencies: [isHovered, maxWidth, color], scope: containerRef });

    return (
        <div
            ref={containerRef}
            style={{ width: maxWidth }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-[52px] relative flex items-center justify-center shrink-0 will-change-[width]"
        >
            <a
                ref={linkRef}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full h-full rounded-2xl outline-none flex items-center p-0 cursor-pointer overflow-hidden group/link transition-colors"
                style={{
                    backgroundColor: 'transparent'
                }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    style={{ backgroundColor: color }}
                />
                {/* Text Label - Right Justified */}
                <div className="absolute right-6 inset-y-0 flex items-center justify-end pointer-events-none">
                    <div
                        ref={textRef}
                        className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80"
                    >
                        {label}
                    </div>
                </div>

                {/* Animated Icon - Left Justified by Default */}
                <div
                    ref={iconRef}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none origin-center"
                    style={{ color }}
                >
                    <Icon size={18} />
                </div>
            </a>
        </div>
    );
}
