import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { formatCountdown, formatRelative } from "@/lib/format";
import { useMoney } from "@/lib/currency";
import { displayCategory, type Want } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WantCard({
  want,
  now,
  ready = false,
  muted = false,
}: {
  want: Want;
  now: number;
  ready?: boolean;
  muted?: boolean;
}) {
  const remaining = (want.waitUntil ?? 0) - now;
  const category = displayCategory(want.category);
  const { format } = useMoney();

  return (
    <Link
      to="/review/$id"
      params={{ id: want.id }}
      className={cn(
        "block rounded-[var(--radius-xl)] border p-4 transition-transform active:scale-[0.98]",
        ready
          ? "border-harbour bg-harbour-soft/60 shadow-[var(--shadow-card)]"
          : muted
            ? "border-border/50 bg-transparent shadow-none"
            : "border-border bg-card shadow-[var(--shadow-card)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-display text-lg leading-tight",
              muted ? "text-muted" : "text-ink",
            )}
          >
            {want.name}
          </p>
          <p className="mt-1 text-xs text-muted">
            {[category, want.sample ? "sample" : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 font-display text-lg tabular",
            muted ? "text-muted" : "text-harbour",
          )}
        >
          {format(want.priceHkd)}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Clock className="size-3.5" />
        {ready ? (
          <span className="font-medium text-harbour">How does it feel now?</span>
        ) : (
          <span className="tabular">{formatCountdown(remaining)} left</span>
        )}
        <span className="text-faint">
          {"\u00b7"} logged {formatRelative(want.createdAt, now)} ago
        </span>
      </div>
    </Link>
  );
}
