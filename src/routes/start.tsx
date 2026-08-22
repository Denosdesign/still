import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Leaf, PencilLine, Plane, Shield } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  fromHourlyRate,
  roundPay,
  toHourlyRate,
  type PayPeriod,
} from "@/lib/format";
import {
  formatMoney,
  getCurrency,
  isPreset,
  normaliseCurrency,
} from "@/lib/currency";
import { CurrencySelect } from "@/components/currency-select";
import { useStillStore } from "@/lib/store";

export const Route = createFileRoute("/start")({ component: StartPage });

const PERIODS: { id: PayPeriod; label: string }[] = [
  { id: "hour", label: "Hour" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

const NAME_MAX = 20;

const GOALS = [
  { name: "A quieter year", hint: "Less stuff, more room", icon: Leaf },
  { name: "A trip", hint: "Kyushu, Seoul, anywhere", icon: Plane },
  { name: "An emergency fund", hint: "Sleep-at-night money", icon: Shield },
  { name: "Something of mine", hint: "Name it yourself", icon: PencilLine },
] as const;

function StartPage() {
  const navigate = useNavigate();
  const profile = useStillStore((s) => s.profile);
  const updateProfile = useStillStore((s) => s.updateProfile);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [period, setPeriod] = useState<PayPeriod>("hour");
  const [raw, setRaw] = useState(
    profile.rateSet ? String(profile.hourlyRate) : "",
  );
  const [joy, setJoy] = useState(
    profile.setupDone ? profile.funMoneyMonthly : getCurrency(profile.currency || "HKD").joyDefault,
  );
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency || "HKD");
  const [customCurrencies, setCustomCurrencies] = useState<string[]>(
    profile.customCurrencies ?? [],
  );
  const money = getCurrency(currency);
  const [goalName, setGoalName] = useState(
    profile.setupDone ? profile.goalName : "A quieter year",
  );
  const [goalCustom, setGoalCustom] = useState("");

  const amount = Number.parseFloat(raw.replace(/,/g, "")) || 0;
  const hourly = roundPay(toHourlyRate(amount, period));
  const canSee = hourly >= 1;
  const resolvedGoal =
    goalName === "Something of mine"
      ? goalCustom.trim() || "Something of mine"
      : goalName;

  function setPeriodAndKeep(next: PayPeriod) {
    if (next === period) return;
    if (hourly >= 1) setRaw(String(fromHourlyRate(hourly, next)));
    setPeriod(next);
  }

  function pickChip(n: number) {
    setRaw(String(n));
  }

  function pickCurrency(code: string) {
    const next = normaliseCurrency(code) || "HKD";
    setCurrency(next);
    if (!profile.rateSet) {
      setRaw("");
      setJoy(getCurrency(next).joyDefault);
    }
  }

  function addCurrency(raw: string) {
    const next = normaliseCurrency(raw);
    if (next.length !== 3) return;
    if (!isPreset(next) && !customCurrencies.includes(next)) {
      setCustomCurrencies((list) => [next, ...list].slice(0, 12));
    }
    pickCurrency(next);
  }

  function commit(to: "/" | "/pause") {
    updateProfile({
      name: clipName(name),
      currency,
      customCurrencies,
      hourlyRate: Math.max(1, hourly || money.skipHourly || profile.hourlyRate || 1),
      funMoneyMonthly: Math.max(0, joy),
      goalName: resolvedGoal,
      rateSet: true,
      setupDone: true,
      seenWelcome: true,
    });
    navigate({ to });
  }

  function back() {
    if (step === 0) {
      navigate({ to: "/" });
      return;
    }
    setStep((s) => (s === 2 ? 1 : 0));
  }

  return (
    <Shell hideNav>
      <header className="mb-4 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={back}
          className="flex size-11 items-center justify-center rounded-[var(--radius-md)] text-ink hover:bg-harbour-soft/60"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Start
          </p>
          <p className="truncate font-display text-lg text-ink">
            {step === 0
              ? "A few rough numbers"
              : step === 1
                ? "Earn, then a little joy"
                : "What is it for?"}
          </p>
        </div>
      </header>
      <div className="mb-4 flex shrink-0 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= step ? "bg-harbour" : "bg-border",
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <WhyStep
          name={name}
          onName={setName}
          currency={currency}
          customCurrencies={customCurrencies}
          onCurrency={pickCurrency}
          onAddCurrency={addCurrency}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <PayStep
          currency={currency}
          period={period}
          raw={raw}
          hourly={hourly}
          joy={joy}
          canSee={canSee}
          onPeriod={setPeriodAndKeep}
          onRaw={setRaw}
          onChip={pickChip}
          onJoy={setJoy}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <HoursStep
          goalName={goalName}
          goalCustom={goalCustom}
          onGoalName={setGoalName}
          onGoalCustom={setGoalCustom}
          onHome={() => commit("/")}
          onPause={() => commit("/pause")}
        />
      )}
    </Shell>
  );
}

