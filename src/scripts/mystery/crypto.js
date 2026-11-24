// 劇本殺的加解密：Node（npm run seal 加密）和瀏覽器（玩家頁、DM 頁解密）共用。
// 密碼用 PBKDF2-SHA256 變成金鑰，內容用 AES-GCM 加密；密碼錯了就解不開。

export const ITERATIONS = 150000;

const enc = new TextEncoder();
const dec = new TextDecoder();

// 密碼正規化：全形轉半形、去掉空白、英文一律大寫，避免手機輸入法造成的差異
export const norm = (s) => String(s || '').normalize('NFKC').replace(/\s+/g, '').toUpperCase();

// 角色每一幕的鑰匙：第一幕只要角色代碼；第二、三幕要再加上 DM 唸的密碼
export const actKey = (code, act, actPass = '') => (act === 1 ? norm(code) : `${norm(code)}|${norm(actPass)}`);

const toB64 = (bytes) => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveKey(pass, salt, usage, iterations) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

export async function seal(data, pass, iterations = ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt, 'encrypt', iterations);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data)));
  return { s: toB64(salt), i: toB64(iv), c: toB64(new Uint8Array(ct)) };
}

// 解不開（密碼錯）就回傳 null
export async function open(box, pass, iterations = ITERATIONS) {
  if (!box) return null;
  try {
    const key = await deriveKey(pass, fromB64(box.s), 'decrypt', iterations);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(box.i) }, key, fromB64(box.c));
    return JSON.parse(dec.decode(pt));
  } catch {
    return null;
  }
}

export const cryptoReady = () => typeof crypto !== 'undefined' && Boolean(crypto.subtle);
