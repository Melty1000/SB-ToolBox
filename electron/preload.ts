import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('window-min'),
    maximize: () => ipcRenderer.send('window-max'),
    close: () => ipcRenderer.send('window-close'),
    fs: {
        selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
        selectFiles: (params: any) => ipcRenderer.invoke('fs:selectFiles', params),
        readTextFile: (path: string) => ipcRenderer.invoke('fs:readTextFile', path),
    },
    settings: {
        getAll: () => ipcRenderer.invoke('settings:get-all'),
        set: (key: string, value: any) => ipcRenderer.invoke('settings:set', { key, value }),
    },
    updater: {
        check: () => ipcRenderer.invoke('update:check'),
        download: () => ipcRenderer.invoke('update:download'),
        quitAndInstall: () => ipcRenderer.invoke('update:quit-and-install'),
        on: (channel: string, callback: (data: any) => void) => {
            const subscription = (_event: any, data: any) => callback(data);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    }
});
