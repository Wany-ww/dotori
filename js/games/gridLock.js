import { h, pick, randInt, shuffle, wiggle, cheer } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 3;
// 단계별: 판 크기, 막는 차 수, 가장 짧은 풀이 횟수 범위(택시가 나가는 것까지), 돋보기 수
const CFG = {
  1: [4, 2, [2, 2], 1], 2: [4, 3, [2, 3], 1], 3: [5, 4, [3, 5], 2], 4: [5, 5, [4, 7], 2], 5: [6, 7, [6, 11], 2],
};
const COLORS = ['#E8574F', '#7A6FE0', '#F08AB8', '#5DBB63', '#C8A27A', '#4A90E2', '#F08A3A', '#9AA3B5'];

// 차 하나가 차지하는 칸 (가로 차는 c가, 세로 차는 r이 움직인다)
const cellsOf = (k, pos) => Array.from({ length: k.len }, (_, i) => (k.dir === 'h' ? [k.r, pos + i] : [pos + i, k.c]));
const posOf = (k) => (k.dir === 'h' ? k.c : k.r);

// 가장 짧은 풀이: 한 번 = 차 하나를 한 방향으로 몇 칸이든 미는 것. [횟수, 첫 수(차 번호, 새 자리)]
function solve(cars, N, start) {
  const key = (s) => s.join(',');
  const goal = N - cars[0].len;
  const seen = new Map([[key(start), null]]);
  let layer = [start];
  for (let d = 0; layer.length && d < 40; d++) {
    const next = [];
    for (const s of layer) {
      if (s[0] === goal) {
        let k = key(s);
        let first = null;
        for (let p = seen.get(k); p; p = seen.get(k)) { first = p.move; k = p.from; }
        return [d, first];
      }
      const g = Array.from({ length: N }, () => Array(N).fill(false));
      cars.forEach((k, i) => cellsOf(k, s[i]).forEach(([r, c]) => { g[r][c] = true; }));
      cars.forEach((k, i) => {
        for (const step of [-1, 1]) {
          for (let p = s[i] + step; p >= 0 && p + k.len <= N; p += step) {
            const [r, c] = step < 0 ? cellsOf(k, p)[0] : cellsOf(k, p)[k.len - 1];
            if (g[r][c]) break;
            const t = s.slice();
            t[i] = p;
            const tk = key(t);
            if (!seen.has(tk)) { seen.set(tk, { from: key(s), move: [i, p] }); next.push(t); }
          }
        }
      });
    }
    layer = next;
  }
  return [Infinity, null];
}

// 무작위로 차를 놓고 풀어 보아, 풀이 횟수가 단계 범위에 드는 판만 쓴다
function makePuzzle(N, n, [lo, hi]) {
  for (let t = 0; t < 4000; t++) {
    const row = randInt(1, N - 2);
    const cars = [{ r: row, c: 0, len: 2, dir: 'h' }];
    const g = Array.from({ length: N }, () => Array(N).fill(false));
    g[row][0] = g[row][1] = true;
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      ok = false;
      for (let tries = 0; tries < 40; tries++) {
        const dir = Math.random() < 0.65 ? 'v' : 'h';
        const len = N >= 5 && Math.random() < 0.35 ? 3 : 2;
        const r = dir === 'v' ? randInt(0, N - len) : randInt(0, N - 1);
        const c = dir === 'h' ? randInt(0, N - len) : randInt(1, N - 1);
        if (dir === 'h' && r === row) continue;
        const k = { r, c, len, dir };
        const cs = cellsOf(k, posOf(k));
        if (cs.some(([a, b]) => g[a][b])) continue;
        cs.forEach(([a, b]) => { g[a][b] = true; });
        cars.push(k);
        ok = true;
        break;
      }
    }
    // 택시 앞길이 처음부터 막혀 있어야 한다
    if (!ok || !g[row].slice(2).some(Boolean)) continue;
    const [d] = solve(cars, N, cars.map(posOf));
    if (d >= lo && d <= hi) return cars;
  }
  return [{ r: 1, c: 0, len: 2, dir: 'h' }, { r: 0, c: 2, len: 2, dir: 'v' }];
}

