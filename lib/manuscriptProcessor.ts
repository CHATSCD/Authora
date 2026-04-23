import path from "path";
import fs from "fs/promises";

export interface Chapter {
  title: string;
  subtitle: string;
  htmlContent: string;
  wordCount: number;
  index: number;
}

export interface ManuscriptMetadata {
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
}

export interface ProcessedManuscript {
  id: string;
  originalFilename: string;
  fileType: string;
  metadata: ManuscriptMetadata;
  chapters: Chapter[];
  processedAt: string;
}

// ─── Heading detection patterns ─────────────────────────────────────────────

// "Chapter 1", "Chapter One", "Chapter I", "Part 2", "Book 3", "Volume IV"
const EXPLICIT_CHAPTER_RE =
  /^(?:chapter|part|book|section|volume)\s+(?:\d+|[ivxlcdmIVXLCDM]{1,8}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|thirty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?)\b/i;

// Named special sections
const SPECIAL_SECTION_RE =
  /^(?:prologue|epilogue|preface|foreword|introduction|conclusion|afterword|appendix|interlude|intermission|coda|overture|envoi|postscript|acknowledgements?|dedication|about the author|bibliography|glossary|index|author['']?s note)\s*$/i;

// A bare number or Roman numeral on its own line (e.g. "1", "XIV", "iv.")
const STANDALONE_NUMBER_RE = /^(?:\d{1,3}|[ivxlcdmIVXLCDM]{1,8})\s*\.?\s*$/;

// Written-out numbers standing alone: "One", "Two", …
const WRITTEN_NUMBER_RE =
  /^(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|thirty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?)\s*$/i;

const SMALL_WORDS = new Set([
  "a","an","the","and","but","or","nor","for","so","yet","at","by","in",
  "of","on","to","up","as","is","it","its","via","vs",
]);

function isTitleCase(str: string): boolean {
  const words = str.split(/\s+/);
  // Reject very long lines — they're prose, not headings
  if (words.length > 9) return false;
  return words.every(
    (w, i) =>
      i === 0 ||
      SMALL_WORDS.has(w.toLowerCase()) ||
      (w.length > 0 && w[0] === w[0].toUpperCase() && /[A-Za-z]/.test(w[0]))
  );
}

/**
 * Decide whether a plain-text line is a chapter/section heading.
 * prevBlank / nextBlank indicate whether the surrounding lines were blank.
 */
function isPlainTextHeading(
  line: string,
  prevBlank: boolean,
  nextBlank: boolean
): boolean {
  const t = line.trim();
  if (!t || t.length > 100) return false;

  // Always a heading regardless of surrounding whitespace
  if (EXPLICIT_CHAPTER_RE.test(t)) return true;
  if (SPECIAL_SECTION_RE.test(t)) return true;

  // These patterns only count as headings when surrounded by blank lines
  if (!(prevBlank && nextBlank)) return false;

  if (STANDALONE_NUMBER_RE.test(t)) return true;
  if (WRITTEN_NUMBER_RE.test(t)) return true;

  // Short all-caps line (e.g. "THE BEGINNING", "PART ONE")
  if (
    t === t.toUpperCase() &&
    t.length <= 60 &&
    /[A-Z]/.test(t) &&
    !/[.!?,;]$/.test(t)
  )
    return true;

  // Short Title Case line with no trailing sentence punctuation
  if (t.length <= 70 && !/[.!?,;]$/.test(t) && isTitleCase(t)) return true;

  return false;
}

// ─── HTML utilities ──────────────────────────────────────────────────────────

function cleanHtml(html: string): string {
  return html
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[ \t]{2,}/g, " ")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<del[^>]*>[^<]*<\/del>/gi, "")
    .replace(/<span>(.*?)<\/span>/gi, "$1")
    .replace(/<p>\s+/gi, "<p>")
    .replace(/\s+<\/p>/gi, "</p>")
    .trim();
}

