import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencySelect } from "@/components/currency-select";
import { getCurrency, isPreset, normaliseCurrency } from "@/lib/currency";
import { useStillStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const navigate = useNavigate();
  const profile = useStillStore((s) => s.profile);
  const updateProfile = useStillStore((s) => s.updateProfile);
  const resetAll = useStillStore((s) => s.resetAll);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [name, setName] = useState(profile.name);
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate));
  const [fun, setFun] = useState(String(profile.funMoneyMonthly));
  const [goalName, setGoalName] = useState(profile.goalName);
  const [currency, setCurrency] = useState(profile.currency || "HKD");
  const [customCurrencies, setCustomCurrencies] = useState<string[]>(
    profile.customCurrencies ?? [],
  );
  const money = getCurrency(currency);

  function addCustom(raw: string) {
    const next = normaliseCurrency(raw);
    if (next.length !== 3) return;
    if (!isPreset(next) && !customCurrencies.includes(next)) {
      setCustomCurrencies((list) => [next, ...list].slice(0, 12));
    }
    setCurrency(next);
  }

  function save() {
    updateProfile({
      name: name.replace(/\s+/g, " ").trim().slice(0, 20),
      hourlyRate: Math.max(1, Number(hourlyRate) || 150),
      funMoneyMonthly: Math.max(0, Number(fun) || 0),
      goalName: goalName.trim() || "A quieter year",
      currency,
      customCurrencies,
      setupDone: true,
      seenWelcome: true,
      rateSet: true,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Shell>
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">You</p>
        <h1 className="mt-1 font-display text-3xl">Your numbers</h1>
        <p className="mt-2 text-sm text-muted">
          Used only on this device. Hourly rate turns prices into hours of your life.
        </p>
      </header>

      <div className="space-y-4">
        <Field label="What shall we call you?">
          <Input
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder="Optional"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Currency">
          <CurrencySelect
            value={currency}
            custom={customCurrencies}
            onChange={setCurrency}
            onAdd={addCustom}
          />
        </Field>
        <Field label={`Hourly rate (${money.symbol.trim() || money.code})`}>
          <Input
            inputMode="decimal"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
          />
        </Field>
        <Field label={`Monthly joy money (${money.symbol.trim() || money.code})`}>
          <Input
            inputMode="decimal"
            value={fun}
            onChange={(e) => setFun(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <p className="mt-1 text-xs text-muted">
            Planned pleasure is not the enemy. Impulse is. Leave yourself a budget that is allowed.
          </p>
        </Field>
        <Field label="Why you pause">
          <Input
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="A quieter year, a trip…"
          />
          <p className="mt-1 text-xs text-muted">
            A reason, not a savings target. We do not count dollars toward it.
          </p>
        </Field>
        <Button size="lg" className="w-full" onClick={save}>
          {saved ? "Saved — well done for setting this" : "Save"}
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl">How to use Still</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>When a want hits, open the app before you open the shop.</li>
          <li>Name the thing and the price. Ride the ninety-second wave.</li>
          <li>Hold it on the waitlist. Review it only when the timer is done.</li>
          <li>Check in on loud days. A twenty-second visit still counts.</li>
        </ol>
        <Link to="/insights" className="mt-4 inline-block text-sm text-harbour">
          Read the science behind each step
        </Link>
      </section>

      <section className="mt-10 rounded-[var(--radius-lg)] border border-border p-4">
        <p className="text-sm font-medium">Start again</p>
        <p className="mt-1 text-sm text-muted">
          Clears pauses and check-ins from this device. Cannot be undone.
        </p>
        {confirmReset ? (
          <Button
            variant="danger"
            className="mt-3 w-full"
            onClick={() => {
              resetAll();
              navigate({ to: "/" });
            }}
          >
            Yes, clear everything
          </Button>
        ) : (
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setConfirmReset(true)}>
            Reset this device
          </Button>
        )}
      </section>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
