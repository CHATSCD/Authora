import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { ProcessedManuscript } from "./manuscriptProcessor";

const STORE_DIR = "/tmp/authora-uploads";

// In-process cache to avoid redundant disk reads within the same Lambda instance
const cache = new Map<string, ProcessedManuscript>();

export const manuscriptStore = {
  async get(id: string): Promise<ProcessedManuscript | undefined> {
    if (cache.has(id)) return cache.get(id);
    try {
      const data = await readFile(path.join(STORE_DIR, `${id}.json`), "utf-8");
      const manuscript = JSON.parse(data) as ProcessedManuscript;
      cache.set(id, manuscript);
      return manuscript;
    } catch {
      return undefined;
    }
  },

  async set(id: string, manuscript: ProcessedManuscript): Promise<void> {
    cache.set(id, manuscript);
    try {
      await mkdir(STORE_DIR, { recursive: true });
      await writeFile(
        path.join(STORE_DIR, `${id}.json`),
        JSON.stringify(manuscript),
        "utf-8"
      );
    } catch (err) {
      console.error("[store] disk write failed:", err);
    }
  },

  async patch(id: string, updates: Partial<ProcessedManuscript["metadata"]>): Promise<ProcessedManuscript | null> {
    const manuscript = await this.get(id);
    if (!manuscript) return null;
    const updated = { ...manuscript, metadata: { ...manuscript.metadata, ...updates } };
    await this.set(id, updated);
    return updated;
  },
};
