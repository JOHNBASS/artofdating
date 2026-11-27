// 全站設定：流量統計、聯絡方式。改這裡就好，所有頁面會跟著變。
import { url } from '../scripts/paths.js';

export const siteConfig = {
  // Google Analytics 4 的「評估 ID」（G- 開頭，例如 'G-ABC123XYZ9'）。
  // 空字串就不載入統計。設定方式見 README「流量統計」。
  gaId: '',

  // 「留言給我」頁面收信的地方。拆成兩半寫，網頁原始碼裡就不會出現完整的 Email，比較不會被垃圾信程式抓走。
  contact: {
    user: 'john6812711',
    domain: 'gmail.com',
    // Web3Forms 的 Access Key。填了以後，留言會直接寄到上面的信箱；
    // 空字串時，按「送出」會打開訪客手機或電腦裡的 Email App，把寫好的內容帶進去。
    // 申請方式見 README「留言給我」。
    web3formsKey: '',
  },
};

// 完整網址（https://…）。分享預覽圖、sitemap、Google 的活動資料都需要完整網址，不能只寫 /artofdating/…
export function absUrl(path = '') {
  return new URL(url(path), import.meta.env.SITE).href;
}
