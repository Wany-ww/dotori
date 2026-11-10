import { h, shuffle, pickN, pick, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { MATRIX_SETS, WORD_MATRIX, CHO, JAMO_NAME, compose } from '../data.js';
import { draggable, hits } from './dragTap.js';

const NS = 'http://www.w3.org/2000/svg';
const PATHS = {
  circle: 'M50 12a38 38 0 1 0 0.1 0Z',
  square: 'M16 16H84V84H16Z',
  triangle: 'M50 12L88 84H12Z',
  star: 'M50 8L61 38H93L67 57L77 89L50 70L23 89L33 57L7 38H39Z',
  heart: 'M50 86C20 64 8 48 12 32C16 16 38 12 50 30C62 12 84 16 88 32C92 48 80 64 50 86Z',
};
function shape(kind, fill) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', PATHS[kind]);
  p.setAttribute('fill', fill);
  p.setAttribute('stroke', 'rgba(0,0,0,.18)');
  p.setAttribute('stroke-width', '3');
  s.append(p);
  return s;
}

// 단계별: 판 크기(가로줄 × 세로줄), 미리 끼워 둔 조각 수, 판 수, 머리 칸을 낱말로 보여 줄지
const CFG = [
  { rows: 2, cols: 2, given: 1, boards: 3, sets: ['dress', 'shape', 'dress'] },
  { rows: 2, cols: 2, given: 0, boards: 3, sets: ['shape', 'dress', 'shape'] },
  { rows: 2, cols: 3, given: 0, boards: 2, sets: ['dress', 'shape'] },
  { rows: 3, cols: 3, given: 1, boards: 1, sets: [null] },
  { rows: 3, cols: 3, given: 0, boards: 1, sets: ['shape'], words: true },
];

// 단어 매트릭스: 판 수 (단계별)
const WORD_BOARDS = [3, 3, 2, 2, 1];
// 한글표 완성하기: [자음 수, 모음 수, 미리 채운 칸 수, 판 수]
const HANGUL = [[2, 2, 1, 2], [2, 3, 2, 2], [3, 3, 3, 1], [3, 4, 5, 1], [4, 4, 6, 1]];
const H_CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const H_VOWS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
// 수학 매트릭스: 가로줄은 수, 세로줄은 물건. 칸에는 그 물건에 수만큼 점이 찍힌 조각 (참고 영상 기준)
// 단계별: 판 크기, 수 범위, 미리 끼워 둔 조각 수, 판 수
const MATH = [
  { rows: 2, cols: 2, nums: [1, 3], given: 1, boards: 3 },
  { rows: 2, cols: 2, nums: [1, 4], given: 0, boards: 3 },
  { rows: 2, cols: 3, nums: [1, 5], given: 0, boards: 2 },
  { rows: 3, cols: 3, nums: [2, 5], given: 1, boards: 2 },
  { rows: 3, cols: 3, nums: [2, 6], given: 0, boards: 2 },
];
// 물건: 바탕 모양 · 바탕색 · 점 색
const THINGS = {
  ball: ['circle', '#45B035', '#F2E030'],
  cookie: ['cookie', '#E2B57A', '#6B3F1F'],
  dice: ['square', '#A0249A', '#fff'],
  bug: ['circle', '#E8483C', '#2A2A2A'],
};
const THING_KO = { ball: '공', cookie: '쿠키', dice: '주사위', bug: '무당벌레' };
// 주사위 눈 자리 (100칸 안)
const PIPS = {
  1: [[50, 50]], 2: [[32, 32], [68, 68]], 3: [[30, 30], [50, 50], [70, 70]], 4: [[32, 32], [68, 32], [32, 68], [68, 68]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]], 6: [[32, 28], [68, 28], [32, 50], [68, 50], [32, 72], [68, 72]],
};
function thing(kind, n) {
  const [base, fill, dot] = THINGS[kind];
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('aria-hidden', 'true');
  const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); s.append(e); };
  if (base === 'square') add('rect', { x: 14, y: 14, width: 72, height: 72, rx: 10, fill });
  else if (base === 'cookie') add('path', { d: 'M50 12C66 10 76 22 84 30C92 44 90 62 82 74C72 88 54 92 40 86C24 82 12 68 12 50C12 32 30 14 50 12Z', fill });
  else add('circle', { cx: 50, cy: 50, r: 38, fill });
  if (kind === 'bug') add('rect', { x: 49, y: 12, width: 2, height: 76, fill: '#2A2A2A' });
  (PIPS[n] || []).forEach(([x, y]) => add('circle', { cx: x, cy: y, r: kind === 'dice' ? 7 : 8, fill: dot }));
  return s;
}

