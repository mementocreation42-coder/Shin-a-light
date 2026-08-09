import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifyToken } from '@/lib/adminAuth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass pathname to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname.startsWith('/admin')) {
    // 署名と有効期限を検証する（クッキーを立てるだけでは通らない）
    const ok = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value, 'session');
    if (!ok) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const res = NextResponse.redirect(loginUrl);
      // 失効したセッションは持ち越さない
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|videos).*)'],
};
