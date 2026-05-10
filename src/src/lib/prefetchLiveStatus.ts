/**
 * Prefetch Twitch live status for all known handles on app startup.
 * Results are stored in sessionStorage so the Support page can
 * render with the correct sort order immediately.
 */

const ALL_HANDLES = [
    // Inspirations
    'tawmae', 'gaellevel', 'web_mage', 'vrflad', 'gowman',
    'mustached_maniac', 'nutty', 'digivybe', 'andilippi',
    'codewithtd', 'osuphoenix',
    // Community
    'tattedtizzy', 'okv1sual', 'archurro_27', 'leftclicksnipe',
    'miltythegreat', 'imcoleymoley', 'yothatscarter'
];

async function checkHandle(handle: string): Promise<boolean> {
    try {
        const resp = await fetch(
            `https://static-cdn.jtvnw.net/previews-ttv/live_user_${handle}-440x248.jpg?t=${Date.now()}`,
            { method: 'GET', cache: 'no-cache' }
        );
        return resp.ok && !resp.url.includes('404_preview');
    } catch {
        return false;
    }
}

export async function prefetchLiveStatus() {
    // Skip if already cached this session
    if (sessionStorage.getItem('melt-live-handles')) return;

    const results = await Promise.allSettled(
        ALL_HANDLES.map(async (handle) => ({
            handle,
            live: await checkHandle(handle)
        }))
    );

    const liveSet: string[] = [];
    for (const r of results) {
        if (r.status === 'fulfilled' && r.value.live) {
            liveSet.push(r.value.handle);
        }
    }

    try {
        sessionStorage.setItem('melt-live-handles', JSON.stringify(liveSet));
    } catch { }
}
