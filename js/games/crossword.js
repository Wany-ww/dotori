import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, FLASH_SETS, SPELL_WORDS, QUIZ_SYLLABLES } from '../data.js';

const COUNT = [2, 3, 3, 4, 5];
const TRAPS = [0, 0, 2, 2, 3];
const ABC = 'abcdefghijklmnopqrstuvwxyz';

// 낱말들을 가로세로로 엇갈리게 놓는다 (겹치는 칸은 같은 글자). 실패하면 다시 섞어서 시도
function build(pool, count) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const words = shuffle(pool);
    const grid = new Map();
    const placed = [];
    const at = (r, c) => grid.get(`${r},${c}`);
    const put = (w, r, c, dir) => {
      [...w.w].forEach((ch, k) => grid.set(`${r + (dir === 'v' ? k : 0)},${c + (dir === 'h' ? k : 0)}`, ch));
      placed.push({ ...w, r, c, dir });
    };
    const fits = (w, r, c, dir) => {
      const cs = [...w.w];
      const dr = dir === 'v' ? 1 : 0;
      const dc = dir === 'h' ? 1 : 0;
      if (at(r - dr, c - dc) || at(r + dr * cs.length, c + dc * cs.length)) return false;
      let cross = 0;
      for (let k = 0; k < cs.length; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        const cur = at(rr, cc);
        if (cur) { if (cur !== cs[k]) return false; cross++; continue; }
        // 새로 채우는 칸의 옆(진행 방향과 수직)은 비어 있어야 한다
        if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return false;
      }
      return cross === 1;
    };
    put(words[0], 0, 0, 'h');
    for (const w of words.slice(1)) {
      if (placed.length >= count) break;
      if (placed.some((p) => p.w === w.w)) continue;
      let done = false;
      for (const p of shuffle(placed)) {
        const dir = p.dir === 'h' ? 'v' : 'h';
        for (let i = 0; i < p.w.length && !done; i++) {
          for (let j = 0; j < w.w.length && !done; j++) {
            if ([...p.w][i] !== [...w.w][j]) continue;
            const r = p.dir === 'h' ? p.r - j : p.r + i;
            const c = p.dir === 'h' ? p.c + i : p.c - j;
            if (fits(w, r, c, dir)) { put(w, r, c, dir); done = true; }
          }
        }
        if (done) break;
      }
    }
    if (placed.length >= count) {
      const r0 = Math.min(...placed.map((p) => p.r));
      const c0 = Math.min(...placed.map((p) => p.c));
      placed.forEach((p) => { p.r -= r0; p.c -= c0; });
      const rows = Math.max(...placed.map((p) => p.r + (p.dir === 'v' ? [...p.w].length : 1)));
      const cols = Math.max(...placed.map((p) => p.c + (p.dir === 'h' ? [...p.w].length : 1)));
      return { placed, rows, cols };
    }
  }
  return null;
}

