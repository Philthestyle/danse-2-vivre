import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/profil", "/messagerie", "/enseignant", "/admin"];
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclude static files and Next internals from auth check.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|api/).*)",
  ],
};