function countWords(text: string): number {
  return text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── HTML chapter splitter (DOCX output) ────────────────────────────────────

function splitHtmlIntoChapters(html: string): Chapter[] {
  // Try splitting on h1 first, fall back to h2 if we get fewer than 2 chunks
  const tryLevel = (level: string): string[] => {
    const re = new RegExp(`(?=<${level}(?:\\s[^>]*)?>)`, "gi");
    const parts = html.split(re).filter((s) => s.trim());
    return parts.length >= 2 ? parts : [];
  };

  const blocks = tryLevel("h1") || tryLevel("h2") || [html];

  const chapters: Chapter[] = [];

  for (const block of blocks) {
    if (!block.trim()) continue;

    // Extract first heading as title
    const h1Match = block.match(/<h1(?:\s[^>]*)?>([^<]+)<\/h1>/i);
    const h2Match = block.match(/<h2(?:\s[^>]*)?>([^<]+)<\/h2>/i);
    const headingMatch = h1Match || h2Match;

    const rawTitle = headingMatch ? headingMatch[1].trim() : "";

    // Strip the heading tag from content
    const body = headingMatch
      ? block.replace(/<h[12](?:\s[^>]*)?>([^<]+)<\/h[12]>/i, "").trim()
      : block.trim();

    // Look for a subtitle: the next heading level or a short italic/bold paragraph
    const subtitleMatch = body.match(/<h[23](?:\s[^>]*)?>([^<]+)<\/h[23]>/i);
    const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "";

    // Derive a display title
    const title =
      rawTitle ||
      (chapters.length === 0 ? "Preface" : `Chapter ${chapters.length + 1}`);

    chapters.push({
      title,
      subtitle,
      htmlContent: body,
      wordCount: countWords(body),
      index: chapters.length,
    });
  }

  // If the whole document has no headings, one chapter
  if (chapters.length === 0 && html.trim()) {
    chapters.push({
      title: "Manuscript",
      subtitle: "",
      htmlContent: html,
      wordCount: countWords(html),
      index: 0,
    });
  }

  return chapters;
}

// ─── Metadata extractor ──────────────────────────────────────────────────────

function extractMetadataFromText(text: string): Partial<ManuscriptMetadata> {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40);

  const metadata: Partial<ManuscriptMetadata> = {};

  // First non-empty, non-"by" line that isn't a chapter heading
  const titleLine = lines.find(
    (l) =>
      l.length > 3 &&
      l.length < 120 &&
      !/^by\s/i.test(l) &&
      !EXPLICIT_CHAPTER_RE.test(l) &&
      !SPECIAL_SECTION_RE.test(l)
  );
  if (titleLine) metadata.title = titleLine;

  const byLine = lines.find((l) => /^by\s+\w/i.test(l));
  if (byLine) metadata.author = byLine.replace(/^by\s+/i, "").trim();

  return metadata;
}

// ─── Plain-text → HTML conversion with context-aware heading detection ───────

function plainTextToHtml(text: string): string {
  // Split into raw lines, preserving blank lines as paragraph separators
  const rawLines = text.split("\n");
  const htmlParts: string[] = [];
  let paragraph = "";

  const flush = () => {
    if (paragraph.trim()) {
      htmlParts.push(`<p>${paragraph.trim()}</p>`);
      paragraph = "";
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    const prevBlank = i === 0 || !rawLines[i - 1].trim();
    const nextBlank = i === rawLines.length - 1 || !rawLines[i + 1].trim();

    if (isPlainTextHeading(trimmed, prevBlank, nextBlank)) {
      flush();
      htmlParts.push(`<h1>${trimmed}</h1>`);
    } else {
      paragraph += (paragraph ? " " : "") + trimmed;
    }
  }
  flush();

  return htmlParts.join("\n");
}

// ─── File parsers ─────────────────────────────────────────────────────────────

async function processDocx(
  filePath: string
): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
  const mammoth = await import("mammoth");
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.book-title:fresh",
        "p[style-name='Subtitle'] => h2.book-subtitle:fresh",
        "p[style-name='Author'] => p.book-author:fresh",
      ],
    }
  );

  const html = cleanHtml(result.value);
  const plainText = htmlToPlainText(html);
  const metadata = extractMetadataFromText(plainText);

  const titleEl = html.match(/<h1 class="book-title">([^<]+)<\/h1>/i);
  if (titleEl) metadata.title = titleEl[1];

  const authorEl = html.match(/<p class="book-author">([^<]+)<\/p>/i);
  if (authorEl) metadata.author = authorEl[1];

  return { html, metadata };
}

async function processPdf(
  filePath: string
): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
  const pdfParse = (await import("pdf-parse")).default;
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const html = cleanHtml(plainTextToHtml(data.text));
  const metadata = extractMetadataFromText(data.text);
  if (data.info?.Title) metadata.title = data.info.Title;
  if (data.info?.Author) metadata.author = data.info.Author;

  return { html, metadata };
}

async function processTxt(
  filePath: string
): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
  const text = await fs.readFile(filePath, "utf-8");
  const html = cleanHtml(plainTextToHtml(text));
  const metadata = extractMetadataFromText(text);
  return { html, metadata };
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function processManuscript(
  filePath: string,
  originalFilename: string,
  id: string
): Promise<ProcessedManuscript> {
  const ext = path.extname(originalFilename).toLowerCase();

  let html = "";
  let partialMeta: Partial<ManuscriptMetadata> = {};

  if (ext === ".docx" || ext === ".doc") {
    ({ html, metadata: partialMeta } = await processDocx(filePath));
  } else if (ext === ".pdf") {
    ({ html, metadata: partialMeta } = await processPdf(filePath));
  } else {
    ({ html, metadata: partialMeta } = await processTxt(filePath));
  }

  const chapters = splitHtmlIntoChapters(html);

  const metadata: ManuscriptMetadata = {
    title: partialMeta.title ?? path.basename(originalFilename, ext),
    author: partialMeta.author ?? "",
    description: "",
    genre: "",
    language: "en",
  };

  return {
    id,
    originalFilename,
    fileType: ext.replace(".", ""),
    metadata,
    chapters,
    processedAt: new Date().toISOString(),
  };
}
