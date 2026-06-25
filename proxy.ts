import type { NextRequest } from "next/server";
import { handleSupabaseAdminProxy } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return handleSupabaseAdminProxy(request);
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
