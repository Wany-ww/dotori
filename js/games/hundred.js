import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable } from './dragTap.js';

// 100판 퍼즐: 조각 수, 조각 크기, 판 수, 조각에 첫 수만 적을지
const PUZ = [
  { pieces: 5, size: [3, 4], boards: 2 },
  { pieces: 7, size: [3, 5], boards: 2 },
  { pieces: 9, size: [4, 5], boards: 1 },
  { pieces: 11, size: [4, 6], boards: 1 },
  { pieces: 11, size: [4, 6], boards: 1, one: true },
];
const COLORS = ['#E8574F', '#7A4CD8', '#2FB0B8', '#7CC23A', '#F2A23A', '#3E6FD8', '#E85C9A', '#2E9D5A', '#C9862E', '#5A8FE8', '#B84CC8'];
// 자릿값 격자: 목표 수 범위
const GRID = [[11, 20], [11, 40], [21, 60], [41, 99], [21, 99]];

// 100판 퍼즐(HundredPuzzle · puzzle): 1~100 판의 빈자리에 여러 칸짜리 숫자 조각을 끌어 끼운다 (참고 영상 기준).
// 자릿값 격자(DoubleDigit · grid): 10칸 줄(십)과 낱칸(일)을 칠해 목표 수를 만든다
export function mount(stage, ctx) {
  if (ctx.opts.mode === 'grid') return grid(stage, ctx);
  if (ctx.opts.mode === 'quiz') return quiz(stage, ctx);
  const cfg = PUZ[ctx.level - 1];
  const hinter = makeHinter();
  const board = h('div', { class: 'hb-board' });
  const tray = h('div', { class: 'hb-tray' });
  const root = h('div', { class: 'hundred puzzle' }, board, tray);
  stage.append(root);
  // 조각 칸 크기를 판 칸 크기에 맞춘다
  const ro = new ResizeObserver(() => {
    const c = board.querySelector('.hb-cell');
    if (c) root.style.setProperty('--cell', `${c.getBoundingClientRect().width}px`);
  });
  ro.observe(board);
  ctx.onCleanup(() => ro.disconnect());
  let b = 0;
  let firstTry = 0;
  let total = 0;

  // 판(10×10)에서 서로 겹치지 않는 조각(가로·세로로 붙은 칸 덩어리)을 만든다
  function makePieces() {
    const used = new Set();
    const out = [];
    let tries = 0;
    while (out.length < cfg.pieces && tries++ < 400) {
      const size = randInt(...cfg.size);
      const seed = randInt(0, 99);
      if (used.has(seed)) continue;
      const cells = [seed];
      while (cells.length < size) {
        const next = shuffle(cells.flatMap((i) => [i - 10, i + 10, i % 10 ? i - 1 : -1, i % 10 < 9 ? i + 1 : -1]))
          .find((j) => j >= 0 && j < 100 && !used.has(j) && !cells.includes(j));
        if (next === undefined) break;
        cells.push(next);
      }
      if (cells.length < cfg.size[0]) continue;
      cells.forEach((i) => used.add(i));
      out.push(cells.sort((x, y) => x - y));
    }
    return out;
  }

  function round() {
    hinter.reset();
    ctx.progress(b, cfg.boards);
    const pieces = makePieces();
    const owner = new Map();
    pieces.forEach((cells, k) => cells.forEach((i) => owner.set(i, k)));
    total += pieces.length;
    let sel = null;
    const cells = Array.from({ length: 100 }, (_, i) => {
      const hole = owner.has(i);
      const c = h('button', { class: `hb-cell${hole ? ' hole' : ''}`, type: 'button', 'aria-label': hole ? '빈칸' : String(i + 1) }, hole ? '' : i + 1);
      c.addEventListener('click', () => {
        if (!c.classList.contains('hole')) { sfx.tap(); speak(String(i + 1)); return; }
        // 조각을 고른 뒤 판을 누르면, 그 칸이 조각의 한 칸이라면 끼워진다
        if (sel) place(sel, owner.get(i) === Number(sel.dataset.k));
      });
      return c;
    });
    board.replaceChildren(...cells);
    const els = shuffle(pieces.map((p, k) => k)).map((k) => {
      const p = pieces[k];
      const r0 = Math.min(...p.map((i) => Math.floor(i / 10)));
      const c0 = Math.min(...p.map((i) => i % 10));
      const rows = Math.max(...p.map((i) => Math.floor(i / 10))) - r0 + 1;
      const cols = Math.max(...p.map((i) => i % 10)) - c0 + 1;
      const el = h('button', { class: 'hb-piece', type: 'button', 'aria-label': `${p[0] + 1}부터 시작하는 조각`, style: { '--rows': rows, '--cols': cols, '--c': COLORS[k % COLORS.length] } },
        p.map((i) => h('span', { class: 'hb-pc', style: { gridRow: Math.floor(i / 10) - r0 + 1, gridColumn: (i % 10) - c0 + 1 } }, cfg.one && i !== p[0] ? '' : i + 1)));
      el.dataset.k = k;
      el.dataset.miss = '0';
      const anchor = el.firstChild;
      let at = null;
      draggable(el, {
        onMove: () => { const r = anchor.getBoundingClientRect(); at = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
        onDrop: () => {
          const br = board.getBoundingClientRect();
          if (!at || at.x < br.left || at.x > br.right || at.y < br.top || at.y > br.bottom) { wiggle(el); return; }
          const i = Math.floor(((at.y - br.top) / br.height) * 10) * 10 + Math.floor(((at.x - br.left) / br.width) * 10);
          place(el, i === p[0]);
        },
      });
      el.addEventListener('click', () => {
        sfx.tap();
        speak(String(p[0] + 1));
        sel?.classList.remove('sel');
        sel = sel === el ? null : el;
        sel?.classList.add('sel');
      });
      return el;
    });
    tray.replaceChildren(...els);
    let left = pieces.length;

    function place(el, ok) {
      const k = Number(el.dataset.k);
      const p = pieces[k];
      if (!ok) {
        el.dataset.miss = '1';
        wiggle(el);
        hinter.miss(cells[p[0]]);
        return;
      }
      hinter.reset();
      if (el.dataset.miss === '0') firstTry++;
      if (sel === el) sel = null;
      el.remove();
      p.forEach((i) => {
        const c = cells[i];
        c.classList.remove('hole');
        c.classList.add('placed');
        c.style.setProperty('--c', COLORS[k % COLORS.length]);
        c.textContent = i + 1;
        c.setAttribute('aria-label', String(i + 1));
      });
      pop(cells[p[0]]);
      sfx.pop();
      speak(String(p[0] + 1));
      left--;
      ctx.progress(b + (pieces.length - left) / pieces.length, cfg.boards);
      if (left) return;
      sfx.correct();
      cheer(board);
      ctx.later(() => {
        b++;
        if (b >= cfg.boards) ctx.finish({ firstTry, total });
        else round();
      }, 1800);
    }
    ctx.prompt(cfg.one ? '조각에는 첫 수만 적혀 있어요. 옆으로 1씩, 아래로 10씩 커지는 것을 생각하며 100판의 빈자리에 끼워요!'
      : '숫자 조각을 끌어 100판의 알맞은 빈자리에 끼워요. 옆으로 1씩, 아래로 10씩 커져요!', () => speak('빈칸에 숫자 조각을 끼워요!'));
  }
  round();
}

// 수 뒤 조사 (한자어로 읽은 끝소리): 3을 · 5를 · 10을
const eul = (n) => ([2, 4, 5, 9].includes(n % 10) ? '를' : '을');
// 백 칸 퀴즈 단계: 찾을 수의 범위 · 기준 수와의 차이 (읽어 줄 말은 녹음해 두려고 통째로 적는다)
const REL = {
  1: ['1 큰', '보다 1 큰 수를 찾으세요.'], [-1]: ['1 작은', '보다 1 작은 수를 찾으세요.'],
  10: ['10 큰', '보다 10 큰 수를 찾으세요.'], [-10]: ['10 작은', '보다 10 작은 수를 찾으세요.'],
  11: ['11 큰', '보다 11 큰 수를 찾으세요.'], [-9]: ['9 작은', '보다 9 작은 수를 찾으세요.'],
};
const QUIZ = [
  { find: [1, 20] },
  { find: [21, 100] },
  { rel: [1, -1] },
  { rel: [10, -10] },
  { rel: [1, -1, 10, -10, 11, -9] },
];

// 백 칸 퀴즈(HundredsBoard · quiz): 1~100 판 전체에서 수를 찾아 누른다.
// 1~2단계는 "5를 찾으세요"(참고 영상), 3단계부터 "34보다 10 큰 수"처럼 판의 규칙으로 찾는다
function quiz(stage, ctx) {
  const cfg = QUIZ[ctx.level - 1];
  const R = 5;
  const hinter = makeHinter();
  const ask = h('p', { class: 'hq-ask', 'aria-live': 'polite' });
  const frame = h('div', { class: 'hq-frame' });
  const ear = h('button', { class: 'hq-ear', type: 'button', 'aria-label': '다시 듣기' }, '🔊');
  const cells = Array.from({ length: 100 }, (_, i) => {
    const c = h('button', { class: 'hq-cell', type: 'button' }, i + 1);
    c.dataset.v = i + 1;
    return c;
  });
  const board = h('div', { class: 'hq-board' }, cells);
  stage.append(h('div', { class: 'hundred-quiz' }, board, h('div', { class: 'hq-side' }, ear, ask, frame)));
  let n = 0;
  let firstTry = 0;
  let missed = false;
  let answer = 0;
  let locked = true;
  let say = () => {};
  ear.addEventListener('click', () => { sfx.tap(); say(); });

  board.addEventListener('click', (e) => {
    const c = e.target.closest('.hq-cell');
    if (!c || locked) return;
    const v = Number(c.dataset.v);
    if (v !== answer) {
      missed = true;
      sfx.wrong();
      wiggle(c);
      speak(String(v));
      hinter.miss(cells[answer - 1]);
      return;
    }
    locked = true;
    if (!missed) firstTry++;
    hinter.reset();
    c.classList.add('taken');
    frame.replaceChildren(h('b', { class: 'hq-tile' }, v));
    frame.classList.add('full');
    sfx.correct();
    cheer(frame);
    speak(String(v));
    ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
  });

  // 같은 수가 다시 나오지 않게
  const used = new Set();
  function round() {
    hinter.reset();
    ctx.progress(n, R);
    missed = false;
    cells.forEach((c) => c.classList.remove('taken', 'here'));
    frame.replaceChildren();
    frame.classList.remove('full');
    if (cfg.find) {
      do answer = randInt(...cfg.find); while (used.has(answer));
      used.add(answer);
      ask.textContent = `${answer}${eul(answer)} 찾으세요.`;
      say = () => speak([String(answer), eul(answer) === '을' ? '을 찾으세요.' : '를 찾으세요.']);
    } else {
      const d = cfg.rel[randInt(0, cfg.rel.length - 1)];
      const [word, line] = REL[d];
      let base;
      do base = randInt(Math.max(1, 1 - d), Math.min(100, 100 - d)); while (used.has(base));
      used.add(base);
      answer = base + d;
      cells[base - 1].classList.add('here');
      ask.textContent = `${base}보다 ${word} 수를 찾으세요.`;
      say = () => speak([String(base), line]);
    }
    locked = false;
    ctx.prompt(ask.textContent, say);
  }
  round();
}

function grid(stage, ctx) {
  const L = ctx.level;
  const R = 4;
  const hinter = makeHinter();
  const ask = h('p', { class: 'hg-ask' });
  const rowsEl = h('div', { class: 'hg-grid' });
  const sum = h('p', { class: 'hg-sum', 'aria-live': 'polite' });
  const go = h('button', { class: 'btn btn-primary', type: 'button' }, '다 칠했어요');
  stage.append(h('div', { class: 'place-grid' }, ask, rowsEl, sum, go));
  let n = 0;
  let firstTry = 0;
  const targets = pickN(Array.from({ length: GRID[L - 1][1] - GRID[L - 1][0] + 1 }, (_, i) => GRID[L - 1][0] + i), R);

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const target = targets[n];
    let missed = false;
    const filled = Array.from({ length: 10 }, () => 0);
    const paint = () => {
      rowsEl.querySelectorAll('.hg-row').forEach((row, r) => row.querySelectorAll('.hg-cell').forEach((c, k) => c.classList.toggle('on', k < filled[r])));
      const tens = filled.filter((x) => x === 10).length;
      const ones = filled.reduce((a, x) => a + (x === 10 ? 0 : x), 0);
      sum.textContent = `십 묶음 ${tens} · 낱개 ${ones} → ${tens * 10 + ones}`;
    };
    rowsEl.replaceChildren(...Array.from({ length: 10 }, (_, r) => {
      const ten = h('button', { class: 'hg-ten', type: 'button', 'aria-label': `${r + 1}번째 줄 모두 칠하기` }, '10');
      ten.addEventListener('click', () => { sfx.tap(); filled[r] = filled[r] === 10 ? 0 : 10; paint(); });
      const cells = Array.from({ length: 10 }, (_, k) => {
        const c = h('button', { class: 'hg-cell', type: 'button', 'aria-label': '칸' });
        c.addEventListener('click', () => { sfx.tap(); filled[r] = filled[r] === k + 1 ? k : k + 1; paint(); });
        return c;
      });
      return h('div', { class: 'hg-row' }, ten, ...cells);
    }));
    paint();
    const tens = Math.floor(target / 10);
    const ones = target % 10;
    rowsEl.dataset.target = target;
    ask.textContent = L === 5 ? `십 묶음 ${tens}개와 낱개 ${ones}개를 칠해요. 어떤 수가 될까요?` : `격자에 ${target}만큼 칠해요! 10줄 단추는 한 줄을 한 번에 칠해요.`;
    go.disabled = false;
    go.onclick = () => {
      const total = filled.reduce((a, x) => a + x, 0);
      if (total !== target) {
        missed = true;
        wiggle(go);
        hinter.miss(sum);
        speak(total < target ? '조금 더 칠해요' : '너무 많이 칠했어요');
        return;
      }
      if (!missed) firstTry++;
      go.disabled = true;
      hinter.reset();
      sfx.correct();
      cheer(rowsEl);
      speak([String(target), '십의 자리', String(tens), '일의 자리', String(ones)]);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2000);
    };
    ctx.prompt(ask.textContent, () => speak(L === 5 ? '십 묶음과 낱개를 칠해요!' : [String(target), '만큼 칠해요!']));
  }
  round();
}
