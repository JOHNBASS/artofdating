// 帶領者投影片：換頁、講者畫面（另一個視窗，用 BroadcastChannel 同步）、練習倒數、總覽、黑畫面
import { fmt, chime, keepAwake } from './timer-utils.js';

const $ = (sel) => document.querySelector(sel);
const stage = $('[data-stage]');
const slides = [...stage.querySelectorAll('[data-slide]')];
const total = slides.length;
const num = stage.dataset.num;
const params = new URLSearchParams(location.search);
const presenter = params.has('presenter');
const helpEl = $('[data-help]');

let index = 0;
let black = false;
let overview = false;
// 練習倒數：同一時間只有一個，屬於某一張練習投影片（slide 是它的索引）
let timer = { slide: -1, total: 0, remaining: 0, endAt: 0, running: false };
let chimed = false;
// 另一個視窗（投影片或講者畫面）有沒有開著
let peerSeen = false;
let awaitingState = true;

const channel = 'BroadcastChannel' in window ? new BroadcastChannel(`aod-deck-${num}`) : null;
const send = (msg) => channel?.postMessage(msg);

const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};

if (presenter) {
  document.body.classList.add('is-presenter');
  document.title = `講者畫面・${document.title}`;
}

// ---------- 換頁 ----------
function fromHash() {
  const n = parseInt(location.hash.slice(1), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), total - 1) : 0;
}

function go(i, { broadcast = true } = {}) {
  index = Math.min(Math.max(i, 0), total - 1);
  slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
  history.replaceState(null, '', `${location.search}#${index + 1}`);
  $('[data-progress]').style.width = `${((index + 1) / total) * 100}%`;
  if (overview) slides[index].scrollIntoView({ block: 'nearest' });
  renderTimer();
  if (presenter) renderPresenter();
  if (broadcast) send({ t: 'go', i: index });
}

// ---------- 講者畫面 ----------
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const sections = slides
  .map((s, k) => ({ k, kind: s.dataset.kind, time: s.dataset.time }))
  .filter((x) => x.kind === 'section' && x.time);

function renderPresenter() {
  const s = slides[index];
  $('[data-pv-pos]').textContent = `${index + 1} / ${total}`;
  $('[data-pv-label]').textContent = s.dataset.label;
  const notes = s.querySelector('[data-notes]');
  $('[data-pv-notes]').innerHTML = notes ? notes.innerHTML : '<span class="muted">（這一張沒有備註）</span>';

  const box = $('[data-pv-next]');
  if (index + 1 < total) {
    const clone = slides[index + 1].cloneNode(true);
    clone.classList.add('is-active');
    clone.removeAttribute('data-slide');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('[data-act]').forEach((b) => b.removeAttribute('data-act'));
    box.replaceChildren(clone);
  } else {
    box.innerHTML = '<p class="pv-empty">這是最後一張</p>';
  }
  renderPace();
}

// 和今晚流程比對：下一段預定幾點開始、還有幾分鐘
function renderPace() {
  const el = $('[data-pv-pace]');
  const next = sections.find((x) => x.k > index);
  const now = new Date();
  const left = next ? toMin(next.time) - (now.getHours() * 60 + now.getMinutes()) : NaN;
  // 不在上課時段（例如白天先預習）就不顯示
  if (!next || left > 150 || left < -60) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.classList.toggle('is-late', left < 0);
  el.innerHTML = `<span class="pv-k">下一段 ${next.time}</span><strong>${
    left >= 0 ? `還有 ${left} 分` : `已超過 ${-left} 分`
  }</strong>`;
}

// ---------- 練習倒數 ----------
const remainingNow = () =>
  timer.running ? Math.max(0, (timer.endAt - Date.now()) / 1000) : timer.remaining;
const hasTimer = (k) => k >= 0 && Boolean(slides[k].dataset.minutes);

function setupTimer(k) {
  const secs = Number(slides[k].dataset.minutes);
  timer = { slide: k, total: secs, remaining: secs, endAt: 0, running: false };
  chimed = false;
}

