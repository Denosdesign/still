import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Coffee,
  Heart,
  Moon,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UrgeSurf } from "@/components/urge-surf";
import { cn } from "@/lib/utils";
import { formatWhenGb, hoursOfWork } from "@/lib/format";
import { fromHkd, toHkd, useMoney } from "@/lib/currency";
import {
  BUY_AFTER_WAIT_PRAISE,
  GRATITUDE_PROMPTS,
  HALT_COPY,
  inGameSpendThisWeek,
  isInGameSpend,
  KEEP_PRAISE,
  PRACTICE_TIPS,
  WAIT_OPTIONS,
  pick,
  recommendedWaitHours,
  waitLabel,
} from "@/lib/science";
import {
  selectKeptTotal,
  useStillStore,
} from "@/lib/store";
import {
  CATEGORIES,
  EMPTY_HALT,
  SOURCES,
  displayCategory,
  displaySource,
  type HaltState,
  type TenTenTen,
  type WantStatus,
} from "@/lib/types";
import { TagPicker } from "@/components/tag-picker";
import { CalendarRemind } from "@/components/hold-loop";

type Step = "capture" | "halt" | "surf" | "see" | "gratitude" | "decide" | "done";

const STEPS: Step[] = ["capture", "halt", "surf", "see", "gratitude", "decide"];

function sampleDraft(code: string) {
  return {
    name: "Jellycat Bashful Bunny",
    priceHkd: String(fromHkd(480, code)),
    category: "Games & toys",
    source: "Shop",
  };
}

type PauseDraft = {
  name: string;
  priceHkd: string;
  category: string;
  source: string;
};