function WhyStep({
  name,
  onName,
  currency,
  customCurrencies,
  onCurrency,
  onAddCurrency,
  onNext,
}: {
  name: string;
  onName: (v: string) => void;
  currency: string;
  customCurrencies: string[];
  onCurrency: (code: string) => void;
  onAddCurrency: (raw: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <h1 className="font-display text-3xl leading-tight text-ink">
          Prices are easy to shrug off. Hours of your life are not.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          One rough number for what an hour of you is worth, a little joy money that is allowed,
          and one reason to pause. We are not keeping a ledger.
        </p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium text-muted">
            What shall we call you?
          </span>
          <Input
            value={name}
            maxLength={NAME_MAX}
            placeholder="Optional"
            autoComplete="given-name"
            onChange={(e) => onName(e.target.value.slice(0, NAME_MAX))}
          />
          <p className="mt-1.5 text-xs text-faint">Leave blank if you prefer. First name is enough.</p>
        </label>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium text-muted">Currency</span>
          <CurrencySelect
            value={currency}
            custom={customCurrencies}
            onChange={onCurrency}
            onAdd={onAddCurrency}
          />
        </label>
      </div>
      <div
        className="shrink-0 border-t border-border bg-surface pt-3"
        style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
      >
        <Button size="lg" className="w-full" onClick={onNext}>
          Continue
        </Button>
      </div>
    </>
  );
}

function PayStep({
  currency,
  period,
  raw,
  hourly,
  joy,
  canSee,
  onPeriod,
  onRaw,
  onChip,
  onJoy,
  onNext,
}: {
  currency: string;
  period: PayPeriod;
  raw: string;
  hourly: number;
  joy: number;
  canSee: boolean;
  onPeriod: (p: PayPeriod) => void;
  onRaw: (v: string) => void;
  onChip: (n: number) => void;
  onJoy: (n: number) => void;
  onNext: () => void;
}) {
  const money = getCurrency(currency);
  const chips = money.pay[period];
  const selected = amountEquals(raw, chips);
  const prefix = money.symbol.trim() || money.code;
  const pad = prefix.length > 2 ? "pl-16" : "pl-12";
  const monthlyPay = fromHourlyRate(hourly, "month");
  const joyMax = joySliderMax(monthlyPay, money);
  const joyChips =
    monthlyPay > 0
      ? JOY_PCTS.map((p) => ({
          value: Math.round(((monthlyPay * p) / 100) / money.step) * money.step,
          label: `${p}%`,
        }))
      : money.joyChips.map((n) => ({
          value: n,
          label: formatMoney(n, currency),
        }));
  const joyHintText =
    monthlyPay > 0 && joy > 0 ? joyHint((joy / monthlyPay) * 100) : "";

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <p className="text-sm text-muted">
          Rough is better than blank. {money.known ? "Pick a starting point, or type your own." : "Type your own numbers."}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-full bg-harbour-soft/80 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriod(p.id)}
              className={cn(
                "h-10 rounded-full text-sm font-medium",
                period === p.id ? "bg-harbour text-harbour-fg" : "text-harbour",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-faint">
          Per {period}
        </p>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl text-faint">
            {prefix}
          </span>
          <Input
            inputMode="decimal"
            placeholder=""
            value={raw}
            onChange={(e) => onRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            className={cn("h-16 font-display text-3xl tabular tracking-tight", pad)}
          />
        </div>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChip(n)}
                className={cn(
                  "h-9 rounded-full border px-3 text-sm",
                  selected === n
                    ? "border-harbour bg-harbour-soft text-harbour"
                    : "border-border bg-card text-muted",
                )}
              >
                {formatMoney(n, currency)}
              </button>
            ))}
          </div>
        )}
        {canSee && period !== "hour" && (
          <p className="mt-4 rounded-[var(--radius-lg)] bg-harbour-soft/80 px-4 py-3 text-sm text-harbour">
            That is about {formatMoney(hourly, currency)} an hour
            {period === "month"
              ? ", assuming 8-hour days, 22 days a month."
              : ", assuming 8-hour days across the year."}
          </p>
        )}

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-faint">
            Monthly joy money
          </p>
          <p className="mt-1 text-sm text-muted">
            Planned pleasure is allowed. Impulse is the problem.
          </p>
          {money.known ? (
            <MoneySlider
              value={joy}
              min={0}
              max={joyMax}
              step={money.step}
              chips={joyChips}
              hint={joyHintText}
              prefix={prefix}
              format={(n) => formatMoney(n, currency)}
              onChange={onJoy}
            />
          ) : (
            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl text-faint">
                {prefix}
              </span>
              <Input
                inputMode="decimal"
                value={joy ? String(joy) : ""}
                onChange={(e) => onJoy(Number(e.target.value.replace(/[^0-9.]/g, "")) || 0)}
                className={cn("h-14 font-display text-2xl tabular", pad)}
              />
            </div>
          )}
        </div>
      </div>
      <div
        className="shrink-0 border-t border-border bg-surface pt-3"
        style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
      >
        <Button size="lg" className="w-full" disabled={!canSee} onClick={onNext}>
          Continue
        </Button>
      </div>
    </>
  );
}

