// 咖啡館老闆（由 DM 扮演）的稱呼。
// 加密時，劇本裡的「梅姐」「老闆娘」和指老闆的 {{她}} 會先換成下面的記號；
// 網頁解密後，再依 src/data/mystery.js 的 hostGender 換成「梅姐／老闆娘／她」或「梅叔／老闆／他」。
// 所以切換男女老闆只要改設定、重新建置，不用重新加密。

export const HOST_TOKENS = { name: '{{HOST}}', title: '{{HOST_TITLE}}', pronoun: '{{HOST_PRONOUN}}' };

// 加密前：把原稿裡的稱呼換成記號
export const toHostTokens = (text) =>
  String(text)
    .replaceAll('梅姐', HOST_TOKENS.name)
    .replaceAll('老闆娘', HOST_TOKENS.title)
    .replaceAll('{{她}}', HOST_TOKENS.pronoun);

const fill = (s, host) =>
  s.replaceAll(HOST_TOKENS.name, host.name).replaceAll(HOST_TOKENS.title, host.title).replaceAll(HOST_TOKENS.pronoun, host.pronoun);

// 解密後：把記號換回這個網站設定的稱呼（字串或整個物件都可以）
export function fillHost(value, host) {
  if (typeof value === 'string') return fill(value, host);
  return JSON.parse(fill(JSON.stringify(value), host));
}
