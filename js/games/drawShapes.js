import { h, pick, randInt, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const NS = 'http://www.w3.org/2000/svg';
const COLS = 13;
const ROWS = 7;
const GAP = 40;
// 도형: 이름, 읽어 줄 말, 꼭짓점(점판 칸 좌표, 왼쪽 위 기준) 만들기
const SHAPES = {
  rightTri: { name: '직각삼각형', say: '직각삼각형을 완성해 보세요.', make: () => { const w = randInt(2, 5); const t = randInt(2, 5); return [[0, 0], [0, t], [w, t]]; } },
  rect: { name: '직사각형', say: '직사각형을 완성해 보세요.', make: () => { let w; let t; do { w = randInt(2, 6); t = randInt(2, 5); } while (w === t); return [[0, 0], [w, 0], [w, t], [0, t]]; } },
  square: { name: '정사각형', say: '정사각형을 완성해 보세요.', make: () => { const w = randInt(2, 5); return [[0, 0], [w, 0], [w, w], [0, w]]; } },
  tri: { name: '삼각형', say: '삼각형을 완성해 보세요.', make: () => { const w = randInt(2, 3); const t = randInt(2, 5); return [[w, 0], [w * 2, t], [0, t]]; } },
  trap: { name: '사다리꼴', say: '사다리꼴을 완성해 보세요.', make: () => { const a = randInt(1, 2); const top = randInt(1, 3); const t = randInt(2, 4); return [[a, 0], [a + top, 0], [a * 2 + top, t], [0, t]]; } },
  para: { name: '평행사변형', say: '평행사변형을 완성해 보세요.', make: () => { const a = randInt(1, 3); const w = randInt(2, 4); const t = randInt(2, 4); return [[a, 0], [a + w, 0], [w, t], [0, t]]; } },
  rhombus: { name: '마름모', say: '마름모를 완성해 보세요.', make: () => { const a = randInt(2, 3); const t = randInt(2, 3); return [[a, 0], [a * 2, t], [a, t * 2], [0, t]]; } },
};
// 단계별: 나오는 도형, 그려 두지 않은 변 수 (all: 한 변만 그려져 있음)
const CFG = [
  { shapes: ['square', 'rect', 'rightTri'], missing: 1 },
  { shapes: ['square', 'rect', 'rightTri', 'tri', 'trap'], missing: 1 },
  { shapes: ['square', 'rect', 'rightTri', 'tri', 'trap'], missing: 2 },
  { shapes: ['rect', 'rightTri', 'trap', 'para', 'rhombus'], missing: 2 },
  { shapes: ['rect', 'tri', 'trap', 'para', 'rhombus', 'square'], missing: 'all' },
];
const COLORS = ['#7CE07A', '#F26ADF', '#5CC8F2', '#F2C14A'];

const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
const key = (a, b) => [a, b].map((p) => p.join(',')).sort().join('|');
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
// 변 위의 격자점 (끝점 포함). 긴 변은 여러 번에 나눠 그어도 된다
function stepsOf([p, q]) {
  const g = gcd(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1])) || 1;
  return Array.from({ length: g + 1 }, (_, i) => [p[0] + ((q[0] - p[0]) / g) * i, p[1] + ((q[1] - p[1]) / g) * i]);
}

