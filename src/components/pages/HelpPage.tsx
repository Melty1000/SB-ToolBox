"use client";

import React from 'react';
import {
    BookOpen, FileJson, ShieldCheck, ListTree, Variable, Code2,
    Info, AlertTriangle, ExternalLink, Braces, Workflow, type LucideIcon
} from 'lucide-react';
import { IndustrialStrip } from '@/components/ui/IndustrialStrip';
import { OBSERVED_SUBACTION_TYPES, OBSERVED_TRIGGER_TYPES, type ObservedIdTypeEntry } from '@/lib/observed-id-types';

/**
 * HELP PAGE
 * Tool-focused compatibility notes that stay aligned with official Streamer.bot documentation.
 */

export function HelpPage() {
    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500 pb-20">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 px-2 pt-0">
                <div className="flex items-center gap-3">
                    <Info size={18} className="text-melt-accent" />
                    <h2 className="text-sm font-black text-melt-text-label uppercase tracking-[0.4em]">HELP GUIDE</h2>
                </div>
                <div className="p-0 w-full max-w-4xl">
                    <p className="text-sm font-mono text-melt-text-label leading-relaxed text-left">
                        This is a tool-specific compatibility guide, not official Streamer.bot documentation.
                        Official docs are always the source of truth; this page explains how SB ToolBox maps to that model.
                    </p>
                </div>
            </div>

            <Section
                icon={BookOpen}
                title="FORMAT OVERVIEW"
                description="Streamer.bot imports/exports are transport strings generated from structured export data. SB ToolBox decodes import data for editing and re-encodes edited data back into an import string."
            >
                <IndustrialStrip label="OFFICIAL SCOPE" icon={Workflow}>
                    <div className="p-6 grid grid-cols-1 gap-4">
                        <StatRow
                            label="Export Includes"
                            value="Actions, Triggers, Action Queues, Commands, Timed Actions, WebSocket Clients/Servers"
                            sub="Guide > Import & Export"
                        />
                        <StatRow
                            label="Best Practice"
                            value="Use Streamer.bot docs for behavior rules and platform changes"
                            sub="Avoid hardcoded assumptions"
                        />
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={ShieldCheck}
                title="TOOL COMPATIBILITY (SB TOOLBOX)"
                description="These are app-specific rules for how this project currently processes exported data."
            >
                <IndustrialStrip label="HOW THIS APP HANDLES DATA" icon={ListTree}>
                    <div className="p-6 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <MetadataField label="Accepted Inputs" value="Streamer.bot import string or .sb text file" />
                            <MetadataField label="Root Variants" value="Supports Export/export and common Pascal/camel key variants" />
                            <MetadataField label="Script Decode" value="Decodes ByteCode/byteCode into .cs files and stores REF:<file>.cs pointers" />
                            <MetadataField label="Script Encode" value="Replaces REF pointers with base64 script payloads before export" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <MetadataField label="Auto-Link Heuristic" value="Matches script files to parsed sub-actions by action/sub-action naming" />
                            <MetadataField label="Current Script Marker" value="Script-capable nodes are currently keyed from internal type 99999 data" />
                            <MetadataField label="Field Preservation" value="Unknown fields are preserved unless script pointer fields are rewritten" />
                            <MetadataField label="Safety Rule" value="Always validate the final import inside Streamer.bot after export" />
                        </div>

                        <div className="flex items-start gap-4 p-4 border border-melt-accent/20 bg-transparent rounded-none">
                            <AlertTriangle className="text-melt-accent shrink-0 mt-0.5" size={16} />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-melt-accent uppercase tracking-widest">IMPORTANT</span>
                                <span className="text-sm font-mono text-melt-text-label">
                                    Internal IDs and payload contracts can shift between Streamer.bot versions.
                                    Use official docs for authoritative behavior details.
                                </span>
                            </div>
                        </div>
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={FileJson}
                title="ROOT JSON SHAPE (REPRESENTATIVE)"
                description="Representative structure for editing. Treat this as a working template, not a strict version-locked contract."
            >
                <IndustrialStrip label="VIEW REPRESENTATIVE SHAPE" icon={Braces}>
                    <div className="p-0">
                        <CodeBlock code={`{
  "meta": {
    "name": "Example Export",
    "author": "Creator",
    "version": "1.0.0",
    "description": "What this export does"
  },
  "data": {
    "actions": [
      {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "name": "Example Action",
        "group": "Examples",
        "enabled": true,
        "triggers": [
          {
            "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
            "type": "<use official Triggers API reference>",
            "enabled": true
          }
        ],
        "subActions": [
          {
            "id": "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
            "name": "Execute C#",
            "byteCode": "REF:ExampleScript.cs"
          }
        ]
      }
    ],
    "commands": [],
    "timedActions": [],
    "actionQueues": [],
    "webSocketClients": [],
    "webSocketServers": []
  }
}`} />
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={Variable}
                title="VARIABLE SYNTAX (OFFICIAL)"
                description="Variable behavior should follow official docs. SB ToolBox does not redefine variable semantics."
            >
                <IndustrialStrip label="LOCAL VS GLOBAL VARIABLES" icon={ListTree}>
                    <div className="p-6 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatRow label="%varName%" value="Action-scoped argument value" sub="Guide > Variables" />
                            <StatRow label="~persistedVar~" value="Direct persisted global variable syntax (official)" sub="Guide > Variables" />
                        </div>
                        <p className="text-[11px] font-mono text-melt-text-label leading-relaxed">
                            Official note: <span className="text-melt-accent">~var~</span> currently works for persisted globals,
                            but not user globals. For user globals, non-persisted globals, and full control, use the
                            official Get/Set Global Variable sub-actions.
                        </p>
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={ListTree}
                title="ID TABLE (OBSERVED DATA)"
                description="Observed IDs from your provided export corpus. Useful for compatibility testing in this tool, but not official authoritative mapping."
            >
                <IndustrialStrip label="TRIGGER TYPE IDS (OBSERVED)" icon={Workflow}>
                    <div className="p-6">
                        <IdTypeTable entries={OBSERVED_TRIGGER_TYPES} />
                    </div>
                </IndustrialStrip>

                <IndustrialStrip label="SUB-ACTION TYPE IDS (OBSERVED)" icon={Workflow}>
                    <div className="p-6">
                        <IdTypeTable entries={OBSERVED_SUBACTION_TYPES} />
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={Code2}
                title="TRIGGERS, SUB-ACTIONS, C# METHODS"
                description="Do not rely on hardcoded ID tables in this project for official behavior. Use Streamer.bot API references."
            >
                <IndustrialStrip label="OFFICIAL REFERENCE-FIRST WORKFLOW" icon={Workflow}>
                    <div className="p-6 grid grid-cols-1 gap-4">
                        <StatRow label="Triggers" value="Use API reference list for current trigger definitions" sub="docs.streamer.bot/api/triggers" />
                        <StatRow label="Sub-Actions" value="Use API reference list for current sub-action definitions" sub="docs.streamer.bot/api/sub-actions" />
                        <StatRow label="Sub-Action Numeric IDs" value="Published in Raw.SubAction schema enum (SubActionType)" sub="docs.streamer.bot/api/websocket/events/raw/sub-action" />
                        <StatRow label="Trigger Numeric IDs" value="No single canonical TriggerType enum page; validate against official trigger refs + real exports" sub="docs.streamer.bot/api/triggers" />
                        <StatRow label="C# Methods" value="Use C# methods reference for up-to-date method contracts" sub="docs.streamer.bot/api/csharp/methods" />
                    </div>
                </IndustrialStrip>
            </Section>

            <Section
                icon={ListTree}
                title="SAFE APP WORKFLOW"
                description="Recommended process for reliable exports from this tool."
            >
                <IndustrialStrip label="CHECKLIST" icon={ShieldCheck}>
                    <div className="p-6 grid grid-cols-1 gap-4">
                        <StatRow label="1. Decode" value="Load import string or .sb and inspect extracted scripts" sub="Verify metadata and groups" />
                        <StatRow label="2. Edit" value="Adjust JSON and script files with minimal structural drift" sub="Preserve IDs where possible" />
                        <StatRow label="3. Link" value="Confirm script-to-action mapping before encode" sub="Auto-link is heuristic" />
                        <StatRow label="4. Encode" value="Export .sb file or import string from this app" sub="Reinjection occurs at encode" />
                        <StatRow label="5. Validate" value="Import into Streamer.bot and test trigger/sub-action behavior" sub="Official runtime is final check" />
                    </div>
                </IndustrialStrip>
            </Section>

            {/* Footer Links */}
            <div className="pt-8 flex flex-wrap gap-4 px-2 pb-10">
                <LinkBtn label="Import & Export Guide" href="https://docs.streamer.bot/guide/import-export" />
                <LinkBtn label="Variables Guide" href="https://docs.streamer.bot/guide/variables" />
                <LinkBtn label="Triggers API Reference" href="https://docs.streamer.bot/api/triggers" />
                <LinkBtn label="Sub-Actions API Reference" href="https://docs.streamer.bot/api/sub-actions" />
                <LinkBtn label="Raw.SubAction Schema" href="https://docs.streamer.bot/api/websocket/events/raw/sub-action" />
                <LinkBtn label="C# Methods Reference" href="https://docs.streamer.bot/api/csharp/methods" />
            </div>
        </div >
    );
}

