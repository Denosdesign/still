import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStillStore, selectTodayCheckIn } from "@/lib/store";

const LEVELS = [
  { n: 1 as const, label: "Quiet" },
  { n: 2 as const, label: "Low" },
  { n: 3 as const, label: "Stirring" },
  { n: 4 as const, label: "Loud" },
  { n: 5 as const, label: "Burning" },
];

export function DailyCheckIn() {
  const checkIns = useStillStore((s) => s.checkIns);
  const checkIn = useStillStore((s) => s.checkIn);
  const today = selectTodayCheckIn(checkIns);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["n"]>(3);
  const [thanks, setThanks] = useState("");

  if (today) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
          Today’s check-in
        </p>
        <p className="mt-1 font-display text-lg text-ink">
          Want-level {today.wantLevel} · {LEVELS[today.wantLevel - 1]?.label}
        </p>
        {today.gratitude && (
          <p className="mt-1 text-sm text-muted">Glad for: {today.gratitude}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
        Twenty-second check-in
      </p>
      <p className="mt-1 font-display text-lg text-ink">How loud is the want today?</p>
      <div className="mt-3 flex gap-1.5">
        {LEVELS.map((l) => (
          <button
            key={l.n}
            type="button"
            onClick={() => setLevel(l.n)}
            className={cn(
              "flex h-12 flex-1 flex-col items-center justify-center rounded-[var(--radius-md)] text-xs font-medium",
              level === l.n ? "bg-harbour text-harbour-fg" : "bg-surface text-muted",
            )}
          >
            {l.n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{LEVELS[level - 1]?.label}</p>
      <Input
        className="mt-3 h-11"
        placeholder="One thing you already have (optional)"
        value={thanks}
        onChange={(e) => setThanks(e.target.value)}
      />
      <Button
        className="mt-3 w-full"
        size="sm"
        onClick={() => {
          checkIn(level, thanks);
        }}
      >
        Log it — that counts as showing up
      </Button>
    </div>
  );
}
