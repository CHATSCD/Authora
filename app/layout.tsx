import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authora Bindery Pro",
  description: "Upload your manuscript and make it ready to publish",
};

const NAV_LINKS = [
  { href: "/upload", label: "Upload" },
  { href: "/cover", label: "Cover Designer" },
  { href: "/infographic", label: "Infographics" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 bg-bindery-600 rounded-lg flex items-center justify-center">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="font-serif font-bold text-stone-900 text-base leading-none">
                Authora
              </span>
              <span className="text-xs bg-bindery-100 text-bindery-700 px-2 py-0.5 rounded-full font-medium">
                Bindery Pro
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/upload"
                className="ml-2 bg-bindery-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-bindery-700 transition-colors font-medium"
              >
                New Book
              </Link>
            </nav>

            {/* Mobile: just the CTA */}
            <Link
              href="/upload"
              className="sm:hidden bg-bindery-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-bindery-700 transition-colors font-medium"
            >
              Upload
            </Link>
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
