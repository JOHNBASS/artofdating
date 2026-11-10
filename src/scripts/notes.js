// 課程頁的互動：自動儲存、抽卡、標籤上限、保存與清除筆記
// 所有資料只存在使用者自己的瀏覽器（localStorage）
import { inAppName } from './inapp.js';

const root = document.querySelector('[data-notes-page]');
const page = root ? root.dataset.notesPage : 'page';
const prefix = `aod:${page}:`;

const store = {
  get(key) {
    try {
      return localStorage.getItem(prefix + key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(prefix + key, value);
    } catch {
      /* 私密瀏覽或停用儲存時，照常可用，只是不會記住 */
    }
  },
  clear() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};

const fields = () => Array.from(document.querySelectorAll('[data-save]'));

function readField(el) {
  return el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value;
}

function writeField(el, value) {
  if (el.type === 'checkbox') el.checked = value === '1';
  else el.value = value;
}

function updateRange(el) {
  const out = el.closest('.spectrum-row')?.querySelector('output');
  if (out) out.value = el.dataset.touched ? el.value : '—';
}

let hasNotes = false;

// 載入已儲存的內容
fields().forEach((el) => {
  const saved = store.get(el.dataset.save);
  if (saved !== null) {
    if (saved) hasNotes = true;
    writeField(el, saved);
    if (el.type === 'range') el.dataset.touched = '1';
  }
  if (el.type === 'range') updateRange(el);
  const evt = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
  el.addEventListener(evt, () => {
    if (el.type === 'range') {
      el.dataset.touched = '1';
      updateRange(el);
    }
    store.set(el.dataset.save, readField(el));
    flashSaved();
  });
});

// 「已儲存」提示
const status = document.querySelector('[data-save-status]');
let statusTimer;
function flash(message, ms = 2200) {
  if (!status) return;
  status.textContent = message;
  status.classList.add('on');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('on'), ms);
}
function flashSaved() {
  flash('已自動儲存在這台裝置', 1600);
  hasNotes = true;
  syncFab();
  askPersist();
}

// 請瀏覽器盡量不要自動清掉這個網站的資料（不支援或被拒絕都沒關係）
let persistAsked = false;
function askPersist() {
  if (persistAsked) return;
  persistAsked = true;
  navigator.storage?.persist?.().catch(() => {});
}

// 手機上的「保存筆記」浮動按鈕：有內容、還沒看到頁尾的保存區、也不在打字時才出現
const fab = document.querySelector('[data-notes-fab]');
const panel = document.querySelector('[data-notes-panel]');
let panelVisible = false;
let typing = false;
function syncFab() {
  if (fab) fab.classList.toggle('on', hasNotes && !panelVisible && !typing);
}
if (panel && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    panelVisible = entry.isIntersecting;
    syncFab();
  }).observe(panel);
}
document.addEventListener('focusin', (e) => {
  typing = e.target.matches?.('textarea, input[type="text"]') ?? false;
  syncFab();
});
document.addEventListener('focusout', () => {
  typing = false;
  syncFab();
});
syncFab();

// 課程標籤列：把目前這一堂捲到看得見的位置
const tabs = document.querySelector('[data-session-tabs]');
const current = tabs?.querySelector('[aria-current="page"]');
if (tabs && current && tabs.scrollWidth > tabs.clientWidth) {
  tabs.scrollLeft = current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2;
}

// 標籤選擇：限制最多可選數量
document.querySelectorAll('[data-chips]').forEach((group) => {
  const max = Number(group.dataset.max || 0);
  const counter = group.querySelector('[data-chip-count]');
  const boxes = Array.from(group.querySelectorAll('input[type="checkbox"]'));
  const sync = () => {
    const n = boxes.filter((b) => b.checked).length;
    if (counter) counter.textContent = max ? `${n} / ${max}` : String(n);
    if (max) boxes.forEach((b) => (b.disabled = !b.checked && n >= max));
  };
  boxes.forEach((b) => b.addEventListener('change', sync));
  sync();
});

// 抽卡：同一副牌抽完一輪前不重複
document.querySelectorAll('[data-cards]').forEach((box) => {
  const decks = JSON.parse(box.dataset.cards);
  const face = box.querySelector('[data-card-face]');
  const meta = box.querySelector('[data-card-meta]');
  const tabs = Array.from(box.querySelectorAll('[data-deck]'));
  const draw = box.querySelector('[data-draw]');
  let current = 0;
  const pools = decks.map(() => []);

  const select = (i) => {
    current = i;
    tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(i === j)));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  select(0);

  draw.addEventListener('click', () => {
    const deck = decks[current];
    if (!pools[current].length) {
      pools[current] = deck.cards.map((_, i) => i).sort(() => Math.random() - 0.5);
    }
    const idx = pools[current].pop();
    face.classList.remove('flip');
    void face.offsetWidth;
    face.textContent = deck.cards[idx];
    face.classList.add('flip');
    meta.textContent = `${deck.name} · 這一輪還剩 ${pools[current].length} 張`;
  });
});

