import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';

export interface AppSettings {
    autoUpdate: boolean;
    autoDownload: boolean;
    theme: string;
    themeUserSelected: boolean;
}

export class SettingsStore {
    private path: string;
    private data: AppSettings;
    private readonly validThemes = new Set([
        'graphite-gold',
        'graphite-cobalt',
        'slate-gold',
        'slate-cobalt'
    ]);
    private defaultSettings: AppSettings = {
        autoUpdate: true,
        autoDownload: false,
        theme: 'graphite-gold',
        themeUserSelected: false
    };

    constructor() {
        // Store in the standard Electron userData directory
        this.path = path.join(app.getPath('userData'), 'settings.json');
        this.data = this.load();
    }

    private load(): AppSettings {
        try {
            if (fs.existsSync(this.path)) {
                const raw = fs.readJsonSync(this.path) as Partial<AppSettings> | null;
                const fileSettings = raw || {};

                const normalizedTheme = this.normalizeTheme(fileSettings.theme);
                const normalizedThemeSelected = this.normalizeBoolean(fileSettings.themeUserSelected);

                let migratedTheme = normalizedTheme ?? this.defaultSettings.theme;
                let migratedThemeSelected = normalizedThemeSelected;

                // Migration: old configs did not store explicit selection state.
                // Missing theme OR legacy default should move to graphite-gold.
                if (migratedThemeSelected === null) {
                    if (!normalizedTheme || normalizedTheme === 'graphite-cobalt') {
                        migratedTheme = this.defaultSettings.theme;
                        migratedThemeSelected = false;
                    } else {
                        migratedThemeSelected = true;
                    }
                }

                const merged: AppSettings = {
                    ...this.defaultSettings,
                    ...fileSettings,
                    theme: migratedTheme,
                    themeUserSelected: migratedThemeSelected ?? false
                };

                const requiresWriteBack =
                    fileSettings.theme !== merged.theme ||
                    fileSettings.themeUserSelected !== merged.themeUserSelected;

                if (requiresWriteBack) {
                    this.persist(merged);
                }

                return merged;
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return { ...this.defaultSettings };
    }

    public get(): AppSettings {
        return this.data;
    }

    public set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        this.data[key] = value;
        this.save();
    }

    public setAll(settings: Partial<AppSettings>) {
        this.data = { ...this.data, ...settings };
        this.save();
    }

    private save() {
        this.persist(this.data);
    }

    private persist(data: AppSettings) {
        try {
            fs.writeJsonSync(this.path, data, { spaces: 4 });
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    private normalizeTheme(value: unknown): string | null {
        if (typeof value !== 'string') return null;
        return this.validThemes.has(value) ? value : null;
    }

    private normalizeBoolean(value: unknown): boolean | null {
        if (value === true || value === 'true' || value === 1 || value === '1') return true;
        if (value === false || value === 'false' || value === 0 || value === '0') return false;
        return null;
    }
}
