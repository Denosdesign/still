import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateStill } from "@/components/hydrate-still";
import { ScreenWait } from "@/components/screen-wait";
import { RouteProgress } from "@/components/route-progress";
import appCss from "../styles.css?url";

const APP_NAME = "Still";

export const Route = createRootRoute({
  pendingComponent: () => <ScreenWait label="Loading…" />,
  errorComponent: RootError,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      {
        name: "description",
        content: "Pause the want. Keep the money. A quieter way to spend in Hong Kong dollars.",
      },
      { name: "theme-color", content: "#2C4A42" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en-GB" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <HydrateStill>
            <RouteProgress />
            <Outlet />
          </HydrateStill>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootError() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="font-display text-3xl text-harbour">Still here.</p>
      <p className="mt-3 max-w-xs text-sm text-muted">
        Something slipped. Your pauses are safe on this device — try again.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-harbour px-6 text-sm font-medium text-harbour-fg"
      >
        Back to my day
      </a>
    </div>
  );
}
