import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;

const SLIDES = [
  {
    src: `${BASE}welcome/name.jpg`,
    title: "Name the want",
    body: "Open Still before the shop. Write what it is and what it costs.",
  },
  {
    src: `${BASE}welcome/wait.jpg`,
    title: "Hold it while it cools",
    body: "A waiting period. The listing will still be there tomorrow.",
  },
  {
    src: `${BASE}welcome/wave.jpg`,
    title: "Ride the wave",
    body: "The itch rises, peaks, and falls. You do not have to buy at the top.",
  },
  {
    src: `${BASE}welcome/keep.jpg`,
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
        <h1 className="mt-5 font-display text-6xl leading-[0.9] tracking-tight">Still</h1>
        <p className="mt-5 text-lg leading-relaxed text-harbour-fg/85">
          A pause between wanting something and paying for it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-harbour-fg/70">
          You name the itch, wait a cooling-off, then decide. If you already walked away,
          you can log the skip while the relief is warm. No shame if you buy after the wait.
          Pausing is the win.
        </p>

        <WelcomeSlides />

        <div className="mt-auto flex flex-col gap-3 pt-8">
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
      className="mt-8"
      onPointerEnter={() => setPause(true)}
      onPointerLeave={() => setPause(false)}
    >
      <div className="overflow-hidden rounded-[var(--radius-xl)] bg-harbour-deep/40">
        <img
          key={slide.src}
          src={slide.src}
          alt=""
          className="welcome-slide aspect-[4/3] w-full object-cover"
        />
      </div>
      <p className="mt-3 font-display text-xl text-harbour-fg">{slide.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-harbour-fg/70">{slide.body}</p>
      <div className="mt-3 flex justify-center gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={s.src}
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
