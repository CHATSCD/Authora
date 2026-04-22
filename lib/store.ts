import type { ProcessedManuscript } from "./manuscriptProcessor";

declare global {
  // eslint-disable-next-line no-var
  var __manuscriptStore: Map<string, ProcessedManuscript> | undefined;
}

// Use a global to survive Next.js hot-reloads in dev
global.__manuscriptStore ??= new Map<string, ProcessedManuscript>();

export const manuscriptStore = global.__manuscriptStore;
