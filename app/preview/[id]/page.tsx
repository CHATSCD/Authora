"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
        <a
          href={`/api/export/${id}`}
          className="btn-primary shrink-0 text-center"
          download
        >
          Download EPUB
        </a>
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
    </div>
  );
}
