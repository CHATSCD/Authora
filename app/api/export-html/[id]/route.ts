import { NextRequest, NextResponse } from "next/server";
import { manuscriptStore } from "@/lib/store";
import { exportHtml } from "@/lib/exporters/htmlExporter";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const manuscript = await manuscriptStore.get(params.id);
  if (!manuscript) {
    return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
  }

  const html = exportHtml(manuscript);
  const slug = manuscript.metadata.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.html"`,
    },
  });
}
