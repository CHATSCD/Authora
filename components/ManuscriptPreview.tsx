"use client";

import { useState } from "react";
import type { ProcessedManuscript } from "@/lib/manuscriptProcessor";

interface Props {
  manuscript: ProcessedManuscript;
  activeChapter: number;
}

export default function ManuscriptPreview({ manuscript, activeChapter }: Props) {
  const [fontSize, setFontSize] = useState(16);

  const chapter = manuscript.chapters[activeChapter];

  return (
    <div className="card space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <span className="text-sm text-stone-500 font-medium">
          {chapter
            ? `Chapter ${activeChapter + 1} of ${manuscript.chapters.length}`
            : "Preview"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((s) => Math.max(12, s - 2))}
            className="w-7 h-7 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 flex items-center justify-center text-sm"
            aria-label="Decrease font size"
          >
            A−
          </button>
          <span className="text-xs text-stone-400 w-8 text-center">{fontSize}px</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 2))}
            className="w-7 h-7 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 flex items-center justify-center text-sm"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose-manuscript max-h-[60vh] overflow-y-auto pr-2"
        style={{ fontSize: `${fontSize}px` }}
      >
        {chapter ? (
          <div>
            {chapter.title && (
              <h1 className="!text-2xl !mt-0">{chapter.title}</h1>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: chapter.htmlContent }}
            />
          </div>
        ) : (
          <p className="text-stone-400 italic text-center py-10">
            Select a chapter to preview its content.
          </p>
        )}
      </div>
    </div>
  );
}
