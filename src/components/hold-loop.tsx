import { useEffect, useState } from "react";
import { Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadReviewEvent } from "@/lib/calendar";
import {
  canNativeInstall,
  installPlatform,
  promptNativeInstall,
  useStandalone,
} from "@/lib/install";

export function CalendarRemind({
  id,
  name,
  at,
  variant = "primary",
  size = "lg",
  label = "Remind me at review time",
}: {
  id: string;
  name: string;
  at: number;
  variant?: "primary" | "secondary" | "ghost";
  size?: "lg" | "md";
  label?: string;
}) {
  const [saved, setSaved] = useState(false);

  function add() {
    downloadReviewEvent({ id, name, at });
    setSaved(true);
  }

  return (
    <Button variant={variant} size={size} className="w-full" onClick={add}>
      {saved ? "Saved a calendar file. Open it" : label}
    </Button>
  );
}

export function InstallHome({
  onLater,
  onInstalled,
}: {
  onLater: () => void;
  onInstalled?: () => void;
}) {
  const standalone = useStandalone();
  const [steps, setSteps] = useState(false);
  const [native, setNative] = useState(false);
  const platform = installPlatform();

  useEffect(() => {
    setNative(canNativeInstall());
  }, []);

  if (standalone) return null;

  async function install() {
    const ok = await promptNativeInstall();
    if (ok) onInstalled?.();
    else setSteps(true);
  }

  const copy = installExplainer();
  const showNative = native && platform !== "ios";
  const showSteps = platform === "ios" || platform === "desktop" || steps || (platform === "android" && !native);

  return (
    <section className="w-full rounded-[var(--radius-xl)] bg-harbour px-5 py-5 text-left text-harbour-fg">
      <p className="font-display text-xl leading-tight">{copy.title}</p>
      <p className="mt-2 text-sm text-harbour-fg/75">{copy.why}</p>
      {showNative ? (
        <Button
          size="lg"
          className="mt-4 w-full bg-card text-ink hover:bg-card/90"
          onClick={() => void install()}
        >
          Add to Home Screen
        </Button>
      ) : null}
      {showSteps && <InstallSteps platform={platform} />}
      <button
        type="button"
        className="mt-3 w-full py-2 text-sm text-harbour-fg/70"
        onClick={onLater}
      >
        Remind me later
      </button>
    </section>
  );
}

export function installExplainer() {
  return {
    title: "Put Still on the Home Screen",
    why: "So Still opens faster, and feels smoother to use.",
  };
}

export function InstallSteps({
  platform,
}: {
  platform: "ios" | "android" | "desktop";
}) {
  return (
    <ol className="mt-4 list-none space-y-3 pl-0 text-sm text-harbour-fg/90">
      {platform === "ios" ? (
        <>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10">
              <Share className="size-3.5" strokeWidth={1.8} />
            </span>
            <span>Tap Share in Safari, the square with the arrow.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10">
              <Smartphone className="size-3.5" strokeWidth={1.8} />
            </span>
            <span>Choose Add to Home Screen, then Add.</span>
          </li>
        </>
      ) : platform === "android" ? (
        <>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10 text-xs font-medium">
              1
            </span>
            <span>Open the browser menu (three dots).</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10 text-xs font-medium">
              2
            </span>
            <span>Tap Add to Home screen, or Install app.</span>
          </li>
        </>
      ) : (
        <>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10 text-xs font-medium">
              1
            </span>
            <span>Look for the install icon in the address bar.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-harbour-fg/10 text-xs font-medium">
              2
            </span>
            <span>Or open the browser menu and choose Install Still.</span>
          </li>
        </>
      )}
    </ol>
  );
}
