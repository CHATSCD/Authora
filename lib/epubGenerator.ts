import type { ProcessedManuscript } from "./manuscriptProcessor";

interface EpubFile {
  name: string;
  content: string;
  mediaType: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOpf(manuscript: ProcessedManuscript): string {
  const { metadata, chapters } = manuscript;
  const manifestItems = chapters
    .map(
      (_, i) =>
        `    <item id="chapter${i}" href="chapter${i}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join("\n");

  const spineItems = chapters
    .map((_, i) => `    <itemref idref="chapter${i}"/>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${manuscript.id}</dc:identifier>
    <dc:title>${escapeXml(metadata.title)}</dc:title>
    <dc:creator>${escapeXml(metadata.author || "Unknown Author")}</dc:creator>
    <dc:language>${escapeXml(metadata.language)}</dc:language>
    <dc:description>${escapeXml(metadata.description)}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
    <itemref idref="nav"/>
${spineItems}
  </spine>
</package>`;
}

function buildNav(manuscript: ProcessedManuscript): string {
  const { metadata, chapters } = manuscript;
  const items = chapters
    .map(
      (ch, i) =>
        `      <li><a href="chapter${i}.xhtml">${escapeXml(ch.title || `Chapter ${i + 1}`)}</a></li>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Table of Contents</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapeXml(metadata.title)}</h1>
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>`;
}

function buildChapterXhtml(
  title: string,
  htmlContent: string,
  index: number
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <section id="chapter${index}">
    <h1>${escapeXml(title)}</h1>
    ${htmlContent}
  </section>
</body>
</html>`;
}

function buildCss(): string {
  return `body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1em;
  line-height: 1.7;
  margin: 1.5em 2em;
  color: #1a1a1a;
}
h1 { font-size: 1.6em; margin: 2em 0 0.8em; page-break-before: always; }
h2 { font-size: 1.3em; margin: 1.6em 0 0.6em; }
h3 { font-size: 1.1em; margin: 1.4em 0 0.4em; }
p { margin: 0 0 0.8em; text-indent: 1.2em; }
p:first-of-type { text-indent: 0; }
blockquote { margin: 1em 2em; font-style: italic; }
`;
}

export async function generateEpub(
  manuscript: ProcessedManuscript
): Promise<Buffer> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const meta = zip.folder("META-INF")!;
  meta.file(
    "container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const epub = zip.folder("EPUB")!;
  epub.file("content.opf", buildOpf(manuscript));
  epub.file("nav.xhtml", buildNav(manuscript));
  epub.file("style.css", buildCss());

  for (const chapter of manuscript.chapters) {
    epub.file(
      `chapter${chapter.index}.xhtml`,
      buildChapterXhtml(
        chapter.title || `Chapter ${chapter.index + 1}`,
        chapter.htmlContent,
        chapter.index
      )
    );
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return buffer;
}
