export async function onRequest(context) {
    return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: 'Blaze Sports Intel',
        version: '2.1.0'
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