// 십자말풀이(CrossWord): 그림(영어는 소리도) 단서를 보고 가로세로 칸에 낱말을 채운다.
// 단서를 고르고, 아래 글자 조각을 차례로 눌러 칸을 채운다
export function mount(stage, ctx) {
  const en = ctx.lang === 'en';
  const lang = en ? 'en-US' : 'ko-KR';
  const L = ctx.level;
  const hinter = makeHinter();
  const koPool = [...WORDS, ...WORDS2].map((x) => ({ w: x.word, e: x.emoji })).concat(FLASH_SETS.flatMap((s) => s.words.map(([w, e]) => ({ w, e }))))
    .filter((x) => [...x.w].length >= 2 && [...x.w].length <= 3);
  // 영어 차시: 오늘 단어로 판을 짠다 (모자라면 쉬운 단어로 채운다)
  const enPool = ctx.unit ? [...ctx.unit.words(10, { spell: true, minLen: 3, maxLen: 6 }), ...SPELL_WORDS[3].map((x) => ({ w: x.w, e: x.e }))]
    : [...SPELL_WORDS[3], ...SPELL_WORDS[4], ...(L >= 4 ? SPELL_WORDS[5] : [])].map((x) => ({ w: x.w, e: x.e }));
  const pool = [...new Map((en ? enPool : koPool).map((x) => [x.w, x])).values()];
  let puzzle = null;
  for (let k = COUNT[L - 1]; k >= 2 && !puzzle; k--) puzzle = build(pool, k);
  const { placed, rows, cols } = puzzle;
  const gridEl = h('div', { class: 'cw-grid', style: { '--rows': rows, '--cols': cols } });
  const clues = h('div', { class: 'cw-clues' });
  const bank = h('div', { class: 'cw-bank' });
  stage.append(h('div', { class: `crossword${en ? ' en' : ''}` }, gridEl, h('div', { class: 'cw-side' }, clues, bank)));

  // 칸: 'r,c' → { el, ch, filled }
  const cells = new Map();
  placed.forEach((p, wi) => [...p.w].forEach((ch, k) => {
    const key = `${p.r + (p.dir === 'v' ? k : 0)},${p.c + (p.dir === 'h' ? k : 0)}`;
    if (!cells.has(key)) {
      const [r, c] = key.split(',').map(Number);
      const el = h('button', { class: 'cw-cell', type: 'button', style: { gridRow: r + 1, gridColumn: c + 1 }, 'aria-label': '빈칸', 'data-c': ch });
      cells.set(key, { el, ch, filled: false, words: [] });
      gridEl.append(el);
    }
    const cell = cells.get(key);
    cell.words.push(wi);
    if (k === 0) cell.el.append(h('i', { class: 'cw-no' }, wi + 1));
  }));
  const keysOf = (p) => [...p.w].map((_, k) => `${p.r + (p.dir === 'v' ? k : 0)},${p.c + (p.dir === 'h' ? k : 0)}`);
  const fill = (cell) => {
    cell.filled = true;
    cell.el.classList.add('full');
    cell.el.append(h('span', { class: 'cw-ch' }, cell.ch));
    cell.el.setAttribute('aria-label', cell.ch);
  };
  // 낮은 단계: 낱말마다 첫 글자를 미리 채워 둔다
  if (L <= 2) placed.forEach((p) => { const c = cells.get(keysOf(p)[0]); if (!c.filled) fill(c); });

  let cur = -1;
  let firstTry = 0;
  let solved = 0;
  const wordMiss = placed.map(() => 0);
  const clueEls = placed.map((p, wi) => {
    const b = h('button', { class: 'cw-clue', type: 'button', 'aria-label': `${wi + 1}번 ${p.dir === 'h' ? '가로' : '세로'} 단서` },
      h('i', {}, `${wi + 1} ${p.dir === 'h' ? '→' : '↓'}`), h('span', { 'aria-hidden': 'true' }, wordPic(p.w, p.e)));
    b.addEventListener('click', () => { select(wi); speak(p.w, lang); });
    return b;
  });
  clues.replaceChildren(...clueEls);
  cells.forEach((cell) => cell.el.addEventListener('click', () => {
    const open = cell.words.find((wi) => !isDone(wi));
    select(open ?? cell.words[0]);
  }));
  const isDone = (wi) => keysOf(placed[wi]).every((k) => cells.get(k).filled);

  function select(wi) {
    cur = wi;
    hinter.reset();
    sfx.tap();
    clueEls.forEach((b, i) => b.classList.toggle('on', i === wi));
    cells.forEach((c) => c.el.classList.remove('on'));
    keysOf(placed[wi]).forEach((k) => cells.get(k).el.classList.add('on'));
    const need = keysOf(placed[wi]).map((k) => cells.get(k)).filter((c) => !c.filled).map((c) => c.ch);
    const traps = en ? pickN([...ABC].filter((x) => !need.includes(x)), TRAPS[L - 1]) : pickN(QUIZ_SYLLABLES.filter((x) => !need.includes(x)), TRAPS[L - 1]);
    bank.replaceChildren(...shuffle([...need, ...traps]).map((ch) => {
      const t = h('button', { class: 'cw-tile', type: 'button' }, ch);
      t.dataset.c = ch;
      t.addEventListener('click', () => type(t));
      return t;
    }));
  }

  // 고른 낱말의 다음 빈칸에 맞는 글자면 채운다
  function type(t) {
    if (cur < 0) return;
    const next = keysOf(placed[cur]).map((k) => cells.get(k)).find((c) => !c.filled);
    if (!next) return;
    if (t.dataset.c !== next.ch) {
      wordMiss[cur]++;
      wiggle(t);
      hinter.miss([...bank.children].find((x) => x.dataset.c === next.ch));
      return;
    }
    hinter.reset();
    sfx.pop();
    t.remove();
    fill(next);
    pop(next.el);
    // 이 칸으로 끝난 낱말(가로·세로 모두)을 확인한다
    placed.forEach((p, wi) => {
      if (clueEls[wi].classList.contains('done') || !isDone(wi)) return;
      clueEls[wi].classList.add('done');
      solved++;
      if (wordMiss[wi] === 0) firstTry++;
      ctx.progress(solved, placed.length);
      speak(p.w, lang);
      keysOf(p).forEach((k) => cells.get(k).el.classList.add('good'));
    });
    if (solved >= placed.length) {
      bank.replaceChildren();
      sfx.correct();
      cheer(gridEl, en ? 'en' : 'ko');
      ctx.later(() => ctx.finish({ firstTry, total: placed.length }), 2200);
      return;
    }
    if (isDone(cur)) select(placed.findIndex((_, wi) => !isDone(wi)));
  }

  ctx.progress(0, placed.length);
  select(0);
  ctx.prompt(en ? '그림 단서(🔊 소리도 들어요)를 보고 가로세로 칸에 알맞은 단어를 채워요!' : '그림 단서를 보고, 가로세로 빈칸에 알맞은 낱말을 채워 보아요!',
    () => (en ? speak('Fill in the crossword!', lang) : speak('가로세로 빈칸을 채워 보아요!')));
}
