// sitemap：告訴 Google 這個網站有哪些頁面。帶領者、DM、玩家劇本、欣賞卡這些私人頁面不放。
// 網址是 https://johnbass.github.io/artofdating/sitemap.xml，到 Google Search Console 提交一次就好（見 README）。
import { absUrl } from '../data/site.js';
import { sessions } from '../data/sessions.js';

const pages = ['', 'course/', ...sessions.map((s) => `sessions/${s.num}/`), 'mystery/', 'quiz/', 'questions/', 'contact/', 'sources/'];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${absUrl(p)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
