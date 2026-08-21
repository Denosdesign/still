import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { normaliseTag, tagMatches, uniqueTags } from "@/lib/types";

export function TagPicker({
  label,
  value,
  onChange,
  onRemember,
  presets,
  custom = [],
  recent = [],
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemember: (value: string) => void;
  presets: readonly string[];
  custom?: string[];
  recent?: string[];
  placeholder: string;
}) {
  const [query, setQuery] = useState(value);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const library = useMemo(
    () => uniqueTags([...presets, ...custom]),
    [presets, custom],
  );

  const trimmed = normaliseTag(query);
  const searching = trimmed.length > 0 && trimmed.toLowerCase() !== value.toLowerCase();

  const exact = library.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const canCreate = searching && !exact;

  const recents = uniqueTags(recent);
  const compact = uniqueTags(
    recents.length > 0 ? recents.slice(0, 4) : [...presets].slice(0, 4),
  ).filter((t) => t !== value);

  const visible = searching
    ? library.filter((t) => tagMatches(t, trimmed))
    : showAll
      ? library
      : compact;

  const hiddenCount = Math.max(0, library.length - compact.length);
  const canToggle = !searching && hiddenCount > 0;

  function pick(tag: string) {
    const next = normaliseTag(tag);
    if (!next) return;
    onChange(next);
    onRemember(next);
    setQuery(next);
    setShowAll(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (visible[0]) pick(visible[0]);
      else if (trimmed) pick(trimmed);
    } else if (e.key === "Escape") {
      setShowAll(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {canToggle && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-harbour-soft px-2.5 text-xs font-medium text-harbour"
          >
            {showAll ? (
              <>
                Show less
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Show all
                <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        )}
      </div>
      <div className="relative">
        <Input
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
          onKeyDown={onKeyDown}
          className="pr-11"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear tag"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[var(--radius-sm)] text-faint hover:text-ink"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {value && !searching && (
          <span className="inline-flex h-8 items-center rounded-full bg-harbour px-3 text-xs font-medium text-harbour-fg">
            {value}
          </span>
        )}
        {canCreate && (
          <button
            type="button"
            onClick={() => pick(trimmed)}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-harbour px-3 text-xs font-medium text-harbour"
          >
            <Plus className="size-3" />
            Add {trimmed}
          </button>
        )}
        {visible
          .filter((t) => t !== value)
          .map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => pick(tag)}
              className="h-8 rounded-full border border-border bg-card px-3 text-xs text-muted transition-colors hover:border-harbour hover:text-harbour"
            >
              {tag}
            </button>
          ))}
      </div>
    </div>
  );
}
