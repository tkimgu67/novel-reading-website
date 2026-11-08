import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Only administrators can upload covers." }, { status: 403 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WEBP, GIF or AVIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(media).values({ mimeType: file.type, data: buf.toString("base64") }).returning({ id: media.id });
  return NextResponse.json({ url: `/api/media/${row.id}` });
}
