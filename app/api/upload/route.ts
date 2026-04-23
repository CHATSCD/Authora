import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { processManuscript } from "@/lib/manuscriptProcessor";
import { manuscriptStore } from "@/lib/store";

const UPLOAD_DIR = "/tmp/authora-uploads";
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("manuscript") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 50 MB limit" },
        { status: 413 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    const allowed = [".docx", ".doc", ".pdf", ".txt"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload DOCX, PDF, or TXT." },
        { status: 415 }
      );
    }

    const id = uuidv4();
    await mkdir(UPLOAD_DIR, { recursive: true });

    const filePath = path.join(UPLOAD_DIR, `${id}${ext}`);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const manuscript = await processManuscript(filePath, file.name, id);
    await manuscriptStore.set(id, manuscript);

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload] error:", message, err);
    return NextResponse.json(
      { error: "Processing failed. Please try again.", detail: message },
      { status: 500 }
    );
  }
}
