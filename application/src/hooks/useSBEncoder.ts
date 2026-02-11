"use client";

import { useState, useCallback } from 'react';
import pako from 'pako';

export interface SBExportData {
    name?: string;
    version?: string;
    description?: string;
    author?: string;
    [key: string]: any;
}

export interface SBStats {
    actions: number;
    subActions: number;
    scripts: number;
    triggers: number;
    commands: number;
    timedActions: number;
    queues: number;
    groups: number;
    wsServers: number;
    wsClients: number;
}

export interface SBActionInfo {
    id: string;
    name: string;
}

export const useSBEncoder = () => {
    const [decodedData, setDecodedData] = useState<SBExportData | null>(null);
    const [extractedScripts, setExtractedScripts] = useState<Record<string, string>>({});
    const [availableActions, setAvailableActions] = useState<SBActionInfo[]>([]);
    const [stats, setStats] = useState<SBStats>({
        actions: 0, subActions: 0, scripts: 0, triggers: 0,
        commands: 0, timedActions: 0, queues: 0, wsServers: 0,
        wsClients: 0, groups: 0
    });
    const [error, setError] = useState<string | null>(null);


    const extractAvailableActions = useCallback((obj: any): SBActionInfo[] => {
        const actions: SBActionInfo[] = [];
        const scan = (current: any, parentName: string | null = null) => {
            if (typeof current === 'object' && current !== null) {
                // If this is a container action, capture its name for breadcrumbs
                const currentName = current.name || '';
                const isActionContainer = !!current.subActions;

                // VALID TARGET: Must be Type 99999 (Execute C# Code)
                if (current.type === 99999 && current.id) {
                    const displayName = parentName && parentName !== current.name
                        ? `${parentName} > ${current.name}`
                        : current.name;

                    actions.push({
                        id: String(current.id),
                        name: displayName || 'Unnamed Action'
                    });
                }

                for (const key in current) {
                    // Pass down action name to sub-actions for breadcrumbs
                    scan(current[key], isActionContainer ? currentName : parentName);
                }
            }
        };
        scan(obj);
        return actions;
    }, []);

    const getStats = useCallback((data: any, scriptCount: number): SBStats => {
        if (!data) return {
            actions: 0, subActions: 0, scripts: 0, triggers: 0,
            commands: 0, timedActions: 0, queues: 0, wsServers: 0,
            wsClients: 0, groups: 0
        };
        const root = data.data || data;
        if (!root) return {
            actions: 0, subActions: 0, scripts: 0, triggers: 0,
            commands: 0, timedActions: 0, queues: 0, wsServers: 0,
            wsClients: 0, groups: 0
        };
        let actions = 0;
        let triggers = 0;
        let subActions = 0;

        const commands = (root.commands || []).length || 0;
        const timedActions = (root.timedActions || root.timers || []).length || 0;
        const queues = (root.actionQueues || root.queues || []).length || 0;
        const wsServers = (root.webSocketServers || root.websocketServers || []).length || 0;
        const wsClients = (root.webSocketClients || root.websocketClients || []).length || 0;
        const groupSet = new Set<string>();

        if (root.actions) {
            actions = root.actions.length;
            root.actions.forEach((a: any) => {
                if (a && typeof a === 'object') {
                    if (a.group) groupSet.add(String(a.group));
                    if (a.triggers) triggers += (a.triggers.length || 0);

                    const countSubs = (subs: any[]) => {
                        if (!subs) return;
                        subActions += subs.length;
                        subs.forEach(s => {
                            if (s && s.subActions) countSubs(s.subActions);
                        });
                    };
                    if (a.subActions) countSubs(a.subActions);
                }
            });
        } else if (root.id && root.name) {
            actions = 1;
        }

        return {
            actions,
            triggers,
            subActions,
            scripts: scriptCount,
            commands,
            timedActions,
            queues,
            wsServers,
            wsClients,
            groups: Math.max(root.groups?.length || 0, groupSet.size)
        };
    }, []);

    const calculateStats = useCallback((data: any, scriptCount: number) => {
        setStats(getStats(data, scriptCount));
    }, [getStats]);

    const normalizeError = (e: any, fallback: string): Error => {
        if (e instanceof Error) return e;
        let msg = fallback;
        try {
            msg = typeof e === 'object' ? `${fallback}: ${JSON.stringify(e)}` : String(e);
        } catch (err) {
            msg = `${fallback} (unserializable error context)`;
        }
        const error = new Error(msg);
        (error as any).raw = e;
        return error;
    };

    const decode = useCallback((raw: string) => {
        setError(null);
        try {
            const trimmed = raw.trim();
            if (!trimmed) throw new Error("Input is empty");

            let base64 = trimmed;
            if (trimmed.startsWith('SBAE')) {
                base64 = trimmed.substring(4);
            }

            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            let binData: Uint8Array;
            try {
                const compressedStr = atob(base64);
                const charData = compressedStr.split('').map(x => x.charCodeAt(0));
                binData = new Uint8Array(charData);
            } catch (e) {
                throw new Error("Invalid Base64 encoding - check for truncation or corruption");
            }

            if (binData[0] === 83 && binData[1] === 66 && binData[2] === 65 && binData[3] === 69) {
                binData = binData.slice(4);
            }

            if (binData[0] !== 0x1f || binData[1] !== 0x8b) {
                throw new Error("Invalid SBAE format: Missing GZIP compression header (0x1f 0x8b)");
            }

            let jsonStr: string;
            try {
                jsonStr = pako.ungzip(binData, { to: 'string' });
            } catch (e) {
                throw new Error("GZIP Decompression failed - content may be corrupted");
            }

            let data: any;
            try {
                data = JSON.parse(jsonStr);
            } catch (e) {
                throw new Error("Malformed JSON content inside export");
            }

            const scripts: Record<string, string> = {};
            let scriptCount = 0;

            const extractRecursive = (obj: any) => {
                try {
                    if (typeof obj === 'object' && obj !== null) {
                        if (obj.byteCode && typeof obj.byteCode === 'string' && !obj.byteCode.startsWith('REF:')) {
                            try {
                                const binary = atob(obj.byteCode);
                                const bytes = new Uint8Array(binary.length);
                                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                                const code = new TextDecoder().decode(bytes);

                                const nameBase = (obj.name || `script`).replace(/[^a-zA-Z0-9 _#[\]-]/g, '').replace(/\s+/g, ' ').trim();
                                let name = nameBase + '.cs';
                                let counter = 1;
                                while (scripts[name]) {
                                    name = `${nameBase}_${counter++}.cs`;
                                }

                                scripts[name] = code;
                                obj.byteCode = `REF:${name}`;
                                obj.__ext_name = name;
                                scriptCount++;
                            } catch (e) {
                                console.warn("EXTRACT_SCRIPT_FAIL:", e);
                            }
                        }
                        for (const key in obj) {
                            if (key !== '__ext_name') extractRecursive(obj[key]);
                        }
                    }
                } catch (e) {
                    console.error("EXTRACT_RECURSIVE_FAIL:", e);
                }
            };

            extractRecursive(data);
            setDecodedData(data);
            setAvailableActions(extractAvailableActions(data));
            setExtractedScripts(scripts);

            const calculatedStats = getStats(data, scriptCount);
            setStats(calculatedStats);

            return { data, stats: calculatedStats };
        } catch (e: any) {
            const normalized = normalizeError(e, 'Decoding failed');
            console.log('%c[DECODE_HOOK_REJECTION]', 'color: #f66; font-weight: bold', normalized);
            setError(normalized.message);
            return null;
        }
    }, [getStats, extractAvailableActions]);

    const encode = useCallback((data: SBExportData, scripts: Record<string, string> = {}, linkMap: Record<string, string> = {}) => {
        try {
            const obj = JSON.parse(JSON.stringify(data));

            const injectRecursive = (current: any) => {
                try {
                    if (typeof current === 'object' && current !== null) {
                        let injected = false;

                        if (current.byteCode && typeof current.byteCode === 'string' && current.byteCode.startsWith('REF:')) {
                            const refName = current.byteCode.substring(4);
                            const code = scripts[refName];
                            if (code) {
                                try {
                                    const utf8Bytes = new TextEncoder().encode(code);
                                    const binary = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
                                    current.byteCode = btoa(binary);
                                    injected = true;
                                } catch (e) {
                                    console.warn("INJECT_SCRIPT_FAIL (btoa):", e);
                                }
                            }
                        }

                        if (!injected && current.id && Object.values(linkMap).includes(current.id)) {
                            const scriptName = Object.keys(linkMap).find(key => linkMap[key] === current.id);
                            if (scriptName && scripts[scriptName]) {
                                try {
                                    const utf8Bytes = new TextEncoder().encode(scripts[scriptName]);
                                    const binary = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
                                    current.byteCode = btoa(binary);
                                } catch (e) {
                                    console.warn("INJECT_SCRIPT_LINK_FAIL (btoa):", e);
                                }
                            }
                        }

                        delete current.__ext_name;
                        for (const key in current) injectRecursive(current[key]);
                    }
                } catch (e) {
                    console.error("INJECT_RECURSIVE_FAIL:", e);
                }
            };

            injectRecursive(obj);
            const jsonStr = JSON.stringify(obj);
            const compressed = pako.gzip(jsonStr);
            const header = new TextEncoder().encode('SBAE');
            const finalData = new Uint8Array(header.length + compressed.length);
            finalData.set(header);
            finalData.set(compressed, header.length);

            const finalBinary = Array.from(finalData).map(b => String.fromCharCode(b)).join('');
            return btoa(finalBinary);
        } catch (e: any) {
            const normalized = normalizeError(e, 'Encoding failed');
            console.log('%c[ENCODE_HOOK_REJECTION]', 'color: #f66; font-weight: bold', normalized);
            setError(normalized.message);
            return null;
        }
    }, []);

    const parseActions = useCallback((json: string) => {
        try {
            const data = JSON.parse(json);
            setAvailableActions(extractAvailableActions(data));
            return true;
        } catch (e) {
            return false;
        }
    }, [extractAvailableActions]);

    const updateStats = useCallback((data: any) => {
        calculateStats(data, Object.keys(extractedScripts).length);
    }, [calculateStats, extractedScripts]);

    return {
        decodedData,
        extractedScripts,
        availableActions,
        stats,
        error,
        decode,
        encode,
        setDecodedData,
        setExtractedScripts,
        parseActions,
        updateStats
    };
};
