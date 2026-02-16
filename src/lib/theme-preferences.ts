import type { AppSettings, ElectronApi } from '@/lib/electron-api';

export const THEME_STORAGE_KEY = 'melt-theme';
export const THEME_USER_SELECTED_KEY = 'melt-theme-user-selected';

export const DEFAULT_THEME = 'graphite-gold' as const;
export const LEGACY_DEFAULT_THEME = 'graphite-cobalt' as const;

export const AVAILABLE_THEMES = [
    'graphite-gold',
    'graphite-cobalt',
    'slate-gold',
    'slate-cobalt',
] as const;

export type ThemeVariant = (typeof AVAILABLE_THEMES)[number];

export interface ThemeSelection {
    theme: ThemeVariant;
    userSelected: boolean;
}

export interface ThemeBootstrapResult {
    settings: AppSettings | null;
    selection: ThemeSelection;
}

const AVAILABLE_THEME_SET = new Set<string>(AVAILABLE_THEMES);

const normalizeTheme = (value: unknown): ThemeVariant | null => {
    if (typeof value !== 'string') return null;
    return AVAILABLE_THEME_SET.has(value) ? (value as ThemeVariant) : null;
};

const normalizeBoolean = (value: unknown): boolean | null => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return null;
};

const parseStoredSelectionFlag = (value: string | null): boolean | null => {
    if (value === null) return null;
    return normalizeBoolean(value);
};

const serializeSelectionFlag = (value: boolean) => (value ? '1' : '0');

export const readLocalThemeSelection = (): ThemeSelection => {
    if (typeof window === 'undefined') {
        return { theme: DEFAULT_THEME, userSelected: false };
    }

    const storedTheme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
    const storedSelection = parseStoredSelectionFlag(localStorage.getItem(THEME_USER_SELECTED_KEY));

    const resolved = resolveThemeSelection({
        localTheme: storedTheme,
        localUserSelected: storedSelection
    });

    return resolved;
};

export const writeLocalThemeSelection = ({ theme, userSelected }: ThemeSelection) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(THEME_USER_SELECTED_KEY, serializeSelectionFlag(userSelected));
};

export const applyTheme = (theme: ThemeVariant) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
};

interface ResolveThemeSelectionInput {
    desktopTheme?: unknown;
    desktopUserSelected?: unknown;
    localTheme?: unknown;
    localUserSelected?: unknown;
}

export const resolveThemeSelection = ({
    desktopTheme,
    desktopUserSelected,
    localTheme,
    localUserSelected
}: ResolveThemeSelectionInput): ThemeSelection => {
    const normalizedDesktopTheme = normalizeTheme(desktopTheme);
    const normalizedLocalTheme = normalizeTheme(localTheme);

    const desktopSelected = normalizeBoolean(desktopUserSelected);
    const localSelected = normalizeBoolean(localUserSelected);

    if (desktopSelected === true && normalizedDesktopTheme) {
        return { theme: normalizedDesktopTheme, userSelected: true };
    }

    if (localSelected === true && normalizedLocalTheme) {
        return { theme: normalizedLocalTheme, userSelected: true };
    }

    const inferredTheme = normalizedDesktopTheme ?? normalizedLocalTheme;

    // Migration path: old default (graphite-cobalt) or missing theme should move to graphite-gold.
    if (!inferredTheme || inferredTheme === LEGACY_DEFAULT_THEME) {
        return { theme: DEFAULT_THEME, userSelected: false };
    }

    // No explicit flag but non-legacy value means user likely chose it in a prior release.
    return { theme: inferredTheme, userSelected: true };
};

export const bootstrapThemeSelection = async (electron: ElectronApi | null): Promise<ThemeBootstrapResult> => {
    const localThemeSelection = readLocalThemeSelection();

    if (electron?.settings) {
        const settings = await electron.settings.getAll();
        const selection = resolveThemeSelection({
            desktopTheme: settings.theme,
            desktopUserSelected: settings.themeUserSelected,
            localTheme: localThemeSelection.theme,
            localUserSelected: localThemeSelection.userSelected
        });

        applyTheme(selection.theme);
        writeLocalThemeSelection(selection);

        if (settings.theme !== selection.theme) {
            await electron.settings.set('theme', selection.theme);
        }

        if (settings.themeUserSelected !== selection.userSelected) {
            await electron.settings.set('themeUserSelected', selection.userSelected);
        }

        return { settings, selection };
    }

    const selection = resolveThemeSelection({
        localTheme: localThemeSelection.theme,
        localUserSelected: localThemeSelection.userSelected
    });

    applyTheme(selection.theme);
    writeLocalThemeSelection(selection);

    return { settings: null, selection };
};
