import { h, shuffle, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

// 단계별: 판 크기, 빈칸 수 (참고 영상: 1단계 4×4에 빈칸 2개, 5단계 빈칸 3개)
const CFG = { 1: [4, 2], 2: [4, 3], 3: [4, 5], 4: [4, 7], 5: [6, 10] };
const COLORS = ['#5DC8F0', '#F0508C', '#F07A5A', '#D6EE50', '#A98AF0', '#5BD6A6'];
const SHAPES = ['●', '■', '▲', '◆', '★', '♥'];

// 정답 판: 기본 무늬를 만들고 숫자 · 줄 · 칸 묶음을 섞는다 (상자: 4×4는 2×2, 6×6은 2×3)
function solved(n) {
  const bw = n === 4 ? 2 : 3;
  const bh = 2;
  const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, c) => ((r % bh) * bw + Math.floor(r / bh) + c) % n));
  const digits = shuffle(Array.from({ length: n }, (_, i) => i + 1));
  const bands = shuffle(Array.from({ length: n / bh }, (_, i) => i));
  const rowOrder = bands.flatMap((b) => shuffle(Array.from({ length: bh }, (_, i) => b * bh + i)));
  const stacks = shuffle(Array.from({ length: n / bw }, (_, i) => i));
  const colOrder = stacks.flatMap((s) => shuffle(Array.from({ length: bw }, (_, i) => s * bw + i)));
  return rowOrder.map((r) => colOrder.map((c) => digits[base[r][c]]));
}

// 빈칸을 채우는 방법이 몇 가지인지 (2까지만 센다) — 답이 하나뿐인 판만 낸다
function countWays(g, n) {
  const bw = n === 4 ? 2 : 3;
  const i = g.indexOf(0);
  if (i < 0) return 1;
  const r = Math.floor(i / n);
  const c = i % n;
  let ways = 0;
  for (let v = 1; v <= n && ways < 2; v++) {
    let ok = true;
    for (let k = 0; k < n && ok; k++) {
      const br = Math.floor(r / 2) * 2 + Math.floor(k / bw);
      const bc = Math.floor(c / bw) * bw + (k % bw);
      if (g[r * n + k] === v || g[k * n + c] === v || g[br * n + bc] === v) ok = false;
    }
    if (!ok) continue;
    g[i] = v;
    ways += countWays(g, n);
    g[i] = 0;
  }
  return ways;
}

// 스도쿠(Sudoku): 색깔 숫자 판의 빈칸에 오른쪽 숫자 조각을 끌어 넣는다. 가로줄 · 세로줄 · 굵은 상자에
// 같은 수가 두 번 나오면 안 된다. 123 ↔ ●■▲ 단추로 숫자를 모양으로 바꿔 볼 수 있다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [size, holes] = CFG[ctx.level];
  const R = size === 6 ? 2 : 3;
  const hinter = makeHinter();
  const board = h('div', { class: `su-board n${size}`, style: { gridTemplateColumns: `repeat(${size}, 1fr)` } });
  const tiles = h('div', { class: 'su-tiles' });
  const mode = h('button', { class: 'su-mode', type: 'button', 'aria-label': '숫자와 모양 바꾸기' }, h('b', {}, '123'), h('span', {}, '●■▲'));
  const wrap = h('div', { class: 'sudoku' }, mode, h('div', { class: 'su-main' }, board, tiles));
  stage.append(wrap);
  let shapes = false;
  const face = (v) => (shapes ? SHAPES[v - 1] : String(v));
  const refresh = () => wrap.querySelectorAll('[data-face]').forEach((el) => { el.textContent = face(Number(el.dataset.face)); });
  mode.addEventListener('click', () => {
    shapes = !shapes;
    mode.classList.toggle('shapes', shapes);
    refresh();
    sfx.tap();
  });
  let b = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(b, R);
    const sol = solved(size);
    let blanks;
    do blanks = new Set(shuffle(Array.from({ length: size * size }, (_, i) => i)).slice(0, holes));
    while (countWays(sol.flat().map((v, i) => (blanks.has(i) ? 0 : v)), size) > 1);
    total += blanks.size;
    let left = blanks.size;
    let sel = null;
    const bw = size === 4 ? 2 : 3;
    const cells = sol.flat().map((v, i) => {
      const r = Math.floor(i / size);
      const c = i % size;
      const hole = blanks.has(i);
      const el = h('button', {
        class: `su-cell${hole ? ' hole' : ''}${c % bw === bw - 1 && c < size - 1 ? ' br' : ''}${r % 2 === 1 && r < size - 1 ? ' bb' : ''}`,
        type: 'button',
        style: hole ? {} : { '--c': COLORS[v - 1] },
        'aria-label': hole ? '빈칸' : String(v),
      });
      if (!hole) { el.dataset.face = v; el.textContent = face(v); }
      el.dataset.v = v;
      el.dataset.miss = '0';
      el.addEventListener('click', () => {
        if (!el.classList.contains('hole')) return;
        if (sel?.classList.contains('su-tile')) { put(el, Number(sel.dataset.face)); return; }
        sel?.classList.remove('sel');
        sel = el;
        el.classList.add('sel');
        sfx.tap();
      });
      return el;
    });
    board.replaceChildren(...cells);

    function put(cell, v) {
      sel?.classList.remove('sel');
      sel = null;
      if (Number(cell.dataset.v) !== v) {
        cell.dataset.miss = '1';
        wiggle(cell);
        hinter.miss(tiles.querySelector(`[data-face="${cell.dataset.v}"]`));
        speak('가로줄, 세로줄, 상자를 다시 살펴봐요!');
        return;
      }
      hinter.reset();
      sfx.pop();
      if (cell.dataset.miss === '0') firstTry++;
      cell.classList.remove('hole');
      cell.classList.add('placed');
      cell.style.setProperty('--c', COLORS[v - 1]);
      cell.dataset.face = v;
      cell.textContent = face(v);
      cell.setAttribute('aria-label', String(v));
      pop(cell);
      left--;
      ctx.progress(b + (blanks.size - left) / blanks.size, R);
      if (left) return;
      sfx.correct();
      cheer(board);
      speak('스도쿠 완성!');
      ctx.later(() => {
        b++;
        if (b >= R) ctx.finish({ firstTry, total });
        else round();
      }, 2000);
    }

    tiles.replaceChildren(...Array.from({ length: size }, (_, i) => {
      const k = h('button', { class: 'su-tile', type: 'button', style: { '--c': COLORS[i] }, 'aria-label': String(i + 1) }, face(i + 1));
      k.dataset.face = i + 1;
      draggable(k, {
        onDrop: (pt) => {
          const cell = cells.find((c) => c.classList.contains('hole') && hits(c, pt, 0));
          if (cell) put(cell, i + 1);
        },
      });
      k.addEventListener('click', () => {
        if (sel?.classList.contains('su-cell')) { put(sel, i + 1); return; }
        sel?.classList.remove('sel');
        sel = sel === k ? null : k;
        sel?.classList.add('sel');
        sfx.tap();
      });
      return k;
    }));
    speak('빈칸에 어떤 수가 들어갈까요?');
  }

  ctx.prompt('오른쪽 숫자 조각을 빈칸에 끌어 넣어요. 가로줄, 세로줄, 굵은 상자 안에 같은 수가 두 번 나오면 안 돼요!', () => speak('빈칸에 어떤 수가 들어갈까요?'));
  round();
}
