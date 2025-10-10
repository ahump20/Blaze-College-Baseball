// Cloudflare Pages Functions Middleware
// Handles CORS, caching headers, and request validation

export async function onRequest(context) {
    // Add CORS headers to all API responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
    };

    // Handle OPTIONS preflight requests
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // Execute the actual handler
    const response = await context.next();

    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}
