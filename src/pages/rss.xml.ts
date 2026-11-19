import type { APIRoute } from 'astro';

import { blogPosts } from '../data/blog-posts';

const SITE = 'https://gridpaw.com';
const FEED_TITLE = 'GridPaw Blog — Japanese Logic Puzzle Guides';
const FEED_DESC =
	'Strategy guides, walkthroughs and solving tips for Japanese logic puzzles: Akari, Shikaku, Kakuro, Nonogram and more.';

function esc(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function pubDate(iso: string): string {
	// blog-posts.ts stores plain ISO days (YYYY-MM-DD); pin to UTC midnight so
	// the build machine's timezone can never shift the published date.
	return new Date(`${iso}T00:00:00Z`).toUTCString();
}

export const GET: APIRoute = () => {
	const items = [...blogPosts]
		.sort((a, b) => (a.date < b.date ? 1 : -1))
		.map((post) => {
			const url = `${SITE}/akari/blog/${post.slug}/`;
			const categories = post.tags.map((tag) => `      <category>${esc(tag)}</category>`).join('\n');
			return [
				'    <item>',
				`      <title>${esc(post.title)}</title>`,
				`      <link>${url}</link>`,
				`      <guid isPermaLink="true">${url}</guid>`,
				`      <description>${esc(post.description)}</description>`,
				`      <pubDate>${pubDate(post.date)}</pubDate>`,
				categories,
				'    </item>',
			]
				.filter(Boolean)
				.join('\n');
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(FEED_TITLE)}</title>
    <link>${SITE}/</link>
    <description>${esc(FEED_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			// .xml sits on Cloudflare's default cache-extension list; keep the feed
			// out of the edge cache so a stale build can never be served as current.
			'Cache-Control': 'no-store',
		},
	});
};