function toggleTimer() {
  const k = hasTimer(index) ? index : timer.slide;
  if (k < 0) {
    toast('這一張沒有練習倒數');
    return;
  }
  if (k !== timer.slide) setupTimer(k);
  if (timer.running) {
    timer.remaining = remainingNow();
    timer.running = false;
  } else {
    if (timer.remaining <= 0) timer.remaining = timer.total;
    timer.endAt = Date.now() + timer.remaining * 1000;
    timer.running = true;
    chimed = false;
  }
  timerChanged();
}

function resetTimer() {
  const k = hasTimer(index) ? index : timer.slide;
  if (k < 0) return;
  setupTimer(k);
  timerChanged();
}

function adjustTimer(delta) {
  if (timer.slide < 0 || (hasTimer(index) && timer.slide !== index && !timer.running)) {
    if (!hasTimer(index)) return;
    setupTimer(index);
  }
  const r = Math.max(0, remainingNow() + delta);
  if (timer.running) timer.endAt = Date.now() + r * 1000;
  else timer.remaining = r;
  timer.total = Math.max(60, timer.total + delta, r);
  if (r > 0) chimed = false;
  timerChanged();
}

function timerChanged() {
  renderTimer();
  send({ t: 'timer', timer });
}

function renderTimer() {
  const active = timer.slide >= 0;
  const r = active ? remainingNow() : 0;
  const done = active && !timer.running && r <= 0;
  const warn = active && r > 0 && r <= 60;
  const progress = active ? `${(1 - r / timer.total) * 100}%` : '0%';

  slides.forEach((s, k) => {
    const box = s.querySelector('[data-timer]');
    if (!box) return;
    const mine = k === timer.slide;
    box.querySelector('[data-timer-display]').textContent = fmt(
      mine ? Math.ceil(r) : Number(s.dataset.minutes),
    );
    box.querySelector('[data-timer-bar]').style.width = mine ? progress : '0%';
    box.classList.toggle('is-warn', mine && warn);
    box.classList.toggle('is-done', mine && done);
    const btn = box.querySelector('.ex-btn');
    btn.textContent = !mine ? '開始計時' : timer.running ? '暫停' : done ? '再計時一次' : r < timer.total ? '繼續' : '開始計時';
  });

  // 計時中換到別張投影片時，右下角留一個小計時器
  const mini = $('[data-mini]');
  const showMini = active && timer.slide !== index && (timer.running || done);
  mini.hidden = !showMini;
  if (showMini) {
    $('[data-mini-label]').textContent = slides[timer.slide].dataset.label;
    $('[data-mini-time]').textContent = fmt(Math.ceil(r));
    mini.classList.toggle('is-warn', warn);
    mini.classList.toggle('is-done', done);
  }

  if (presenter) {
    const box = $('[data-pv-timer]');
    const shown = active ? Math.ceil(r) : hasTimer(index) ? Number(slides[index].dataset.minutes) : null;
    $('[data-pv-timer-display]').textContent = shown === null ? '--:--' : fmt(shown);
    $('[data-pv-timer-btn]').textContent = timer.running ? '暫停' : '開始';
    box.classList.toggle('is-warn', warn);
    box.classList.toggle('is-done', done);
  }
}

// ---------- 時鐘 ----------
const pad = (n) => String(n).padStart(2, '0');
let startedAt = Date.now();
try {
  startedAt = Number(sessionStorage.getItem(`aod:deck-start-${num}`)) || startedAt;
  sessionStorage.setItem(`aod:deck-start-${num}`, String(startedAt));
} catch {
  /* ignore */
}

function tickClock() {
  const now = new Date();
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.querySelectorAll('[data-clock]').forEach((el) => (el.textContent = hm));
  if (presenter) {
    $('[data-pv-clock]').textContent = hm;
    const mins = Math.floor((Date.now() - startedAt) / 60000);
    $('[data-pv-elapsed]').textContent = `${Math.floor(mins / 60)}:${pad(mins % 60)}`;
    renderPace();
  }
}

