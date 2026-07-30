import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

const PROTECTED_PREFIXES = ["/dashboard"];

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // The admin panel is only reachable via the obfuscated ADMIN_BASE_PATH —
  // block the plain /admin path outright, before anything else runs.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not run any logic between createServerClient and getUser().
  // A stray error here can randomly log users out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Transparently rewrite the secret admin path to the real /admin routes —
  // done last so it carries over any cookies the session refresh above set,
  // by copying them onto the rewritten response rather than replacing it.
  if (path === `/${ADMIN_BASE_PATH}` || path.startsWith(`/${ADMIN_BASE_PATH}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(`/${ADMIN_BASE_PATH}`, "/admin");
    const rewritten = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewritten.cookies.set(cookie);
    });
    return rewritten;
  }

  return supabaseResponse;
}
