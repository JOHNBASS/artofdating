# 關係練習室

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
| 首頁（介紹、課程列表、流程、常見問題） | `src/pages/index.astro` |
| 首頁「關於愛情的四個擔心」與資料來源 | `src/data/worries.js` |
| 帶領者計時器 | `src/pages/timer.astro` |
| 課程頁的顏色與字體 | `src/styles/global.css` |
| 首頁的顏色與字體 | `src/layouts/Landing.astro` 裡的 `:root` |

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

## 首頁的設計系統與動態

首頁用 [tasteskill](https://github.com/Leonxlnx/taste-skill) 的版型系統，檔案在 `public/assets/`（`system.css`、`motion/`、`layout/`、`moments/` 等）。這些是套件原檔，**不要直接修改**；首頁自己的樣式寫在 `index.astro` 開頭的 `<style>`。

首頁的動態只有三種，刻意保持克制：

- **進場**：載入時，英雄區的標題、說明和按鈕依序浮現一次。
- **滑動時的兩個時刻**：「我們相信的事」那句話會隨捲動一個詞一個詞亮起來；「每個晚上的流程」的照片進入畫面時像相片顯影一樣慢慢浮現。
- **滑鼠與按壓回饋**：按鈕、連結和卡片都有細微的移動與底線。

系統設定「減少動態效果」的使用者，會直接看到靜止的完成畫面。

### 替換照片

首頁目前的五張照片都是 Wikimedia Commons 上的開放授權照片（替代用，出處列在 `public/credits.html`）。有了課程現場的照片後，把檔案放進 `public/assets/img/`，再改 `index.astro` 裡對應的 `src`、`srcset`、`alt`，並把 `credits.html` 裡不再使用的那一行刪掉：

| 位置 | 目前的替代照片 | 建議換成 |
|---|---|---|
| 英雄區（滿版） | 燭光長餐桌 | 課程當晚布置好的餐桌，橫式、左半邊比較單純 |
| 四個擔心 | 筆記本與鉛筆 | 學員手上的筆記或手機練習畫面（不拍到臉） |
| 五堂課 | 倒咖啡的手 | 兩個人對坐聊天的手部或桌面特寫 |
| 每個晚上的流程 | 燭台與餐盤 | 晚餐桌的近景 |
| 常見問題 | 捧著拿鐵的雙手 | 帶領者或學員手上的茶杯、咖啡（不拍到臉） |

## 部署到 GitHub Pages

1. 在 GitHub 建立 repo（免費帳號需為 **public**），名稱和 `astro.config.mjs` 裡的 `base` 一致（預設 `artofdating`）。
2. 推送到 `main` 分支。
3. 到 repo 的 **Settings → Pages → Build and deployment**，Source 選 **GitHub Actions**。
4. 之後每次推送到 `main`，`.github/workflows/deploy.yml` 會自動建置並發布到
   `https://johnbass.github.io/artofdating/`。

如果帳號或 repo 名稱不同，修改 `astro.config.mjs` 的 `site` 和 `base` 即可。

## 分享給學員

學員多半用手機開啟。LINE 的內建瀏覽器無法下載檔案，關掉後筆記也可能不見，所以在 LINE 群組或 QR code 裡分享連結時，請在網址後面加上 `?openExternalBrowser=1`，LINE 就會改用手機的預設瀏覽器開啟：

```
https://johnbass.github.io/artofdating/?openExternalBrowser=1
```

在 Facebook、Instagram 等 App 裡開啟網站時，頁面上方會提示學員改用瀏覽器開啟。

每一堂頁面底部的「保存我的筆記」會依裝置自動調整：手機顯示「傳給自己保存」（打開系統分享選單），電腦以「下載文字檔」為主，所有裝置都可以「複製全部文字」。

## 版權提醒

本課程內容為原創，研究與書籍皆於頁面中註明出處。請勿將其他課程的手冊、影片或逐字稿放進這個 repo。
