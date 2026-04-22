import type { ProcessedManuscript } from "../manuscriptProcessor";

export function exportHtml(manuscript: ProcessedManuscript): string {
  const { metadata, chapters } = manuscript;

  const tocItems = chapters
    .map(
      (ch, i) =>
        `      <li><a href="#chapter-${i}">${escapeHtml(ch.title || `Chapter ${i + 1}`)}</a></li>`
    )
    .join("\n");

  const chapterHtml = chapters
    .map(
      (ch, i) => `
  <section id="chapter-${i}" class="chapter">
    <h1>${escapeHtml(ch.title || `Chapter ${i + 1}`)}</h1>
    ${ch.htmlContent}
  </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.language)}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="author" content="${escapeHtml(metadata.author)}"/>
  <meta name="description" content="${escapeHtml(metadata.description)}"/>
  <title>${escapeHtml(metadata.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18px;
      line-height: 1.75;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    h1 { font-size: 2em; margin: 2.5rem 0 1rem; }
    h2 { font-size: 1.5em; margin: 2rem 0 0.75rem; }
    h3 { font-size: 1.2em; margin: 1.5rem 0 0.5rem; }
    p { margin: 0 0 1em; text-indent: 1.5em; }
    p:first-of-type { text-indent: 0; }
    blockquote { margin: 1.5em 2em; font-style: italic; border-left: 3px solid #c4711f; padding-left: 1em; }
    .chapter { page-break-before: always; padding-top: 4rem; }
    .chapter:first-of-type { page-break-before: auto; }
    nav#toc { margin-bottom: 4rem; }
    nav#toc h2 { font-size: 1.2em; text-transform: uppercase; letter-spacing: 0.08em; color: #6c3a1a; }
    nav#toc ol { line-height: 2; }
    nav#toc a { color: #c4711f; text-decoration: none; }
    nav#toc a:hover { text-decoration: underline; }
    .book-header { text-align: center; padding: 6rem 0 4rem; border-bottom: 1px solid #ecc47e; margin-bottom: 4rem; }
    .book-header h1 { font-size: 3em; margin: 0 0 0.5rem; }
    .book-header .author { font-size: 1.2em; color: #6c3a1a; }
    @media print {
      .chapter { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="book-header">
    <h1>${escapeHtml(metadata.title)}</h1>
    ${metadata.author ? `<p class="author">by ${escapeHtml(metadata.author)}</p>` : ""}
  </div>

  ${
    chapters.length > 1
      ? `<nav id="toc">
    <h2>Table of Contents</h2>
    <ol>
${tocItems}
    </ol>
  </nav>`
      : ""
  }
${chapterHtml}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
