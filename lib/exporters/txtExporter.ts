import type { ProcessedManuscript } from "../manuscriptProcessor";

const LINE_WIDTH = 72;

function center(text: string): string {
  const pad = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));
  return " ".repeat(pad) + text;
}

function rule(char = "-"): string {
  return char.repeat(LINE_WIDTH);
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrapParagraph(text: string): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).length > LINE_WIDTH) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

export function exportTxt(manuscript: ProcessedManuscript): string {
  const { metadata, chapters } = manuscript;
  const parts: string[] = [];

  // Title block
  parts.push(rule("="));
  parts.push(center(metadata.title.toUpperCase()));
  if (metadata.author) parts.push(center(`by ${metadata.author}`));
  parts.push(rule("="));
  parts.push("");

  if (metadata.description) {
    parts.push(wrapParagraph(metadata.description));
    parts.push("");
    parts.push(rule());
    parts.push("");
  }

  // Table of contents
  if (chapters.length > 1) {
    parts.push(center("CONTENTS"));
    parts.push("");
    chapters.forEach((ch, i) => {
      const num = String(i + 1).padStart(2, " ");
      const title = ch.title || `Chapter ${i + 1}`;
      const dots = ".".repeat(Math.max(2, LINE_WIDTH - num.length - title.length - 2));
      parts.push(`${num}. ${title} ${dots}`);
    });
    parts.push("");
    parts.push(rule());
    parts.push("");
  }

  // Chapters
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const title = ch.title || `Chapter ${i + 1}`;

    parts.push("");
    parts.push(center(title.toUpperCase()));
    parts.push(center(rule("~").slice(0, Math.min(title.length + 4, 40))));
    parts.push("");

    const plainText = htmlToText(ch.htmlContent);
    const paragraphs = plainText.split("\n\n").filter(Boolean);

    for (const para of paragraphs) {
      parts.push(wrapParagraph(para));
      parts.push("");
    }

    if (i < chapters.length - 1) {
      parts.push(rule());
    }
  }

  parts.push("");
  parts.push(rule("="));
  parts.push(center(`END OF "${metadata.title.toUpperCase()}"`));
  parts.push(rule("="));

  return parts.join("\n");
}
