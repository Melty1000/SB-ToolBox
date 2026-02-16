export interface AppSettings {
    autoUpdate: boolean;
    autoDownload: boolean;
    theme: string;
    themeUserSelected: boolean;
}

export type AppSettingsKey = keyof AppSettings;

export interface SelectFilesParams {
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
}

export interface UpdaterEventMap {
    'update:available': string;
    'update:download-progress': number;
    'update:ready': string;
    'update:status': 'checking' | 'uptodate';
    'update:error': string;
}

export interface ElectronApi {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    fs: {
        selectFolder: () => Promise<Record<string, string> | null>;
        selectFiles: (params?: SelectFilesParams) => Promise<Record<string, string> | null>;
    };
    settings: {
        getAll: () => Promise<AppSettings>;
        set: <K extends AppSettingsKey>(key: K, value: AppSettings[K]) => Promise<boolean>;
    };
    updater: {
        check: () => Promise<void>;
        download: () => Promise<void>;
        quitAndInstall: () => Promise<void>;
        on: <K extends keyof UpdaterEventMap>(
            channel: K,
            callback: (data: UpdaterEventMap[K]) => void
        ) => () => void;
    };
}

export const getElectronApi = (): ElectronApi | null => {
    if (typeof window === 'undefined') return null;
    return window.electron || null;
};

export const isElectronRuntime = () => getElectronApi() !== null;
