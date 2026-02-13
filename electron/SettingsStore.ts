import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';

export interface AppSettings {
    autoUpdate: boolean;
    autoDownload: boolean;
    theme: string;
}

export class SettingsStore {
    private path: string;
    private data: AppSettings;
    private defaultSettings: AppSettings = {
        autoUpdate: true,
        autoDownload: false,
        theme: 'graphite-cobalt'
    };

    constructor() {
        // Store in the standard Electron userData directory
        this.path = path.join(app.getPath('userData'), 'settings.json');
        this.data = this.load();
    }

    private load(): AppSettings {
        try {
            if (fs.existsSync(this.path)) {
                return { ...this.defaultSettings, ...fs.readJsonSync(this.path) };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return this.defaultSettings;
    }

    public get(): AppSettings {
        return this.data;
    }

    public set(key: keyof AppSettings, value: AppSettings[keyof AppSettings]) {
        (this.data as any)[key] = value;
        this.save();
    }

    public setAll(settings: Partial<AppSettings>) {
        this.data = { ...this.data, ...settings };
        this.save();
    }

    private save() {
        try {
            fs.writeJsonSync(this.path, this.data, { spaces: 4 });
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
}
