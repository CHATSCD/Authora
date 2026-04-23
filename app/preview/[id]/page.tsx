"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ChapterList from "@/components/ChapterList";
import ManuscriptPreview from "@/components/ManuscriptPreview";
import PublishChecklist from "@/components/PublishChecklist";
import type { ProcessedManuscript } from "@/lib/manuscriptProcessor";

type Tab = "preview" | "metadata" | "checklist";

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [manuscript, setManuscript] = useState<ProcessedManuscript | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editMeta, setEditMeta] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
  });

  useEffect(() => {
    fetch(`/api/process/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Manuscript not found");
        return r.json();
      })
      .then((data: ProcessedManuscript) => {
        setManuscript(data);
        setEditMeta({
          title: data.metadata.title,
          author: data.metadata.author,
          description: data.metadata.description,
          genre: data.metadata.genre,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const saveMeta = useCallback(async () => {
    if (!manuscript) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/process/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMeta),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setManuscript(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [id, manuscript, editMeta]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-bindery-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500">Loading manuscript…</p>
        </div>
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-stone-500">{error ?? "Manuscript not found."}</p>
        <button onClick={() => router.push("/upload")} className="btn-primary">
          Upload a new manuscript
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "preview", label: "Preview" },
    { id: "metadata", label: "Metadata" },
    { id: "checklist", label: "Checklist" },
  ];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 truncate">
            {manuscript.metadata.title || "Untitled Manuscript"}
          </h1>
          {manuscript.metadata.author && (
            <p className="text-stone-500 text-sm mt-0.5">
              by {manuscript.metadata.author}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={`/api/export-txt/${id}`} className="btn-secondary text-sm" download>
            TXT
          </a>
          <a href={`/api/export-html/${id}`} className="btn-secondary text-sm" download>
            HTML
          </a>
          <a href={`/api/export/${id}`} className="btn-primary text-sm" download>
            Download EPUB
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors duration-100 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-bindery-600 text-bindery-700"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "preview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <ChapterList
            manuscript={manuscript}
            activeChapter={activeChapter}
            onSelect={setActiveChapter}
          />
          <ManuscriptPreview
            manuscript={manuscript}
            activeChapter={activeChapter}
          />
        </div>
      )}

      {activeTab === "metadata" && (
        <div className="max-w-xl space-y-5">
          <p className="text-stone-500 text-sm">
            Set your book&apos;s metadata before exporting. This information is
            embedded in the EPUB file.
          </p>
          {(
            [
              { key: "title", label: "Title", placeholder: "Book title" },
              { key: "author", label: "Author", placeholder: "Full name" },
              {
                key: "description",
                label: "Description",
                placeholder: "A short summary of your book…",
                multiline: true,
              },
              {
                key: "genre",
                label: "Genre",
                placeholder: "e.g. Literary Fiction, Fantasy, Romance",
              },
            ] as const
          ).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                {field.label}
              </label>
              {"multiline" in field && field.multiline ? (
                <textarea
                  rows={4}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-bindery-400"
                  placeholder={field.placeholder}
                  value={editMeta[field.key]}
                  onChange={(e) =>
                    setEditMeta((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-bindery-400"
                  placeholder={field.placeholder}
                  value={editMeta[field.key]}
                  onChange={(e) =>
                    setEditMeta((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={saveMeta}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving…" : "Save Metadata"}
            </button>
            {saveSuccess && (
              <span className="text-green-600 text-sm font-medium">Saved!</span>
            )}
          </div>
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="max-w-md">
          <PublishChecklist manuscript={manuscript} />
        </div>
      )}

      {/* Next steps */}
      <div className="border-t border-stone-200 pt-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">
          Next steps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/cover"
            className="card flex items-start gap-4 hover:border-bindery-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-bindery-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-bindery-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-bindery-600">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">Design Your Cover</p>
              <p className="text-stone-500 text-xs mt-0.5">
                Create a professional book cover with genre templates, custom backgrounds, and typography.
              </p>
            </div>
          </Link>
          <Link
            href="/infographic"
            className="card flex items-start gap-4 hover:border-bindery-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-bindery-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-bindery-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-bindery-600">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">Make an Infographic</p>
              <p className="text-stone-500 text-xs mt-0.5">
                Build shareable graphics with your book stats, quotes, and chapter map.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
