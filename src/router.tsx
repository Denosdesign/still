import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent, AppNotFound } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

export function getRouter() {
  return createRouter({
    routeTree,
    basepath,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: AppNotFound,
    defaultPreload: "intent",
    defaultPendingMs: 8000,
    defaultPendingMinMs: 0,
  });
}