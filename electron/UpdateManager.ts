import { autoUpdater, type ProgressInfo, UpdateInfo } from 'electron-updater';
import { BrowserWindow } from 'electron';

type UpdateChannelPayloadMap = {
    'update:available': string;
    'update:download-progress': number;
    'update:ready': string;
    'update:status': 'checking' | 'uptodate';
    'update:error': string;
};

export class UpdateManager {
    private mainWindow: BrowserWindow | null = null;
    private isChecking = false;

    constructor() {
        this.setupListeners();
    }

    public setWindow(win: BrowserWindow) {
        this.mainWindow = win;
    }

    public setAutoDownload(enabled: boolean) {
        autoUpdater.autoDownload = enabled;
    }

    private setupListeners() {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;

        autoUpdater.on('checking-for-update', () => {
            console.log('[Updater] Checking for updates...');
            this.pulse('update:status', 'checking');
        });

        autoUpdater.on('update-available', (info: UpdateInfo) => {
            console.log('[Updater] Update available:', info.version);
            this.pulse('update:available', info.version);
        });

        autoUpdater.on('update-not-available', () => {
            console.log('[Updater] Up to date.');
            this.pulse('update:status', 'uptodate');
        });

        autoUpdater.on('error', (err: Error) => {
            console.error('[Updater] Error:', err);
            this.pulse('update:error', err.message);
        });

        autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
            this.pulse('update:download-progress', progressObj.percent);
        });

        autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
            console.log('[Updater] Update downloaded:', info.version);
            this.pulse('update:ready', info.version);
        });
    }

    public async checkForUpdates() {
        if (this.isChecking) return;
        this.isChecking = true;
        try {
            await autoUpdater.checkForUpdates();
        } catch (e) {
            console.error('[Updater] Check failed:', e);
        } finally {
            this.isChecking = false;
        }
    }

    public async downloadUpdate() {
        try {
            await autoUpdater.downloadUpdate();
        } catch (e) {
            console.error('[Updater] Download failed:', e);
        }
    }

    public quitAndInstall() {
        autoUpdater.quitAndInstall();
    }

    private pulse<K extends keyof UpdateChannelPayloadMap>(channel: K, data: UpdateChannelPayloadMap[K]) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, data);
        }
    }
}
