import { useRouterState } from "@tanstack/react-router";

export function RouteProgress() {
  const busy = useRouterState({
    select: (s) => s.isLoading || s.location.href !== s.resolvedLocation?.href,
  });

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
      role="progressbar"
      aria-hidden={!busy}
      aria-valuetext={busy ? "Loading" : undefined}
    >
      <span
        className={`block h-full origin-left bg-harbour ${busy ? "load-bar-full" : "opacity-0"}`}
      />
    </div>
  );
}
