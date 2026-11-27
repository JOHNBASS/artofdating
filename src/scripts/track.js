// 送一個事件給 Google Analytics（有設定 gaId 才會送；沒設定時什麼都不做）
export function track(name, params = {}) {
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* ignore */
  }
}