function resetElapsed() {
  startedAt = Date.now();
  try {
    sessionStorage.setItem(`aod:deck-start-${num}`, String(startedAt));
  } catch {
    /* ignore */
  }
  tickClock();
}

let lastMinute = -1;
setInterval(() => {
  if (timer.running && remainingNow() <= 0) {
    timer.running = false;
    timer.remaining = 0;
    // 兩個視窗都開著時，只讓投影片視窗發出提示音
    if (!chimed && (!presenter || !peerSeen)) chime();
    chimed = true;
  }
  if (timer.slide >= 0) renderTimer();
  const m = new Date().getMinutes();
  if (m !== lastMinute) {
    lastMinute = m;
    tickClock();
  }
}, 250);

// ---------- 黑畫面、深淺色、總覽、說明、全螢幕 ----------
function setBlack(on, { broadcast = true } = {}) {
  black = on;
  $('[data-blackout]').hidden = !on || presenter;
  document.querySelectorAll('[data-act="black"]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  if (broadcast) send({ t: 'black', on });
}

function applyTheme(v) {
  if (v === 'light' || v === 'dark') document.documentElement.dataset.theme = v;
}
function toggleTheme() {
  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const cur = document.documentElement.dataset.theme || (sysDark ? 'dark' : 'light');
  const v = cur === 'dark' ? 'light' : 'dark';
  applyTheme(v);
  store.set('aod:deck-theme', v);
  send({ t: 'theme', v });
}
applyTheme(store.get('aod:deck-theme'));

function setOverview(on) {
  overview = on;
  stage.classList.toggle('is-overview', on);
  if (on) slides[index].scrollIntoView({ block: 'center' });
  else stage.scrollTop = 0;
}

function toggleHelp(on = helpEl.hidden) {
  helpEl.hidden = !on;
  if (on) helpEl.querySelector('.btn-primary')?.focus();
}

function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.();
}
if (!document.fullscreenEnabled) $('[data-full-btn]')?.remove();

function openSpeaker() {
  if (presenter) return;
  const w = window.open(
    `${location.pathname}?presenter${location.hash}`,
    `aod-presenter-${num}`,
    'popup,width=1280,height=800',
  );
  if (!w) toast('瀏覽器擋住了新視窗，請允許這個網站開啟彈出式視窗');
}

let toastTimer;
function toast(text, ms = 3000) {
  const el = $('[data-toast]');
  el.textContent = text;
  el.classList.remove('is-hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('is-hidden'), ms);
}

const actions = {
  next: () => go(index + 1),
  prev: () => go(index - 1),
  first: () => go(0),
  last: () => go(total - 1),
  timer: toggleTimer,
  reset: resetTimer,
  plus: () => adjustTimer(60),
  minus: () => adjustTimer(-60),
  overview: () => setOverview(!overview),
  black: () => setBlack(!black),
  theme: toggleTheme,
  help: () => toggleHelp(),
  full: fullscreen,
  speaker: openSpeaker,
  'elapsed-reset': resetElapsed,
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  e.stopPropagation();
  actions[b.dataset.act]?.();
  b.blur();
});

const keys = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageDown: 'next',
  ' ': 'next',
  n: 'next',
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  PageUp: 'prev',
  Backspace: 'prev',
  p: 'prev',
  Home: 'first',
  End: 'last',
  t: 'timer',
  r: 'reset',
  '+': 'plus',
  '=': 'plus',
  '-': 'minus',
  _: 'minus',
  o: 'overview',
  b: 'black',
  '.': 'black',
  d: 'theme',
  f: 'full',
  s: 'speaker',
  '?': 'help',
  h: 'help',
};

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest?.('input, textarea, select')) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (!helpEl.hidden) {
    if (key === 'Escape' || key === '?' || key === 'h') {
      e.preventDefault();
      toggleHelp(false);
    }
    return;
  }
  if (overview && (key === 'Escape' || key === 'Enter')) {
    e.preventDefault();
    setOverview(false);
    return;
  }
  // 黑畫面時按任何鍵都只是回到投影片
  if (black) {
    e.preventDefault();
    setBlack(false);
    return;
  }
  const act = keys[key];
  if (!act) return;
  e.preventDefault();
  actions[act]();
});

