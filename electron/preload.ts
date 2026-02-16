import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings } from './SettingsStore';

type SelectFilesParams = {
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
};

type UpdateEventMap = {
    'update:available': string;
    'update:download-progress': number;
    'update:ready': string;
    'update:status': 'checking' | 'uptodate';
    'update:error': string;
};

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('window-min'),
    maximize: () => ipcRenderer.send('window-max'),
    close: () => ipcRenderer.send('window-close'),
    fs: {
        selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
        selectFiles: (params?: SelectFilesParams) => ipcRenderer.invoke('fs:selectFiles', params),
    },
    settings: {
        getAll: () => ipcRenderer.invoke('settings:get-all'),
        set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => ipcRenderer.invoke('settings:set', { key, value }),
    },
    updater: {
        check: () => ipcRenderer.invoke('update:check'),
        download: () => ipcRenderer.invoke('update:download'),
        quitAndInstall: () => ipcRenderer.invoke('update:quit-and-install'),
        on: <K extends keyof UpdateEventMap>(channel: K, callback: (data: UpdateEventMap[K]) => void) => {
            const subscription = (_event: Electron.IpcRendererEvent, data: UpdateEventMap[K]) => callback(data);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    }
});
