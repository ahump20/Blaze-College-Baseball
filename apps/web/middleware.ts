import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Legacy URL redirects based on RedirectMap.csv
const redirects: Record<string, string> = {
  '/college-baseball': '/baseball/ncaab',
  '/college-baseball/scores': '/baseball/ncaab/games/scores',
  '/college-baseball/teams': '/baseball/ncaab/teams',
  '/teams': '/baseball/ncaab/teams',
  '/games': '/baseball/ncaab/games',
  '/news': '/baseball/ncaab/news',
  '/standings': '/baseball/ncaab/standings',
  '/rankings': '/baseball/ncaab/rankings'
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check for legacy URLs
  if (redirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = redirects[pathname];
    return NextResponse.redirect(url, 301);
  }
  
  // Handle dynamic team and game redirects
  const teamMatch = pathname.match(/^\/team\/([^/]+)$/);
  if (teamMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/baseball/ncaab/teams/${teamMatch[1]}`;
    return NextResponse.redirect(url, 301);
  }
  
  const gameMatch = pathname.match(/^\/game\/([^/]+)$/);
  if (gameMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/baseball/ncaab/games/${gameMatch[1]}`;
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
