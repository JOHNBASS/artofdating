// 課程頁的互動：自動儲存、抽卡、標籤上限、匯出與清除筆記
// 所有資料只存在使用者自己的瀏覽器（localStorage）

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

// 載入已儲存的內容
fields().forEach((el) => {
  const saved = store.get(el.dataset.save);
  if (saved !== null) {
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
function flashSaved() {
  if (!status) return;
  status.textContent = '已自動儲存在這台裝置';
  status.classList.add('on');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('on'), 1600);
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

// 匯出筆記為文字檔
function dots(value, steps) {
  const v = Number(value);
  return Array.from({ length: steps }, (_, i) => (i + 1 === v ? '●' : '○')).join('');
}

function exportNotes() {
  const title = document.querySelector('[data-session-title]')?.textContent?.trim() || document.title;
  const lines = [`約會的藝術｜${title}`, `匯出時間：${new Date().toLocaleString('zh-TW')}`, ''];
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
      lines.push(`【${ex.dataset.exercise}】`, ...entries, '');
    }
  });
  if (lines.length <= 3) lines.push('（這一堂還沒有填寫內容）');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `約會的藝術-${title}-我的筆記.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.querySelectorAll('[data-export]').forEach((b) => b.addEventListener('click', exportNotes));

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
    armed = false;
    btn.textContent = '已清除';
    btn.classList.remove('danger');
    setTimeout(() => (btn.textContent = label), 1500);
  });
});
