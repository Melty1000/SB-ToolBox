import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MELT_CONSTANTS } from '../lib/melt-motion';

const NAV_IDS: readonly string[] = ['decoder', 'encoder', 'history', 'help', 'support', 'settings'];

/**
 * useMeltSidebar: The "Infinite Curve" Restoration
 * High-poly 12-point rounding + 1.25x persistent icon scale.
 */
export const useMeltSidebar = (activePage?: string) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shellRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
    const isFirstMount = useRef(true);
    const isExpandedRef = useRef(false);
    const activeIndexRef = useRef(0);
    const visitedPagesRef = useRef<Set<string>>(new Set());

    const navNodesRef = useRef<{
        icons: HTMLElement[];
        items: HTMLElement[];
        texts: Array<HTMLElement | null>;
        selectionDrip: HTMLElement | null;
    }>({
        icons: [],
        items: [],
        texts: [],
        selectionDrip: null
    });

    const killNavTweens = useCallback(() => {
        const { icons, texts, selectionDrip } = navNodesRef.current;
        const targets: gsap.TweenTarget[] = [
            ...icons,
            ...texts.filter((text): text is HTMLElement => !!text),
            ...(selectionDrip ? [selectionDrip] : [])
        ];

        if (targets.length > 0) {
            gsap.killTweensOf(targets);
        }
    }, []);

    const ensureNavNodes = useCallback(() => {
        if (!shellRef.current) return;
        if (navNodesRef.current.items.length > 0) return;

        const items = Array.from(shellRef.current.querySelectorAll('.nav-item')) as HTMLElement[];
        const icons = Array.from(shellRef.current.querySelectorAll('.nav-icon-wrapper')) as HTMLElement[];
        const texts = items.map((item) => item.querySelector('.nav-text') as HTMLElement | null);
        const selectionDrip = shellRef.current.querySelector('.selection-drip') as HTMLElement | null;

        navNodesRef.current = {
            icons,
            items,
            texts,
            selectionDrip
        };
    }, []);

    const syncSelectionDrip = useCallback((immediate = false) => {
        const { selectionDrip } = navNodesRef.current;
        if (!selectionDrip) return;
        gsap.killTweensOf(selectionDrip);

        const activeIndex = activeIndexRef.current;

        if (activeIndex === -1) {
            gsap.to(selectionDrip, {
                autoAlpha: 0,
                duration: 0.2,
                overwrite: 'auto'
            });
            return;
        }

        if (immediate || isFirstMount.current) {
            gsap.set(selectionDrip, { y: activeIndex * 44, autoAlpha: 1 });
            return;
        }

        gsap.to(selectionDrip, {
            y: activeIndex * 44,
            autoAlpha: 1,
            duration: 0.45,
            ease: "power3.out",
            overwrite: 'auto'
        });
    }, []);

    const applyExpandedState = useCallback((immediate = false) => {
        const { icons, items, texts } = navNodesRef.current;
        if (!icons.length || !items.length) return;

        const activeIndex = activeIndexRef.current;

        icons.forEach((icon, i) => {
            const isActive = i === activeIndex;
            const parentItem = icon.closest('.nav-item');
            gsap.killTweensOf(icon);

            if (parentItem) {
                gsap.set(parentItem, { overflow: isActive ? 'visible' : 'hidden' });
            }

            const iconAnimation = {
                x: 0,
                y: "70%",
                scale: isActive ? 2.5 : 2.25,
                rotation: 0,
                force3D: true
            };

            if (immediate || isFirstMount.current) {
                gsap.set(icon, iconAnimation);
            } else {
                gsap.to(icon, {
                    ...iconAnimation,
                    duration: MELT_CONSTANTS.ANIMATION.ICON_DURATION,
                    ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                    overwrite: true
                });
            }
        });

        texts.forEach((text) => {
            if (!text) return;
            gsap.killTweensOf(text);

            if (immediate || isFirstMount.current) {
                gsap.set(text, {
                    autoAlpha: 1,
                    x: 0,
                    y: -6,
                    visibility: 'visible'
                });
            } else {
                gsap.to(text, {
                    autoAlpha: 1,
                    x: 0,
                    y: -6,
                    visibility: 'visible',
                    duration: MELT_CONSTANTS.ANIMATION.TEXT_DURATION_EXPAND,
                    ease: "back.out(1.5)",
                    overwrite: true
                });
            }
        });
    }, []);

    const applyCollapsedState = useCallback((immediate = false) => {
        const { icons, items, texts } = navNodesRef.current;
        if (!icons.length || !items.length) return;

        const activeIndex = activeIndexRef.current;

        icons.forEach((icon, i) => {
            const isActive = i === activeIndex;
            const parentItem = icon.closest('.nav-item');
            gsap.killTweensOf(icon);
            const collapsedAnimation = {
                x: 0,
                y: 0,
                rotation: isActive ? -10 : 0,
                scale: isActive ? 1.25 : 1,
                force3D: true
            };

            if (immediate || isFirstMount.current) {
                gsap.set(icon, collapsedAnimation);
                if (parentItem) gsap.set(parentItem, { overflow: 'hidden' });
            } else {
                gsap.to(icon, {
                    ...collapsedAnimation,
                    duration: 0.37,
                    ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                    overwrite: 'auto',
                    onComplete: () => {
                        if (parentItem) gsap.set(parentItem, { overflow: 'hidden' });
                    }
                });
            }
        });

        texts.forEach((text) => {
            if (!text) return;
            gsap.killTweensOf(text);

            if (immediate || isFirstMount.current) {
                gsap.set(text, { autoAlpha: 0, x: 20, y: -6, visibility: 'hidden' });
            } else {
                gsap.to(text, {
                    autoAlpha: 0,
                    x: 20,
                    y: -6,
                    visibility: 'hidden',
                    duration: 0.25,
                    overwrite: true
                });
            }
        });
    }, []);

    const applyHoverBehavior = useCallback((itemIndex: number, isEntering: boolean) => {
        const { icons, texts } = navNodesRef.current;
        const icon = icons[itemIndex];
        const text = texts[itemIndex];
        if (!icon || !text) return;
        gsap.killTweensOf([icon, text]);

        if (itemIndex === activeIndexRef.current) return;

        if (isEntering) {
            gsap.to(icon, {
                y: 0,
                scale: 1.6,
                rotation: -10,
                duration: 0.22,
                ease: MELT_CONSTANTS.ANIMATION.BOUNCE_EASE,
                overwrite: true,
                force3D: true
            });
            gsap.to(text, {
                autoAlpha: 0,
                y: -10,
                duration: 0.18,
                overwrite: true
            });
            return;
        }

        gsap.to(icon, {
            y: "70%",
            scale: 2.25,
            rotation: 0,
            duration: MELT_CONSTANTS.ANIMATION.ICON_DURATION,
            ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
            overwrite: true,
            force3D: true
        });
        gsap.to(text, {
            autoAlpha: 1,
            y: -6,
            duration: 0.3,
            ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
            overwrite: true
        });
    }, []);

    // 1. PHASE ONE: Layout & Branding (isExpanded ONLY)
    useGSAP(() => {
        const cleanupListeners: Array<() => void> = [];

        const ctx = gsap.context(() => {
            gsap.set(shellRef.current, { '--sidebar-width': MELT_CONSTANTS.SIDEBAR.COLLAPSED });

            const mainTl = gsap.timeline({
                paused: true,
                defaults: {
                    duration: MELT_CONSTANTS.ANIMATION.DURATION,
                    ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE
                }
            });

            mainTl.to(shellRef.current, {
                '--sidebar-width': MELT_CONSTANTS.SIDEBAR.EXPANDED,
                ease: MELT_CONSTANTS.ANIMATION.LAYOUT_BOUNCE
            }, 0);

            mainTl.to('.logo-main', { x: -20, rotation: -10, ease: "back.out(1.2)" }, 0);
            mainTl.to('.logo-reveal', { x: 20, rotation: 10, opacity: 1, ease: "back.out(1.2)" }, 0);

            tl.current = mainTl;

            ensureNavNodes();
            activeIndexRef.current = NAV_IDS.indexOf(activePage || 'decoder');
            syncSelectionDrip(true);
            applyCollapsedState(true);

            navNodesRef.current.items.forEach((item, i) => {
                const handleMouseEnter = () => {
                    if (!isExpandedRef.current) return;
                    applyHoverBehavior(i, true);
                };

                const handleMouseLeave = () => {
                    if (!isExpandedRef.current) return;
                    applyHoverBehavior(i, false);
                };

                item.addEventListener('mouseenter', handleMouseEnter);
                item.addEventListener('mouseleave', handleMouseLeave);
                cleanupListeners.push(() => {
                    item.removeEventListener('mouseenter', handleMouseEnter);
                    item.removeEventListener('mouseleave', handleMouseLeave);
                });
            });
        }, shellRef);
        return () => {
            cleanupListeners.forEach((cleanup) => cleanup());
            ctx.revert();
        };
    }, {
        scope: shellRef,
        dependencies: [ensureNavNodes, applyCollapsedState, applyHoverBehavior, syncSelectionDrip]
    });

    // 2. PHASE TWO: Navigation Controller (activePage ONLY)
    useEffect(() => {
        ensureNavNodes();
        killNavTweens();
        const resolvedPage = activePage || 'decoder';
        activeIndexRef.current = NAV_IDS.indexOf(resolvedPage);
        syncSelectionDrip(false);

        if (isExpandedRef.current) {
            applyExpandedState(false);
        } else {
            applyCollapsedState(false);
        }

        if (!shellRef.current) return;
        const viewport = shellRef.current.querySelector('#page-transition-wrapper');
        if (viewport) {
            const isFirstVisit = !visitedPagesRef.current.has(resolvedPage);
            visitedPagesRef.current.add(resolvedPage);

            gsap.killTweensOf(viewport);

            if (isFirstVisit) {
                gsap.set(viewport, {
                    autoAlpha: 1,
                    y: 0,
                    rotation: 0,
                    scale: 1,
                    clearProps: 'transform,opacity'
                });
            } else {
                gsap.fromTo(viewport,
                    { y: 6, autoAlpha: 0.92 },
                    { y: 0, autoAlpha: 1, duration: 0.24, ease: "power2.out", overwrite: 'auto', clearProps: 'transform,opacity' }
                );
            }
        }
    }, [activePage, ensureNavNodes, killNavTweens, applyCollapsedState, applyExpandedState, syncSelectionDrip]);

    // 3. PHASE THREE: Expand/Collapse State Synchronization
    useEffect(() => {
        if (!tl.current) return;

        ensureNavNodes();
        killNavTweens();
        isExpandedRef.current = isExpanded;

        if (isExpanded) {
            tl.current.timeScale(1).play();
            applyExpandedState(false);
        } else {
            tl.current.timeScale(MELT_CONSTANTS.ANIMATION.UNHOVER_SPEED).reverse();
            applyCollapsedState(false);
        }

        isFirstMount.current = false;
    }, [isExpanded, ensureNavNodes, killNavTweens, applyExpandedState, applyCollapsedState]);

    // 4. Resilience: Global Mouse Leave
    useEffect(() => {
        const handleGlobalMouseLeave = () => setIsExpanded(false);
        window.addEventListener('mouseleave', handleGlobalMouseLeave);
        return () => window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    }, []);

    return { isExpanded, setIsExpanded, shellRef };
};
