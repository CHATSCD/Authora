import { NextRequest, NextResponse } from "next/server";
import { manuscriptStore } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const manuscript = await manuscriptStore.get(params.id);
  if (!manuscript) {
    return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
  }
  return NextResponse.json(manuscript);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { title, author, description, genre, language } = body;

  const updated = await manuscriptStore.patch(params.id, {
    ...(title !== undefined && { title }),
    ...(author !== undefined && { author }),
    ...(description !== undefined && { description }),
    ...(genre !== undefined && { genre }),
    ...(language !== undefined && { language }),
  });

  if (!updated) {
    return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
