import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateStill } from "@/components/hydrate-still";
import { ScreenWait } from "@/components/screen-wait";
import { RouteProgress } from "@/components/route-progress";
import { AppErrorComponent, AppNotFound } from "@/lib/error-component";
import appCss from "../styles.css?url";

const APP_NAME = "Still";
const BASE = import.meta.env.BASE_URL;

function asset(path: string) {
  return `${BASE}${path.replace(/^\//, "")}`;
}

export const Route = createRootRoute({
  pendingComponent: () => <ScreenWait label="Loading…" />,
  errorComponent: AppErrorComponent,
  notFoundComponent: AppNotFound,
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
        content: "Pause the want. Keep the money. A quieter way to spend.",
      },
      { name: "theme-color", content: "#2C4A42" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: asset("favicon.svg") },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: asset("__grok/manifest.webmanifest") },
      { rel: "apple-touch-icon", href: asset("__grok/icon-180.png") },
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
