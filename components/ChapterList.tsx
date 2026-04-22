"use client";

import type { ProcessedManuscript } from "@/lib/manuscriptProcessor";

interface Props {
  manuscript: ProcessedManuscript;
  activeChapter: number;
  onSelect: (index: number) => void;
}

export default function ChapterList({ manuscript, activeChapter, onSelect }: Props) {
  const wordCount = manuscript.chapters.reduce(
    (sum, ch) => sum + ch.wordCount,
    0
  );

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
          Table of Contents
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          {manuscript.chapters.length} chapter
          {manuscript.chapters.length !== 1 ? "s" : ""} &middot;{" "}
          {wordCount.toLocaleString()} words
        </p>
      </div>

      <ul className="space-y-1">
        {manuscript.chapters.map((chapter, i) => (
          <li key={i}>
            <button
              onClick={() => onSelect(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors duration-100 flex items-start gap-2 ${
                activeChapter === i
                  ? "bg-bindery-50 text-bindery-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span
                className={`shrink-0 text-xs mt-0.5 font-mono ${
                  activeChapter === i ? "text-bindery-400" : "text-stone-300"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate">
                {chapter.title || `Chapter ${i + 1}`}
              </span>
              <span className="shrink-0 text-xs text-stone-300">
                {chapter.wordCount.toLocaleString()}w
              </span>
            </button>
          </li>
        ))}
      </ul>

      {manuscript.chapters.length === 0 && (
        <p className="text-sm text-stone-400 italic text-center py-4">
          No chapters detected.
        </p>
      )}
    </div>
  );
}