export function PauseFlow({ sample = false }: { sample?: boolean }) {
  const { code } = useMoney();
  const navigate = useNavigate();
  const profile = useStillStore((s) => s.profile);
  const wants = useStillStore((s) => s.wants);
  const logWant = useStillStore((s) => s.logWant);
  const resetDraft = useStillStore((s) => s.resetDraft);
  const liveDraft = useStillStore((s) => s.draft);
  const setLiveDraft = useStillStore((s) => s.setDraft);
  const [practiceDraft, setPracticeDraft] = useState<PauseDraft>(() =>
    sampleDraft(code),
  );
  const draft = sample ? practiceDraft : liveDraft;
  const setDraft = sample
    ? (patch: Partial<PauseDraft>) =>
        setPracticeDraft((current) => ({ ...current, ...patch }))
    : setLiveDraft;

  const [step, setStep] = useState<Step>("capture");
  const [halt, setHalt] = useState<HaltState>(EMPTY_HALT);
  const [ten, setTen] = useState<TenTenTen>({
    minutes: "unsure",
    days: "unsure",
    months: "unsure",
  });
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [waitHours, setWaitHours] = useState(24);
  const [outcome, setOutcome] = useState<WantStatus>("waiting");
  const [praise, setPraise] = useState("");
  const [committed, setCommitted] = useState({
    name: "",
    price: 0,
    id: "",
    waitUntil: 0,
  });

  const price = Number.parseFloat(draft.priceHkd.replace(/,/g, "")) || 0;
  const work = hoursOfWork(price, profile.hourlyRate);
  const kept = selectKeptTotal(wants);
  const haltHit = Object.values(halt).some(Boolean);

  const recWait = useMemo(
    () => recommendedWaitHours(toHkd(price, code) || 300),
    [price, code],
  );

  useEffect(() => {
    if (sample) return;
    const demo = sampleDraft(code);
    if (
      liveDraft.name === demo.name &&
      liveDraft.category === demo.category &&
      liveDraft.source === demo.source
    ) {
      resetDraft();
    }
  }, [sample, code, liveDraft.name, liveDraft.category, liveDraft.source, resetDraft]);

  function go(next: Step) {
    if (next === "see" || next === "decide") {
      setWaitHours(recommendedWaitHours(toHkd(price, code) || 300));
    }
    setStep(next);
  }

  function back() {
    const i = STEPS.indexOf(step as (typeof STEPS)[number]);
    if (step === "done") {
      goHome();
      return;
    }
    if (i <= 0) {
      goHome();
      return;
    }
    setStep(STEPS[i - 1] as Step);
  }

  function goHome() {
    navigate({ to: "/" });
  }

  function commit(status: WantStatus, hours = waitHours) {
    let savedId = "";
    let savedUntil = 0;
    if (!sample) {
      const want = logWant({
        name: draft.name,
        priceHkd: price,
        category: draft.category,
        source: draft.source,
        halt,
        tenTenTen: ten,
        gratitude,
        status,
        waitHours: status === "waiting" ? hours : 0,
      });
      savedId = want.id;
      savedUntil = want.waitUntil ?? 0;
    }
    setCommitted({
      name: draft.name,
      price,
      id: savedId,
      waitUntil: savedUntil,
    });
    setOutcome(status);
    setPraise(
      sample
        ? "Nothing was logged. This was a walk-through, not a waitlist."
        : status === "kept"
          ? pick(KEEP_PRAISE)
          : status === "bought"
            ? pick(BUY_AFTER_WAIT_PRAISE)
            : pick(KEEP_PRAISE),
    );
    if (!sample) resetDraft();
    setStep("done");
    if (!sample && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  const stepIndex = Math.max(0, STEPS.indexOf(step as (typeof STEPS)[number]));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={back}
          className="flex size-11 items-center justify-center rounded-[var(--radius-md)] text-ink transition-colors hover:bg-harbour-soft/60"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {step === "done" ? (sample ? "Practice" : "Well done") : sample ? "Practice" : "Pause"}
          </p>
          <p className="truncate font-display text-lg text-ink">
            {stepTitle(step, draft.name)}
          </p>
        </div>
      </header>

      {step !== "done" && (
        <div className="mb-4 flex shrink-0 gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= stepIndex ? "bg-harbour" : "bg-border",
              )}
            />
          ))}
        </div>
      )}
      {step !== "done" &&
        (sample ? <PracticeCoach step={step} /> : <WhyThisStep step={step} />)}

      {step === "capture" && (
        <CaptureStep
          sample={sample}
          draft={draft}
          setDraft={setDraft}
          onNext={() => go("halt")}
        />
      )}
      {step === "halt" && (
        <HaltStep
          halt={halt}
          setHalt={setHalt}
          onNext={() => go("surf")}
        />
      )}
      {step === "surf" && (
        <UrgeSurf onDone={() => go("see")} onSkip={() => go("see")} />
      )}
      {step === "see" && (
        <SeeStep
          name={draft.name}
          price={price}
          work={work}
          goalName={profile.goalName}
          haltHit={haltHit}
          inGameNth={
            isInGameSpend(draft.category)
              ? inGameSpendThisWeek(wants) + 1
              : 0
          }
          ten={ten}
          setTen={setTen}
          onNext={() => go("gratitude")}
        />
      )}
      {step === "gratitude" && (
        <GratitudeStep
          values={gratitude}
          setValues={setGratitude}
          onNext={() => go("decide")}
          onSkip={() => go("decide")}
        />
      )}
      {step === "decide" && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        <DecideStep
          price={price}
          recWait={recWait}
          waitHours={waitHours}
          setWaitHours={setWaitHours}
          haltHit={haltHit}
          onHold={() => commit("waiting", waitHours)}
          onKeep={() => commit("kept")}
          onBuy={() => commit("bought")}
        />
        </div>
      )}
      {step === "done" && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        <DoneStep
          outcome={outcome}
          price={committed.price}
          praise={praise}
          waitHours={waitHours}
          waitUntil={committed.waitUntil}
          wantId={committed.id}
          wantName={committed.name}
          kept={kept}
          goalName={profile.goalName}
          practice={sample}
          onHome={goHome}
          onTryReal={() => {
            if (profile.rateSet) navigate({ to: "/pause", search: {} });
            else navigate({ to: "/start" });
          }}
        />
        </div>
      )}
    </div>
  );
}

