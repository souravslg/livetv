/**
 * Vercel Serverless Proxy for HLS streams.
 * Fetches any URL passed via ?url= and forwards it with CORS headers.
 * Resolves relative URLs within .m3u8 files to absolute URLs so segment loading goes through the proxy correctly.
 */
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  try {
    const headers = {};
    // Forward client headers to the upstream server, except for security/identity headers
    for (const [key, val] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'host' &&
        lowerKey !== 'referer' &&
        lowerKey !== 'origin' &&
        !lowerKey.startsWith('x-forwarded-') &&
        lowerKey !== 'x-real-ip'
      ) {
        headers[key] = val;
      }
    }
    
    // Set a standard browser User-Agent
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const upstream = await fetch(url, { headers });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
        url,
      });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const isPlaylist = url.includes('.m3u8') || 
                       contentType.toLowerCase().includes('mpegurl') || 
                       contentType.toLowerCase().includes('x-mpegurl');

    if (isPlaylist) {
      let text = await upstream.text();
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0 || trimmed.startsWith('#')) {
          return line;
        }
        try {
          const absoluteUrl = new URL(trimmed, url).href;
          const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
          return `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return line;
        }
      });
      text = rewrittenLines.join('\n');
      res.status(upstream.status).send(text);
    } else {
      const buffer = await upstream.arrayBuffer();
      res.status(upstream.status).send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy fetch failed', message: err.message });
  }
}
