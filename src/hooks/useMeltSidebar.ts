import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MELT_CONSTANTS } from '../lib/melt-motion';

/**
 * useMeltSidebar: Clean SocialLink-Style Navigation
 *
 * Key rules:
 * - Icons NEVER move on sidebar expand/collapse. Only on tab switch + individual hover.
 * - Text color handled entirely by CSS classes (no GSAP color overrides).
 * - Overflow always hidden (no text leaking outside buttons).
 * - Active icon doesn't re-animate on expand/collapse.
 */
export const useMeltSidebar = (activePage?: string) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shellRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // 1. Sidebar width/branding timeline
    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.set(shellRef.current, { '--sidebar-width': MELT_CONSTANTS.SIDEBAR.COLLAPSED });

            const mainTl = gsap.timeline({
                paused: true,
                defaults: {
                    duration: MELT_CONSTANTS.ANIMATION.DURATION,
                    ease: "power2.inOut"
                }
            });

            mainTl.to(shellRef.current, {
                '--sidebar-width': MELT_CONSTANTS.SIDEBAR.EXPANDED,
                ease: "power2.inOut"
            }, 0);

            mainTl.to('.logo-main', { x: -20, rotation: -10 }, 0);
            mainTl.to('.logo-reveal', { x: 20, rotation: 10, opacity: 1 }, 0);
            mainTl.to('span.version-beta', { width: 40, autoAlpha: 1 }, 0);

            tl.current = mainTl;
        }, shellRef);
        return () => ctx.revert();
    }, { scope: shellRef });

    const isFirstMount = useRef(true);
    const prevIsExpanded = useRef(false);
    const prevActiveIndex = useRef(-1);

    // 2. Navigation interaction
    useGSAP(() => {
        if (!tl.current || !shellRef.current) return;

        const icons = shellRef.current.querySelectorAll('.nav-icon-wrapper');
        const texts = shellRef.current.querySelectorAll('.nav-text');
        const bgs = shellRef.current.querySelectorAll('.nav-bg');
        const selectionDrip = shellRef.current.querySelector('.selection-drip');
        const items = shellRef.current.querySelectorAll('.nav-item');

        const navIds = ['decoder', 'encoder', 'history', 'help', 'support', 'settings'];
        const activeIndex = navIds.indexOf(activePage || 'decoder');

        const expandedChanged = prevIsExpanded.current !== isExpanded;
        const activeChanged = prevActiveIndex.current !== activeIndex;
        const oldActiveIndex = prevActiveIndex.current;
        prevIsExpanded.current = isExpanded;
        prevActiveIndex.current = activeIndex;

        // ── Selection Drip ──
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

        // ── Icons: position & scale ──
        // Only update on first mount OR tab switch. NEVER on expand/collapse.
        if (isFirstMount.current || activeChanged) {
            icons.forEach((icon, i) => {
                const isActive = i === activeIndex;
                const wasActive = i === oldActiveIndex;

                // Skip items that didn't change (not newly active, not previously active)
                if (!isFirstMount.current && !isActive && !wasActive) return;

                // Clear any GSAP color override so CSS classes take effect
                gsap.set(icon, { clearProps: 'color' });

                const targetProps = {
                    left: '20px',
                    xPercent: -50,
                    top: '50%',
                    yPercent: -50,
                    scale: isActive ? 1.25 : 1,
                    rotation: isActive ? -10 : 0,
                    force3D: false
                };

                if (isFirstMount.current) {
                    gsap.set(icon, targetProps);
                } else {
                    gsap.to(icon, {
                        ...targetProps,
                        duration: 0.45,
                        ease: "power2.inOut",
                        overwrite: 'auto'
                    });
                }
            });
        }

        // ── Text ──
        if (isExpanded) {
            // Play expand timeline
            if (expandedChanged || isFirstMount.current) {
                tl.current.timeScale(1).play();
            }

            if (isFirstMount.current) {
                // Instant set on first mount
                texts.forEach(text => {
                    gsap.set(text, { clearProps: 'color' });
                    gsap.set(text, { autoAlpha: 1, x: 0, visibility: 'visible' });
                });
            } else if (expandedChanged) {
                // Sidebar just expanded — find which tab the mouse is currently on
                const hoveredIndex = Array.from(items).findIndex(
                    item => (item as HTMLElement).matches(':hover')
                );

                // Slide text in from right, but skip the hovered tab
                texts.forEach((text, i) => {
                    gsap.set(text, { clearProps: 'color' });
                    if (i === hoveredIndex && i !== activeIndex) {
                        // This tab is already hovered — keep text hidden, apply hover state
                        gsap.set(text, { autoAlpha: 0, visibility: 'hidden' });
                        gsap.to(icons[i], {
                            left: '50%', xPercent: -50,
                            scale: 1.55, rotation: -8,
                            duration: 0.45, ease: "back.out(1.7)",
                            overwrite: true, force3D: false
                        });
                    } else {
                        gsap.fromTo(text,
                            { autoAlpha: 0, x: 30, visibility: 'hidden' },
                            {
                                autoAlpha: 1, x: 0, visibility: 'visible' as const,
                                duration: 0.3,
                                delay: 0.1,
                                ease: "power2.out",
                                overwrite: 'auto'
                            }
                        );
                    }
                });
            } else if (activeChanged) {
                // Tab switch while expanded — restore text for affected items
                texts.forEach((text, i) => {
                    const isActive = i === activeIndex;
                    const wasActive = i === oldActiveIndex;
                    if (!isActive && !wasActive) return;

                    gsap.set(text, { clearProps: 'color' });
                    gsap.to(text, {
                        x: 0, autoAlpha: 1, visibility: 'visible',
                        duration: 0.45, ease: "power2.inOut", overwrite: true
                    });
                });
            }

            // ── Mouse handlers ──
            items.forEach((item, i) => {
                (item as HTMLElement).onmouseenter = () => {
                    if (i === activeIndex) return;

                    // Text slides out right
                    gsap.to(texts[i], {
                        x: 40, autoAlpha: 0,
                        duration: 0.35, ease: "power2.out", overwrite: true
                    });

                    // Icon centers and scales
                    gsap.to(icons[i], {
                        left: '50%', xPercent: -50,
                        scale: 1.55, rotation: -8,
                        duration: 0.45, ease: "back.out(1.7)",
                        overwrite: true, force3D: false
                    });
                };

                (item as HTMLElement).onmouseleave = () => {
                    if (i === activeIndex) return;

                    // Text returns
                    gsap.to(texts[i], {
                        x: 0, autoAlpha: 1,
                        duration: 0.45, ease: "power2.inOut", overwrite: true
                    });

                    // Icon returns to pinned position
                    gsap.to(icons[i], {
                        left: '20px', xPercent: -50,
                        scale: 1, rotation: 0,
                        duration: 0.45, ease: "power2.inOut",
                        overwrite: true, force3D: false
                    });
                };
            });

        } else {
            // ── Collapsed ──
            if (expandedChanged || isFirstMount.current) {
                tl.current.timeScale(MELT_CONSTANTS.ANIMATION.UNHOVER_SPEED).reverse();

                // Hide text
                if (isFirstMount.current) {
                    gsap.set('.nav-text', { autoAlpha: 0, x: 20, visibility: 'hidden' });
                } else {
                    gsap.to('.nav-text', {
                        autoAlpha: 0, x: 20, visibility: 'hidden',
                        duration: 0.3, overwrite: true
                    });
                }

                // Clear text color overrides
                texts.forEach(text => gsap.set(text, { clearProps: 'color' }));

                // Collapsed hover handlers — icon centers + text peeks
                items.forEach((item, i) => {
                    (item as HTMLElement).onmouseenter = () => {
                        if (i === activeIndex) return;

                        // Ensure text stays hidden
                        gsap.set(texts[i], { autoAlpha: 0, visibility: 'hidden' });

                        // Icon centers and scales
                        gsap.to(icons[i], {
                            left: '50%', xPercent: -50,
                            scale: 1.55, rotation: -8,
                            duration: 0.45, ease: "back.out(1.7)",
                            overwrite: true, force3D: false
                        });
                    };

                    (item as HTMLElement).onmouseleave = () => {
                        if (i === activeIndex) return;

                        // Icon returns to pinned position
                        gsap.to(icons[i], {
                            left: '20px', xPercent: -50,
                            scale: 1, rotation: 0,
                            duration: 0.45, ease: "power2.inOut",
                            overwrite: true, force3D: false
                        });
                    };
                });
            }
        }

        isFirstMount.current = false;
    }, { dependencies: [isExpanded, activePage], scope: shellRef });

    // 3. Global mouse leave resilience
    useEffect(() => {
        const handleGlobalMouseLeave = () => setIsExpanded(false);
        window.addEventListener('mouseleave', handleGlobalMouseLeave);
        return () => window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    }, []);

    return { isExpanded, setIsExpanded, shellRef };
};
