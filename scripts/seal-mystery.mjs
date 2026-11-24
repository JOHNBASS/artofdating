// 劇本殺加密：npm run seal
//
// 讀 private/沒寄出的信/（不進 git）裡的劇本、DM 稿、密碼，
// 加密後寫到 src/data/mystery-sealed.json。這個輸出檔可以公開上傳，沒有密碼看不到內容。
//
//   roles/<角色 id>.md   每個角色的劇本，用「## 第一幕／## 第二幕／## 第三幕」分幕
//   dm.mjs               梅姐台詞、線索卡、信、選擇與結局、真相
//   passwords.json       DM 密碼、角色代碼、第二三幕密碼
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { seal, actKey, ITERATIONS } from '../src/scripts/mystery/crypto.js';
import { mystery } from '../src/data/mystery.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'private', '沒寄出的信');
const out = path.join(root, 'src', 'data', 'mystery-sealed.json');

const problems = [];
const check = (ok, msg) => ok || problems.push(msg);

try {
  await access(dir);
} catch {
  console.error(`找不到劇本資料夾：${dir}\n劇本只存在原作者的電腦上（private/ 不進 git）。`);
  process.exit(1);
}

// ---------- 簡單的 Markdown → HTML ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const inline = (s) =>
  esc(String(s))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');

