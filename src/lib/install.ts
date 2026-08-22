import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: InstallEvent | null = null;
let bound = false;

function bindInstall() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as InstallEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
  });
}

bindInstall();

export const INSTALL_NUDGE_LIMIT = 3;

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    Boolean(nav.standalone) ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function installPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const iPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPod|iPad/.test(ua) || iPad) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function canNativeInstall() {
  return Boolean(deferred);
}

export async function promptNativeInstall() {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome === "accepted";
}

export function useStandalone() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    bindInstall();
    setOn(isStandalone());
  }, []);
  return on;
}
