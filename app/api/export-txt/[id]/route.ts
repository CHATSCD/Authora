import { NextRequest, NextResponse } from "next/server";
import { manuscriptStore } from "@/lib/store";
import { exportTxt } from "@/lib/exporters/txtExporter";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const manuscript = manuscriptStore.get(params.id);
  if (!manuscript) {
    return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
  }

  const txt = exportTxt(manuscript);
  const slug = manuscript.metadata.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(txt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.txt"`,
    },
  });
}
