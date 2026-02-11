import { BeforeMount, OnMount, useMonaco, Monaco } from '@monaco-editor/react';
import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MELT_THEMES, MELT_TYPOGRAPHY } from '@/lib/melt-theme';

interface SBEditorProps {
    value: string;
    language: string;
    theme: string; // Dynamic theme name
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
}

export const SBEditor: React.FC<SBEditorProps> = ({ value, language, onChange, readOnly }) => {
    const monaco = useMonaco();
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Stable refs for mount/reveal tracking
    const isActuallyUnmounted = useRef(false);
    const hasRevealed = useRef(false);

    const [currentThemeName, setCurrentThemeName] = useState(() => {
        if (typeof window === 'undefined') return 'melt-theme-default';
        const variant = document.documentElement.getAttribute('data-theme') || 'default';
        return `melt-theme-${variant}`;
    });

    const [isReady, setIsReady] = useState(false);

    // 1. Stable Lifecycle Guard
    useEffect(() => {
        isActuallyUnmounted.current = false;

        // FAIL-SAFE: 750ms Absolute override to ensure code is visible even if mount events stall
        const safetyTimer = setTimeout(() => {
            if (!isActuallyUnmounted.current && !hasRevealed.current) {
                hasRevealed.current = true;
                setIsReady(true);
            }
        }, 750);

        return () => {
            isActuallyUnmounted.current = true;
            clearTimeout(safetyTimer);
        };
    }, []);

    // 2. Definitive Theme Registration
    const registerMeltThemes = (monaco: Monaco) => {
        if (!monaco) return;

        Object.keys(MELT_THEMES).forEach(variant => {
            try {
                const config = MELT_THEMES[variant];
                const themeName = `melt-theme-${variant}`;
                const accent = config.accent || { main: '#ffaa00' };
                const getHex = (c: string) => (c && c.startsWith('#')) ? c : `#${c || 'ffaa00'}`;

                monaco.editor.defineTheme(themeName, {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'keyword', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'keyword.cs', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'storage.type.cs', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'storage.modifier.cs', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'keyword.json', foreground: getHex(accent.main) },
                        { token: 'string.key.json', foreground: getHex(accent.main), fontStyle: 'bold' },
                        { token: 'string.value.json', foreground: getHex(MELT_TYPOGRAPHY.heading) },
                        { token: 'number', foreground: getHex(MELT_TYPOGRAPHY.body) },
                        { token: 'type', foreground: getHex(MELT_TYPOGRAPHY.heading) },
                        { token: 'string', foreground: getHex(MELT_TYPOGRAPHY.body) },
                        { token: 'comment', foreground: getHex(MELT_TYPOGRAPHY.muted), fontStyle: 'italic' },
                        { token: 'variable', foreground: getHex(MELT_TYPOGRAPHY.label) },
                        { token: 'delimiter', foreground: getHex(MELT_TYPOGRAPHY.muted) },
                    ],
                    colors: {
                        'editor.background': '#00000000',
                        'editor.foreground': getHex(MELT_TYPOGRAPHY.label),
                        'editorGutter.background': '#00000000',
                        'editorLineNumber.foreground': getHex(MELT_TYPOGRAPHY.muted),
                        'editorLineNumber.activeForeground': getHex(MELT_TYPOGRAPHY.label),
                        'editor.lineHighlightBackground': `${config.surface || '#18181b'}33`,
                        'editor.selectionBackground': `${accent.main}44`,
                        'editor.wordHighlightBackground': `${accent.main}22`,
                        'editorBracketMatch.border': getHex(accent.main),
                    }
                });
            } catch (err) {
                console.error("THEME_REG_FAIL:", variant, err);
            }
        });
    };

    const refreshTheme = (monaco: Monaco) => {
        if (!monaco || isActuallyUnmounted.current) return;
        try {
            const variant = document.documentElement.getAttribute('data-theme') || 'default';
            const newThemeName = `melt-theme-${variant}`;
            registerMeltThemes(monaco);
            monaco.editor.setTheme(newThemeName);
            setCurrentThemeName(newThemeName);
        } catch (e) {
            console.warn("MONACO_THEME_FAIL:", e);
        }
    };

    // 3. Layout & Theme Synchronization
    useEffect(() => {
        if (!containerRef.current || !editorRef.current) return;
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (editorRef.current) editorRef.current.layout();
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [editorRef.current]);

    useEffect(() => {
        if (!monaco) return;
        refreshTheme(monaco);
        const observer = new MutationObserver(() => refreshTheme(monaco));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, [monaco]);

    const handleBeforeMount: BeforeMount = (monaco) => {
        registerMeltThemes(monaco);
        refreshTheme(monaco);
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        refreshTheme(monaco);

        editor.updateOptions({
            lineNumbers: 'off',
            lineNumbersMinChars: 0,
            lineDecorationsWidth: 0,
            glyphMargin: false,
            folding: false,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
            }
        });

        // REVEAL: 150ms delay masks the pink/blue default syntax frames
        setTimeout(() => {
            if (!isActuallyUnmounted.current && !hasRevealed.current) {
                hasRevealed.current = true;
                setIsReady(true);
            }
        }, 150);
    };

    // 4. C# Autocomplete
    useEffect(() => {
        if (!monaco || language !== 'csharp') return;
        const disposable = monaco.languages.registerCompletionItemProvider('csharp', {
            triggerCharacters: ['.'],
            provideCompletionItems: (model, position) => {
                if (isActuallyUnmounted.current) return { suggestions: [] };
                const suggestions = [
                    {
                        label: 'RunAction',
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: 'RunAction("${1:actionName}", ${2:true});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '(method) CPH.RunAction(string name, bool runImmediately)'
                    },
                    {
                        label: 'SendMessage',
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: 'SendMessage("${1:message}");',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '(method) CPH.SendMessage(string message)'
                    }
                ].map(s => ({
                    ...s, range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endColumn: position.column
                    }
                }));
                return { suggestions };
            }
        });
        return () => disposable.dispose();
    }, [monaco, language]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden bg-transparent relative transition-all duration-500 ${isReady ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            <Editor
                height="100%"
                language={language}
                theme={currentThemeName}
                value={value}
                onChange={onChange}
                beforeMount={handleBeforeMount}
                onMount={handleEditorDidMount}
                loading={
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-melt-surface z-[100]">
                        <div className="w-8 h-8 border-2 border-melt-accent/20 border-t-melt-accent rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-melt-text-muted uppercase tracking-[0.3em]">INITIALIZING CORE...</span>
                    </div>
                }
                options={{
                    readOnly,
                    fontSize: 13,
                    fontFamily: 'Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'none',
                    automaticLayout: true,
                    stickyScroll: { enabled: false },
                    scrollbar: {
                        useShadows: false,
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 12,
                        horizontalScrollbarSize: 12,
                        alwaysConsumeMouseWheel: false,
                    },
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    lineNumbers: 'off',
                    lineDecorationsWidth: 0,
                    glyphMargin: false,
                    folding: false,
                    guides: { indentation: false },
                    contextmenu: false,
                }}
            />
        </div>
    );
};
