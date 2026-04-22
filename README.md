# Authora Bindery Pro

Upload a manuscript and make it ready to publish. Supports DOCX, PDF, and TXT files — detects chapters automatically, lets you edit metadata, previews your content, and exports as EPUB, HTML, or plain text.

## Features

- **Manuscript upload** — drag-and-drop or file picker for DOCX, PDF, TXT (up to 50 MB)
- **Chapter detection** — automatically splits on heading styles and `Chapter N` patterns
- **Metadata editor** — set title, author, description, and genre before exporting
- **Publish checklist** — validates your manuscript against common publishing requirements
- **Three export formats** — EPUB 3, standalone HTML, and plain text
- **Infographic Maker** — canvas-based designer for book graphics; export as PNG or SVG

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [mammoth](https://github.com/mwilliamson/mammoth.js) — DOCX → HTML conversion
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF text extraction
- [JSZip](https://stuk.github.io/jszip/) — EPUB 3 packaging

## Getting Started

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx                  Landing page
  upload/page.tsx           Manuscript upload UI
  preview/[id]/page.tsx     Preview, metadata editor, and export
  infographic/page.tsx      Infographic Maker canvas editor
  api/
    upload/route.ts         POST   Upload and process a manuscript
    process/[id]/route.ts   GET    Fetch processed manuscript
                            PATCH  Update metadata
    export/[id]/route.ts    GET    Download as EPUB
    export-html/[id]/...    GET    Download as HTML
    export-txt/[id]/...     GET    Download as TXT
components/
  UploadZone.tsx            Drag-and-drop file uploader
  ChapterList.tsx           Table of contents sidebar
  ManuscriptPreview.tsx     Chapter reader with font controls
  PublishChecklist.tsx      Pre-publish validation checklist
  Icons.tsx                 SVG icon library
lib/
  manuscriptProcessor.ts    Core DOCX / PDF / TXT parser
  epubGenerator.ts          EPUB 3 builder (JSZip)
  exporters/
    htmlExporter.ts         Standalone HTML output
    txtExporter.ts          Plain-text output with word wrap
  store.ts                  In-memory manuscript store
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload manuscript file (multipart/form-data, field `manuscript`) |
| `GET` | `/api/process/:id` | Retrieve processed manuscript JSON |
| `PATCH` | `/api/process/:id` | Update metadata (`title`, `author`, `description`, `genre`) |
| `GET` | `/api/export/:id` | Download EPUB |
| `GET` | `/api/export-html/:id` | Download HTML |
| `GET` | `/api/export-txt/:id` | Download plain text |

## Development Notes

- Manuscripts are stored **in-memory** (the `manuscriptStore` singleton). Restarting the server clears all uploads. For production use, replace with a database and object storage.
- Uploaded files are written to `tmp/uploads/` at the project root (excluded from git).
- The EPUB export generates a valid EPUB 3 package with `content.opf`, `nav.xhtml`, per-chapter XHTML, and embedded CSS.

## License

MIT