// --- Components ---

interface SectionProps {
    icon: LucideIcon;
    title: string;
    description: string;
    children?: React.ReactNode;
}

function Section({ icon: Icon, title, description, children }: SectionProps) {
    return (
        <div className="flex flex-col gap-6 py-8 border-0">
            <div className="flex flex-col items-start px-0">
                <div className="flex items-center gap-3 mb-2 w-full">
                    <Icon size={18} className="text-melt-accent" />
                    <h2 className="text-xs font-black text-melt-text-label uppercase tracking-[0.3em]">{title}</h2>
                    <div className="h-[1px] flex-1 bg-melt-text-muted/10 ml-4" />
                </div>
                <div className="w-full max-w-4xl">
                    <p className="text-sm font-mono text-melt-text-label leading-relaxed text-left">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mx-auto w-full">
                {React.Children.map(children, child => {
                    if (
                        React.isValidElement<{ labelClassName?: string; disableAutoscroll?: boolean }>(child) &&
                        child.type === IndustrialStrip
                    ) {
                        return React.cloneElement(child, {
                            labelClassName: "text-[10px] font-black uppercase tracking-[0.2em] opacity-60",
                            disableAutoscroll: true
                        });
                    }
                    return child;
                })}
            </div>
        </div >
    );
}

interface StatRowProps {
    label: string;
    value: string;
    sub: string;
}

