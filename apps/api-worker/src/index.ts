export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Redirect legacy domain to canonical
    if (url.hostname === 'blazeintelligence.com') {
      url.hostname = 'blazesportsintel.com';
      return Response.redirect(url.toString(), 301);
    }
    // Remove .html extensions
    if (url.pathname.endsWith('.html')) {
      url.pathname = url.pathname.replace(/\.html$/, '');
      return Response.redirect(url.toString(), 301);
    }

    // Proceed to origin (Next.js/Pages) and set security headers
    const res = await fetch(req);
    const hdrs = new Headers(res.headers);
    hdrs.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    hdrs.set('X-Content-Type-Options', 'nosniff');
    hdrs.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return new Response(res.body, { status: res.status, headers: hdrs });
  }
} satisfies ExportedHandler;
