import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Feather, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "how",
    kind: "how" as const,
    title: "How it works",
    body: "",
  },
  {
    id: "name",
    kind: "ui" as const,
    title: "Name the want",
    body: "Open Still before the shop. Write what it is and what it costs.",
  },
  {
    id: "wait",
    kind: "ui" as const,
    title: "Hold it while it cools",
    body: "A waiting period. The listing will still be there tomorrow.",
  },
  {
    id: "wave",
    kind: "ui" as const,
    title: "Ride the wave",
    body: "The itch rises, peaks, and falls. You do not have to buy at the top.",
  },
  {
    id: "keep",
    kind: "ui" as const,
    title: "Keep the money, or buy on purpose",
    body: "If it fades, you kept it. If you still want it after the wait, that is a considered buy.",
  },
] as const;

export function Welcome() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-harbour text-harbour-fg">
      <div
        className="stagger-in mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-y-auto px-6 pt-[max(3rem,env(safe-area-inset-top))]"
        style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-harbour-fg/60">
          A quieter spend
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-tight">Still</h1>
        <p className="mt-6 max-w-[16rem] text-lg leading-relaxed text-harbour-fg/80">
          A pause between wanting something and paying for it.
        </p>

        <WelcomeSlides />
      </div>

      <div
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-20 w-[min(calc(100%-1.5rem),24.5rem)] -translate-x-1/2 rounded-[1.75rem] border border-border/80 bg-surface/90 px-3 py-3 shadow-[var(--shadow-card)] backdrop-blur-md"
      >
        <Button asChild size="xl" className="w-full">
          <Link to="/start">Start</Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="mt-2 w-full text-ink hover:bg-harbour-soft/60">
          <Link to="/pause" search={{ sample: true }}>
            Show me how it works
          </Link>
        </Button>
      </div>
    </div>
  );
}

function WelcomeSlides() {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const t = window.setInterval(() => {
      setI((n) => (n + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [pause]);

  const slide = SLIDES[i];

  return (
    <div
      className="mt-10"
      onPointerEnter={() => setPause(true)}
      onPointerLeave={() => setPause(false)}
    >
      <div className="flex min-h-[18.5rem] flex-col">
        {slide.kind === "how" ? (
          <div key="how" className="welcome-slide flex min-h-[18.5rem] flex-col justify-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-harbour-fg/50">
              How it works
            </p>
            <p className="mt-3 font-display text-3xl leading-tight tracking-tight">
              Name it. Wait. Decide.
            </p>
            <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-harbour-fg/70">
              Already walked away? Log the skip while the relief is warm.
            </p>
            <p className="mt-6 font-display text-xl leading-snug">Pausing is the win.</p>
            <p className="mt-1 text-sm text-harbour-fg/55">No shame if you buy after the wait.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <Phone key={slide.id}>
                {slide.id === "name" ? <UiName /> : null}
                {slide.id === "wait" ? <UiWait /> : null}
                {slide.id === "wave" ? <UiWave /> : null}
                {slide.id === "keep" ? <UiKeep /> : null}
              </Phone>
            </div>
            <p className="mt-3 font-display text-lg text-harbour-fg">{slide.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-harbour-fg/70">{slide.body}</p>
          </>
        )}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={s.id}
            type="button"
            aria-label={s.title}
            onClick={() => setI(n)}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-[var(--motion-fast)]",
              n === i ? "w-6 bg-harbour-fg" : "w-1.5 bg-harbour-fg/35",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="welcome-slide w-[11.25rem] overflow-hidden rounded-[1.35rem] border border-harbour-fg/25 bg-surface p-2 shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-1.5 h-1 w-8 rounded-full bg-border" />
      <div className="h-[13.5rem] overflow-hidden rounded-[1rem] bg-surface px-2.5 pt-2 text-ink">
        {children}
      </div>
    </div>
  );
}

function UiName() {
  return (
    <div>
      <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-muted">The thing</p>
      <p className="mt-1 font-display text-[15px] leading-tight text-ink">Jellycat</p>
      <p className="mt-3 text-[8px] font-medium uppercase tracking-[0.14em] text-muted">Price</p>
      <p className="mt-0.5 font-display text-2xl tabular text-harbour">HK$480</p>
      <div className="mt-3 h-7 rounded-lg bg-harbour text-center text-[10px] font-medium leading-7 text-harbour-fg">
        Continue
      </div>
    </div>
  );
}

function UiWait() {
  return (
    <div>
      <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-muted">Holding</p>
      <div className="mt-2 rounded-xl border border-border bg-card p-2.5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-[13px] leading-tight">Jellycat</p>
          <p className="font-display text-[13px] tabular text-harbour">HK$480</p>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
          <Clock className="size-2.5" />
          <span className="tabular">1d 4h left</span>
        </p>
      </div>
    </div>
  );
}

function UiWave() {
  return (
    <div className="flex h-full flex-col items-center pt-3">
      <div className="relative flex size-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-harbour-soft" />
        <span className="breath-circle absolute inset-2 rounded-full bg-harbour" />
        <span className="relative font-display text-xs text-harbour-fg">32s</span>
      </div>
      <p className="mt-3 text-center font-display text-[12px] leading-snug text-ink">
        The urge will peak. Then it falls.
      </p>
    </div>
  );
}

function UiKeep() {
  return (
    <div>
      <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-muted">Glad I didn’t</p>
      <p className="mt-1 font-display text-xl tabular text-harbour">HK$480</p>
      <div className="mt-3 grid grid-cols-3 gap-1">
        <span className="flex flex-col items-center gap-0.5 rounded-lg border border-harbour/40 bg-harbour-soft py-2 text-harbour">
          <Feather className="size-3" strokeWidth={1.8} />
          <span className="text-[8px]">Lighter</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 rounded-lg border border-harbour bg-harbour/20 py-2 text-harbour">
          <Sun className="size-3" strokeWidth={1.8} />
          <span className="text-[8px]">Glad</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 rounded-lg border border-harbour bg-harbour py-2 text-harbour-fg">
          <Sparkles className="size-3" strokeWidth={1.8} />
          <span className="text-[8px]">Relieved</span>
        </span>
      </div>
    </div>
  );
}
