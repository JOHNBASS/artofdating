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

首頁的動態與特效：

| 位置 | 特效 |
|---|---|
| 英雄區 | 載入時標題、說明和按鈕依序浮現；標題裡的「單身／情侶」輪流替換 |
| 關於愛情的四個擔心 | 數字像里程表一樣滾動；小圖捲到時才畫出來（曲線描繪、點陣逐一亮起、長條伸長） |
| 我們相信的事 | 捲動時一個詞一個詞亮起來 |
| 五堂課 | 標題逐行升起；滑過或點一堂，右邊換成那一堂的照片 |
| 每個晚上的流程 | 畫面固定，捲動時三個段落依序展開，右邊照片跟著換 |
| 常見問題 | 照片進入畫面時像相片顯影 |
| 結尾 | 五堂課的關鍵字標籤（滑過會變色） |
| 全站 | 按鈕、連結、卡片的滑鼠與按壓回饋 |

系統設定「減少動態效果」的使用者，會直接看到靜止的完成畫面；沒有 JavaScript 時內容也完整。

注意：tasteskill 的規則建議服務類網站每頁只用一到兩個捲動特效，目前的數量是應需求刻意加多的，所以它的檢查器會列出「特效太多」之類的提醒。

另外，tasteskill 原本讓每個區塊剛好佔一屏或兩屏；在比較矮或比較窄的視窗（例如 1000×650）會出現大片空白或把文字切掉，所以首頁已改成**區塊高度依內容決定**（`index.astro` 樣式最後一段）。英雄區至少一屏，放不下時會自己長高。

### 照片

首頁的 12 張照片都是用 AI（Codex 圖像生成）做的示意圖，統一成傍晚燭光、台北窗景的色調，畫面裡不出現人臉。頁尾有一行「照片皆為 AI 生成的示意圖」。有了課程現場的照片後，可以放進 `public/assets/img/`，再改 `index.astro` 裡對應的檔名和 `alt`：

| 位置 | 檔名 |
|---|---|
| 英雄區（滿版） | `ai-hero-*.jpg` |
| 四個擔心 | `ai-worries-*.jpg` |
| 五堂課（每堂一張） | `ai-s1-listen`、`ai-s2-repair`、`ai-s3-choose`、`ai-s4-share`、`ai-s5-journey` |
| 每個晚上的流程（三段） | `ai-e1-dinner`、`ai-e2-practice`、`ai-e3-home` |
| 常見問題 | `ai-faq-*.jpg` |

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
