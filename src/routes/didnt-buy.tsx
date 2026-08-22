import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toHkd, useMoney } from "@/lib/currency";
import { EMPTY_HALT, GLADNESS, type Gladness } from "@/lib/types";
import { useStillStore } from "@/lib/store";

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
  const prefix = symbol.trim() || code;
  const pad = prefix.length > 2 ? "pl-16" : "pl-12";
  const can = name.trim().length > 1;

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
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
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
            {saved ? "Glad you didn’t" : "I didn’t buy something"}
          </p>
        </div>
      </header>

      {saved ? (
        <div className="stagger-in flex min-h-0 flex-1 flex-col items-center pt-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-harbour text-harbour-fg">
            <Check className="size-7" strokeWidth={2.2} />
          </div>
          <h1 className="mt-6 font-display text-4xl text-ink">Kept.</h1>
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
              Name it while the relief is warm. No pause, no wait — just what you didn’t buy.
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
              <p className="mb-2 text-sm font-medium text-muted">How does not buying feel?</p>
              <div className="flex flex-wrap gap-2">
                {GLADNESS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGladness(gladness === g.id ? "" : g.id)}
                    className={cn(
                      "h-9 rounded-full border px-3 text-sm",
                      gladness === g.id
                        ? "border-harbour bg-harbour-soft text-harbour"
                        : "border-border bg-card text-muted",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
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
