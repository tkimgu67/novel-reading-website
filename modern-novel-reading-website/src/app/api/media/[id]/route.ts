import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return new Response("Not found", { status: 404 });
  const [row] = await db.select().from(media).where(eq(media.id, n)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data, "base64"), {
    headers: {
      "Content-Type": row.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
