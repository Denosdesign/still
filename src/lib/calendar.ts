/** Download a calendar event so review has an ending outside the app. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function icsUtc(ts: number) {
  const d = new Date(ts);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string) {
  if (line.length <= 74) return line;
  const parts = [line.slice(0, 74)];
  for (let i = 74; i < line.length; i += 73) {
    parts.push(` ${line.slice(i, i + 73)}`);
  }
  return parts.join("\r\n");
}

export function reviewPageUrl(id: string) {
  if (typeof window === "undefined") return `/review/${id}`;
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(
    /\/+$/,
    "",
  );
  return `${base}/review/${id}`;
}

export function buildReviewIcs(input: {
  id: string;
  name: string;
  at: number;
}) {
  const start = input.at;
  const end = start + 15 * 60 * 1000;
  const title = `Still: how does ${input.name} feel?`;
  const url = reviewPageUrl(input.id);
  const desc = `The itch had a night. How does ${input.name} feel?\n\nOpen Still and review.\n${url}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Still//Pause//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:still-${input.id}@still.app`,
    `DTSTAMP:${icsUtc(Date.now())}`,
    `DTSTART:${icsUtc(start)}`,
    `DTEND:${icsUtc(end)}`,
    fold(`SUMMARY:${icsEscape(title)}`),
    fold(`DESCRIPTION:${icsEscape(desc)}`),
    fold(`URL:${url}`),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${icsEscape(`The itch had a night. How does ${input.name} feel?`)}`),
    "TRIGGER:PT0S",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];
  return lines.join("\r\n");
}

function slug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "want"
  );
}

export function downloadReviewEvent(input: {
  id: string;
  name: string;
  at: number;
}) {
  const ics = buildReviewIcs(input);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `still-${slug(input.name)}.ics`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
