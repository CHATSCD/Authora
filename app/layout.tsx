import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authora Bindery Pro",
  description: "Upload your manuscript and make it ready to publish",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-bindery-600 rounded-lg flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <span className="font-serif font-bold text-stone-900 text-lg">
                Authora
              </span>
              <span className="ml-2 text-xs bg-bindery-100 text-bindery-700 px-2 py-0.5 rounded-full font-medium">
                Bindery Pro
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t border-stone-200 mt-20 py-8 text-center text-sm text-stone-400">
          Authora Bindery Pro &mdash; Manuscript to publish-ready in minutes
        </footer>
      </body>
    </html>
  );
}
