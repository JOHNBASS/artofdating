// 偵測 LINE、Facebook 等 App 的內建瀏覽器：這些瀏覽器通常不能下載檔案，關掉後資料也可能不見
const apps = [
  [/\bLine\//i, 'LINE'],
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB/i, 'Facebook'],
  [/MicroMessenger/i, '微信'],
];

export function inAppName(ua = navigator.userAgent) {
  return apps.find(([re]) => re.test(ua))?.[1] ?? '';
}
