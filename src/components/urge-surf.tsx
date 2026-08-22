import { useEffect, useMemo, useState } from "react";
import { URGE_LINES } from "@/lib/science";
import { Button } from "@/components/ui/button";

const DURATION = 45;

export function UrgeSurf({
  onDone,
  onSkip,
}: {
  onDone: () => void;
  onSkip: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const line = useMemo(
    () => URGE_LINES[Math.floor(Date.now() / 8000) % URGE_LINES.length],
    [],
  );

  useEffect(() => {
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= DURATION) {
          window.clearInterval(t);
          return DURATION;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const done = seconds >= DURATION;
  const phase = seconds % 8 < 4 ? "in" : "out";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative mx-auto mt-4 flex size-56 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-harbour-soft/70" />
          <div className="breath-circle absolute inset-8 rounded-full bg-harbour/90" />
          <div className="relative z-10 text-center text-harbour-fg">
            <p className="font-display text-2xl">
              {done ? "There." : phase === "in" ? "Breathe in" : "Breathe out"}
            </p>
            <p className="mt-1 text-sm tabular text-harbour-fg/70">
              {DURATION - seconds}s
            </p>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-[18rem] text-center font-display text-xl leading-snug text-ink">
          {done ? "The wave has broken. How is the want now?" : line}
        </p>
        <p className="mt-3 text-center text-sm text-muted">
          Urges peak and fall on their own. You only have to stay.
        </p>

        <Wave />
      </div>

      <div
        className="shrink-0 border-t border-border bg-surface pt-3"
        style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
      >
        {done ? (
          <Button size="lg" onClick={onDone} className="w-full">
            I rode it
          </Button>
        ) : (
          <Button variant="quiet" className="w-full" onClick={onSkip}>
            Skip. I want to hold it
          </Button>
        )}
      </div>
    </div>
  );
}

function Wave() {
  return (
    <div
      className="relative mt-10 h-16 overflow-hidden rounded-[var(--radius-xl)] bg-harbour"
      aria-hidden="true"
    >
      <div className="wave-track absolute inset-y-0 left-0 flex h-full w-[200%]">
        <WaveSvg />
        <WaveSvg />
      </div>
    </div>
  );
}

function WaveSvg() {
  return (
    <svg
      className="h-full w-1/2 shrink-0 text-[#c9d6d0]"
      viewBox="0 0 720 80"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M0 42 C120 10 240 10 360 42 C480 74 600 74 720 42 V80 H0 Z"
      />
    </svg>
  );
}
