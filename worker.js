/**
 * Unified Cloudflare Worker Script.
 * Serves the Player HTML page and handles the streamMap.
 * Copy and paste this script directly into the Cloudflare Workers Dashboard.
 */

const streamMap = {
  "PSL": {
    url: "https://pslurdu.bigbaat.app/out/v1/0ef369b90c7b4025b76621e46ee5fb70/index.m3u8",
    poster: "#"
  },
  "S": {
    url: "https%3A%2F%2Fstream.mux.com%2FKoxxjUGynnOrRH0054JSB702dX8pn4yAHUm6t02AowArnk.m3u8%3Ftoken%3DeyJhbGciOiJSUzI1NiJ9.eyJraWQiOiJGMDFHc2doUkVIM0RjZEowMGdZaDRKUHg3cW9SM2pDVENGaGR6YUtrT2lNdGMiLCJzdWIiOiJLb3h4alVHeW5uT3JSSDAwNTRKU0I3MDJkWDhwbjR5QUhVbTZ0MDJBb3dBcm5rIiwiYXVkIjoidiIsImV4cCI6MTc4NDI4NjY0OH0.N9f2_VL8MTL7Lce4gcxRp4kTo-rC3YrAOSnNqMObTZzxC06Mbu5Z9GMz8VXCrMtHUMtchGkVGlBvcqOBz9BJC8d92393aCrerLsh_iMwYq1T9qtmo9sk2e1QuWOHwMx_THcmaVWie1LJuNx1wftxjob8q0SJtuXl6MviY95wt8hvacirKL-z9i7AbsL_4nwrC4M-ewDKOw0I9X7H8m2eK91O1YFlidpZSZqFgLcfe82yH2Ey2fYL-lIJgf5LbFq2jtAIElAP5Uu4arbuO7JF2cx9yr5SkaCixHUZI7p6Nwu122CS2jnVwxQJ8G9LcO6Aozl8cx-TxmbKF11OfbPOQA&autoplay=1&controls=auto&theme=default&buffer=30&quality=1&speed=1&pip=1&fullscreen=1&no_download=1&width=responsive&aspect=16%3A9",
    poster: ""
  },
  "PSL2": {
    url: "https://psl.bigbaat.app/out/v1/f342445c31dd475bbf30c7304dbad14f/index.m3u8",
    poster: ""
  },
  "S2": {
    url: "https://amg01269-amg01269c1-sportstribal-emea-5204.playouts.now.amagi.tv/playlist/amg01269-willowtvfast-willowplus-sportstribalemea/playlist.m3u8",
    poster: "#"
  },
  "E": {
    url: "https://dai-partner.fancode.com/primary/142976_english_hls_32abf1ee6040415_1ta-di_h264/index.m3u8",
    poster: ""
  },
  "H": {
    url: "https://fncd.kuvuslov.cymru/mumbai/143396_english_hls_308563297d37105_1ta-di_h264/index.m3u8",
    poster: ""
  },
  "P": {
    url: "https://dai-partner.fancode.com/primary/140518_english_hls_9481b78c2323004_1ta-di_h264/index.m3u8",
    poster: ""
  },
  "C": {
    url: "https://dai-partner.fancode.com/primary/140518_english_hls_9481b78c2323004_1ta-di_h264/index.m3u8",
    poster: ""
  },
  "F2": {
    url: "https://hugh.cdn.rumble.cloud/live/t34ch9px/slot-155/r0gr-9joe/chunklist.m3u8",
    poster: ""
  },
  "U8": {
    url: "https://hugh.cdn.rumble.cloud/live/v0xi25uh/slot-85/m8uy-e0k3_1080p/chunklist_DVR.m3u8",
    poster: ""
  },
  "F1": {
    url: "https://fuck-you.kasin-tv.com/fc/proxy.php/https://in-mc-pdlive.fancode.com/mumbai/139471_english_hls_bcb585673323107_1ta-di_h264/index.m3u8",
    poster: ""
  },
  "U7": {
    url: "https://fox.newpersonalities.workers.dev/",
    poster: ""
  },
  "S3": {
    url: "https://stream.mux.com/KoxxjUGynnOrRH0054JSB702dX8pn4yAHUm6t02AowArnk.m3u8?token=eyJhbGciOiJSUzI1NiJ9.eyJraWQiOiJGMDFHc2doUkVIM0RjZEowMGdZaDRKUHg3cW9SM2pDVENGaGR6YUtrT2lNdGMiLCJzdWIiOiJLb3h4alVHeW5uT3JSSDAwNTRKU0I3MDJkWDhwbjR5QUhVbTZ0MDJBb3dBcm5rIiwiYXVkIjoidiIsImV4cCI6MTc4NDI4NjY0OH0.N9f2_VL8MTL7Lce4gcxRp4kTo-rC3YrAOSnNqMObTZzxC06Mbu5Z9GMz8VXCrMtHUMtchGkVGlBvcqOBz9BJC8d92393aCrerLsh_iMwYq1T9qtmo9sk2e1QuWOHwMx_THcmaVWie1LJuNx1wftxjob8q0SJtuXl6MviY95wt8hvacirKL-z9i7AbsL_4nwrC4M-ewDKOw0I9X7H8m2eK91O1YFlidpZSZqFgLcfe82yH2Ey2fYL-lIJgf5LbFq2jtAIElAP5Uu4arbuO7JF2cx9yr5SkaCixHUZI7p6Nwu122CS2jnVwxQJ8G9LcO6Aozl8cx-TxmbKF11OfbPOQA&autoplay=1&controls=auto&theme=default&buffer=30&quality=1&speed=1&pip=1&fullscreen=1&no_download=1&width=responsive&aspect=16:9",
    poster: ""
  },
  "U5": {
    url: "rda2lIOMpzK9DlSwKzXK6o2TC45fLlTFYdQwySsTP3efVWKfsuHlYXolCAxxg15URqOE5B&uid=YZ128Qk7yQvbLqXhSrt1Msl25aNuAldI&sid=XdbbfqKeCgqAfwc3K2tcDx4FaLZlzmyI&pid=YpZkPe8xrIefIbd2spJu6CNDmV5ahFkG&ref=tvgo.americatv.com.pe&ext_pb=0&es=pe-p5-p-e-cl1-clrp.cdn.mdstrm.com&ote=1783021451469&ot=fz8hNvpBKoD_fuOl5YrtEw&proto=https&pz=us",
    poster: ""
  },
  "U4": {
    url: "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8",
    poster: ""
  },
  "U6": {
    url: "https://foxdtc-video.akamaized.net/ZXhwPTE3ODQ1NjQxODc7YWNsPS8qO3dzaWQ9ZThkZWM0NWJhZDNjN2Y3ODNlYWMxNjYxNDk2NjQyOTVfZm94ZHRjX2FuZHJvaWR0dl9lbi1VUztobWFjPW41QjV5bE90dDdFVkhTei9aVEU4QmlxcjFxWmNmTEJWN1VXK3BLSkhsMWs9/live/uhd-1-b-uw2/index.m3u8",
    poster: ""
  },
  "S4": {
    url: "https%3A%2F%2Fstream.mux.com%2FKoxxjUGynnOrRH0054JSB702dX8pn4yAHUm6t02AowArnk.m3u8%3Ftoken%3DeyJhbGciOiJSUzI1NiJ9.eyJraWQiOiJGMDFHc2doUkVIM0RjZEowMGdZaDRKUHg3cW9SM2pDVENGaGR6YUtrT2lNdGMiLCJzdWIiOiJLb3h4alVHeW5uT3JSSDAwNTRKU0I3MDJkWDhwbjR5QUhVbTZ0MDJBb3dBcm5rIiwiYXVkIjoidiIsImV4cCI6MTc4NDI4NjY0OH0.N9f2_VL8MTL7Lce4gcxRp4kTo-rC3YrAOSnNqMObTZzxC06Mbu5Z9GMz8VXCrMtHUMtchGkVGlBvcqOBz9BJC8d92393aCrerLsh_iMwYq1T9qtmo9sk2e1QuWOHwMx_THcmaVWie1LJuNx1wftxjob8q0SJtuXl6MviY95wt8hvacirKL-z9i7AbsL_4nwrC4M-ewDKOw0I9X7H8m2eK91O1YFlidpZSZqFgLcfe82yH2Ey2fYL-lIJgf5LbFq2jtAIElAP5Uu4arbuO7JF2cx9yr5SkaCixHUZI7p6Nwu122CS2jnVwxQJ8G9LcO6Aozl8cx-TxmbKF11OfbPOQA&autoplay=1&controls=auto&theme=default&buffer=30&quality=1&speed=1&pip=1&fullscreen=1&no_download=1&width=responsive&aspect=16%3A9",
    poster: ""
  },
  "U": {
    url: "https://amg00716-globo-amg00716c1-tcl-br-9495.playouts.now.amagi.tv/playlist.m3u8",
    poster: ""
  },
  "U3": {
    url: "https://cua.atharican.shop/menze1.m3u8",
    poster: ""
  },
  "U1": {
    url: "https://live05.miekgo.app/live/78905744.m3u8",
    poster: ""
  },
  "U2": {
    url: "https://foxdtc-video.akamaized.net/ZXhwPTE3ODQ1Njk4MTc7YWNsPS8qO3dzaWQ9ZGMxZjljNTI3YmNiYWM3MTY5ZDA4ZDgyNjBkMDg2ZjNfZm94ZHRjX3dlYl9lbi1VUztobWFjPVBvcFdWWUpTMERKUjNMTEVZOWZDOVFFVDhKbklzSFpBaWRSMnBVaXRtVTA9/live/tx001-ue2/index.m3u8",
    poster: "#"
  },
  "S1": {
    url: "https://stream.ottplus.live/live/ten_1_hd_abr/live/ten_1_hd_720/chunks.m3u8",
    poster: ""
  },
  "ranapkz": {
    url: "https://ranapkz.site/JOIN@RANAPK33/XT/X/play.m3u8?id=135352",
    poster: ""
  }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Serve premium.js stream mapping
    if (url.pathname === '/premium.js') {
      return new Response(`const streamMap = ${JSON.stringify(streamMap, null, 2)};`, {
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
      });
    }

    // 2. Serve index.html by default
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IPTV INDIA- live streaming</title>
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
<script src="premium.js"></script>
  
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('player');

    const urlParams = new URLSearchParams(window.location.search);
    let streamId = urlParams.get('id');

    let streamUrl;
    if (streamId && streamMap[streamId]) {
      streamUrl = streamMap[streamId].url;
    } else {
      streamUrl = `https://vodtest.vercel.app/api/api.php?id=${streamId || '475070'}`;
    }

    console.log('Playing stream URL directly:', streamUrl);

    const player = new Plyr(video, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 
        'mute', 'volume', 'captions', 'settings', 
        'pip', 'airplay', 'fullscreen'
      ],
      autoplay: true
    });

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
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
              console.warn('Network error, attempting recovery:', data);
              hls.startLoad();
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
      video.src = streamUrl;
    }
  });
</script>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
