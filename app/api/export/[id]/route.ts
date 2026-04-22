import { NextRequest, NextResponse } from "next/server";
import { manuscriptStore } from "@/lib/store";
import { generateEpub } from "@/lib/epubGenerator";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const manuscript = manuscriptStore.get(params.id);
  if (!manuscript) {
    return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
  }

  const epubBuffer = await generateEpub(manuscript);
  const slug = manuscript.metadata.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(epubBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/epub+zip",
      "Content-Disposition": `attachment; filename="${slug}.epub"`,
      "Content-Length": epubBuffer.byteLength.toString(),
    },
  });
}