function WizardFrame({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <div
        className="shrink-0 border-t border-border bg-surface pt-3"
        style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
      >
        {footer}
      </div>
    </>
  );
}

function PracticeCoach({ step }: { step: Step }) {
  const tip = PRACTICE_TIPS[step];
  if (!tip) return null;
  return (
    <aside className="mb-4 rounded-[var(--radius-lg)] bg-harbour-soft/80 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-harbour">
        Practice · nothing is saved
      </p>
      <p className="mt-1 text-sm leading-snug text-harbour">{tip}</p>
    </aside>
  );
}

function WhyThisStep({ step }: { step: Step }) {
  const [open, setOpen] = useState(false);
  const tip = PRACTICE_TIPS[step];
  useEffect(() => {
    setOpen(false);
  }, [step]);
  if (!tip) return null;
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-muted underline-offset-2 hover:text-harbour hover:underline"
      >
        {open ? "Hide" : "Why this step?"}
      </button>
      {open && <p className="mt-2 text-sm leading-relaxed text-harbour">{tip}</p>}
    </div>
  );
}

function stepTitle(step: Step, name: string) {
  if (step === "capture") return "What is pulling at you?";
  if (step === "halt") return "How are you, right now?";
  if (step === "surf") return "Ride the wave";
  if (step === "see") return name || "Look at it plainly";
  if (step === "gratitude") return "What you already have";
  if (step === "decide") return "Your move";
  return "Still";
}

