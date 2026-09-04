export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const redirects = {
      "/": "https://gridpaw.com/",
      "/cheats": "https://gridpaw.com/",
      "/cheats/": "https://gridpaw.com/",
      "/community": "https://gridpaw.com/akari/community/",
      "/community/": "https://gridpaw.com/akari/community/",
      "/daily": "https://gridpaw.com/",
      "/daily/": "https://gridpaw.com/",
      "/how-to-play-shikaku": "https://gridpaw.com/",
      "/how-to-play-shikaku/": "https://gridpaw.com/",
      "/privacy": "https://gridpaw.com/akari/privacy/",
      "/privacy/": "https://gridpaw.com/akari/privacy/",
      "/rectangle-partition-guide": "https://gridpaw.com/",
      "/rectangle-partition-guide/": "https://gridpaw.com/",
      "/rules": "https://gridpaw.com/",
      "/rules/": "https://gridpaw.com/",
      "/shikaku-10x10": "https://gridpaw.com/",
      "/shikaku-10x10/": "https://gridpaw.com/",
      "/shikaku-5x5": "https://gridpaw.com/",
      "/shikaku-5x5/": "https://gridpaw.com/",
      "/shikaku-6x6": "https://gridpaw.com/",
      "/shikaku-6x6/": "https://gridpaw.com/",
      "/shikaku-7x7": "https://gridpaw.com/",
      "/shikaku-7x7/": "https://gridpaw.com/",
      "/shikaku-8x8": "https://gridpaw.com/",
      "/shikaku-8x8/": "https://gridpaw.com/",
      "/shikaku-tips": "https://gridpaw.com/",
      "/shikaku-tips/": "https://gridpaw.com/",
      "/solver": "https://gridpaw.com/",
      "/solver/": "https://gridpaw.com/",
      "/tips": "https://gridpaw.com/",
      "/tips/": "https://gridpaw.com/",
      "/vs-shikaku": "https://gridpaw.com/",
      "/vs-shikaku/": "https://gridpaw.com/",
    };

    if (redirects[path]) {
      return Response.redirect(redirects[path], 301);
    }

    const stripped = path.endsWith('/') ? path.slice(0, -1) : path;
    if (redirects[stripped]) {
      return Response.redirect(redirects[stripped], 301);
    }

    return Response.redirect("https://gridpaw.com/", 301);
  },
};