// 퍼즐 매트릭스(Matrix): 가로줄과 세로줄이 만나는 칸에 두 성질을 다 가진 조각을 끼운다.
// 단어 매트릭스(WordMatrix, opts.kind = 'word'): 첫소리(dr) × 끝소리(um)가 만나는 칸에 그 단어(drum)를 끼운다
// 한글표 완성하기(Matrix · 한글, opts.kind = 'hangul'): 자음(가로줄) × 모음(세로줄)이 만나는 빈칸에 글자를 끼운다.
// 수학 매트릭스(opts.kind = 'math'): 색 × 모양 판을 한국어로
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  const say = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  const en = say;
  const hangul = ctx.opts.kind === 'hangul';
  const math = ctx.opts.kind === 'math';
  const words = ctx.opts.kind === 'word' || hangul;
  const hg = HANGUL[ctx.level - 1];
  const wordBoards = hangul
    ? Array.from({ length: hg[3] }, () => [pickN(H_CONS, hg[0]).sort((a, b) => CHO.indexOf(a) - CHO.indexOf(b)), pickN(H_VOWS, hg[1]).sort((a, b) => H_VOWS.indexOf(a) - H_VOWS.indexOf(b))])
    : words ? pickN(WORD_MATRIX[ctx.level - 1], WORD_BOARDS[ctx.level - 1]) : null;
  const cfg = words ? { boards: wordBoards.length, given: hangul ? hg[2] : 0 } : math ? MATH[ctx.level - 1] : CFG[ctx.level - 1];
  const hinter = makeHinter();
  const grid = h('div', { class: 'mx-grid' });
  const tray = h('div', { class: 'mx-tray' });
  stage.append(h('div', { class: 'matrix' }, grid, tray));
  let b = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    const kind = words ? 'word' : math ? 'math' : cfg.sets[b] || pick(['dress', 'shape']);
    const set = words
      ? { rows: wordBoards[b][0].map((x) => [x]), cols: wordBoards[b][1].map((x) => [x]), say: (r, c) => (hangul ? compose(r, c) : r + c) }
      : math ? { say: (r) => String(r) } : MATRIX_SETS[kind];
    // 수학: 가로줄 수는 작은 수부터 차례로
    const rows = words ? set.rows : math ? pickN(Array.from({ length: cfg.nums[1] - cfg.nums[0] + 1 }, (_, i) => cfg.nums[0] + i), cfg.rows).sort((x, y) => x - y).map((v) => [v])
      : pickN(set.rows, cfg.rows);
    const cols = words ? set.cols : math ? pickN(Object.keys(THINGS), cfg.cols).map((k) => [k]) : pickN(set.cols, cfg.cols);
    const cells = new Map();
    let sel = null;

    // 조각 모습: 동물 + 꾸미개 / 색 + 모양
    const art = (r, c) => (words ? [h('span', { class: 'mx-text' }, set.say(r[0], c[0]))] : math ? [thing(c[0], r[0])] : kind === 'dress'
      ? [h('span', { class: 'mx-animal', 'aria-hidden': 'true' }, c[1]), h('span', { class: `mx-acc acc-${r[0]}`, 'aria-hidden': 'true' }, r[1])]
      : [shape(c[0], r[1])]);
    const rowHead = (r) => (math ? h('span', { class: 'mx-num' }, r[0]) : cfg.words || words ? h('span', { class: 'mx-word' }, r[0])
      : kind === 'dress' ? h('span', { class: 'mx-head-e', 'aria-hidden': 'true' }, r[1]) : h('span', { class: 'mx-splash', style: { background: r[1] } }));
    const colHead = (c) => (math ? thing(c[0], 0) : cfg.words || words ? h('span', { class: 'mx-word' }, c[0])
      : kind === 'dress' ? h('span', { class: 'mx-head-e', 'aria-hidden': 'true' }, c[1]) : shape(c[0], '#9AA3AD'));
    const head = (el, word) => {
      const btn = h('button', { class: 'mx-head', type: 'button', 'aria-label': word }, el);
      // 단어 조각(dr, um)은 따로 소리 내지 않는다
      btn.addEventListener('click', () => { sfx.tap(); pop(btn); if (hangul) say(JAMO_NAME[word] || word); else if (!words && !math) say(word); else if (math && typeof word === 'number') say(String(word)); });
      return btn;
    };

    const keys = rows.flatMap((_, ri) => cols.map((__, ci) => `${ri}-${ci}`));
    const given = new Set(pickN(keys, cfg.given));
    grid.style.setProperty('--cols', cols.length + 1);
    grid.classList.toggle('words', words);
    grid.classList.toggle('hangul', hangul);
    grid.classList.toggle('math', math);
    grid.classList.remove('out');
    grid.replaceChildren(
      h('span', { class: 'mx-corner' }),
      ...cols.map((c) => head(colHead(c), math ? THING_KO[c[0]] : c[0])),
      ...rows.flatMap((r, ri) => [head(rowHead(r), r[0]), ...cols.map((c, ci) => {
        const key = `${ri}-${ci}`;
        const say = set.say(r[0], c[0]);
        const cell = h('button', { class: 'mx-cell', type: 'button', 'aria-label': '빈 칸' });
        cell.dataset.say = say;
        if (given.has(key)) fill(cell, r, c);
        cell.addEventListener('click', () => {
          if (cell.classList.contains('filled')) { sfx.tap(); pop(cell); en(say); return; }
          if (sel) place(sel, cell);
        });
        cells.set(key, cell);
        return cell;
      })]),
    );

    function fill(cell, r, c) {
      cell.classList.add('filled');
      cell.setAttribute('aria-label', cell.dataset.say);
      cell.replaceChildren(...art(r, c));
    }

    const todo = keys.filter((k) => !given.has(k));
    let left = todo.length;
    const pieces = shuffle(todo).map((key, i) => {
      const [ri, ci] = key.split('-').map(Number);
      const say = set.say(rows[ri][0], cols[ci][0]);
      const p = h('button', { class: 'mx-piece', type: 'button', style: { animationDelay: `${0.2 + i * 0.1}s` }, 'aria-label': `${say} 조각` }, ...art(rows[ri], cols[ci]));
      p.dataset.key = key;
      p.dataset.miss = '0';
      draggable(p, {
        onDrop: (pt) => {
          const cell = [...cells.values()].find((c) => !c.classList.contains('filled') && hits(c, pt, 4));
          if (cell) place(p, cell);
          else wiggle(p);
        },
      });
      p.addEventListener('click', () => {
        sfx.tap();
        en(say);
        if (sel === p) { p.classList.remove('sel'); sel = null; return; }
        sel?.classList.remove('sel');
        sel = p;
        p.classList.add('sel');
      });
      return p;
    });
    tray.replaceChildren(...pieces);

    function place(p, cell) {
      const key = p.dataset.key;
      const target = cells.get(key);
      if (cell !== target) {
        p.dataset.miss = String(Number(p.dataset.miss) + 1);
        wiggle(p);
        wiggle(cell);
        hinter.miss(target);
        return;
      }
      hinter.reset();
      if (sel === p) sel = null;
      p.remove();
      total++;
      if (p.dataset.miss === '0') firstTry++;
      const [ri, ci] = key.split('-').map(Number);
      fill(cell, rows[ri], cols[ci]);
      pop(cell);
      sfx.pop();
      en(cell.dataset.say);
      left--;
      ctx.progress(b + (todo.length - left) / todo.length, cfg.boards);
      if (left > 0) return;
      ctx.later(() => { sfx.correct(); cheer(grid, ko ? 'ko' : 'en'); }, 900);
      ctx.later(() => grid.classList.add('out'), 2500);
      ctx.later(() => {
        b++;
        if (b >= cfg.boards) ctx.finish({ firstTry, total });
        else round();
      }, 3000);
    }

    ctx.progress(b, cfg.boards);
    ctx.prompt(
      hangul ? '한글표의 빈칸을 채워요. 왼쪽 자음과 위쪽 모음이 만나는 칸에 들어갈 글자 조각을 끼워요!'
        : math ? '왼쪽의 수와 위쪽의 물건이 만나는 칸에, 그 물건에 점이 수만큼 있는 조각을 끼워요!'
        : words ? '왼쪽 첫소리와 위쪽 끝소리를 이어 읽고, 두 조각이 만나는 칸에 그 단어를 끼워요!'
        : cfg.words ? '맨 위와 왼쪽의 영어 낱말을 읽고, 두 낱말이 만나는 칸에 맞는 조각을 끼워요!'
        : '가로줄과 세로줄이 만나는 칸에, 둘을 모두 닮은 조각을 끼워요!',
      () => (hangul ? say('한글표를 완성해 봐요!') : math ? say('어느 자리에 어떤 조각을 맞추면 좋을까요?') : en(kind === 'dress' ? 'Who goes here?' : words ? 'Make the words!' : 'What goes here?')),
    );
  }

  round();
}
