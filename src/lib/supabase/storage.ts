import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "media";

export interface SignUploadInput {
  category: "news" | "gallery" | "teacher" | "avatar";
  filename: string;
  contentType: string;
}

export interface SignUploadResult {
  uploadUrl: string;
  publicUrl: string;
  path: string;
}

export async function signUpload(input: SignUploadInput): Promise<SignUploadResult> {
  const safeName = input.filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .slice(0, 100);
  const path = `${input.category}/${crypto.randomUUID()}-${safeName}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "sign_upload_failed");

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { uploadUrl: data.signedUrl, publicUrl: pub.publicUrl, path };
}
