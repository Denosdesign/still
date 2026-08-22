import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Feather, Sparkles, Sun } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toHkd, useMoney } from "@/lib/currency";
import { EMPTY_HALT, type Gladness } from "@/lib/types";
import { useStillStore } from "@/lib/store";

const FEEL: {
  id: Gladness;
  label: string;
  icon: typeof Feather;
  on: string;
}[] = [
  {
    id: "lighter",
    label: "Lighter",
    icon: Feather,
    on: "border border-harbour/40 bg-harbour-soft text-harbour",
  },
  {
    id: "glad",
    label: "Glad",
    icon: Sun,
    on: "border border-harbour bg-harbour/20 text-harbour shadow-[var(--shadow-card)]",
  },
  {
    id: "relieved",
    label: "Relieved",
    icon: Sparkles,
    on: "border border-harbour bg-harbour text-harbour-fg shadow-[var(--shadow-card)]",
  },
];

const RIBBON_GREENS = ["#dce6e1", "#8aa397", "#3e5c4f", "#2c4a42", "#223a34"];
const RIBBON_COUNT: Record<Gladness, number> = {
  lighter: 22,
  glad: 48,
  relieved: 72,
};

type Ribbon = {
  id: number;
  left: string;
  width: number;
  height: number;
  color: string;
  delay: string;
  duration: string;
  r0: string;
  r1: string;
  dx: string;
};

function makeRibbons(level: Gladness): Ribbon[] {
  const n = RIBBON_COUNT[level];
  return Array.from({ length: n }, (_, i) => {
    const spin = 160 + Math.random() * 420;
    return {
      id: i,
      left: `${Math.random() * 100}%`,
      width: 2 + Math.random() * 2.5,
      height: 7 + Math.random() * 8,
      color: RIBBON_GREENS[(i + Math.floor(Math.random() * 3)) % RIBBON_GREENS.length],
      delay: `${Math.random() * 0.55}s`,
      duration: `${2.8 + Math.random() * 1.8}s`,
      r0: `${Math.random() * 360}deg`,
      r1: `${Math.random() * 360 + spin}deg`,
      dx: `${(Math.random() - 0.5) * 48}px`,
    };
  });
}

export const Route = createFileRoute("/didnt-buy")({
  component: DidntBuyPage,
});

