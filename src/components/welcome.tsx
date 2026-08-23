import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Feather, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "name",
    title: "Name the want",
    body: "Open Still before the shop. Write what it is and what it costs.",
  },
  {
    id: "wait",
    title: "Hold it while it cools",
    body: "A waiting period. The listing will still be there tomorrow.",
  },
  {
    id: "wave",
    title: "Ride the wave",
    body: "The itch rises, peaks, and falls. You do not have to buy at the top.",
  },
  {
    id: "keep",
    title: "Keep the money, or buy on purpose",
    body: "If it fades, you kept it. If you still want it after the wait, that is a considered buy.",
  },
] as const;

export function Welcome() {
  return (
    <div className="flex min-h-dvh flex-col bg-harbour px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))] text-harbour-fg">
      <div className="stagger-in mx-auto flex w-full max-w-md flex-1 flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-harbour-fg/60">
          A quieter spend
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tight">Still</h1>
        <p className="mt-4 text-base leading-relaxed text-harbour-fg/85">
          A pause between wanting something and paying for it.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-harbour-fg/70">
          You name the itch, wait a cooling-off, then decide. If you already walked away,
          you can log the skip while the relief is warm. No shame if you buy after the wait.
          Pausing is the win.
        </p>

        <WelcomeSlides />

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Button
            asChild
            size="xl"
            className="w-full bg-card text-ink hover:bg-card/90"
          >
            <Link to="/start">Start</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full border border-harbour-fg/40 text-harbour-fg hover:bg-harbour-fg/10 hover:text-harbour-fg"
          >
            <Link to="/pause" search={{ sample: true }}>
              Show me how it works
            </Link>
          </Button>
        </div>
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
      className="mt-6"
      onPointerEnter={() => setPause(true)}
      onPointerLeave={() => setPause(false)}
    >
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
      <div className="mt-3 flex justify-center gap-2">
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
