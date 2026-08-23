import { useEffect, useState } from "react";

export function ScreenWait({
  label = "One moment",
}: {
  label?: string;
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const started = performance.now();
    const duration = 1000;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      setPct(Math.round(t * 100));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="relative size-16" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-harbour-soft" />
        <span className="breath-circle absolute inset-2 rounded-full bg-harbour" />
      </div>
      <p className="mt-6 font-display text-2xl text-harbour">Still</p>
      <p className="mt-2 text-sm text-muted">{label}</p>
      <p className="mt-5 font-display text-3xl tabular tracking-tight text-harbour">
        {pct}
        <span className="ml-0.5 text-lg text-harbour/60">%</span>
      </p>
    </div>
  );
}