function md(text) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    let m;
    if ((m = line.match(/^(#{3,4})\s+(.*)$/))) {
      const h = m[1].length;
      html.push(`<h${h}>${inline(m[2])}</h${h}>`);
      i++;
    } else if (/^---+\s*$/.test(line)) {
      html.push('<hr />');
      i++;
    } else if (/^>/.test(line)) {
      const inner = [];
      while (i < lines.length && /^>/.test(lines[i])) inner.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${md(inner.join('\n'))}</blockquote>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      html.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
    } else if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      html.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`);
    } else {
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{3,4}\s|>|\s*[-*]\s|\s*\d+\.\s|---)/.test(lines[i])) para.push(lines[i++]);
      html.push(`<p>${para.map(inline).join('<br />')}</p>`);
    }
  }
  return html.join('\n');
}

// ---------- 讀資料 ----------
const dm = await import(pathToFileURL(path.join(dir, 'dm.mjs')).href);
const passwords = JSON.parse(await readFile(path.join(dir, 'passwords.json'), 'utf8'));
const roleIds = mystery.roles.map((r) => r.id);

check(passwords.dm && passwords.dm.length >= 8, 'passwords.json 的 dm 密碼至少要 8 個字');
for (const id of roleIds) check(passwords.roles?.[id], `passwords.json 少了角色 ${id} 的代碼`);
check(passwords.acts?.['2'] && passwords.acts?.['3'], 'passwords.json 要有第二、三幕的密碼（acts.2、acts.3）');
const codes = Object.values(passwords.roles || {});
check(new Set(codes).size === codes.length, '每個角色的代碼要不一樣');

const clueById = Object.fromEntries(dm.clues.map((c) => [c.id, c]));
const clueHtml = (c) =>
  `<div class="clue"><p class="clue-id">${esc(c.id)}</p><h4>${inline(c.title)}</h4>${md(c.text)}</div>`;
const letterHtml = (id) => `<blockquote class="letter">${md(dm.letters[id])}</blockquote>`;
const choicesHtml = (id) =>
  (dm.choices[id] || [])
    .map(
      (g) =>
        `<div class="choice-group">${(dm.choices[id].length > 1 ? `<p class="choice-label">${inline(g.label)}</p>` : '')}<ul class="choices">${g.options
          .map((o) => `<li><strong>${esc(o.id)}. ${inline(o.label)}</strong>${o.desc ? `<span>${inline(o.desc)}</span>` : ''}</li>`)
          .join('')}</ul></div>`,
    )
    .join('');

// 劇本：## 第一幕 … ## 第三幕
const actNames = { 第一幕: 1, 第二幕: 2, 第三幕: 3 };
const scripts = {};
for (const id of roleIds) {
  const src = await readFile(path.join(dir, 'roles', `${id}.md`), 'utf8');
  const acts = {};
  let cur = null;
  for (const line of src.replace(/\r/g, '').split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m && !line.startsWith('###')) {
      cur = actNames[m[1]] || null;
      check(cur, `${id}.md 有不認得的分幕標題「${m[1]}」（要用 第一幕／第二幕／第三幕）`);
      if (cur) acts[cur] = [];
    } else if (cur) acts[cur].push(line);
  }
  scripts[id] = {};
  for (const n of [1, 2, 3]) {
    check(acts[n], `${id}.md 少了第${'一二三'[n - 1]}幕`);
    let html = md((acts[n] || []).join('\n'));
    html = html
      .replace(/<p>\{\{信\}\}<\/p>/g, () => letterHtml(id))
      .replace(/<p>\{\{選擇\}\}<\/p>/g, () => choicesHtml(id))
      .replace(/<p>\{\{線索:(\w+)\}\}<\/p>/g, (_, cid) => {
        check(clueById[cid], `${id}.md 用到不存在的線索 ${cid}`);
        return clueById[cid] ? clueHtml(clueById[cid]) : '';
      });
    check(!html.includes('{{'), `${id}.md 第 ${n} 幕有沒換掉的 {{⋯}}（要單獨一行）`);
    scripts[id][n] = html;
  }
  check(dm.letters[id], `dm.mjs 的 letters 少了 ${id}`);
  check(dm.choices[id]?.length, `dm.mjs 的 choices 少了 ${id}`);
}

// DM 稿：流程 id 要和公開資料一致
for (const p of mystery.phases) check(dm.phases[p.id], `dm.mjs 的 phases 少了「${p.title}」（${p.id}）`);
const choiceKeys = new Set(roleIds.flatMap((id) => (dm.choices[id] || []).map((g) => `${id}.${g.id}`)));
for (const c of dm.combos) for (const k of Object.keys(c.when)) check(choiceKeys.has(k), `combos 裡的條件 ${k} 不存在`);
for (const q of dm.questions) check(roleIds.includes(q.answer), `投票題 ${q.id} 的答案 ${q.answer} 不是角色 id`);

if (problems.length) {
  console.error('劇本有問題，沒有加密：\n- ' + problems.join('\n- '));
  process.exit(1);
}

const dmData = {
  npc: { ...dm.npc, facts: dm.npc.facts.map((f) => ({ topic: inline(f.topic), say: inline(f.say) })) },
  clues: dm.clues.map((c) => ({ id: c.id, title: inline(c.title), round: inline(c.round), holder: inline(c.holder), html: md(c.text) })),
  letters: Object.fromEntries(roleIds.map((id) => [id, md(dm.letters[id])])),
  choices: Object.fromEntries(
    roleIds.map((id) => [
      id,
      dm.choices[id].map((g) => ({
        id: g.id,
        label: inline(g.label),
        options: g.options.map((o) => ({ id: o.id, label: inline(o.label), desc: inline(o.desc || ''), ending: inline(o.ending) })),
      })),
    ]),
  ),
  combos: dm.combos.map((c) => ({ when: c.when, after: c.after, text: inline(c.text) })),
  endingOrder: dm.endingOrder,
  questions: dm.questions.map((q) => ({ ...q, q: inline(q.q), why: inline(q.why) })),
  commonEndings: dm.commonEndings.map((e) => ({ min: e.min, title: inline(e.title), text: inline(e.text) })),
  phases: Object.fromEntries(
    Object.entries(dm.phases).map(([k, p]) => [k, { say: (p.say || []).map(inline), do: (p.do || []).map(inline), tips: (p.tips || []).map(inline) }]),
  ),
  truth: { summary: inline(dm.truth.summary), timeline: dm.truth.timeline.map(([t, s]) => [inline(t), inline(s)]) },
  reveal: md(dm.reveal),
  questionCards: dm.questionCards.map(inline),
  observer: dm.observer.map(inline),
  appreciation: inline(dm.appreciation),
  scripts,
  passwords: { roles: passwords.roles, acts: passwords.acts },
};

// ---------- 加密 ----------
const sealed = { v: 1, iterations: ITERATIONS, sealedAt: new Date().toISOString().slice(0, 10), roles: {}, dm: null };
for (const id of roleIds) {
  sealed.roles[id] = {};
  for (const n of [1, 2, 3]) {
    sealed.roles[id][n] = await seal({ role: id, act: n, html: scripts[id][n] }, actKey(passwords.roles[id], n, passwords.acts[n]));
  }
}
sealed.dm = await seal(dmData, actKey(passwords.dm, 1));

await writeFile(out, JSON.stringify(sealed) + '\n');
const kb = (JSON.stringify(sealed).length / 1024).toFixed(0);
console.log(`已加密 ${roleIds.length} 個角色 × 3 幕，和 DM 資料 → ${path.relative(root, out)}（${kb} KB）`);
console.log(`DM 密碼：${passwords.dm}　第二幕：${passwords.acts['2']}　第三幕：${passwords.acts['3']}`);
console.log('角色代碼：' + roleIds.map((id) => `${mystery.roles.find((r) => r.id === id).name} ${passwords.roles[id]}`).join('　'));
