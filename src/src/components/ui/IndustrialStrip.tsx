"use client";

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { ChevronDown, Code2, AlertCircle, Zap } from 'lucide-react';

interface IndustrialStripProps {
    label: string;
    icon?: any;
    rightElement?: React.ReactNode;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    statusColor?: string; // Tailwind text color class
    isExpanded?: boolean; // Controlled state
    onExpandChange?: (expanded: boolean) => void; // State handler
    labelClassName?: string;
    disableAutoscroll?: boolean;
}

/**
 * Internal helper to handle lazy-mounting of editor content.
 * Ensures the editor only mounts when it's first needed.
 */
const StripContentMounting = ({ isExpanded, children }: { isExpanded: boolean, children: React.ReactNode }) => {
    const hasExpanded = useRef(false);
    if (isExpanded) hasExpanded.current = true;

    // Only render children if we are expanded OR have been expanded in the past
    if (!hasExpanded.current && !isExpanded) return null;
    return <>{children}</>;
};

export const IndustrialStrip = ({
    label,
    icon: Icon = Code2,
    rightElement,
    children,
    defaultExpanded = false,
    statusColor = 'text-melt-text-label',
    isExpanded: controlledExpanded,
    onExpandChange,
    labelClassName,
    disableAutoscroll = false
}: IndustrialStripProps) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isExpanded) {
            gsap.to(contentRef.current, {
                height: 'auto',
                opacity: 1,
                duration: 0.35, // Slightly faster for industrial feel
                ease: 'power2.out',
                overwrite: 'auto'
            });
        } else {
            gsap.to(contentRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                overwrite: 'auto'
            });
        }
    }, { dependencies: [isExpanded], scope: containerRef });

    return (
        <div ref={containerRef} className={cn(
            "group relative border-y transition-all duration-500 border-transparent scroll-mt-0"
        )}>
            <div
                className={cn(
                    "flex items-center justify-between p-4 gap-5 cursor-pointer select-none"
                )}
                onClick={() => {
                    if (children) {
                        const next = !isExpanded;
                        if (onExpandChange) {
                            onExpandChange(next);
                        } else {
                            setInternalExpanded(next);
                        }

                        // Surgical Autoscroll to top of container when opening
                        if (next && !disableAutoscroll) {
                            setTimeout(() => {
                                const viewport = document.getElementById('content-viewport');
                                const target = containerRef.current;
                                if (viewport && target) {
                                    const vRect = viewport.getBoundingClientRect();
                                    const tRect = target.getBoundingClientRect();

                                    // Calculate EXACT absolute position within the scrollable content
                                    const scrollDistance = tRect.top - vRect.top;
                                    const absoluteTarget = viewport.scrollTop + scrollDistance;

                                    // Surgical Snap to Top (Zero Margin)
                                    viewport.scrollTo({
                                        top: Math.max(0, absoluteTarget),
                                        behavior: 'smooth'
                                    });
                                }
                            }, 60);
                        }
                    }
                }}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Icon size={20} className="text-melt-accent shrink-0" />
                    <span className={cn(
                        "text-sm font-bold truncate transition-colors",
                        statusColor,
                        labelClassName
                    )}>
                        {String(label)}
                    </span>

                    {/* Expand Indicator (Only if children exist) */}
                    {children && (
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                            isExpanded ? "bg-melt-accent text-melt-surface" : "bg-melt-text-muted/10 text-melt-text-muted group-hover:bg-melt-text-muted/20"
                        )}>
                            <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                        </div>
                    )}
                </div>

                {/* Right Actions / Metadata */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {rightElement}
                </div>
            </div>

            {/* Expandable Content */}
            <div ref={contentRef} className="overflow-hidden h-0 opacity-0 bg-transparent">
                <div className="p-0">
                    {/* Lazy-mount children: only mount when we first expand, and stay mounted */}
                    <StripContentMounting isExpanded={isExpanded}>
                        {children}
                    </StripContentMounting>
                </div>
            </div>
        </div>
    );
};
