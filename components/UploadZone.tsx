"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/pdf",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = [".docx", ".doc", ".pdf", ".txt"];

export default function UploadZone() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (
        !ACCEPTED_TYPES.includes(file.type) &&
        !ACCEPTED_EXTENSIONS.some((ext) => file.name.endsWith(ext))
      ) {
        setError("Unsupported file type. Please upload a DOCX, PDF, or TXT file.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50 MB.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("manuscript", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Upload failed");
        }

        const { id } = await res.json();
        router.push(`/preview/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        setUploading(false);
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <label
        className={`upload-zone block ${dragging ? "dragging" : ""} ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={!uploading ? onDrop : undefined}
      >
        <input
          type="file"
          className="sr-only"
          accept=".docx,.doc,.pdf,.txt"
          onChange={onInputChange}
          disabled={uploading}
        />
        <div className="space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-bindery-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-600 font-medium">Uploading and processing your manuscript…</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-bindery-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-bindery-600"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-stone-700">
                  Drop your manuscript here
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  or <span className="text-bindery-600 underline">browse to upload</span>
                </p>
              </div>
              <p className="text-xs text-stone-400">
                DOCX, PDF, or TXT &mdash; up to 50 MB
              </p>
            </>
          )}
        </div>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
