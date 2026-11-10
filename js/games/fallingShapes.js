import { h, shuffle, pick, randInt, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#8A4CC8', '#E8384F', '#F28A2E', '#3E6FE0', '#45B035', '#F2C230', '#E8389A', '#9A9A9A', '#F2F2F2'];
// 도형 모양: 한 칸(100 × 100) 또는 세로 두 칸(100 × 200)
const PATH = {
  circle: () => 'M50 14a36 36 0 1 0 0.1 0Z',
  square: () => 'M20 20H80V80H20Z',
  triangle: () => (Math.random() < 0.5 ? 'M50 18L86 80H14Z' : 'M14 22L86 80H14Z'),
  pentagon: () => 'M50 14L86 40L72 84H28L14 40Z',
  hexagon: () => 'M30 16H70L90 50L70 84H30L10 50Z',
  diamond: () => 'M50 10L86 50L50 90L14 50Z',
  trapezoid: () => 'M30 28H70L88 72H12Z',
  rect: (tall) => (tall ? 'M28 14H72V186H28Z' : 'M8 34H92V66H8Z'),
  ellipse: (tall) => (tall ? 'M50 16a32 84 0 1 0 0.1 0Z' : 'M50 30a42 20 0 1 0 0.1 0Z'),
};
// 단계별: 판(가로 × 세로 칸), 찾을 이름과 그 이름에 드는 모양
const NAMES = {
  '원': ['circle'], '타원': ['ellipse'], '사각형': ['square', 'rect'], '정사각형': ['square'], '직사각형': ['rect'],
  '삼각형': ['triangle'], '오각형': ['pentagon'], '육각형': ['hexagon'], '마름모': ['diamond'], '사다리꼴': ['trapezoid'],
};
const SAY = {
  원: '원을 모두 찾으세요.', 타원: '타원을 모두 찾으세요.', 사각형: '사각형을 모두 찾으세요.', 정사각형: '정사각형을 모두 찾으세요.', 직사각형: '직사각형을 모두 찾으세요.',
  삼각형: '삼각형을 모두 찾으세요.', 오각형: '오각형을 모두 찾으세요.', 육각형: '육각형을 모두 찾으세요.', 마름모: '마름모를 모두 찾으세요.', 사다리꼴: '사다리꼴을 모두 찾으세요.',
};
const CFG = [
  { cols: 4, rows: 5, names: ['원', '삼각형', '사각형'] },
  { cols: 5, rows: 6, names: ['원', '삼각형', '사각형'] },
  { cols: 5, rows: 6, names: ['원', '타원', '정사각형', '직사각형', '삼각형', '오각형'] },
  { cols: 6, rows: 7, names: ['정사각형', '직사각형', '삼각형', '오각형', '육각형', '마름모', '타원'] },
  { cols: 6, rows: 7, names: ['정사각형', '직사각형', '오각형', '육각형', '마름모', '사다리꼴', '타원', '원'] },
];

function shapeEl(kind, tall, color) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', `0 0 100 ${tall ? 200 : 100}`);
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', PATH[kind](tall));
  p.setAttribute('fill', color);
  s.append(p);
  return s;
}

// 떨어지는 도형(FallingShapes): 빽빽이 쌓인 도형 판에서 "정사각형을 모두 찾으세요."를 듣고 그 도형을 모두 누른다.
// 누른 도형이 사라지면 위의 도형이 아래로 떨어진다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const ask = h('div', { class: 'fs-ask' });
  const board = h('div', { class: 'fs-board', style: { '--cols': cfg.cols, '--rows': cfg.rows } });
  stage.append(h('div', { class: 'falling-shapes' }, ask, board));
  const kinds = [...new Set(cfg.names.flatMap((n) => NAMES[n]))];
  // 칸마다 도형을 쌓아 판을 채운다 (직사각형 · 타원은 세로 두 칸도 된다)
  const cols = Array.from({ length: cfg.cols }, () => {
    const col = h('div', { class: 'fs-col' });
    let used = 0;
    while (used < cfg.rows) {
      const kind = pick(kinds);
      const tall = ['rect', 'ellipse'].includes(kind) && used <= cfg.rows - 2 && Math.random() < 0.5;
      const b = h('button', { class: `fs-block${tall ? ' tall' : ''}`, type: 'button', 'aria-label': '도형' }, shapeEl(kind, tall, pick(COLORS)));
      b.dataset.kind = kind;
      b.addEventListener('click', () => tap(b));
      col.append(b);
      used += tall ? 2 : 1;
    }
    return col;
  });
  board.replaceChildren(...cols);
  let n = 0;
  let firstTry = 0;
  let missed = false;
  let target = null;
  let lastName = '';

  const left = () => [...board.querySelectorAll('.fs-block:not(.gone)')].filter((b) => NAMES[target].includes(b.dataset.kind));

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    missed = false;
    const have = new Set([...board.querySelectorAll('.fs-block:not(.gone)')].map((b) => b.dataset.kind));
    const can = shuffle(cfg.names.filter((nm) => nm !== lastName && NAMES[nm].some((k) => have.has(k))));
    if (!can.length) { ctx.finish({ firstTry, total: n || 1 }); return; }
    target = can[0];
    lastName = target;
    ask.replaceChildren(h('button', { class: 'fs-ear', type: 'button', 'aria-label': '다시 듣기', onclick: () => speak(SAY[target]) }, '🔊'),
      h('p', {}, h('b', {}, target), SAY[target].slice(target.length)));
    speak(SAY[target]);
  }

  function tap(b) {
    if (!target || b.classList.contains('gone')) return;
    if (!NAMES[target].includes(b.dataset.kind)) {
      missed = true;
      wiggle(b);
      hinter.miss(left()[0]);
      return;
    }
    hinter.reset();
    sfx.pop();
    drop(b);
    if (left().length) return;
    if (!missed) firstTry++;
    sfx.correct();
    cheer(board);
    target = null;
    ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1300);
  }

  // 누른 도형을 없애고, 위에 있던 도형이 미끄러지듯 내려오게 한다
  function drop(b) {
    const col = b.parentElement;
    const above = [...col.children].slice([...col.children].indexOf(b) + 1);
    const before = above.map((x) => x.getBoundingClientRect().top);
    b.classList.add('gone');
    ctx.later(() => {
      b.remove();
      above.forEach((x, i) => {
        const dy = before[i] - x.getBoundingClientRect().top;
        if (dy) x.animate?.([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: 'ease-in' });
      });
    }, 180);
  }

  ctx.prompt('말한 도형을 모두 찾아 눌러요. 누른 도형이 없어지면 위의 도형이 떨어져요!', () => speak(SAY[target] || '도형을 찾아요!'));
  round();
}
