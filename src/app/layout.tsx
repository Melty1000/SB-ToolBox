import type { Metadata } from "next";
import "./globals.css";
import { MonacoProvider } from "@/providers/MonacoProvider";


export const metadata: Metadata = {
  title: {
    template: "SB ToolBox // %s",
    default: "SB ToolBox // DECODER"
  },
  description: "Modern Streamer.bot export tool",
  icons: {
    icon: "/assets/icon.png",
    shortcut: "/assets/icon.png",
    apple: "/assets/icon.png",
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
        <link rel="preload" href="/assets/logo-collapsed.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/streamerbot-logo.svg" as="image" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            console.log('%c--- [FORENSIC V3] NUCLEAR_BLOCK BOOTING ---', 'color: white; background: #000; padding: 4px; border-radius: 4px;');
            try {
              var theme = localStorage.getItem('melt-theme') || 'default';
              document.documentElement.setAttribute('data-theme', theme);
              
              function runForensics(reason, source) {
                // 1. SUPPRESSION: Harmless Monaco/Editor/Async cancellations
                if (reason && (
                    reason.type === 'cancelation' || 
                    reason.name === 'Canceled' || 
                    reason.name === 'AbortError' ||
                    reason.message === 'Canceled' || 
                    reason.status === 'canceled' ||
                    (reason.message && (reason.message.includes('manual') || reason.message.includes('canceled')))
                )) {
                  return true; // Return true to signal event suppression
                }

                // 2. NORMALIZATION: Coerce POJO/Non-Error rejections into proper Errors
                var r = reason;
                if (!(r instanceof Error) && r !== null && typeof r !== 'undefined') {
                  var str = 'Unknown';
                  try { str = typeof r === 'object' ? JSON.stringify(r) : String(r); } catch(e) { str = '[Unserializable]'; }
                  var msg = '[' + source + '] Non-Error Rejection: ' + str;
                  var coerced = new Error(msg);
                  coerced.name = 'NormalizedRejection';
                  coerced.raw = r; 
                  r = coerced;
                }

                // 3. LOGGING: Diagnostic group without triggering Next.js Overlay
                console.group('%c❌ METRIC: ' + source, 'color: white; background: #900; padding: 4px; border-radius: 4px; font-weight: bold;');
                console.log('%cMESSAGE: %c' + (r?.message || 'Unlabeled'), 'font-weight: bold', 'color: #f66');
                if (r?.stack) {
                  console.groupCollapsed('STACK TRACE');
                  console.log(r.stack);
                }
                
                // Deep inspection for difficult-to-trace rejections
                if (r && typeof r === 'object') {
                  console.groupCollapsed('INSPECTION');
                  try {
                    console.dir(r);
                    var keys = Object.getOwnPropertyNames(r);
                    keys.forEach(function(k) {
                       try { console.log('PROP [' + k + ']:', r[k]); } catch(e) {}
                    });
                  } catch(e) {}
                  console.groupEnd();
                }
                console.groupEnd();

                return false; // Not suppressed
              }

              window.addEventListener('unhandledrejection', function(event) {
                if (runForensics(event.reason, 'UNHANDLED_REJECTION')) {
                  // NUCLEAR BLOCK: Prevent Next.js overlay from catching this
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  console.info('%c[OVERLAY_SILENCED] suppressed harmless rejection', 'color: #888; font-style: italic');
                }
              }, true); // Use capture to get ahead of Next.js

              window.addEventListener('error', function(event) {
                if (runForensics(event.error || event.message, 'RUNTIME_ERROR')) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  console.info('%c[OVERLAY_SILENCED] suppressed harmless error', 'color: #888; font-style: italic');
                }
              }, true); 
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