function CaptureStep({
  sample,
  draft,
  setDraft,
  onNext,
}: {
  sample: boolean;
  draft: PauseDraft;
  setDraft: (patch: Partial<PauseDraft>) => void;
  onNext: () => void;
}) {
  const rememberTag = useStillStore((s) => s.rememberTag);
  const customCategories = useStillStore((s) => s.customCategories);
  const customSources = useStillStore((s) => s.customSources);
  const recentCategories = useStillStore((s) => s.recentCategories);
  const recentSources = useStillStore((s) => s.recentSources);
  const price = Number.parseFloat(draft.priceHkd.replace(/,/g, "")) || 0;
  const can = draft.name.trim().length > 1 && price > 0;
  const { symbol } = useMoney();
  const prefix = symbol.trim();
  const pad = prefix.length > 2 ? "pl-16" : "pl-12";

  return (
    <WizardFrame
      footer={
        <Button size="lg" className="w-full" disabled={!can} onClick={onNext}>
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-5 pb-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted">The thing</span>
        <Input
          autoFocus={!sample}
          placeholder="e.g. Jellycat, Dyson, a second tote"
          value={draft.name}
          onChange={(e) => setDraft({ name: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted">Price</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl text-faint">
            {prefix}
          </span>
          <Input
            inputMode="decimal"
            placeholder=""
            value={draft.priceHkd}
            onChange={(e) =>
              setDraft({ priceHkd: e.target.value.replace(/[^0-9.]/g, "") })
            }
            className={cn("h-16 font-display text-3xl tabular tracking-tight", pad)}
          />
        </div>
      </label>
      <TagPicker
        label="Category"
        value={displayCategory(draft.category)}
        onChange={(category) => setDraft({ category })}
        onRemember={(tag) => {
          if (!sample) rememberTag("category", tag);
        }}
        presets={CATEGORIES}
        custom={customCategories.map(displayCategory).filter(Boolean)}
        recent={recentCategories.map(displayCategory).filter(Boolean)}
        placeholder="Search or type a tag"
      />
      <TagPicker
        label="Where did it find you?"
        value={displaySource(draft.source)}
        onChange={(source) => setDraft({ source })}
        onRemember={(tag) => {
          if (!sample) rememberTag("source", tag);
        }}
        presets={SOURCES}
        custom={customSources.map(displaySource).filter(Boolean)}
        recent={recentSources.map(displaySource).filter(Boolean)}
        placeholder="Search or type a tag"
      />
      </div>
    </WizardFrame>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-harbour bg-harbour-soft text-harbour"
          : "border-border bg-card text-muted",
      )}
    >
      {children}
    </button>
  );
}

function HaltStep({
  halt,
  setHalt,
  onNext,
}: {
  halt: HaltState;
  setHalt: (h: HaltState) => void;
  onNext: () => void;
}) {
  const items = [
    { key: "hungry" as const, icon: Coffee },
    { key: "angry" as const, icon: Zap },
    { key: "lonely" as const, icon: Users },
    { key: "tired" as const, icon: Moon },
  ];
  const active = items.filter((i) => halt[i.key]);

  return (
    <WizardFrame
      footer={
        <Button size="lg" className="w-full" onClick={onNext}>
          Continue
        </Button>
      }
    >
      <p className="text-sm text-muted">
        Shopping when you are hungry, angry, lonely or tired is a well-studied trap.
        Tick any that fit. None is a perfectly good answer.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {items.map(({ key, icon: Icon }) => {
          const on = halt[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setHalt({ ...halt, [key]: !on })}
              className={cn(
                "flex min-h-24 flex-col items-start gap-3 rounded-[var(--radius-xl)] border p-4 text-left transition-colors",
                on
                  ? "border-harbour bg-harbour text-harbour-fg"
                  : "border-border bg-card text-ink",
              )}
            >
              <Icon className="size-5" />
              <span className="font-display text-lg leading-tight">
                {HALT_COPY[key].title}
              </span>
            </button>
          );
        })}
      </div>
      {active.length > 0 && (
        <ul className="mt-5 space-y-2 rounded-[var(--radius-lg)] bg-harbour-soft/70 p-4 text-sm text-harbour">
          {active.map((a) => (
            <li key={a.key}>{HALT_COPY[a.key].hint}</li>
          ))}
        </ul>
      )}
    </WizardFrame>
  );
}

function SeeStep({
  name,
  price,
  work,
  goalName,
  haltHit,
  inGameNth,
  ten,
  setTen,
  onNext,
}: {
  name: string;
  price: number;
  work: ReturnType<typeof hoursOfWork>;
  goalName: string;
  haltHit: boolean;
  inGameNth: number;
  ten: TenTenTen;
  setTen: (t: TenTenTen) => void;
  onNext: () => void;
}) {
  const inGame = inGameNth >= 1;
  const { format } = useMoney();
  return (
    <WizardFrame
      footer={
        <Button size="lg" className="w-full" onClick={onNext}>
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
      <div className="rounded-[var(--radius-xl)] bg-harbour px-5 py-6 text-harbour-fg shadow-[var(--shadow-card)]">
        <p className="text-sm text-harbour-fg/70">{name}</p>
        <p className="mt-1 font-display text-4xl tabular tracking-tight">
          {format(price)}
        </p>
        {inGame ? (
          <>
            <p className="mt-3 font-display text-xl leading-snug text-harbour-fg">
              {inGameNth === 1
                ? "First in-game spend this week."
                : `This would be in-game spend number ${inGameNth} this week.`}
            </p>
            {work && (
              <p className="mt-2 text-sm text-harbour-fg/75">{work.label}.</p>
            )}
          </>
        ) : (
          work && (
            <p className="mt-3 text-sm leading-relaxed text-harbour-fg/85">
              That is <span className="font-medium">{work.label}</span>.
              Would you clock in for this?
            </p>
          )
        )}
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <p className="text-sm text-muted">This pause is for</p>
        <p className="mt-1 font-display text-2xl text-ink">{goalName || "a quieter year"}</p>
        <p className="mt-2 text-sm text-muted">
          Not a piggy bank. A reason. Money spent here cannot help that.
        </p>
      </div>
      {haltHit && (
        <p className="rounded-[var(--radius-lg)] bg-harbour-soft px-4 py-3 text-sm text-harbour">
          You flagged a HALT state. Evidence says this is a risky moment to decide.
          A hold until morning is the kind option.
        </p>
      )}
      <div>
        <p className="font-display text-lg">The 10-10-10</p>
        <p className="mb-3 text-sm text-muted">
          How will this feel in ten minutes, ten days, ten months?
        </p>
        <TenRow
          label="In ten minutes"
          value={ten.minutes}
          options={[
            { id: "relieved", label: "Relieved I paused" },
            { id: "itchy", label: "Still itching" },
            { id: "unsure", label: "Unsure" },
          ]}
          onChange={(minutes) => setTen({ ...ten, minutes: minutes as TenTenTen["minutes"] })}
        />
        <TenRow
          label="In ten days"
          value={ten.days}
          options={[
            { id: "forgotten", label: "Mostly forgotten" },
            { id: "still", label: "Still want it" },
            { id: "unsure", label: "Unsure" },
          ]}
          onChange={(days) => setTen({ ...ten, days: days as TenTenTen["days"] })}
        />
        <TenRow
          label="In ten months"
          value={ten.months}
          options={[
            { id: "regret", label: "Would regret it" },
            { id: "glad", label: "Would be glad" },
            { id: "unsure", label: "Unsure" },
          ]}
          onChange={(months) => setTen({ ...ten, months: months as TenTenTen["months"] })}
        />
      </div>
      </div>
    </WizardFrame>
  );
}

function TenRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-faint">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o.id} active={value === o.id} onClick={() => onChange(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function GratitudeStep({
  values,
  setValues,
  onNext,
  onSkip,
}: {
  values: string[];
  setValues: (v: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <WizardFrame
      footer={
        <div className="flex flex-col gap-1">
          <Button size="lg" className="w-full" onClick={onNext}>
            Continue
          </Button>
          <Button variant="quiet" className="w-full" onClick={onSkip}>
            Skip gratitude
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted">
        A two-minute gratitude practice has been shown to lower materialistic wanting.
        Name three things you already own that you genuinely like.
      </p>
      <div className="mt-5 space-y-3">
        {GRATITUDE_PROMPTS.map((prompt, i) => (
          <label key={prompt} className="block">
            <span className="mb-1.5 block text-sm text-muted">{prompt}</span>
            <Input
              value={values[i]}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                setValues(next);
              }}
              placeholder="Something true, not impressive"
            />
          </label>
        ))}
      </div>
    </WizardFrame>
  );
}

