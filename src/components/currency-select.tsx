import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PRESET_CODES,
  getCurrency,
  isPreset,
  normaliseCurrency,
} from "@/lib/currency";

const ADD = "__add";

export function CurrencySelect({
  value,
  custom,
  onChange,
  onAdd,
}: {
  value: string;
  custom: string[];
  onChange: (code: string) => void;
  onAdd: (code: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const extras = custom.filter((c) => !isPreset(c));
  const money = getCurrency(value);

  function submit() {
    const next = normaliseCurrency(draft);
    if (next.length !== 3) return;
    onAdd(next);
    setDraft("");
    setAdding(false);
  }

  return (
    <div>
      <select
        value={adding ? ADD : value}
        onChange={(e) => {
          const next = e.target.value;
          if (next === ADD) {
            setAdding(true);
            return;
          }
          setAdding(false);
          onChange(next);
        }}
        className="flex h-12 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-card bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 pr-10 text-base text-ink focus-visible:border-harbour focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b645c' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`,
        }}
        aria-label="Currency"
      >
        {PRESET_CODES.map((code) => (
          <option key={code} value={code}>
            {code} · {getCurrency(code).name}
          </option>
        ))}
        {extras.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
        <option value={ADD}>Add another…</option>
      </select>
      {adding && (
        <div className="mt-2 flex gap-2">
          <Input
            autoFocus
            maxLength={3}
            placeholder="SGD"
            value={draft}
            onChange={(e) => setDraft(normaliseCurrency(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            className="h-12 uppercase"
          />
          <Button type="button" onClick={submit} disabled={draft.length !== 3}>
            Add
          </Button>
        </div>
      )}
      <p className="mt-1.5 text-xs text-faint">
        {money.known
          ? `${money.symbol.trim()} · ${money.name}`
          : "Your own code. Type the numbers yourself — no suggested amounts."}
      </p>
    </div>
  );
}
