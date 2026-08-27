import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { presignUpload } from "@/lib/s3/presign";

const bodySchema = z.object({
  category: z.enum(["news", "gallery", "teacher", "avatar"]),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1),
  contentLength: z.number().int().positive(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { category, filename, contentType, contentLength } = parsed.data;

  // Autorisation par catégorie (defense in depth).
  const allowed =
    profile.role === "admin"
      ? true
      : profile.role === "teacher" && (category === "teacher" || category === "avatar");
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const maxBytes = Number(process.env.S3_MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024);
  if (contentLength > maxBytes) {
    return NextResponse.json(
      { error: "file_too_large", max: maxBytes },
      { status: 413 }
    );
  }

  const allowedMime = (process.env.S3_ALLOWED_MIME ?? "image/jpeg,image/png,image/webp")
    .split(",")
    .map((m) => m.trim());
  if (!allowedMime.includes(contentType)) {
    return NextResponse.json({ error: "mime_not_allowed" }, { status: 415 });
  }

  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .slice(0, 100);
  const key = `${category}/${crypto.randomUUID()}-${safeName}`;

  const presigned = await presignUpload({ key, contentType, maxBytes });
  return NextResponse.json(presigned);
}