function DecideStep({
  price,
  recWait,
  waitHours,
  setWaitHours,
  haltHit,
  onHold,
  onKeep,
  onBuy,
}: {
  price: number;
  recWait: number;
  waitHours: number;
  setWaitHours: (n: number) => void;
  haltHit: boolean;
  onHold: () => void;
  onKeep: () => void;
  onBuy: () => void;
}) {
  const { format } = useMoney();
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-sm text-muted">
        There is no failing this step. Holding, letting go, or buying with a clear head
        are all better than a checkout you will not remember.
      </p>
      <button
        type="button"
        onClick={onHold}
        className="rounded-[var(--radius-xl)] bg-harbour p-5 text-left text-harbour-fg shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
      >
        <Clock className="size-5" />
        <p className="mt-3 font-display text-2xl">Hold it</p>
        <p className="mt-1 text-sm text-harbour-fg/75">
          Put {format(price)} on a cooling-off wait. Recommended: {waitLabel(recWait)}
          {haltHit ? " — or until morning, given how you feel." : "."}
        </p>
      </button>
      <div className="flex flex-wrap gap-2 px-1">
        {WAIT_OPTIONS.map((h) => (
          <Chip key={h} active={waitHours === h} onClick={() => setWaitHours(h)}>
            {waitLabel(h)}
          </Chip>
        ))}
      </div>
      <button
        type="button"
        onClick={onKeep}
        className="rounded-[var(--radius-xl)] border border-border bg-card p-5 text-left transition-transform active:scale-[0.98]"
      >
        <Heart className="size-5 text-harbour" />
        <p className="mt-3 font-display text-xl text-ink">Let it go</p>
        <p className="mt-1 text-sm text-muted">
          Keep {format(price)}. The want can leave without the money.
        </p>
      </button>
      <button
        type="button"
        onClick={onBuy}
        className="rounded-[var(--radius-lg)] px-2 py-3 text-left text-sm text-muted"
      >
        Buy with intention — I have thought it through
      </button>
    </div>
  );
}