function StatRow({ label, value, sub }: StatRowProps) {
    return (
        <div className="flex items-center justify-between border-b border-melt-text-muted/5 py-3 px-2 gap-4">
            <span className="text-xs font-bold text-melt-text-label min-w-[160px] uppercase tracking-wide">{label}</span>
            <span className="text-sm font-mono text-melt-text-body flex-1">{value}</span>
            <span className="text-[10px] font-mono text-melt-text-muted/50 min-w-[220px] text-right uppercase tracking-wider">{sub}</span>
        </div>
    );
}

function MetadataField({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-melt-text-label uppercase tracking-[0.3em]">
                {label}
            </label>
            <span className="text-sm font-mono text-melt-text-label leading-relaxed border-b border-melt-text-muted/10 py-1">
                {String(value)}
            </span>
        </div>
    );
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
    return (
        <div
            className="w-full h-[400px] pl-[20px] bg-transparent relative group select-none"
            aria-hidden={false}
        >
            <div className="w-full h-full overflow-auto custom-scrollbar border-b border-melt-text-muted/10">
                <pre className="min-h-full p-4 text-[11px] leading-relaxed font-mono text-melt-text-label whitespace-pre bg-transparent">
                    <code className={`language-${language}`}>{code}</code>
                </pre>
            </div>
        </div>
    );
}

function LinkBtn({ label, href }: { label: string; href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative h-11 min-w-[240px] px-4 flex items-center justify-between text-[10px] font-black text-melt-text-label uppercase tracking-[0.22em] transition-colors duration-300 hover:text-melt-text-heading focus-visible:outline-none"
        >
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-melt-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <span className="truncate pr-3">{label}</span>
            <ExternalLink size={11} className="shrink-0 text-melt-accent" />
        </a>
    );
}

function IdTypeTable({ entries }: { entries: readonly ObservedIdTypeEntry[] }) {
    const rows: Array<[ObservedIdTypeEntry, ObservedIdTypeEntry | null]> = [];
    for (let i = 0; i < entries.length; i += 2) {
        rows.push([entries[i], entries[i + 1] ?? null]);
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
                <thead>
                    <tr className="border-b border-melt-text-muted/15">
                        <th className="py-2 pr-4 text-left text-[10px] font-black text-melt-text-muted uppercase tracking-[0.2em]">ID</th>
                        <th className="py-2 pr-6 text-left text-[10px] font-black text-melt-text-muted uppercase tracking-[0.2em]">Name</th>
                        <th className="py-2 pr-4 text-left text-[10px] font-black text-melt-text-muted uppercase tracking-[0.2em]">ID</th>
                        <th className="py-2 text-left text-[10px] font-black text-melt-text-muted uppercase tracking-[0.2em]">Name</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([left, right]) => (
                        <tr key={`${left.id}-${right?.id ?? 'none'}`} className="border-b border-melt-text-muted/8">
                            <td className="py-2 pr-4 text-[11px] font-mono text-melt-text-label">{left.id}</td>
                            <td className="py-2 pr-6 text-[11px] font-mono text-melt-text-body">{left.name}</td>
                            <td className="py-2 pr-4 text-[11px] font-mono text-melt-text-label">{right?.id ?? ''}</td>
                            <td className="py-2 text-[11px] font-mono text-melt-text-body">{right?.name ?? ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
