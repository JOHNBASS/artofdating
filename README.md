# 約會的藝術

給單身與交往中的人的五堂關係課網站。內容包括課程介紹、五堂課的上課內容與互動練習，以及帶領者計時器。

學員在練習裡填寫的內容只存在自己的瀏覽器（localStorage），不會上傳。

## 本機預覽

```sh
npm install
npm run dev
```

打開終端機顯示的網址（預設 http://localhost:4321/artofdating/）。

## 修改內容

| 想改什麼 | 檔案 |
|---|---|
| 五堂課的標題、副標、摘要 | `src/data/sessions.js` |
| 每一堂的上課內容與練習 | `src/pages/sessions/1.mdx` ～ `5.mdx` |
| 首頁（介紹、流程、常見問題） | `src/pages/index.astro` |
| 帶領者計時器 | `src/pages/timer.astro` |
| 顏色與字體 | `src/styles/global.css` |

課程頁是 MDX：一般文字用 Markdown 寫，練習用元件插入，例如：

```mdx
<Exercise title="練習名稱" mode="pair" minutes={10}>
說明文字
<Reflect id="唯一的代號" label="題目" />
</Exercise>
```

- `mode`：`self`（自己）、`pair`（兩人）、`table`（桌組）
- 可用元件：`Reflect`（文字框）、`Spectrum`（光譜滑桿）、`Checklist`（勾選）、`Chips`（標籤多選）、`Lists`（清單）、`Rank`（排序）、`Rewrite`（改寫練習）、`Cards`（抽卡）、`Callout`（提示框）
- 同一頁裡每個 `id` 必須不同，學員的填寫內容是用它來儲存的。改掉 `id` 會讓學員之前填的內容讀不到。

## 部署到 GitHub Pages

1. 在 GitHub 建立 repo（免費帳號需為 **public**），名稱和 `astro.config.mjs` 裡的 `base` 一致（預設 `artofdating`）。
2. 推送到 `main` 分支。
3. 到 repo 的 **Settings → Pages → Build and deployment**，Source 選 **GitHub Actions**。
4. 之後每次推送到 `main`，`.github/workflows/deploy.yml` 會自動建置並發布到
   `https://johnbass.github.io/artofdating/`。

如果帳號或 repo 名稱不同，修改 `astro.config.mjs` 的 `site` 和 `base` 即可。

## 版權提醒

本課程內容為原創，研究與書籍皆於頁面中註明出處。請勿將其他課程的手冊、影片或逐字稿放進這個 repo。
