// 產生可以分享的圖卡（限時動態尺寸 1080×1920）：測驗結果卡、欣賞卡共用
import QRCode from 'qrcode';
import { track } from './track.js';

export const W = 1080;
export const H = 1920;

// 圖卡固定用淺色，不跟著深色模式變
export const C = {
  bg: '#fbf7f2',
  surface: '#ffffff',
  ink: '#2b2024',
  soft: '#6b5a5f',
  line: '#eadfd8',
  accent: '#8e3b46',
  accentSoft: '#f4e2e1',
  gold: '#b9832f',
  goldSoft: '#f7ecd9',
};

export const SERIF = '"Noto Serif TC", "Songti TC", serif';
export const SANS = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';

// Google Fonts 的中文字是分片下載的：先把圖卡會用到的字載入，畫出來才不會變成系統字
export async function loadFonts(text) {
  if (!document.fonts?.load) return;
  const jobs = [`700 60px "Noto Serif TC"`, `400 40px "Noto Sans TC"`, `700 40px "Noto Sans TC"`].map((f) =>
    document.fonts.load(f, text).catch(() => {}),
  );
  await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 2500))]);
}

export function makeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  return canvas;
}

// 不能放在行首的標點：遇到就跟前一個字一起換行
const NO_START = '，。、！？；：」』）》〉…⋯．,.!?;:)';

// 中文逐字換行；英文單字不拆開
export function wrapLines(ctx, text, maxWidth) {
  const tokens = text.match(/[A-Za-z0-9'’\-]+|\s+|./gu) || [];
  const lines = [];
  let line = '';
  for (const t of tokens) {
    const next = line + t;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }
    if (NO_START.includes(t[0])) {
      // 標點硬塞在行尾，比放在下一行開頭好看
      line = next;
      continue;
    }
    lines.push(line.trimEnd());
    line = t.trimStart();
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}

// 畫一段會自動換行的文字，回傳畫完後的 y
export function drawText(ctx, text, x, y, { font, color = C.ink, maxWidth, lineHeight, align = 'left' }) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const lines = wrapLines(ctx, text, maxWidth);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

export function measureText(ctx, text, { font, maxWidth, lineHeight }) {
  ctx.font = font;
  return wrapLines(ctx, text, maxWidth).length * lineHeight;
}

export function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// 兩個圓圈交疊的 logo（和網站左上角一樣）
export function drawLogo(ctx, x, y, size) {
  const r = (size * 6.4) / 24;
  const dx = (size * 3.4) / 24;
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.save();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = (size * 1.9) / 24;
  [cx - dx, cx + dx].forEach((px) => {
    ctx.beginPath();
    ctx.arc(px, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(cx - dx, cy, r, -Math.acos(dx / r), Math.acos(dx / r));
  ctx.arc(cx + dx, cy, r, Math.PI - Math.acos(dx / r), Math.PI + Math.acos(dx / r));
  ctx.fillStyle = C.accent;
  ctx.fill();
  ctx.restore();
}

export async function drawQR(ctx, text, x, y, size) {
  const q = document.createElement('canvas');
  await QRCode.toCanvas(q, text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: C.ink, light: '#ffffff' },
  });
  roundRect(ctx, x - 12, y - 12, size + 24, size + 24, 20, '#ffffff', C.line);
  ctx.drawImage(q, x, y, size, size);
}

// 圖卡底部：logo、站名、一句邀請、QR code
export async function drawFooter(ctx, { line1, line2, qrUrl }) {
  const pad = 96;
  const qr = 210;
  const top = H - pad - qr;
  ctx.fillStyle = C.line;
  ctx.fillRect(pad, top - 56, W - pad * 2, 2);
  await drawQR(ctx, qrUrl, W - pad - qr, top, qr);
  const textW = W - pad * 2 - qr - 60;
  drawLogo(ctx, pad, top + 4, 64);
  ctx.font = `700 46px ${SERIF}`;
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('關係練習室', pad + 80, top + 10);
  let y = drawText(ctx, line1, pad, top + 98, { font: `400 32px ${SANS}`, color: C.soft, maxWidth: textW, lineHeight: 46 });
  if (line2) drawText(ctx, line2, pad, y + 6, { font: `700 32px ${SANS}`, color: C.accent, maxWidth: textW, lineHeight: 46 });
}

function toBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// 把畫好的圖卡放進頁面：預覽圖（可長按存檔）、分享、下載
export async function showImage(box, canvas, { filename, shareText, event = 'share_image' }) {
  const blob = await toBlob(canvas);
  const file = new File([blob], filename, { type: 'image/png' });
  const src = URL.createObjectURL(blob);

  const img = box.querySelector('[data-img]');
  img.src = src;
  img.hidden = false;

  const share = box.querySelector('[data-img-share]');
  const save = box.querySelector('[data-img-save]');
  const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  if (share) {
    share.hidden = !canShareFile;
    share.onclick = async () => {
      try {
        await navigator.share({ files: [file], text: shareText });
        track(event, { method: 'share' });
      } catch (e) {
        if (e?.name !== 'AbortError') save?.click();
      }
    };
  }
  if (save) {
    save.onclick = () => {
      const a = document.createElement('a');
      a.href = src;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      track(event, { method: 'download' });
    };
  }
  box.hidden = false;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}
