import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, Pause, Settings2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStillStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/waitlist", label: "Waiting", icon: Layers },
  { to: "/pause", label: "Pause", icon: Pause, fab: true },
  { to: "/wins", label: "Wins", icon: Trophy },
  { to: "/settings", label: "You", icon: Settings2 },
] as const;

export function Shell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const resolvedPath = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const waiting =
    useRouterState({
      select: (s) => s.isLoading || s.location.href !== s.resolvedLocation?.href,
    });
  const rateSet = useStillStore((s) => s.profile.rateSet);
  const [shown, setShown] = useState(children);

  useEffect(() => {
    if (!waiting) setShown(children);
  }, [waiting, children]);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface shadow-[var(--shadow-card)]">
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))]",
            hideNav ? "overflow-hidden pb-0" : "pb-32",
          )}
        >
          <div key={resolvedPath} className="page-enter flex min-h-0 flex-1 flex-col">
            {waiting ? shown : children}
          </div>
        </main>
        {!hideNav && (
          <nav
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(calc(100%-1.5rem),24.5rem)] -translate-x-1/2 rounded-[1.75rem] border border-border/80 bg-surface/90 px-2 pt-1.5 pb-1.5 shadow-[var(--shadow-card)] backdrop-blur-md"
            aria-label="Primary"
          >
            <ul className="grid grid-cols-5 items-end">
              {NAV.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                if ("fab" in item && item.fab) {
                  return (
                    <li key={item.to} className="flex justify-center">
                      <Link
                        to={rateSet ? "/pause" : "/start"}
                        search={rateSet ? {} : undefined}
                        aria-label="Pause a want"
                        className="-mt-6 flex size-14 items-center justify-center rounded-full bg-harbour text-harbour-fg shadow-[var(--shadow-card)] transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] active:scale-[0.96]"
                      >
                        <Icon className="size-6" strokeWidth={1.8} />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex flex-col items-center gap-1 py-1 text-[11px] font-medium tracking-wide transition-colors duration-[var(--motion-quick)]",
                        active ? "text-harbour" : "text-faint",
                      )}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}