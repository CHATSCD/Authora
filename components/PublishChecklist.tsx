import type { ProcessedManuscript } from "@/lib/manuscriptProcessor";

interface CheckItem {
  label: string;
  passed: boolean;
  note?: string;
}

interface Props {
  manuscript: ProcessedManuscript;
}

export default function PublishChecklist({ manuscript }: Props) {
  const totalWords = manuscript.chapters.reduce(
    (sum, ch) => sum + ch.wordCount,
    0
  );

  const checks: CheckItem[] = [
    {
      label: "Title present",
      passed: !!manuscript.metadata.title,
      note: manuscript.metadata.title
        ? `"${manuscript.metadata.title}"`
        : "Add a title in metadata",
    },
    {
      label: "Author present",
      passed: !!manuscript.metadata.author,
      note: manuscript.metadata.author
        ? manuscript.metadata.author
        : "Add an author name in metadata",
    },
    {
      label: "Chapters detected",
      passed: manuscript.chapters.length > 0,
      note:
        manuscript.chapters.length > 0
          ? `${manuscript.chapters.length} chapter${manuscript.chapters.length !== 1 ? "s" : ""} found`
          : "No chapters detected — check heading formatting",
    },
    {
      label: "Minimum word count (1,000)",
      passed: totalWords >= 1000,
      note: `${totalWords.toLocaleString()} words`,
    },
    {
      label: "No empty chapters",
      passed: manuscript.chapters.every((ch) => ch.wordCount > 0),
      note: manuscript.chapters.every((ch) => ch.wordCount > 0)
        ? "All chapters have content"
        : "Some chapters are empty",
    },
    {
      label: "Description present",
      passed: !!manuscript.metadata.description,
      note: manuscript.metadata.description
        ? "Description set"
        : "Add a book description in metadata",
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const allPassed = passed === total;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
          Publish Checklist
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            allPassed
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {passed}/{total}
        </span>
      </div>

      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                check.passed ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {check.passed ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="6" y1="3" x2="6" y2="7" />
                  <line x1="6" y1="9.5" x2="6" y2="9.5" />
                </svg>
              )}
            </span>
            <div>
              <span
                className={
                  check.passed ? "text-stone-700" : "text-stone-500"
                }
              >
                {check.label}
              </span>
              {check.note && (
                <p className="text-xs text-stone-400 mt-0.5">{check.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {allPassed && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium">
          Ready to export as EPUB
        </div>
      )}
    </div>
  );
}