// 把這一堂的筆記整理成純文字
function dots(value, steps) {
  const v = Number(value);
  return Array.from({ length: steps }, (_, i) => (i + 1 === v ? '●' : '○')).join('');
}

function buildNotes() {
  const title = document.querySelector('[data-session-title]')?.textContent?.trim() || document.title;
  const lines = [`關係練習室｜${title}`, `保存時間：${new Date().toLocaleString('zh-TW')}`, ''];
  let count = 0;
  document.querySelectorAll('[data-exercise]').forEach((ex) => {
    const entries = [];
    ex.querySelectorAll('[data-save]').forEach((el) => {
      const label = el.dataset.label || '';
      if (el.type === 'checkbox') {
        if (el.checked) entries.push(`☑ ${label}`);
      } else if (el.type === 'range') {
        if (el.dataset.touched) {
          const [l, r] = label.split('|');
          entries.push(`${l}  ${dots(el.value, Number(el.max))}  ${r}`);
        }
      } else if (el.value.trim()) {
        entries.push(label ? `${label}：${el.value.trim()}` : el.value.trim());
      }
    });
    if (entries.length) {
      count += entries.length;
      lines.push(`【${ex.dataset.exercise}】`, ...entries, '');
    }
  });
  return { title, text: lines.join('\n'), empty: count === 0 };
}

// 保存方式：手機用分享選單或複製，電腦用下載
function notesOrWarn(btn) {
  const notes = buildNotes();
  if (notes.empty) {
    flash('這一堂還沒有填寫內容');
    btn.blur();
    return null;
  }
  return notes;
}

function download({ title, text }) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `關係練習室-${title}-我的筆記.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 舊瀏覽器或內建瀏覽器不支援 clipboard API 時的備援
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

const touch = matchMedia('(pointer: coarse)').matches;
const canShare = touch && typeof navigator.share === 'function';
const inApp = Boolean(inAppName());

document.querySelectorAll('[data-share-tip]').forEach((t) => (t.hidden = !canShare));
document.querySelectorAll('[data-share]').forEach((b) => {
  b.hidden = !canShare;
  b.addEventListener('click', async () => {
    const notes = notesOrWarn(b);
    if (!notes) return;
    try {
      await navigator.share({ title: `關係練習室｜${notes.title}`, text: notes.text });
    } catch (e) {
      if (e?.name === 'AbortError') return;
      if (await copyText(notes.text)) flash('無法開啟分享，已改為複製全部文字');
    }
  });
});

document.querySelectorAll('[data-copy]').forEach((b) => {
  if (!canShare && inApp) b.classList.add('btn-primary');
  b.addEventListener('click', async () => {
    const notes = notesOrWarn(b);
    if (!notes) return;
    flash((await copyText(notes.text)) ? '已複製，可以貼到 LINE、備忘錄或 Email' : '複製失敗，請改用下載');
  });
});

document.querySelectorAll('[data-export]').forEach((b) => {
  // 手機上分享比下載好找；LINE、Facebook 等內建瀏覽器通常無法下載
  b.hidden = inApp;
  if (!canShare) b.classList.add('btn-primary');
  b.addEventListener('click', () => {
    const notes = notesOrWarn(b);
    if (notes) download(notes);
  });
});

// 清除：按兩次才清除，避免誤觸
document.querySelectorAll('[data-clear]').forEach((btn) => {
  let armed = false;
  let timer;
  const label = btn.textContent;
  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      btn.textContent = '再按一次確認清除';
      btn.classList.add('danger');
      timer = setTimeout(() => {
        armed = false;
        btn.textContent = label;
        btn.classList.remove('danger');
      }, 3000);
      return;
    }
    clearTimeout(timer);
    store.clear();
    fields().forEach((el) => {
      if (el.type === 'checkbox') el.checked = false;
      else if (el.type === 'range') {
        el.value = String(Math.ceil(Number(el.max) / 2));
        delete el.dataset.touched;
        updateRange(el);
      } else el.value = '';
    });
    document.querySelectorAll('[data-chips] input').forEach((b) => (b.disabled = false));
    document.querySelectorAll('[data-chip-count]').forEach((c) => {
      const max = c.closest('[data-chips]')?.dataset.max;
      c.textContent = max ? `0 / ${max}` : '0';
    });
    hasNotes = false;
    syncFab();
    armed = false;
    btn.textContent = '已清除';
    btn.classList.remove('danger');
    setTimeout(() => (btn.textContent = label), 1500);
  });
});
