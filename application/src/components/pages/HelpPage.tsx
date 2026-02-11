"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import {
    BookOpen, Workflow, FileJson, ShieldCheck, Layers, Terminal, ListTree, Variable, Code2,
    CheckCircle2, Info, AlertTriangle, ExternalLink,
    Zap, Hash, Box, FileText, Braces
} from 'lucide-react';
import { IndustrialStrip } from '@/components/ui/IndustrialStrip';

/**
 * HELP PAGE: Documentation & Command Guide
 * ---------------------------------------
 * This page uses the Melt Typography Standard for hierarchy.
 * Code highlights are synchronized with the global accent system.
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
                        Technical reference for the Streamer.bot SBAE format. Much of this information revolves specifically around the SB Encoder/Decoder toolset; it is intended as a companion guide and should not take the place of the official Streamer.bot documentation.
                    </p>
                </div>
            </div>

            {/* 1. OVERVIEW */}
            <Section
                icon={BookOpen}
                title="FORMAT OVERVIEW"
                description="Streamer.bot export strings (SBAE) are compressed JSON structures containing actions, commands, and C# scripts. This tool decodes them into editable formats and re-encodes them for import."
            />

            {/* 3. ROOT STRUCTURE */}
            <Section
                icon={FileJson}
                title="ROOT STRUCTURE"
                description="The fundamental JSON schema for a valid export file. It contains metadata about the export itself and a data object holding all the actual logic entities."
            >
                <IndustrialStrip label="VIEW JSON SCHEMA" icon={Braces}>
                    <div className="p-0">
                        <CodeBlock code={`{
  "meta": {
    "name": "Export Name",
    "author": "Author Name",
    "version": "1.0.0",
    "description": "Description"
  },
  "data": {
    "actions": [ ... ],
    "commands": [],
    "timers": [],
    "queues": [],
    "websocketServers": [],
    "websocketClients": []
  },
  "version": 23,
  "exportedFrom": "1.0.1",
  "minimumVersion": "1.0.0-alpha.1"
}`} />
                    </div>
                </IndustrialStrip>
            </Section>

            {/* 4. ENCODER REQUIREMENTS */}
            <Section
                icon={ShieldCheck}
                title="ENCODER REQUIREMENTS"
                description="Strict rules must be followed when constructing a valid export to ensure it imports correctly into Streamer.bot. Failure to adhere to these rules will result in a silent import failure or corrupt actions."
            >
                <IndustrialStrip label="VIEW VALIDATION RULES" icon={AlertTriangle}>
                    <div className="p-6 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <MetadataField label="Sub-Action Type" value="Target must be '99999' (C# Execute)" />
                            <MetadataField label="ByteCode Field" value="Must be filename (e.g. 'Script.cs')" />
                            <MetadataField label="Filenames" value="Must match extracted file exactly" />
                            <MetadataField label="UUIDs" value="Lowercase RFC4122 format only" />
                        </div>

                        <div className="flex items-start gap-4 p-4 border border-melt-accent/20 bg-transparent rounded-none">
                            <AlertTriangle className="text-melt-accent shrink-0 mt-0.5" size={16} />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-melt-accent uppercase tracking-widest">CRITICAL WARNING</span>
                                <span className="text-sm font-mono text-melt-text-label">
                                    Do not paste raw code into the "byteCode" field. The encoder injects code content automatically based on the filename reference.
                                </span>
                            </div>
                        </div>
                    </div>
                </IndustrialStrip>
            </Section>

            {/* 5. AUTO-LINKING */}
            <Section
                icon={Hash}
                title="AUTO-LINKING"
                description="The encoder automatically maps .cs files to valid sub-actions using hierarchical naming and Type 99999 validation."
            >
                <IndustrialStrip label="LINKING LOGIC & BREADCRUMBS" icon={ListTree}>
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-black text-melt-text-label uppercase tracking-widest">HIERARCHICAL MATCHING</span>
                            <p className="text-[10px] font-mono text-melt-text-label leading-relaxed">
                                The system scans for nodes with <span className="text-melt-accent">type: 99999</span>. It generates a breadcrumb path <span className="text-melt-accent">[Action] {" > "} [Sub-Action]</span> to help distinguish between duplicate names.
                            </p>
                        </div>
                    </div>
                </IndustrialStrip>
            </Section>

            {/* 7. TRIGGERS REFERENCE */}
            <Section
                icon={Terminal}
                title="TRIGGERS REFERENCE"
                description="Triggers define what events start an action. They are matched by Type ID and contain specific configuration fields like command IDs, twitch bits amounts, or chat message patterns."
            >
                <IndustrialStrip label="VIEW TRIGGER TYPES" icon={Zap}>
                    <div className="p-6 grid grid-cols-1 gap-6">
                        <StatRow label="Chat Message" value="Type 0" sub="exact, ignoreCase" />
                        <StatRow label="Twitch Bits" value="Type 26" sub="min, max" />
                        <StatRow label="Twitch Sub" value="Type 28" sub="tiers" />
                        <StatRow label="Command" value="Type 1" sub="commandId" />
                        <StatRow label="Timer" value="Type 43" sub="timerId" />
                    </div>
                </IndustrialStrip>
            </Section>

            {/* 10. EXAMPLE */}
            <Section
                icon={Code2}
                title="COMPLETE EXAMPLE JSON"
                description="A complete JSON structure demonstrating a simple 'Welcome' action that triggers on a chat message."
            >
                <IndustrialStrip label="VIEW EXAMPLE JSON" icon={FileText}>
                    <div className="p-0">
                        <CodeBlock code={`{
  "meta": { "name": "Welcome Action", "author": "Melty", "version": "1.0.0" },
  "data": {
    "actions": [{
      "id": "guid-lowercase",
      "name": "First Time Chatter",
      "group": "Chat",
      "enabled": true,
      "triggers": [{ "id": "trigger-guid", "type": 120, "enabled": true }],
      "subActions": [
        {
          "id": "sub-1",
          "type": 560,
          "text": "Welcome %userName%!"
        }
      ]
    }]
  }
}`} />
                    </div>
                </IndustrialStrip>
            </Section>

            {/* Footer Links */}
            <div className="pt-8 flex flex-wrap gap-4 px-2 pb-10">
                <LinkBtn label="Streamer.bot Website" href="https://streamer.bot" />
                <LinkBtn label="Streamerbot Docs" href="https://docs.streamer.bot" />
                <LinkBtn label="Streamerbot Discord" href="https://discord.gg/streamerbot" />
            </div>
        </div >
    );
}

