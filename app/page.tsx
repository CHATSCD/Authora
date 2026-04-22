import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drop your manuscript in DOCX, PDF, or TXT format.",
  },
  {
    number: "02",
    title: "Process",
    description:
      "We detect chapters, clean formatting, and extract metadata automatically.",
  },
  {
    number: "03",
    title: "Publish",
    description: "Download your book as a polished EPUB ready for any platform.",
  },
];

const features = [
  {
    icon: "📖",
    title: "Chapter Detection",
    description:
      "Automatically identifies and structures chapters and sections from your manuscript.",
  },
  {
    icon: "📋",
    title: "Table of Contents",
    description:
      "Generates a navigable table of contents from your headings.",
  },
  {
    icon: "✨",
    title: "Formatting Cleanup",
    description:
      "Strips inconsistent formatting artifacts left by word processors.",
  },
  {
    icon: "📚",
    title: "EPUB Export",
    description:
      "Exports a standards-compliant EPUB 3 file compatible with all major e-readers.",
  },
  {
    icon: "🔍",
    title: "Publish Checklist",
    description:
      "Validates your manuscript against common publishing requirements.",
  },
  {
    icon: "📝",
    title: "Metadata Editor",
    description:
      "Set title, author, description, and genre before exporting.",
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-bindery-100 text-bindery-700 px-4 py-1.5 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-bindery-500 rounded-full"></span>
          Manuscript to publish-ready in minutes
        </div>
        <h1 className="text-5xl font-serif font-bold text-stone-900 leading-tight max-w-2xl mx-auto">
          Turn your manuscript into a{" "}
          <span className="text-bindery-600">publish-ready book</span>
        </h1>
        <p className="text-xl text-stone-500 max-w-xl mx-auto leading-relaxed">
          Upload your DOCX, PDF, or TXT file. Bindery Pro structures your
          chapters, cleans your formatting, and exports a professional EPUB in
          seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/upload" className="btn-primary text-lg px-8 py-4">
            Upload Manuscript
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary text-lg px-8 py-4"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="space-y-10">
        <h2 className="text-3xl font-serif font-bold text-stone-900 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="card space-y-3">
              <div className="text-4xl font-serif font-bold text-bindery-200">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className="text-stone-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-10">
        <h2 className="text-3xl font-serif font-bold text-stone-900 text-center">
          Everything You Need to Publish
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card space-y-2">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-lg font-semibold text-stone-900">{f.title}</h3>
              <p className="text-stone-500 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-bindery-600 border-bindery-700 text-center py-16 space-y-6">
        <h2 className="text-3xl font-serif font-bold text-white">
          Ready to publish?
        </h2>
        <p className="text-bindery-100 text-lg max-w-md mx-auto">
          Upload your manuscript now and get a publish-ready EPUB in under a
          minute.
        </p>
        <Link
          href="/upload"
          className="inline-block bg-white text-bindery-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-bindery-50 transition-colors"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