// 탈출하기(GridLock): 차를 앞뒤로 끌어 길을 내고 노란 택시를 오른쪽 출구로 빼낸다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [N, n, range, lenses] = CFG[ctx.level];
  const board = h('div', { class: 'gl-board' });
  const road = h('div', { class: 'gl-road', 'aria-hidden': 'true' }, h('span', {}, '➜'));
  const lensBtn = h('button', { class: 'gl-lens', type: 'button', 'aria-label': '돋보기 힌트' }, '🔍', h('b'));
  const resetBtn = h('button', { class: 'gl-reset', type: 'button', 'aria-label': '처음부터 다시' }, '↺');
  const dots = h('div', { class: 'gl-dots', 'aria-hidden': 'true' });
  stage.append(h('div', { class: 'grid-lock' }, h('div', { class: 'gl-top' }, dots, lensBtn),
    h('div', { class: 'gl-field', style: { '--n': N } }, board, road), resetBtn));
  let p = 0;
  let firstTry = 0;
  let cars = [];
  let start = [];
  let pos = [];
  let lensLeft = 0;
  let count = 0;
  let best = 0;
  let used = false;
  let done = false;
  let sel = null;

  const grid = (skip) => {
    const g = Array.from({ length: N }, () => Array(N).fill(false));
    cars.forEach((k, i) => { if (i !== skip) cellsOf(k, pos[i]).forEach(([r, c]) => { g[r][c] = true; }); });
    return g;
  };
  // 차 i가 갈 수 있는 자리 범위
  const span = (i) => {
    const k = cars[i];
    const g = grid(i);
    let lo = pos[i];
    while (lo > 0 && !(k.dir === 'h' ? g[k.r][lo - 1] : g[lo - 1][k.c])) lo--;
    let hi = pos[i];
    while (hi + k.len < N && !(k.dir === 'h' ? g[k.r][hi + k.len] : g[hi + k.len][k.c])) hi++;
    return [lo, hi];
  };
  const place = (i) => {
    const k = cars[i];
    const [r, c] = k.dir === 'h' ? [k.r, pos[i]] : [pos[i], k.c];
    Object.assign(k.el.style, { left: `calc(${c} * var(--cell))`, top: `calc(${r} * var(--cell))` });
  };
  const moveTo = (i, to) => {
    if (to === pos[i]) { place(i); return; }
    pos[i] = to;
    count++;
    sfx.pop();
    place(i);
    board.querySelector('.hint')?.classList.remove('hint', 'up', 'down', 'left', 'right');
    if (i === 0 && pos[0] + cars[0].len === N) win();
  };

  function win() {
    done = true;
    cars[0].el.classList.add('out');
    sfx.correct();
    cheer(board);
    speak('탈출 성공!');
    if (!used && count <= best + 2) firstTry++;
    ctx.later(() => {
      p++;
      if (p >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 2000);
  }

  function carEl(k, i) {
    const el = h('button', {
      class: `gl-car ${k.dir} len${k.len}${i === 0 ? ' taxi' : ''}`,
      type: 'button',
      style: { '--c': i === 0 ? '#F7C63A' : k.color, width: `calc(${k.dir === 'h' ? k.len : 1} * var(--cell))`, height: `calc(${k.dir === 'v' ? k.len : 1} * var(--cell))` },
      'aria-label': i === 0 ? '노란 택시' : `${k.dir === 'h' ? '가로' : '세로'} ${k.len === 3 ? '버스' : '자동차'}`,
    }, h('i', { class: 'gl-glass' }), i === 0 ? h('b', { class: 'gl-sign' }, 'TAXI') : null);
    let d = null;
    el.addEventListener('pointerdown', (e) => {
      if (done) return;
      try { el.setPointerCapture(e.pointerId); } catch {}
      d = { x: e.clientX, y: e.clientY, from: pos[i], span: span(i), moved: false, size: board.clientWidth / N };
    });
    el.addEventListener('pointermove', (e) => {
      if (!d) return;
      const px = k.dir === 'h' ? e.clientX - d.x : e.clientY - d.y;
      if (!d.moved && Math.abs(px) < 8) return;
      d.moved = true;
      el.classList.add('dragging');
      // 막힌 데까지만 따라온다
      const lo = (d.span[0] - d.from) * d.size;
      const hi = (d.span[1] - d.from) * d.size;
      const v = Math.max(lo, Math.min(hi, px));
      el.style.translate = k.dir === 'h' ? `${v}px 0` : `0 ${v}px`;
      d.v = v;
    });
    const up = () => {
      if (!d) return;
      const { moved, v = 0, from, size } = d;
      d = null;
      el.classList.remove('dragging');
      el.style.translate = '';
      if (!moved) {
        // 누르기만 하면 고르기 → 빈칸을 눌러 옮길 수도 있다
        sel = sel === i ? null : i;
        board.querySelectorAll('.gl-car').forEach((c, j) => c.classList.toggle('sel', j === sel));
        sfx.tap();
        return;
      }
      moveTo(i, from + Math.round(v / size));
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return el;
  }

  function draw() {
    sel = null;
    const cells = Array.from({ length: N * N }, (_, j) => {
      const r = Math.floor(j / N);
      const c = j % N;
      const cell = h('span', { class: 'gl-cell', style: { left: `calc(${c} * var(--cell))`, top: `calc(${r} * var(--cell))` } });
      cell.addEventListener('click', () => {
        if (sel === null || done) return;
        const k = cars[sel];
        const [lo, hi] = span(sel);
        const along = k.dir === 'h' ? (r === k.r ? c : null) : (c === k.c ? r : null);
        if (along === null) { wiggle(k.el); sfx.wrong(); return; }
        const to = along < pos[sel] ? along : along - k.len + 1;
        if (to < lo || to > hi) { wiggle(k.el); sfx.wrong(); return; }
        const i = sel;
        sel = null;
        k.el.classList.remove('sel');
        moveTo(i, to);
      });
      return cell;
    });
    cars.forEach((k, i) => { k.el = carEl(k, i); });
    board.replaceChildren(...cells, ...cars.map((k) => k.el));
    cars.forEach((_, i) => place(i));
    road.style.top = `calc(${cars[0].r} * var(--cell))`;
  }

  function reset() {
    pos = start.slice();
    count = 0;
    draw();
  }

  lensBtn.addEventListener('click', () => {
    if (done) return;
    if (!lensLeft) { wiggle(lensBtn); sfx.wrong(); return; }
    const [, move] = solve(cars, N, pos);
    if (!move) return;
    lensLeft--;
    used = true;
    lensBtn.querySelector('b').textContent = lensLeft;
    const [i, to] = move;
    const k = cars[i];
    board.querySelector('.hint')?.classList.remove('hint', 'up', 'down', 'left', 'right');
    k.el.classList.add('hint', k.dir === 'h' ? (to > pos[i] ? 'right' : 'left') : (to > pos[i] ? 'down' : 'up'));
    sfx.sparkle();
    speak('반짝이는 차를 화살표 쪽으로 밀어 봐요.');
  });
  resetBtn.addEventListener('click', () => { if (!done) { sfx.tap(); reset(); } });

  function round() {
    ctx.progress(p, R);
    dots.replaceChildren(...Array.from({ length: R }, (_, i) => h('i', { class: i < p ? 'done' : i === p ? 'now' : '' })));
    const colors = shuffle(COLORS);
    cars = makePuzzle(N, n, range).map((k, i) => ({ ...k, color: colors[i % colors.length] }));
    start = cars.map(posOf);
    [best] = solve(cars, N, start);
    lensLeft = lenses;
    lensBtn.querySelector('b').textContent = lensLeft;
    used = false;
    done = false;
    reset();
    speak(pick(['노란 택시를 탈출시켜요!', '길을 막은 차를 옮겨요!']));
  }

  ctx.prompt('차를 앞뒤로 끌어 길을 열고, 노란 택시를 오른쪽 출구로 빼내요! 막히면 돋보기를 눌러요.', () => speak('노란 택시를 탈출시켜요!'));
  round();
}
