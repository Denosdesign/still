import { useEffect, useState, type ReactNode } from "react";
import { useStillStore } from "@/lib/store";
import { ScreenWait } from "@/components/screen-wait";

export function HydrateStill({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      useStillStore.getState().setHydrated(true);
      setReady(true);
    };

    const unsub = useStillStore.persist.onFinishHydration(finish);
    try {
      void useStillStore.persist.rehydrate();
    } catch {
      finish();
    }
    if (useStillStore.persist.hasHydrated()) finish();
    const t = window.setTimeout(finish, 1200);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  if (!ready) {
    return <ScreenWait label="Loading your pauses…" />;
  }

  return children;
}