// --- Components ---

function Section({ icon: Icon, title, description, children }: any) {
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
                    if (React.isValidElement(child) && child.type === IndustrialStrip) {
                        return React.cloneElement(child as React.ReactElement<any>, {
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

function StatRow({ label, value, sub }: any) {
    return (
        <div className="flex items-center justify-between border-b border-melt-text-muted/5 py-3 px-2">
            <span className="text-xs font-bold text-melt-text-label w-1/3 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-mono text-melt-text-body w-1/3">{value}</span>
            <span className="text-[10px] font-mono text-melt-text-muted/50 w-1/3 text-right uppercase tracking-wider">{sub}</span>
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

function CodeBlock({ code }: { code: string }) {
    const highlight = (code: string) => {
        return code.split('\n').map((line, i) => {
            const content = line.replace(
                /(".*?")(:)/g,
                `<span style="color:var(--melt-accent)">$1</span><span style="color:var(--melt-text-muted)">$2</span>`
            ).replace(
                /(:)\s(".*?")/g,
                `<span style="color:var(--melt-text-muted)">$1</span> <span style="color:var(--melt-text-body)">$2</span>`
            ).replace(
                /(:)\s(\d+|true|false|null|\[|\{)/g,
                `<span style="color:var(--melt-text-muted)">$1</span> <span style="color:#F472B6">$2</span>`
            );

            return (
                <div key={i} className="table-row">
                    <span className="table-cell select-none text-right pl-6 pr-4 text-melt-text-muted opacity-30 text-xs font-mono w-8 border-r border-melt-text-muted/10 bg-melt-void">{i + 1}</span>
                    <span className="table-cell pl-4 whitespace-pre-wrap text-melt-text-body opacity-80" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            )
        });
    };

    return (
        <div className="w-full h-auto overflow-hidden bg-melt-void font-mono text-[13px] leading-6 py-6 border-y border-melt-text-muted/10">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="table w-full">
                    {highlight(code)}
                </div>
            </div>
        </div>
    );
}

function LinkBtn({ label, href }: { label: string; href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-melt-accent/10 border border-melt-text-muted/10 hover:border-melt-accent/40 text-[10px] font-black text-melt-text-label hover:text-melt-accent uppercase tracking-[0.2em] transition-all active:scale-95"
        >
            {label}
            <ExternalLink size={12} className="opacity-50" />
        </a>
    );
}
