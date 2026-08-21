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
}: {
  want: Want;
  now: number;
  ready?: boolean;
}) {
  const remaining = (want.waitUntil ?? 0) - now;
  const category = displayCategory(want.category);
  const { format } = useMoney();

  return (
    <Link
      to="/review/$id"
      params={{ id: want.id }}
      className={cn(
        "block rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]",
        ready ? "border-harbour bg-harbour-soft/60" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight text-ink">{want.name}</p>
          <p className="mt-1 text-xs text-muted">
            {[category, want.sample ? "sample" : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p className="shrink-0 font-display text-lg tabular text-harbour">
          {format(want.priceHkd)}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Clock className="size-3.5" />
        {ready ? (
          <span className="font-medium text-harbour">Ready to review</span>
        ) : (
          <span className="tabular">{formatCountdown(remaining)} left</span>
        )}
        <span className="text-faint">· logged {formatRelative(want.createdAt, now)} ago</span>
      </div>
    </Link>
  );
}
