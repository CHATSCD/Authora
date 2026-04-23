import path from "path";
import fs from "fs/promises";

export interface Chapter {
  title: string;
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

const CHAPTER_HEADING_RE =
  /^(?:chapter\s+(?:\d+|[ivxlcdm]+)|part\s+(?:\d+|[ivxlcdm]+)|\d+\.?\s+\w)/i;

function cleanHtml(html: string): string {
  return html
    // Normalise smart quotes to straight (readers re-apply their own)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // Collapse multiple spaces inside tags
    .replace(/[ \t]{2,}/g, " ")
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/gi, "")
    // Remove MS Word comment/revision artefacts (no /s flag for ES2017 compat)
    .replace(/<del[^>]*>[^<]*<\/del>/gi, "")
    // Unwrap unnecessary spans with no attributes
    .replace(/<span>(.*?)<\/span>/gi, "$1")
    // Trim trailing whitespace inside paragraph tags
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

function splitHtmlIntoChapters(html: string): Chapter[] {
  const chapterBlocks = html.split(
    /(?=<h[12][^>]*>(?:Chapter|Part|\d+\.?\s+\w)[^<]*<\/h[12]>)/i
  );

  const chapters: Chapter[] = [];

  for (const block of chapterBlocks) {
    if (!block.trim()) continue;

    const titleMatch = block.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
    const title = titleMatch
      ? titleMatch[1].trim()
      : chapters.length === 0
      ? "Preface"
      : `Chapter ${chapters.length + 1}`;

    const htmlContent = titleMatch
      ? block.replace(/<h[12][^>]*>[^<]+<\/h[12]>/i, "").trim()
      : block.trim();

    const wordCount = countWords(htmlContent);

    chapters.push({
      title,
      htmlContent,
      wordCount,
      index: chapters.length,
    });
  }

  if (chapters.length === 0 && html.trim()) {
    chapters.push({
      title: "Manuscript",
      htmlContent: html,
      wordCount: countWords(html),
      index: 0,
    });
  }

  return chapters;
}

function extractMetadataFromText(text: string): Partial<ManuscriptMetadata> {
  const lines = text.split("\n").slice(0, 30);
  const metadata: Partial<ManuscriptMetadata> = {};

  const titleLine = lines.find(
    (l) => l.trim().length > 3 && l.trim().length < 120 && !/^by\s/i.test(l.trim())
  );
  if (titleLine) metadata.title = titleLine.trim();

  const byLine = lines.find((l) => /^by\s+\w/i.test(l.trim()));
  if (byLine) metadata.author = byLine.replace(/^by\s+/i, "").trim();

  return metadata;
}

async function processDocx(filePath: string): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
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
        "p[style-name='Author'] => p.author:fresh",
      ],
    }
  );

  const html = cleanHtml(result.value);
  const plainText = htmlToPlainText(html);
  const metadata = extractMetadataFromText(plainText);

  const titleEl = html.match(/<h1 class="book-title">([^<]+)<\/h1>/i);
  if (titleEl) metadata.title = titleEl[1];

  const authorEl = html.match(/<p class="author">([^<]+)<\/p>/i);
  if (authorEl) metadata.author = authorEl[1];

  return { html, metadata };
}

async function processPdf(filePath: string): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
  const pdfParse = (await import("pdf-parse")).default;
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const lines = data.text.split("\n");
  const paragraphs: string[] = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.trim()) {
        paragraphs.push(current.trim());
        current = "";
      }
    } else if (CHAPTER_HEADING_RE.test(trimmed) && trimmed.length < 80) {
      if (current.trim()) paragraphs.push(current.trim());
      paragraphs.push(`<HEADING>${trimmed}</HEADING>`);
      current = "";
    } else {
      current += (current ? " " : "") + trimmed;
    }
  }
  if (current.trim()) paragraphs.push(current.trim());

  const html = paragraphs
    .map((p) => {
      if (p.startsWith("<HEADING>")) {
        const text = p.replace(/<\/?HEADING>/g, "");
        return `<h1>${text}</h1>`;
      }
      return `<p>${p}</p>`;
    })
    .join("\n");

  const metadata = extractMetadataFromText(data.text);
  if (data.info?.Title) metadata.title = data.info.Title;
  if (data.info?.Author) metadata.author = data.info.Author;

  return { html: cleanHtml(html), metadata };
}

async function processTxt(filePath: string): Promise<{ html: string; metadata: Partial<ManuscriptMetadata> }> {
  const text = await fs.readFile(filePath, "utf-8");
  const lines = text.split("\n");
  const htmlParts: string[] = [];
  let paragraph = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (paragraph) {
        htmlParts.push(`<p>${paragraph}</p>`);
        paragraph = "";
      }
    } else if (CHAPTER_HEADING_RE.test(trimmed) && trimmed.length < 80) {
      if (paragraph) {
        htmlParts.push(`<p>${paragraph}</p>`);
        paragraph = "";
      }
      htmlParts.push(`<h1>${trimmed}</h1>`);
    } else {
      paragraph += (paragraph ? " " : "") + trimmed;
    }
  }
  if (paragraph) htmlParts.push(`<p>${paragraph}</p>`);

  const html = cleanHtml(htmlParts.join("\n"));
  const metadata = extractMetadataFromText(text);
  return { html, metadata };
}

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
