import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { WantCard } from "@/components/want-card";
import { Button } from "@/components/ui/button";
import { selectReady, selectWaiting, useStillStore } from "@/lib/store";

export const Route = createFileRoute("/waitlist")({ component: WaitlistPage });

function WaitlistPage() {
  const wants = useStillStore((s) => s.wants);
  const rateSet = useStillStore((s) => s.profile.rateSet);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const waiting = selectWaiting(wants, now);
  const cooling = waiting.filter((w) => !w.hideUntilReview);
  const tucked = waiting.filter((w) => w.hideUntilReview);
  const ready = selectReady(wants, now);

  return (
    <Shell>
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
          Cooling-off
        </p>
        <h1 className="mt-1 font-display text-3xl">The waitlist</h1>
        <p className="mt-2 text-sm text-muted">
          Nothing here is denied. It is simply not decided yet.
        </p>
      </header>

      {ready.length === 0 && waiting.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-2xl">Empty on purpose</p>
          <p className="mt-2 max-w-[16rem] text-sm text-muted">
            When a want hits, park it here. The wait is the product.
          </p>
          <Button asChild className="mt-6">
            <Link to={rateSet ? "/pause" : "/start"} search={rateSet ? {} : undefined}>
              Pause a want
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {ready.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-display text-xl">The itch had a night</h2>
              <p className="text-sm text-muted">
                {ready.length === 1
                  ? `How does ${ready[0].name} feel?`
                  : "How do they feel now?"}
              </p>
              {ready.map((w) => (
                <WantCard key={w.id} want={w} now={now} ready />
              ))}
            </section>
          )}
          {cooling.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-display text-xl">Still cooling</h2>
              {cooling.map((w) => (
                <WantCard key={w.id} want={w} now={now} />
              ))}
            </section>
          )}
          {tucked.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-display text-lg text-muted">Hidden until review</h2>
              <p className="text-sm text-faint">
                Still counting. Back on Home when time’s up.
              </p>
              {tucked.map((w) => (
                <WantCard key={w.id} want={w} now={now} muted />
              ))}
            </section>
          )}
        </div>
      )}
    </Shell>
  );
}
