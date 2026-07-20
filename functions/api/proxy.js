/**
 * Cloudflare Pages Function proxy for HLS streams.
 * Maps to /api/proxy and forwards requests with proper CORS headers.
 * Resolves relative URLs within .m3u8 files to absolute URLs so segment loading goes through the proxy correctly.
 */
export async function onRequest(context) {
  const { request } = context;
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range',
      }
    });
  }

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const headers = new Headers();
    // Copy incoming headers except host, referer, origin, and Cloudflare internal headers
    for (const [key, val] of request.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'host' &&
        lowerKey !== 'referer' &&
        lowerKey !== 'origin' &&
        !lowerKey.startsWith('cf-') &&
        !lowerKey.startsWith('x-forwarded-') &&
        lowerKey !== 'x-real-ip'
      ) {
        headers.set(key, val);
      }
    }
    
    // Set a standard browser User-Agent
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const upstreamResponse = await fetch(targetUrl, { headers });

    // Copy response headers and apply CORS
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const isPlaylist = targetUrl.includes('.m3u8') || 
                       contentType.toLowerCase().includes('mpegurl') || 
                       contentType.toLowerCase().includes('x-mpegurl');

    // Cloudflare Workers throws an error if a body is returned with certain status codes (like 304)
    const nullBodyStatuses = [101, 204, 205, 304];
    const isNullBody = nullBodyStatuses.includes(upstreamResponse.status);

    if (isPlaylist && upstreamResponse.ok && !isNullBody) {
      let text = await upstreamResponse.text();
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0 || trimmed.startsWith('#')) {
          return line;
        }
        try {
          const absoluteUrl = new URL(trimmed, targetUrl).href;
          return `${urlObj.origin}${urlObj.pathname}?url=${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return line;
        }
      });
      text = rewrittenLines.join('\n');
      
      return new Response(text, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    }

    return new Response(isNullBody ? null : upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed', message: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
