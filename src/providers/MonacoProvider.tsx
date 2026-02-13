"use client";

import React, { useEffect } from 'react';
import { loader } from '@monaco-editor/react';
import { MELT_THEMES, MELT_TYPOGRAPHY } from '@/lib/melt-theme';

/**
 * MonacoProvider
 * Centralizes theme registration for all editor instances.
 * Prevents race conditions and "broken" fallback themes.
 */
export const MonacoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // Register all themes on boot
        loader.init().then(monaco => {
            Object.keys(MELT_THEMES).forEach(variant => {
                const config = MELT_THEMES[variant];
                const accent = config.accent;
                const themeName = `melt-theme-${variant}`;

                const getHex = (c: string) => c.startsWith('#') ? c : `#${c}`;

                monaco.editor.defineTheme(themeName, {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'string.key.json', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'string.value.json', foreground: getHex(MELT_TYPOGRAPHY.heading) },
                        { token: 'number', foreground: getHex(MELT_TYPOGRAPHY.body) },
                        { token: 'keyword.json', foreground: getHex(accent.main) },
                        { token: 'keyword', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'type', foreground: getHex(MELT_TYPOGRAPHY.heading) },
                        { token: 'string', foreground: getHex(MELT_TYPOGRAPHY.body) },
                        { token: 'comment', foreground: getHex(MELT_TYPOGRAPHY.muted), fontStyle: 'italic' },
                        { token: 'variable', foreground: getHex(MELT_TYPOGRAPHY.label) },
                        { token: 'delimiter', foreground: getHex(MELT_TYPOGRAPHY.muted) },
                        { token: 'delimiter.bracket', foreground: getHex(MELT_TYPOGRAPHY.muted) },
                    ],
                    colors: {
                        'editor.background': '#00000000',
                        'editor.foreground': getHex(MELT_TYPOGRAPHY.label),
                        'editorGutter.background': '#00000000',
                        'editorLineNumber.foreground': getHex(MELT_TYPOGRAPHY.muted),
                        'editorLineNumber.activeForeground': getHex(MELT_TYPOGRAPHY.label),
                        'editor.lineHighlightBackground': `${config.surface}33`,
                        'editor.selectionBackground': `${accent.main}44`,
                        'editor.wordHighlightBackground': `${accent.main}22`,
                        'editorBracketMatch.border': getHex(accent.main),
                        'editorIndentGuide.background': '#1f1f23',
                        'editorIndentGuide.activeBackground': '#27272a',
                    }
                });
            });

            // Set the initial global theme
            const initialVariant = document.documentElement.getAttribute('data-theme') || 'default';
            monaco.editor.setTheme(`melt-theme-${initialVariant}`);
        });
    }, []);

    return <>{children}</>;
};
