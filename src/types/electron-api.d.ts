import type { ElectronApi } from '@/lib/electron-api';

declare global {
    interface Window {
        electron?: ElectronApi;
    }
}

export {};
