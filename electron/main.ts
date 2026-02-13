import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import serve from 'electron-serve';
import { SettingsStore } from './SettingsStore';
import { UpdateManager } from './UpdateManager';

// tsup shims __dirname in CJS output if needed, or it's native in Electron CJS.
// We remove the ESM import.meta.url shim which was causing the crash.

const appServe = serve({ directory: path.join(__dirname, '../out') });

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const settings = new SettingsStore();
const updateManager = new UpdateManager();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 900,
        minHeight: 600,
        frame: false, // Frameless for Melt UI
        icon: path.join(__dirname, '../public/assets/icon.png'),
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#050505',
    });

    if (isDev) {
        win.loadURL('http://localhost:3001');
        win.webContents.openDevTools();
    } else {
        appServe(win).then(() => {
            win.loadURL('app://-');
        });
    }

    updateManager.setWindow(win);

    // Window controls IPC
    ipcMain.on('window-min', () => win.minimize());
    ipcMain.on('window-max', () => {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
    });

    // Hard exit on window close to prevent zombie processes
    ipcMain.on('window-close', () => {
        win.destroy();
        app.quit();
    });

    // File System IPC handlers with robust return type check
    ipcMain.handle('fs:selectFolder', async () => {
        const result: any = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });

        const filePaths = result.filePaths || (Array.isArray(result) ? result : null);
        const canceled = result.canceled || (!filePaths);

        if (canceled || !filePaths || !filePaths.length) return null;

        const folderPath = filePaths[0];
        const files = await fs.readdir(folderPath);
        const scripts: Record<string, string> = {};

        for (const file of files) {
            if (file.endsWith('.cs')) {
                const content = await fs.readFile(path.join(folderPath, file), 'utf-8');
                scripts[file] = content;
            }
        }
        return scripts;
    });

    ipcMain.handle('fs:selectFiles', async (_, options?: any) => {
        const result: any = await dialog.showOpenDialog(win, {
            properties: ['openFile', 'multiSelections'],
            filters: options?.filters || [{ name: 'C# Scripts', extensions: ['cs'] }]
        });

        const filePaths = result.filePaths || (Array.isArray(result) ? result : null);
        const canceled = result.canceled || (!filePaths);

        if (canceled || !filePaths || !filePaths.length) return null;

        const scripts: Record<string, string> = {};
        for (const filePath of filePaths) {
            const name = path.basename(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            scripts[name] = content;
        }
        return scripts;
    });

    ipcMain.handle('fs:readTextFile', async (_, filePath: string) => {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            return null;
        }
    });

    // SETTINGS IPC
    ipcMain.handle('settings:get-all', () => settings.get());
    ipcMain.handle('settings:set', (_, { key, value }: { key: any, value: any }) => {
        settings.set(key, value);
        return true;
    });

    // UPDATE IPC
    ipcMain.handle('update:check', () => updateManager.checkForUpdates());
    ipcMain.handle('update:download', () => updateManager.downloadUpdate());
    ipcMain.handle('update:quit-and-install', () => updateManager.quitAndInstall());
};

app.whenReady().then(() => {
    createWindow();

    // Auto-update check on startup (if enabled)
    const config = settings.get();
    if (config.autoUpdate && !isDev) {
        setTimeout(() => {
            updateManager.checkForUpdates();
        }, 3000); // 3-second delay to ensure UI is ready
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Ensure a clean exit even if sub-processes hang
app.on('before-quit', () => {
    ipcMain.removeAllListeners();
});

app.on('window-all-closed', () => {
    app.quit();
    // Force exit after a short delay if app.quit() is ignored by hanging processes
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});
