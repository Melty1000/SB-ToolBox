import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MELT_CONSTANTS } from '../lib/melt-motion';

/**
 * useMeltSidebar: The "Infinite Curve" Restoration
 * High-poly 12-point rounding + 1.25x persistent icon scale.
 */
export const useMeltSidebar = (activePage?: string) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shellRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // 1. PHASE ONE: Layout & Branding (isExpanded ONLY)
    useGSAP(() => {
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

            mainTl.to('.version-compact', { autoAlpha: 0, y: -5 }, 0);
            mainTl.to('.version-expanded', { autoAlpha: 1, y: 0 }, 0);

            tl.current = mainTl;
        }, shellRef);
        return () => ctx.revert();
    }, { scope: shellRef });

    // 2. PHASE TWO: Navigation Controller (activePage ONLY)
    useEffect(() => {
        if (!shellRef.current) return;
        const viewport = shellRef.current.querySelector('#page-transition-wrapper');
        if (viewport) {
            gsap.fromTo(viewport,
                { y: 10, autoAlpha: 0, rotation: 0.5, scale: 0.98 },
                { y: 0, autoAlpha: 1, rotation: 0, scale: 1, duration: 0.5, ease: "power2.out", overwrite: 'auto' }
            );
        }
    }, [activePage]);

    const isFirstMount = useRef(true);

    // 3. PHASE THREE: Liquid Interaction & Precision Morph
    // useGSAP = useLayoutEffect = Run BEFORE paint. Syncs hydration instantly.
    useGSAP(() => {
        if (!tl.current || !shellRef.current) return;

        const icons = shellRef.current.querySelectorAll('.nav-icon-wrapper');
        const selectionDrip = shellRef.current.querySelector('.selection-drip');
        const items = shellRef.current.querySelectorAll('.nav-item');

        const navIds = ['decoder', 'encoder', 'history', 'help', 'support', 'settings'];
        const activeIndex = navIds.indexOf(activePage || 'decoder');

        // Selection Drip (Synchronized Elastic Drift)
        if (selectionDrip && activeIndex !== -1) {
            if (isFirstMount.current) {
                gsap.set(selectionDrip, { y: activeIndex * 44, autoAlpha: 1 });
            } else {
                gsap.to(selectionDrip, {
                    y: activeIndex * 44,
                    autoAlpha: 1,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.75)",
                    overwrite: 'auto'
                });
            }
        } else if (selectionDrip) {
            gsap.to(selectionDrip, { autoAlpha: 0, duration: 0.3 });
        }

        if (isExpanded) {
            tl.current.timeScale(1).play();

            // Icons Morph to Action-Style stacked layout
            icons.forEach((icon, i) => {
                const isActive = i === activeIndex;
                const targetScale = isActive ? 2.5 : 2.25;
                const parentItem = icon.closest('.nav-item');
                const isHovered = parentItem?.matches(':hover');

                // Ensure active item has overflow visible for the pop-out effect
                if (isActive && parentItem) {
                    gsap.set(parentItem, { overflow: 'visible' });
                } else if (parentItem) {
                    // Non-active items should be clipped (user requirement)
                    gsap.set(parentItem, { overflow: 'hidden' });
                }

                if (isHovered && !isActive) {
                    if (isFirstMount.current) {
                        gsap.set(icon, { x: 0, y: 0, scale: 1.6, rotation: -10, force3D: false });
                    } else {
                        gsap.to(icon, {
                            x: 0,
                            y: 0,
                            scale: 1.6,
                            rotation: -10,
                            duration: 0.5,
                            ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                            force3D: false
                        });
                    }
                } else {
                    if (isFirstMount.current) {
                        gsap.set(icon, { x: 0, y: "70%", scale: targetScale, rotation: 0, force3D: false });
                    } else {
                        gsap.to(icon, {
                            x: 0,
                            y: "70%",
                            scale: targetScale,
                            rotation: 0,
                            duration: MELT_CONSTANTS.ANIMATION.ICON_DURATION,
                            ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                            force3D: false
                        });
                    }
                }
            });

            // Smart Label Reveal: Falling from top + stagger
            items.forEach((item, i) => {
                const text = item.querySelector('.nav-text');
                const isHovered = (item as HTMLElement).matches(':hover');
                const isActive = i === activeIndex;

                // Only hide text if hovered AND NOT active (Active item text should stay visible)
                const shouldHideText = isHovered && !isActive;

                if (isFirstMount.current) {
                    gsap.set(text, {
                        autoAlpha: shouldHideText ? 0 : 1,
                        x: 0,
                        y: -6,
                        visibility: shouldHideText ? 'hidden' : 'visible'
                    });
                } else {
                    gsap.fromTo(text,
                        { autoAlpha: 0, x: 0, y: -30 },
                        {
                            autoAlpha: shouldHideText ? 0 : 1, // Focused area stays text-free only if inactive
                            x: 0,
                            y: -6,
                            visibility: 'visible',
                            duration: MELT_CONSTANTS.ANIMATION.TEXT_DURATION_EXPAND,
                            delay: 0, // No stagger, instant feel
                            overwrite: true,
                            ease: "back.out(1.5)" // Catchy entry
                        }
                    );
                }
            });

            items.forEach((item, i) => {
                (item as HTMLElement).onmouseenter = () => {
                    // Active item is already "Popped Out" (Scale 2.5). 
                    // Do not apply Bounce (Scale 1.6) or hide text.
                    if (i === activeIndex) return;

                    gsap.to(icons[i], {
                        y: 0,
                        scale: 1.6,
                        rotation: -10,
                        duration: 0.3,
                        ease: MELT_CONSTANTS.ANIMATION.BOUNCE_EASE,
                        overwrite: true,
                        force3D: false
                    });
                    gsap.to(item.querySelector('.nav-text'), {
                        autoAlpha: 0,
                        y: -10,
                        duration: 0.25,
                        overwrite: true
                    });
                };
                (item as HTMLElement).onmouseleave = () => {
                    const isActive = i === activeIndex;
                    gsap.to(icons[i], {
                        y: "70%",
                        scale: isActive ? 2.5 : 2.25,
                        rotation: 0,
                        duration: MELT_CONSTANTS.ANIMATION.ICON_DURATION,
                        ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                        overwrite: true,
                        force3D: false
                    });
                    gsap.to(item.querySelector('.nav-text'), {
                        autoAlpha: 1,
                        y: -6,
                        duration: 0.4,
                        ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                        overwrite: true
                    });
                };
            });

        } else {
            tl.current.timeScale(MELT_CONSTANTS.ANIMATION.UNHOVER_SPEED).reverse();

            // Icons restore to Collapsed layout
            icons.forEach((icon, i) => {
                const isActive = i === activeIndex;
                const targetRotation = isActive ? -10 : 0;
                const targetScale = isActive ? 1.25 : 1;
                const parentItem = icon.closest('.nav-item');

                if (isFirstMount.current) {
                    gsap.set(icon, { x: 0, y: 0, rotation: targetRotation, scale: targetScale, force3D: false });
                    // Reset overflow on mount if needed
                    if (parentItem) gsap.set(parentItem, { overflow: 'hidden' });
                } else {
                    // For active item collapsing: Keep visible until done? 
                    // No, usually shrinking back to center is safe to clip immediately?
                    // Actually, if we were popped out, and we shrink, we want to tuck back in.
                    // Safe bet: ensure hidden at end.

                    gsap.to(icon, {
                        x: 0,
                        y: 0,
                        rotation: targetRotation,
                        scale: targetScale,
                        duration: 0.37,
                        ease: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,
                        overwrite: 'auto',
                        force3D: false,
                        onComplete: () => {
                            if (parentItem) gsap.set(parentItem, { overflow: 'hidden' });
                        }
                    });
                }
            });

            // Ensure text is correctly hidden without clearing props
            if (isFirstMount.current) {
                gsap.set('.nav-text', { autoAlpha: 0, x: 20, visibility: 'hidden' });
            } else {
                gsap.to('.nav-text', {
                    autoAlpha: 0,
                    x: 20,
                    visibility: 'hidden',
                    duration: 0.3,
                    overwrite: true
                });
            }

            items.forEach(item => {
                (item as HTMLElement).onmouseenter = null;
                (item as HTMLElement).onmouseleave = null;
            });
        }

        // Finalize Mount Lifecycle
        isFirstMount.current = false;
    }, { dependencies: [isExpanded, activePage], scope: shellRef });

    // 4. Resilience: Global Mouse Leave
    useEffect(() => {
        const handleGlobalMouseLeave = () => setIsExpanded(false);
        window.addEventListener('mouseleave', handleGlobalMouseLeave);
        return () => window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    }, []);

    return { isExpanded, setIsExpanded, shellRef };
};
