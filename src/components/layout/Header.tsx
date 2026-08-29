import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const isAuthed = await getIsAuthed();
  return <HeaderClient isAuthed={isAuthed} />;
}

async function getIsAuthed(): Promise<boolean> {
  if (IS_STATIC_PREVIEW) return false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}
