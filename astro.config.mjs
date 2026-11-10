// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// GitHub Pages project site: https://<user>.github.io/<repo>/
// 若 repo 名稱或帳號不同，只需修改這兩行
export default defineConfig({
  site: 'https://johnbass.github.io',
  base: '/artofdating',
  integrations: [mdx()],
});