function HoursStep({
  goalName,
  goalCustom,
  onGoalName,
  onGoalCustom,
  onHome,
  onPause,
}: {
  goalName: string;
  goalCustom: string;
  onGoalName: (n: string) => void;
  onGoalCustom: (n: string) => void;
  onHome: () => void;
  onPause: () => void;
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <p className="text-sm text-muted">
          Not a savings target. A reason. When a want hits, this is what you are pausing for.
        </p>
        <div className="mt-5 space-y-2">
          {GOALS.map((g) => {
            const on = goalName === g.name;
            const Icon = g.icon;
            return (
              <button
                key={g.name}
                type="button"
                onClick={() => onGoalName(g.name)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors",
                  on
                    ? "border-harbour bg-harbour text-harbour-fg"
                    : "border-border bg-card text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                    on ? "bg-harbour-fg/10" : "bg-harbour-soft text-harbour",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <p className="font-display text-base leading-tight">{g.name}</p>
                  <p className={cn("mt-0.5 text-xs", on ? "text-harbour-fg/70" : "text-muted")}>
                    {g.hint}
                  </p>
                </span>
              </button>
            );
          })}
        </div>
        {goalName === "Something of mine" && (
          <Input
            className="mt-3 h-12"
            placeholder="A quieter flat, a camera, more rest…"
            value={goalCustom}
            onChange={(e) => onGoalCustom(e.target.value)}
          />
        )}
      </div>
      <div
        className="shrink-0 border-t border-border bg-surface pt-3"
        style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
      >
        <Button size="lg" className="w-full" onClick={onHome}>
          That’s enough for now
        </Button>
        <Button variant="quiet" className="mt-1 w-full" onClick={onPause}>
          I want something
        </Button>
      </div>
    </>
  );
}

function MoneySlider({
  value,
  min,
  max,
  step,
  chips,
  hint,
  prefix,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  chips: { value: number; label: string }[];
  hint?: string;
  prefix: string;
  format: (n: number) => string;
  onChange: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value || ""));
  const pct = Math.max(
    0,
    Math.min(100, ((Math.min(value, max) - min) / (max - min)) * 100),
  );
  const pad = prefix.length > 2 ? "pl-16" : "pl-12";
  const sliderValue = Math.min(max, Math.max(min, value));

  function startEdit() {
    setDraft(value ? String(value) : "");
    setEditing(true);
  }

  function commit() {
    const n = Number.parseFloat(draft.replace(/,/g, ""));
    onChange(Number.isFinite(n) && n >= 0 ? n : 0);
    setEditing(false);
  }

  return (
    <div className="mt-3">
      {editing ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl text-faint">
            {prefix}
          </span>
          <Input
            autoFocus
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") setEditing(false);
            }}
            className={cn("h-16 font-display text-3xl tabular tracking-tight", pad)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="inline-flex items-baseline gap-[0.35em] font-display text-3xl tabular tracking-tight text-ink"
          aria-label="Type monthly joy money"
        >
          <span>{format(value)}</span>
          <PencilLine
            className="relative top-[0.08em] size-[0.48em] shrink-0 text-faint"
            strokeWidth={1.8}
            aria-hidden
          />
        </button>
      )}
      <div className="relative mt-3 h-8">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-harbour-soft" />
        <div
          className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-harbour"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onMouseDown={() => {
            if (editing) commit();
          }}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent accent-harbour"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={sliderValue}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setEditing(false);
              onChange(chip.value);
            }}
            className={cn(
              "h-9 rounded-full border px-3 text-sm",
              Math.abs(value - chip.value) <= step
                ? "border-harbour bg-harbour-soft text-harbour"
                : "border-border bg-card text-muted",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      {hint ? (
        <p className="mt-3 text-xs leading-relaxed text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

function joySliderMax(
  monthlyPay: number,
  money: { joyMax: number; skipHourly: number; step: number },
) {
  const floor = money.joyMax;
  if (!(monthlyPay > 0) || floor <= 0) return floor;
  const typicalMonth = fromHourlyRate(money.skipHourly, "month");
  const ratio = typicalMonth > 0 ? floor / typicalMonth : 0.3;
  const scaled = monthlyPay * ratio;
  const thirty = Math.round((monthlyPay * 0.3) / money.step) * money.step;
  const stepped = Math.round(scaled / money.step) * money.step;
  return Math.max(floor, stepped, thirty);
}

const JOY_PCTS = [10, 15, 20, 25, 30] as const;

function joyHint(pct: number) {
  if (pct < 12.5) {
    return "Conservative. For a large savings goal, or if you want assets to grow quickly.";
  }
  if (pct < 17.5) {
    return "Balanced. Enough joy without feeling too tight.";
  }
  if (pct < 22.5) {
    return "Steady income, and the savings rate is already enough.";
  }
  if (pct < 27.5) {
    return "More weight on lifestyle and enjoying it now.";
  }
  return "Only if this does not eat into savings.";
}

function amountEquals(raw: string, chips: number[]) {
  const n = Number.parseFloat(raw.replace(/,/g, ""));
  if (!n) return null;
  return chips.find((c) => c === n) ?? null;
}

function clipName(raw: string) {
  return raw.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
}