function DidntBuyPage() {
  const navigate = useNavigate();
  const logWant = useStillStore((s) => s.logWant);
  const { code, symbol } = useMoney();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [gladness, setGladness] = useState<Gladness | "">("");
  const [saved, setSaved] = useState(false);
  const [ribbons, setRibbons] = useState<Ribbon[] | null>(null);
  const prefix = symbol.trim() || code;
  const pad = prefix.length > 2 ? "pl-16" : "pl-12";
  const can = name.trim().length > 1;

  useEffect(() => {
    if (!ribbons) return;
    const t = window.setTimeout(() => setRibbons(null), 5200);
    return () => window.clearTimeout(t);
  }, [ribbons]);

  function shower(level: Gladness) {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setRibbons(makeRibbons(level));
  }

  function pickFeel(id: Gladness) {
    setGladness(id);
  }

  function save() {
    if (!can) return;
    const local = Number.parseFloat(price.replace(/,/g, "")) || 0;
    logWant({
      name: name.trim(),
      priceHkd: toHkd(local, code),
      category: "",
      source: "",
      halt: EMPTY_HALT,
      tenTenTen: null,
      gratitude: [],
      status: "kept",
      waitHours: 0,
      nearMiss: true,
      gladness: gladness || undefined,
    });
    setSaved(true);
    if (gladness) shower(gladness);
    const vibe =
      gladness === "relieved"
        ? [18, 40, 18, 40, 28]
        : gladness === "glad"
          ? [12, 32, 16]
          : [8];
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(vibe);
    }
  }

  const praise =
    gladness === "lighter"
      ? "A little lighter. That counts."
      : gladness === "relieved"
        ? "You already did the hard part."
        : gladness === "glad"
          ? "That relief is the point. You already did the hard part."
          : "Logged. The money stayed.";

  return (
    <Shell hideNav>
      {ribbons ? (
        <div className="glad-ribbons" aria-hidden>
          {ribbons.map((r) => (
            <span
              key={r.id}
              className="glad-ribbon"
              style={{
                left: r.left,
                width: r.width,
                height: r.height,
                background: r.color,
                animationDelay: r.delay,
                animationDuration: r.duration,
                ["--r0" as string]: r.r0,
                ["--r1" as string]: r.r1,
                ["--dx" as string]: r.dx,
              }}
            />
          ))}
        </div>
      ) : null}
      <header className="mb-4 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex size-11 items-center justify-center rounded-[var(--radius-md)] text-ink hover:bg-harbour-soft/60"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {saved ? "Logged" : "A near miss"}
          </p>
          <p className="truncate font-display text-lg text-ink">
            {saved ? "Glad you didn’t" : "Glad I didn’t"}
          </p>
        </div>
      </header>

      {saved ? (
        <div className="stagger-in flex min-h-0 flex-1 flex-col items-center pt-8 text-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full text-harbour-fg",
              gladness === "relieved" ? "size-20 bg-harbour glad-icon-spark" : "size-16 bg-harbour",
              gladness === "lighter" && "glad-icon-float",
              gladness === "glad" && "glad-cell",
            )}
            data-on={gladness || undefined}
          >
            {gladness === "lighter" ? (
              <Feather className="size-7" strokeWidth={1.8} />
            ) : gladness === "relieved" ? (
              <Sparkles className="size-8" strokeWidth={1.8} />
            ) : gladness === "glad" ? (
              <Sun className="size-7" strokeWidth={1.8} />
            ) : (
              <Check className="size-7" strokeWidth={2.2} />
            )}
          </div>
          <h1 className="mt-6 font-display text-4xl text-ink">
            {gladness === "lighter"
              ? "Lighter."
              : gladness === "glad"
                ? "Glad."
                : gladness === "relieved"
                  ? "Relieved."
                  : "Kept."}
          </h1>
          <p className="mt-3 max-w-[20rem] text-muted">{praise}</p>
          <div className="mt-auto w-full pt-8" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
            <Button size="lg" className="w-full" onClick={() => navigate({ to: "/" })}>
              Back to my day
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <p className="text-sm text-muted">
              Name it while the relief is warm. No pause, no wait. Just what you didn’t buy.
            </p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-muted">The thing</span>
              <Input
                autoFocus
                placeholder="e.g. Jellycat, a second tote"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-muted">
                Price you didn’t spend
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl text-faint">
                  {prefix}
                </span>
                <Input
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={cn("h-16 font-display text-3xl tabular tracking-tight", pad)}
                />
              </div>
            </label>
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-muted">How does not buying feel?</p>
              <div className="grid grid-cols-3 gap-2">
                {FEEL.map((g) => {
                  const on = gladness === g.id;
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => pickFeel(g.id)}
                      data-on={on ? g.id : undefined}
                      className={cn(
                        "glad-cell flex flex-col items-center gap-2 rounded-[var(--radius-xl)] px-2 py-5 transition-[transform,background-color,color,box-shadow] duration-[var(--motion-quick)]",
                        on ? g.on : "border border-border bg-card text-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-6",
                          on && g.id === "lighter" && "glad-icon-float",
                          on && g.id === "relieved" && "glad-icon-spark",
                        )}
                        strokeWidth={1.8}
                      />
                      <span className="font-display text-base leading-tight">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="shrink-0 border-t border-border bg-surface pt-3"
            style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
          >
            <Button size="lg" className="w-full" disabled={!can} onClick={save}>
              Log it
            </Button>
          </div>
        </>
      )}
    </Shell>
  );
}
