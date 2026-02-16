import type { Metadata } from "next";
import "./globals.css";
import { MonacoProvider } from "@/providers/MonacoProvider";
import { withBasePath } from "@/lib/paths";

const appIconPath = withBasePath("/assets/icon.png");
const logoCollapsedPath = withBasePath("/assets/logo-collapsed.svg");
const streamerbotLogoPath = withBasePath("/assets/streamerbot-logo.svg");

export const metadata: Metadata = {
  title: {
    template: "SB ToolBox // %s",
    default: "SB ToolBox // DECODER"
  },
  description: "Modern Streamer.bot export tool",
  icons: {
    icon: appIconPath,
    shortcut: appIconPath,
    apple: appIconPath,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href={logoCollapsedPath} as="image" type="image/svg+xml" />
        <link rel="preload" href={streamerbotLogoPath} as="image" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var key = 'melt-theme';
              var choiceKey = 'melt-theme-user-selected';
              var fallback = 'graphite-gold';
              var legacy = 'graphite-cobalt';
              var allowed = {
                'graphite-gold': true,
                'graphite-cobalt': true,
                'slate-gold': true,
                'slate-cobalt': true
              };

              var theme = localStorage.getItem(key);
              var choiceRaw = localStorage.getItem(choiceKey);
              var userSelected = choiceRaw === '1' || choiceRaw === 'true';

              if (!allowed[theme]) {
                theme = null;
              }

              if (!userSelected && (!theme || theme === legacy)) {
                theme = fallback;
              }

              if (!theme) {
                theme = fallback;
              }

              localStorage.setItem(key, theme);
              if (choiceRaw === null) {
                localStorage.setItem(choiceKey, '0');
              }

              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="antialiased font-sans">
        <MonacoProvider>
          {children}
        </MonacoProvider>
      </body>
    </html>
  );
}