// 도형 그리기(DrawShapes): 점판에 몇 변만 그려진 도형을 보고, 점과 점을 이어 빠진 변을 그려 도형을 완성한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const title = h('p', { class: 'ds-title' });
  const svg = el('svg', { class: 'ds-board', viewBox: `0 0 ${(COLS + 1) * GAP} ${(ROWS + 1) * GAP}`, role: 'img', 'aria-label': '점판' });
  stage.append(h('div', { class: 'draw-shapes' }, title, h('div', { class: 'ds-wrap' }, svg)));
  const at = ([x, y]) => [(x + 1) * GAP, (y + 1) * GAP];
  let n = 0;
  let firstTry = 0;
  let last = '';

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let id;
    do id = pick(cfg.shapes); while (id === last);
    last = id;
    const sh = SHAPES[id];
    const raw = sh.make();
    const w = Math.max(...raw.map((p) => p[0]));
    const t = Math.max(...raw.map((p) => p[1]));
    const ox = randInt(1, COLS - 1 - w - 1);
    const oy = Math.max(0, Math.floor((ROWS - 1 - t) / 2));
    const pts = raw.map(([x, y]) => [x + ox, y + oy]);
    const edges = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
    const missN = cfg.missing === 'all' ? edges.length - 1 : cfg.missing;
    // 빠진 변은 이어진 변들로 (꺾이는 모습이 보이게)
    const start = randInt(0, edges.length - 1);
    const missing = new Set(Array.from({ length: missN }, (_, i) => key(...edges[(start + i) % edges.length])));
    const color = pick(COLORS);
    let missed = false;
    title.textContent = sh.say;

    const fill = el('polygon', { class: 'ds-fill', points: pts.map(at).map((p) => p.join(',')).join(' '), fill: color });
    const lines = el('g', {});
    const dots = el('g', {});
    const temp = el('line', { class: 'ds-temp', stroke: color });
    svg.replaceChildren(fill, lines, temp, dots);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const [cx, cy] = at([x, y]); dots.append(el('circle', { class: 'ds-dot', cx, cy, r: 6 })); }
    const drawEdge = ([a, b], cls = '') => {
      const [x1, y1] = at(a);
      const [x2, y2] = at(b);
      lines.append(el('line', { class: `ds-edge ${cls}`, x1, y1, x2, y2, stroke: color }));
    };
    edges.filter((e) => !missing.has(key(...e))).forEach((e) => drawEdge(e));
    pts.forEach((p) => { const [cx, cy] = at(p); lines.append(el('circle', { class: 'ds-corner', cx, cy, r: 9, fill: color })); });
    // 빠진 변마다 아직 안 그은 칸(격자점 사이)
    const todo = edges.filter((e) => missing.has(key(...e))).map((e) => ({ e, pts: stepsOf(e), done: new Set() }));
    const left = { get size() { return todo.filter((d) => d.done.size < d.pts.length - 1).length; } };

    // 끌어서 잇기: 가까운 점에서 시작해 가까운 점에서 끝난다 (점 두 개를 차례로 눌러도 된다)
    const near = (ev) => {
      const r = svg.getBoundingClientRect();
      const sx = ((ev.clientX - r.left) / r.width) * (COLS + 1) * GAP;
      const sy = ((ev.clientY - r.top) / r.height) * (ROWS + 1) * GAP;
      const x = Math.round(sx / GAP) - 1;
      const y = Math.round(sy / GAP) - 1;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
      const [cx, cy] = at([x, y]);
      return Math.hypot(cx - sx, cy - sy) < GAP * 0.45 ? [x, y] : null;
    };
    let from = null;
    let picked = null;
    svg.onpointerdown = (ev) => {
      const p = near(ev);
      if (!p || !left.size) return;
      ev.preventDefault();
      from = p;
      try { svg.setPointerCapture(ev.pointerId); } catch {}
      const [x1, y1] = at(p);
      Object.entries({ x1, y1, x2: x1, y2: y1 }).forEach(([k, v]) => temp.setAttribute(k, v));
      temp.style.display = 'block';
    };
    svg.onpointermove = (ev) => {
      if (!from) return;
      const r = svg.getBoundingClientRect();
      temp.setAttribute('x2', ((ev.clientX - r.left) / r.width) * (COLS + 1) * GAP);
      temp.setAttribute('y2', ((ev.clientY - r.top) / r.height) * (ROWS + 1) * GAP);
    };
    svg.onpointerup = svg.onpointercancel = (ev) => {
      if (!from) return;
      temp.style.display = 'none';
      const a = from;
      from = null;
      const b = near(ev);
      if (!b) return;
      if (a[0] === b[0] && a[1] === b[1]) {
        // 눌렀다 뗀 점: 두 번째 점을 누르면 잇는다
        if (picked && (picked[0] !== a[0] || picked[1] !== a[1])) { const p = picked; picked = null; tryEdge(p, a); return; }
        picked = a;
        sfx.tap();
        return;
      }
      picked = null;
      tryEdge(a, b);
    };

    // a-b가 빠진 변의 한 부분이면 그 칸들을 그은 것으로 한다
    const cover = (a, b) => {
      for (const d of todo) {
        const ia = d.pts.findIndex((p) => p[0] === a[0] && p[1] === a[1]);
        const ib = d.pts.findIndex((p) => p[0] === b[0] && p[1] === b[1]);
        if (ia < 0 || ib < 0) continue;
        for (let i = Math.min(ia, ib); i < Math.max(ia, ib); i++) d.done.add(i);
        return true;
      }
      return false;
    };
    function tryEdge(a, b) {
      if (!cover(a, b)) {
        missed = true;
        sfx.wrong();
        // 잘못 그은 선은 잠깐 보였다가 사라진다
        const [x1, y1] = at(a);
        const [x2, y2] = at(b);
        const bad = el('line', { class: 'ds-edge bad', x1, y1, x2, y2 });
        lines.append(bad);
        ctx.later(() => bad.remove(), 600);
        const p = todo.find((d) => d.done.size < d.pts.length - 1).e[0];
        hinter.miss(null);
        if (hinter.count >= 2) {
          const [cx, cy] = at(p);
          const glow = el('circle', { class: 'ds-hint', cx, cy, r: 16 });
          lines.append(glow);
          ctx.later(() => glow.remove(), 1800);
        }
        return;
      }
      drawEdge([a, b], 'new');
      sfx.pop();
      if (left.size) return;
      hinter.reset();
      if (!missed) firstTry++;
      sfx.correct();
      fill.classList.add('on');
      cheer(svg);
      speak(sh.name);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
    }

    speak(sh.say);
  }

  ctx.prompt('점과 점을 손가락으로 이어 빠진 변을 그려 도형을 완성해요!', () => speak('점을 이어 도형을 완성해요!'));
  round();
}
