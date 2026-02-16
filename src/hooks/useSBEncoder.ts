"use client";

import { useState, useCallback } from 'react';
import pako from 'pako';

type JsonObject = Record<string, unknown>;

const EMPTY_STATS: SBStats = {
    actions: 0,
    subActions: 0,
    scripts: 0,
    triggers: 0,
    commands: 0,
    timedActions: 0,
    queues: 0,
    groups: 0,
    wsServers: 0,
    wsClients: 0,
};

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null;

const getFirstArray = (parent: JsonObject, ...keys: string[]): unknown[] => {
    for (const key of keys) {
        const value = parent[key];
        if (Array.isArray(value)) return value;
    }
    return [];
};

const getFirstString = (parent: JsonObject, ...keys: string[]): string | null => {
    for (const key of keys) {
        const value = parent[key];
        if (typeof value === 'string') return value;
    }
    return null;
};

const normalizeError = (error: unknown, fallback: string): Error => {
    if (error instanceof Error) return error;

    let message = fallback;
    try {
        message = typeof error === 'object' ? `${fallback}: ${JSON.stringify(error)}` : String(error);
    } catch {
        message = `${fallback} (unserializable error context)`;
    }

    const normalized = new Error(message);
    (normalized as Error & { raw?: unknown }).raw = error;
    return normalized;
};

const toBase64Utf8 = (content: string) => {
    const utf8Bytes = new TextEncoder().encode(content);
    let binary = '';
    utf8Bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
};