// 點投影片：右邊三分之二下一張、左邊三分之一上一張；總覽時點一張跳過去
let swiped = false;
stage.addEventListener('click', (e) => {
  if (e.target.closest('button, a')) return;
  if (overview) {
    const s = e.target.closest('[data-slide]');
    if (s) {
      go(slides.indexOf(s));
      setOverview(false);
    }
    return;
  }
  if (swiped) {
    swiped = false;
    return;
  }
  const r = stage.getBoundingClientRect();
  go(e.clientX - r.left < r.width / 3 ? index - 1 : index + 1);
});
$('[data-blackout]').addEventListener('click', () => setBlack(false));

// 平板觸控：左右滑動換頁
let touchStart = null;
stage.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') touchStart = { x: e.clientX, y: e.clientY };
});
stage.addEventListener('pointerup', (e) => {
  if (!touchStart || overview) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    swiped = true;
    go(dx < 0 ? index + 1 : index - 1);
  }
});

// 滑鼠動了才顯示控制列，靜止 2.5 秒後連游標一起藏起來
const controls = $('[data-controls]');
let idleTimer;
document.addEventListener('pointermove', (e) => {
  if (presenter || e.pointerType === 'touch') return;
  controls.classList.remove('is-idle');
  document.body.classList.remove('cursor-idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!controls.matches(':hover')) controls.classList.add('is-idle');
    document.body.classList.add('cursor-idle');
  }, 2500);
});

// ---------- 兩個視窗同步 ----------
channel?.addEventListener('message', ({ data }) => {
  peerSeen = true;
  switch (data.t) {
    case 'go':
      go(data.i, { broadcast: false });
      break;
    case 'timer':
      timer = data.timer;
      chimed = !timer.running && timer.remaining <= 0;
      renderTimer();
      break;
    case 'black':
      setBlack(data.on, { broadcast: false });
      break;
    case 'theme':
      applyTheme(data.v);
      break;
    case 'hello':
      send({ t: 'state', i: index, timer, black });
      break;
    case 'state':
      if (!awaitingState) break;
      awaitingState = false;
      timer = data.timer;
      chimed = !timer.running && timer.remaining <= 0;
      setBlack(data.black, { broadcast: false });
      go(data.i, { broadcast: false });
      break;
  }
});

addEventListener('hashchange', () => {
  if (fromHash() !== index) go(fromHash());
});

// 上課中不讓螢幕休眠
keepAwake(true);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepAwake(true);
});

go(fromHash(), { broadcast: false });
// ?overview：直接打開總覽（帶領者頁的「預覽全部」）
if (params.has('overview')) setOverview(true);
tickClock();
send({ t: 'hello' });
setTimeout(() => (awaitingState = false), 1500);
if (!presenter && !overview) toast('→ 下一張　F 全螢幕　S 講者畫面　? 說明', 5000);

// 開發時檢查：哪幾張投影片的內容超出畫面
if (import.meta.env.DEV) {
  document.fonts.ready.then(() => {
    const bad = [];
    slides.forEach((s, k) => {
      const was = s.classList.contains('is-active');
      s.classList.add('is-active');
      const f = s.querySelector('.frame');
      if (f.scrollHeight > f.clientHeight + 1) {
        bad.push(k + 1);
        s.dataset.overflow = String(f.scrollHeight - f.clientHeight);
      }
      if (!was) s.classList.remove('is-active');
    });
    document.documentElement.dataset.overflow = bad.join(',') || 'none';
    if (bad.length) console.warn('[投影片] 內容超出畫面：', bad.join(', '));
  });
}
