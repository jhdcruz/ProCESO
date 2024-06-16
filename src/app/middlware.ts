import { createMiddlwareClient } from '@/utils/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, response } = createMiddlwareClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Require auth for all routes except login
  if (!session && !pathname.startsWith('/login')) {
    return NextResponse.redirect('/login');
  }

  return response;
}

// noinspection JSUnusedGlobalSymbols
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
