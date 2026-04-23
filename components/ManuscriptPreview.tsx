"use client";

import { useState } from "react";
import type { ProcessedManuscript } from "@/lib/manuscriptProcessor";

interface Props {
  manuscript: ProcessedManuscript;
  activeChapter: number;
}

export default function ManuscriptPreview({ manuscript, activeChapter }: Props) {
  const [fontSize, setFontSize] = useState(17);
  const chapter = manuscript.chapters[activeChapter];
  const totalWords = manuscript.chapters.reduce((s, c) => s + c.wordCount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-stone-400">
          {chapter
            ? `${chapter.wordCount.toLocaleString()} words in this chapter`
            : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFontSize((s) => Math.max(13, s - 1))}
            className="w-7 h-7 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-bold"
          >
            A−
          </button>
          <button
            onClick={() => setFontSize((s) => Math.min(22, s + 1))}
            className="w-7 h-7 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-bold"
          >
            A+
          </button>
        </div>
      </div>

      {/* Book page */}
      <div
        className="bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {/* Book header / title page feel */}
        {activeChapter === 0 && (
          <div className="bg-stone-900 text-white px-10 py-10 text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400 font-sans">
              {manuscript.metadata.genre || "Manuscript"}
            </p>
            <h1 className="text-3xl font-bold leading-tight">
              {manuscript.metadata.title || "Untitled"}
            </h1>
            {manuscript.metadata.author && (
              <p className="text-stone-300 text-lg mt-1">
                by {manuscript.metadata.author}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 pt-3 text-xs text-stone-500">
              <span>{manuscript.chapters.length} chapters</span>
              <span>·</span>
              <span>{totalWords.toLocaleString()} words</span>
              <span>·</span>
              <span>~{Math.round(totalWords / 250)} min read</span>
            </div>
          </div>
        )}

        {/* Chapter content */}
        <div
          className="px-10 py-10 max-h-[65vh] overflow-y-auto"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter ? (
            <div className="book-content">
              {/* Chapter number + title */}
              <div className="text-center mb-10">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400 font-sans mb-2">
                  Chapter {activeChapter + 1}
                </p>
                {chapter.title && (
                  <h2
                    className="font-bold text-stone-900 leading-tight"
                    style={{ fontSize: `${fontSize * 1.6}px` }}
                  >
                    {chapter.title}
                  </h2>
                )}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="w-8 h-px bg-stone-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-bindery-400" />
                  <span className="w-8 h-px bg-stone-300" />
                </div>
              </div>

              <div
                className="chapter-body"
                style={{
                  lineHeight: 1.85,
                  color: "#1c1c1c",
                }}
                dangerouslySetInnerHTML={{ __html: styledContent(chapter.htmlContent, fontSize) }}
              />
            </div>
          ) : (
            <p className="text-stone-400 italic text-center py-16">
              Select a chapter to preview.
            </p>
          )}
        </div>

        {/* Page footer */}
        {chapter && (
          <div className="border-t border-stone-100 px-10 py-3 flex items-center justify-between">
            <span className="text-xs text-stone-300 font-sans">
              {manuscript.metadata.title}
            </span>
            <span className="text-xs text-stone-300 font-sans">
              {activeChapter + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function styledContent(html: string, fontSize: number): string {
  // Inject inline styles that work inside dangerouslySetInnerHTML
  return html
    .replace(
      /<p>/g,
      `<p style="margin:0 0 ${fontSize * 0.5}px; text-indent:${fontSize * 1.5}px;">`
    )
    .replace(
      /<p class="([^"]*)">/g,
      `<p class="$1" style="margin:0 0 ${fontSize * 0.5}px; text-indent:${fontSize * 1.5}px;">`
    )
    .replace(
      /<h1>/g,
      `<h1 style="font-size:${fontSize * 1.4}px; font-weight:700; margin:${fontSize * 2}px 0 ${fontSize * 0.6}px; text-indent:0;">`
    )
    .replace(
      /<h2>/g,
      `<h2 style="font-size:${fontSize * 1.2}px; font-weight:600; margin:${fontSize * 1.6}px 0 ${fontSize * 0.5}px; text-indent:0;">`
    )
    .replace(
      /<h3>/g,
      `<h3 style="font-size:${fontSize * 1.05}px; font-weight:600; margin:${fontSize * 1.4}px 0 ${fontSize * 0.4}px; text-indent:0;">`
    )
    .replace(
      /<blockquote>/g,
      `<blockquote style="margin:${fontSize}px ${fontSize * 2}px; font-style:italic; color:#555; border-left:3px solid #c4711f; padding-left:${fontSize}px;">`
    );
}