export interface SBExportData {
    name?: string;
    version?: string;
    description?: string;
    author?: string;
    [key: string]: unknown;
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

export interface DecodeResult {
    data: SBExportData;
    stats: SBStats;
}

export const useSBEncoder = () => {
    const [decodedData, setDecodedData] = useState<SBExportData | null>(null);
    const [extractedScripts, setExtractedScripts] = useState<Record<string, string>>({});
    const [availableActions, setAvailableActions] = useState<SBActionInfo[]>([]);
    const [stats, setStats] = useState<SBStats>(EMPTY_STATS);
    const [error, setError] = useState<string | null>(null);

    const extractAvailableActions = useCallback((obj: unknown): SBActionInfo[] => {
        const actions: SBActionInfo[] = [];

        const scan = (current: unknown, parentName: string | null = null) => {
            if (!isObject(current)) return;

            const currentName = getFirstString(current, 'name', 'Name') || '';
            const isActionContainer =
                Array.isArray(current.subActions) || Array.isArray(current.SubActions);
            const currentType = current.type ?? current.Type;
            const numericType = typeof currentType === 'number' ? currentType : Number(currentType);
            const currentId = current.id ?? current.Id;
            const currentActionName = currentName;

            if (numericType === 99999 && currentId !== undefined && currentId !== null) {
                const displayName = parentName && parentName !== currentActionName
                    ? `${parentName} > ${currentActionName}`
                    : currentActionName;

                actions.push({
                    id: String(currentId),
                    name: displayName || 'Unnamed Action'
                });
            }

            for (const key of Object.keys(current)) {
                scan(current[key], isActionContainer ? currentName : parentName);
            }
        };

        scan(obj);
        return actions;
    }, []);

    const getStats = useCallback((data: unknown, scriptCount: number): SBStats => {
        if (!isObject(data)) {
            return { ...EMPTY_STATS, scripts: scriptCount };
        }

        const exportRootUnknown = data.Export ?? data.export ?? data;
        if (!isObject(exportRootUnknown)) {
            return { ...EMPTY_STATS, scripts: scriptCount };
        }

        const rootUnknown = exportRootUnknown.data ?? exportRootUnknown;
        if (!isObject(rootUnknown)) {
            return { ...EMPTY_STATS, scripts: scriptCount };
        }

        let actions = 0;
        let triggers = 0;
        let subActions = 0;

        const commandList = getFirstArray(rootUnknown, 'Commands', 'commands');
        const timedActionList = getFirstArray(rootUnknown, 'TimedActions', 'Timers', 'timedActions', 'timers');
        const queueList = getFirstArray(rootUnknown, 'ActionQueues', 'Queues', 'actionQueues', 'queues');
        const wsServerList = getFirstArray(rootUnknown, 'WebSocketServers', 'webSocketServers', 'websocketServers');
        const wsClientList = getFirstArray(rootUnknown, 'WebSocketClients', 'webSocketClients', 'websocketClients');
        const actionList = getFirstArray(rootUnknown, 'Actions', 'actions');
        const groupList = getFirstArray(rootUnknown, 'Groups', 'groups');

        const groupSet = new Set<string>();

        const countSubActions = (subs: unknown[]) => {
            subActions += subs.length;
            for (const sub of subs) {
                if (!isObject(sub)) continue;
                const nestedSubs = sub.SubActions ?? sub.subActions;
                if (Array.isArray(nestedSubs)) {
                    countSubActions(nestedSubs);
                }
            }
        };

        if (actionList.length > 0) {
            actions = actionList.length;

            for (const action of actionList) {
                if (!isObject(action)) continue;

                const groupValue = action.Group ?? action.group;
                if (groupValue !== undefined && groupValue !== null) {
                    groupSet.add(String(groupValue));
                }

                const actionTriggers = action.Triggers ?? action.triggers;
                if (Array.isArray(actionTriggers)) {
                    triggers += actionTriggers.length;
                }

                const actionSubs = action.SubActions ?? action.subActions;
                if (Array.isArray(actionSubs)) {
                    countSubActions(actionSubs);
                }
            }
        } else if ((rootUnknown.Id || rootUnknown.id) && (rootUnknown.Name || rootUnknown.name)) {
            // Single Action export
            actions = 1;
        }

        return {
            actions,
            triggers,
            subActions,
            scripts: scriptCount,
            commands: commandList.length,
            timedActions: timedActionList.length,
            queues: queueList.length,
            wsServers: wsServerList.length,
            wsClients: wsClientList.length,
            groups: Math.max(groupList.length, groupSet.size)
        };
    }, []);

    const calculateStats = useCallback((data: unknown, scriptCount: number) => {
        setStats(getStats(data, scriptCount));
    }, [getStats]);

    const decode = useCallback((raw: string): DecodeResult | null => {
        setError(null);

        try {
            const trimmed = raw.trim();
            if (!trimmed) throw new Error("Input is empty");

            let base64 = trimmed;
            if (trimmed.startsWith('SBAE')) {
                base64 = trimmed.substring(4);
            }

            // Imported strings are often wrapped or line-broken; normalize first.
            base64 = base64.replace(/\s+/g, '');
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            let binData: Uint8Array;
            try {
                const compressedStr = atob(base64);
                const charData = compressedStr.split('').map((x) => x.charCodeAt(0));
                binData = new Uint8Array(charData);
            } catch {
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
            } catch {
                throw new Error("GZIP Decompression failed - content may be corrupted");
            }

            let parsedData: unknown;
            try {
                parsedData = JSON.parse(jsonStr);
            } catch {
                throw new Error("Malformed JSON content inside export");
            }

            const data: SBExportData = isObject(parsedData) ? parsedData : { value: parsedData };
            const scripts: Record<string, string> = {};
            let scriptCount = 0;

            const extractRecursive = (obj: unknown, parentName: string | null = null) => {
                if (!isObject(obj)) return;

                try {
                    const currentName = getFirstString(obj, 'Name', 'name') || parentName;
                    const byteCode = getFirstString(obj, 'ByteCode', 'byteCode');

                    if (byteCode && !byteCode.startsWith('REF:')) {
                        try {
                            const binary = atob(byteCode);
                            const bytes = new Uint8Array(binary.length);
                            for (let i = 0; i < binary.length; i++) {
                                bytes[i] = binary.charCodeAt(i);
                            }
                            const code = new TextDecoder().decode(bytes);

                            const sanitize = (value: string) =>
                                String(value).replace(/[^a-zA-Z0-9 _#[\]-]/g, '').replace(/\s+/g, ' ').trim();

                            const rawName = getFirstString(obj, 'Name', 'name') || 'script';
                            const leafName = sanitize(rawName);
                            const nameBase = (parentName && parentName !== rawName)
                                ? `${sanitize(parentName)} - ${leafName}`
                                : leafName;

                            let name = `${nameBase}.cs`;
                            let counter = 1;
                            while (scripts[name]) {
                                name = `${nameBase}_${counter++}.cs`;
                            }

                            scripts[name] = code;

                            if (typeof obj.ByteCode === 'string') {
                                obj.ByteCode = `REF:${name}`;
                            } else {
                                obj.byteCode = `REF:${name}`;
                            }

                            obj.__ext_name = name;
                            scriptCount += 1;
                        } catch (scriptError) {
                            console.warn("EXTRACT_SCRIPT_FAIL:", scriptError);
                        }
                    }

                    for (const key of Object.keys(obj)) {
                        if (key !== '__ext_name') {
                            extractRecursive(obj[key], currentName);
                        }
                    }
                } catch (recursiveError) {
                    console.error("EXTRACT_RECURSIVE_FAIL:", recursiveError);
                }
            };

            extractRecursive(data);
            setDecodedData(data);
            setAvailableActions(extractAvailableActions(data));
            setExtractedScripts(scripts);

            const calculatedStats = getStats(data, scriptCount);
            setStats(calculatedStats);

            return { data, stats: calculatedStats };
        } catch (decodeError: unknown) {
            const normalized = normalizeError(decodeError, 'Decoding failed');
            console.log('%c[DECODE_HOOK_REJECTION]', 'color: #f66; font-weight: bold', normalized);
            setError(normalized.message);
            return null;
        }
    }, [extractAvailableActions, getStats]);

    const encode = useCallback((
        data: SBExportData,
        scripts: Record<string, string> = {},
        linkMap: Record<string, string> = {}
    ) => {
        try {
            const obj = JSON.parse(JSON.stringify(data)) as unknown;
            const linkedActionIds = new Set(Object.values(linkMap));

            const injectRecursive = (current: unknown) => {
                if (!isObject(current)) return;

                try {
                    let injected = false;

                    const byteCodeKey: 'ByteCode' | 'byteCode' | null =
                        typeof current.ByteCode === 'string'
                            ? 'ByteCode'
                            : typeof current.byteCode === 'string'
                                ? 'byteCode'
                                : null;
                    const byteCodeValue = byteCodeKey ? String(current[byteCodeKey]) : null;

                    if (byteCodeKey && byteCodeValue && byteCodeValue.startsWith('REF:')) {
                        const refName = byteCodeValue.substring(4);
                        const code = scripts[refName];
                        if (typeof code === 'string') {
                            try {
                                current[byteCodeKey] = toBase64Utf8(code);
                                injected = true;
                            } catch (injectError) {
                                console.warn("INJECT_SCRIPT_FAIL (btoa):", injectError);
                            }
                        }
                    }

                    const currentId = String(current.id ?? current.Id ?? '');
                    if (!injected && currentId && linkedActionIds.has(currentId)) {
                        const scriptName = Object.keys(linkMap).find((key) => linkMap[key] === currentId);
                        if (scriptName && scripts[scriptName]) {
                            try {
                                const writeKey = byteCodeKey || ('ByteCode' in current ? 'ByteCode' : 'byteCode');
                                current[writeKey] = toBase64Utf8(scripts[scriptName]);
                            } catch (injectLinkError) {
                                console.warn("INJECT_SCRIPT_LINK_FAIL (btoa):", injectLinkError);
                            }
                        }
                    }

                    delete current.__ext_name;

                    for (const key of Object.keys(current)) {
                        injectRecursive(current[key]);
                    }
                } catch (recursiveError) {
                    console.error("INJECT_RECURSIVE_FAIL:", recursiveError);
                }
            };

            injectRecursive(obj);

            const jsonStr = JSON.stringify(obj);
            const compressed = pako.gzip(jsonStr);
            const header = new TextEncoder().encode('SBAE');
            const finalData = new Uint8Array(header.length + compressed.length);
            finalData.set(header);
            finalData.set(compressed, header.length);

            let finalBinary = '';
            finalData.forEach((byte) => {
                finalBinary += String.fromCharCode(byte);
            });

            return btoa(finalBinary);
        } catch (encodeError: unknown) {
            const normalized = normalizeError(encodeError, 'Encoding failed');
            console.log('%c[ENCODE_HOOK_REJECTION]', 'color: #f66; font-weight: bold', normalized);
            setError(normalized.message);
            return null;
        }
    }, []);

    const parseActions = useCallback((json: string) => {
        try {
            const data = JSON.parse(json) as unknown;
            setAvailableActions(extractAvailableActions(data));
            return true;
        } catch {
            return false;
        }
    }, [extractAvailableActions]);

    const updateStats = useCallback((data: unknown) => {
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
