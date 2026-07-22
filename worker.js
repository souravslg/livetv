/**
 * Unified Cloudflare Worker Script.
 * Serves the Player HTML page.
 * Copy and paste this script directly into the Cloudflare Workers Dashboard.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle OPTIONS preflight for proxy
    if (request.method === 'OPTIONS' && url.pathname === '/api/proxy') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range',
        }
      });
    }

    // Handle API Proxy route
    if (url.pathname === '/api/proxy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const range = request.headers.get('range');
        if (range) {
          headers.set('Range', range);
        }

        const upstreamResponse = await fetch(targetUrl, { headers });
        const responseHeaders = new Headers(upstreamResponse.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
        responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        const contentType = upstreamResponse.headers.get('content-type') || '';
        const isPlaylist = targetUrl.includes('.m3u8') || 
                           contentType.toLowerCase().includes('mpegurl') || 
                           contentType.toLowerCase().includes('x-mpegurl');

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
              const absoluteUrl = new URL(trimmed, upstreamResponse.url).href;
              return `${url.origin}${url.pathname}?url=${encodeURIComponent(absoluteUrl)}`;
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
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Serve the index.html by default
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Premium Live Streaming</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    body { background:#000; margin:0; overflow:hidden; }
    html, body { height:100%; }
    video { width:100%; height:100%; }
    .plyr { height:100%; }
  </style>
</head>
<body>

<video id="player" autoplay muted controls crossorigin playsinline></video>

<script src="https://cdn.jsdelivr.net/npm/hls.js@1.1.4/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('player');
    const defaultStream = 'https://vods2.aynaott.com/gseriesDrama/tracks-v1a1/mono.ts.m3u8';
    
    const urlParams = new URLSearchParams(window.location.search);
    let streamUrl = urlParams.get('url') || defaultStream;

    // Use proxy prefix if URL contains certain keywords or falls back
    const proxyPrefix = '/api/proxy?url=';
    
    // We can fetch directly, and fallback to proxy on network/CORS failure
    console.log('Playing stream URL:', streamUrl);

    const player = new Plyr(video, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 
        'mute', 'volume', 'captions', 'settings', 
        'pip', 'airplay', 'fullscreen'
      ],
      autoplay: true
    });

    function loadSource(url) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(err => {
            console.log('Autoplay blocked, user interaction required:', err);
          });
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (url === streamUrl && !url.startsWith(proxyPrefix)) {
                  console.warn('Network error on direct stream. Retrying through proxy...');
                  hls.destroy();
                  loadSource(proxyPrefix + encodeURIComponent(streamUrl));
                } else {
                  console.warn('Network error, attempting recovery:', data);
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('Media error, attempting recovery...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    }

    loadSource(streamUrl);
  });
</script>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
