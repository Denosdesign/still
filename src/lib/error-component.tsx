import { useEffect, useRef, useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { ScreenWait } from "@/components/screen-wait";

const BASE = import.meta.env.BASE_URL;

function isTransient(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /hydrat|mismatch|search|chunk|failed to fetch|load|not found|404|network/i.test(
    msg,
  );
}

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const [hold, setHold] = useState(() => isTransient(error));
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current || !isTransient(error)) {
      setHold(false);
      return;
    }
    tried.current = true;
    const retry = window.setTimeout(() => reset(), 60);
    const reveal = window.setTimeout(() => setHold(false), 420);
    return () => {
      window.clearTimeout(retry);
      window.clearTimeout(reveal);
    };
  }, [error, reset]);

  if (hold) {
    return <ScreenWait label="One moment…" />;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="font-display text-3xl text-harbour">Still here.</p>
      <p className="mt-3 max-w-xs text-sm text-muted">
        Something slipped. Your pauses are safe on this device — try again.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-12 items-center justify-center rounded-full bg-harbour px-6 text-sm font-medium text-harbour-fg"
        >
          Try again
        </button>
        <a href={BASE} className="text-sm text-muted hover:text-ink">
          Back to my day
        </a>
      </div>
    </div>
  );
}

export function AppNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="font-display text-3xl text-harbour">Still here.</p>
      <p className="mt-3 max-w-xs text-sm text-muted">
        That page drifted off. Your pauses are still on this device.
      </p>
      <a
        href={BASE}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-harbour px-6 text-sm font-medium text-harbour-fg"
      >
        Back to my day
      </a>
    </div>
  );
}