function DoneStep({
  outcome,
  price,
  praise,
  waitHours,
  waitUntil,
  wantId,
  wantName,
  kept,
  goalName,
  practice = false,
  onHome,
  onTryReal,
}: {
  outcome: WantStatus;
  price: number;
  praise: string;
  waitHours: number;
  waitUntil: number;
  wantId: string;
  wantName: string;
  kept: number;
  goalName: string;
  practice?: boolean;
  onHome: () => void;
  onTryReal: () => void;
}) {
  const title = practice
    ? "That's the pause."
    : outcome === "waiting"
      ? "Held."
      : outcome === "bought"
        ? "Chosen, not snatched."
        : "Yours to keep.";
  const { format } = useMoney();
  const when = waitUntil ? formatWhenGb(waitUntil) : "";

  return (
    <div className="stagger-in flex flex-1 flex-col items-center pt-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-harbour text-harbour-fg">
        <Check className="size-7" strokeWidth={2.2} />
      </div>
      <h1 className="mt-6 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-3 max-w-[20rem] text-muted">{praise}</p>
      <div className="mt-8 w-full rounded-[var(--radius-xl)] border border-border bg-card p-5">
        {practice ? (
          <>
            <p className="text-sm text-muted">You walked every step</p>
            <p className="font-display text-3xl text-harbour">Nothing logged</p>
            <p className="mt-2 text-sm text-muted">
              Next time, bring a real want. It will sit on your waitlist — not in a bag.
            </p>
          </>
        ) : outcome === "waiting" ? (
          <>
            <p className="text-sm text-muted">Come back</p>
            <p className="font-display text-3xl tabular text-harbour">
              {when || waitLabel(waitHours)}
            </p>
            <p className="mt-2 text-sm text-muted">
              {format(price)} is parked for {waitLabel(waitHours)}. The wait only
              works if you reopen it.
            </p>
          </>
        ) : outcome === "bought" ? (
          <>
            <p className="text-sm text-muted">A considered purchase</p>
            <p className="font-display text-3xl tabular">{format(price)}</p>
            <p className="mt-2 text-sm text-muted">
              Logged against this month’s joy money. No lecture. You paused first.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Kept this time</p>
            <p className="font-display text-3xl tabular text-harbour">{format(price)}</p>
            <p className="mt-2 text-sm text-muted">
              Running total kept: {format(kept)}. This pause is for {goalName}.
            </p>
          </>
        )}
      </div>
      <div className="mt-auto flex w-full flex-col gap-2 pt-8">
        {practice ? (
          <>
            <Button size="lg" className="w-full" onClick={onTryReal}>
              Try with a real want
            </Button>
            <Button variant="quiet" className="w-full" onClick={onHome}>
              Back to my day
            </Button>
          </>
        ) : outcome === "waiting" ? (
          <>
            {wantId && waitUntil ? (
              <CalendarRemind id={wantId} name={wantName} at={waitUntil} />
            ) : null}
            <Button
              size="lg"
              variant={wantId && waitUntil ? "quiet" : "primary"}
              className="w-full"
              onClick={onHome}
            >
              Back to my day
            </Button>
          </>
        ) : (
          <Button size="lg" className="w-full" onClick={onHome}>
            Back to my day
          </Button>
        )}
      </div>
    </div>
  );
}
