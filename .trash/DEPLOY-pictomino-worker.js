export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const redirects = {
      "/": "https://gridpaw.com/pictomino/",
      "/animal-puzzles": "https://gridpaw.com/pictomino/animal-puzzles.html",
      "/animal-puzzles.html": "https://gridpaw.com/pictomino/animal-puzzles.html",
      "/animal-puzzles/": "https://gridpaw.com/pictomino/animal-puzzles.html",
      "/cat-breeds": "https://gridpaw.com/pictomino/cat-breeds.html",
      "/cat-breeds.html": "https://gridpaw.com/pictomino/cat-breeds.html",
      "/cat-breeds/": "https://gridpaw.com/pictomino/cat-breeds.html",
      "/community": "https://gridpaw.com/pictomino/community.html",
      "/community.html": "https://gridpaw.com/pictomino/community.html",
      "/community/": "https://gridpaw.com/pictomino/community.html",
      "/daily-puzzle": "https://gridpaw.com/pictomino/daily-puzzle.html",
      "/daily-puzzle.html": "https://gridpaw.com/pictomino/daily-puzzle.html",
      "/daily-puzzle/": "https://gridpaw.com/pictomino/daily-puzzle.html",
      "/easy": "https://gridpaw.com/pictomino/easy.html",
      "/easy.html": "https://gridpaw.com/pictomino/easy.html",
      "/easy/": "https://gridpaw.com/pictomino/easy.html",
      "/game": "https://gridpaw.com/pictomino/game.html",
      "/game.html": "https://gridpaw.com/pictomino/game.html",
      "/game/": "https://gridpaw.com/pictomino/game.html",
      "/hard": "https://gridpaw.com/pictomino/hard.html",
      "/hard.html": "https://gridpaw.com/pictomino/hard.html",
      "/hard/": "https://gridpaw.com/pictomino/hard.html",
      "/index.html": "https://gridpaw.com/pictomino/",
      "/privacy": "https://gridpaw.com/pictomino/privacy.html",
      "/privacy.html": "https://gridpaw.com/pictomino/privacy.html",
      "/privacy/": "https://gridpaw.com/pictomino/privacy.html",
    };

    if (redirects[path]) {
      return Response.redirect(redirects[path], 301);
    }

    const stripped = path.endsWith('/') ? path.slice(0, -1) : path;
    if (redirects[stripped]) {
      return Response.redirect(redirects[stripped], 301);
    }

    return Response.redirect("https://gridpaw.com/pictomino/", 301);
  },
};
