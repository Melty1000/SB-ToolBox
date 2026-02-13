"use client";

import { useState } from 'react';
import { MeltShell } from '@/components/layout/MeltShell';
import { DecoderPage } from '@/components/pages/DecoderPage';
import { EncoderPage } from '@/components/pages/EncoderPage';
import { HelpPage } from '@/components/pages/HelpPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { SupportPage } from '@/components/pages/SupportPage';
import { HistoryPage } from '@/components/pages/HistoryPage';

export default function Home() {
    const [activePage, setActivePage] = useState('decoder');
    const [restoreData, setRestoreData] = useState<{ type: string, data: string } | null>(null);

    const handleRestore = (type: 'decode' | 'encode', data: string) => {
        setRestoreData({ type, data });
        // Fix: Map history type (verb) to page id (noun)
        const pageId = type === 'decode' ? 'decoder' : 'encoder';
        setActivePage(pageId);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'decoder': return <DecoderPage key={restoreData?.data} initialValue={restoreData?.type === 'decode' ? restoreData.data : undefined} />;
            case 'encoder': return <EncoderPage key={restoreData?.data} initialValue={restoreData?.type === 'encode' ? restoreData.data : undefined} />;
            case 'history': return <HistoryPage onRestore={handleRestore} />;
            case 'help': return <HelpPage />;
            case 'settings': return <SettingsPage />;
            case 'support': return <SupportPage />;
            default: return <DecoderPage />;
        }
    };

    return (
        <MeltShell activePage={activePage} setActivePage={setActivePage}>
            {renderPage()}
        </MeltShell>
    );
}
