import UploadZone from "@/components/UploadZone";

export const metadata = {
  title: "Upload Manuscript | Authora Bindery Pro",
};

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif font-bold text-stone-900">
          Upload Your Manuscript
        </h1>
        <p className="text-stone-500 text-lg">
          We&apos;ll process your file, detect chapters, and prepare it for
          publishing.
        </p>
      </div>

      <UploadZone />

      <div className="card space-y-3">
        <h2 className="font-semibold text-stone-800">Supported formats</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              ext: "DOCX",
              label: "Microsoft Word",
              note: "Best results — preserves headings",
            },
            { ext: "PDF", label: "PDF Document", note: "Text PDFs only" },
            {
              ext: "TXT",
              label: "Plain Text",
              note: "Chapter headings auto-detected",
            },
          ].map((f) => (
            <div
              key={f.ext}
              className="bg-stone-50 rounded-xl p-4 text-center space-y-1"
            >
              <div className="text-2xl font-mono font-bold text-bindery-600">
                .{f.ext.toLowerCase()}
              </div>
              <div className="text-sm font-medium text-stone-700">{f.label}</div>
              <div className="text-xs text-stone-400">{f.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-stone-400 space-y-1">
        <p>Maximum file size: 50 MB</p>
        <p>Your files are processed privately and never shared.</p>
      </div>
    </div>
  );
}
