import { h, shuffle, pick, pickN, randInt, wiggle, burst, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 2;
const NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#8A4CC8', '#F2C230', '#2F7FD0', '#E8902A', '#7CC23A', '#E8572E', '#3FC2D0', '#E8389A'];
// 도형 이름(읽어 줄 말)과 모양 (100 × 100)
const TYPES = {
  circle: ['원', 'M50 16a34 34 0 1 0 0.1 0Z'],
  ellipse: ['타원', 'M50 26a40 24 0 1 0 0.1 0Z'],
  square: ['정사각형', 'M22 22H78V78H22Z'],
  rect: ['직사각형', 'M10 30H90V70H10Z'],
  triangle: ['삼각형', 'M50 16L86 80H14Z'],
  pentagon: ['오각형', 'M50 14L86 40L72 84H28L14 40Z'],
  hexagon: ['육각형', 'M30 16H70L90 50L70 84H30L10 50Z'],
  diamond: ['마름모', 'M50 10L82 50L50 90L18 50Z'],
  trapezoid: ['사다리꼴', 'M32 28H68L88 72H12Z'],
  star: ['별', 'M50 8L61 38H93L67 57L77 89L50 70L23 89L33 57L7 38H39Z'],
  heart: ['하트', 'M50 86C20 64 8 48 12 32C16 16 38 12 50 30C62 12 84 16 88 32C92 48 80 64 50 86Z'],
};
// 단계별: 짝 수, 더미 수, 짝끼리 색 · 방향 · 크기가 다른지, 비슷한 모양을 함께 쓰는지
const CFG = [
  { pairs: 3, stacks: 6, color: false, turn: false, size: false },
  { pairs: 4, stacks: 6, color: true, turn: false, size: false },
  { pairs: 4, stacks: 4, color: true, turn: true, size: false },
  { pairs: 5, stacks: 4, color: true, turn: true, size: true, near: true },
  { pairs: 6, stacks: 4, color: true, turn: true, size: true, near: true },
];
const NEAR = ['square', 'rect', 'diamond', 'trapezoid', 'pentagon', 'hexagon', 'circle', 'ellipse'];

function face(type, color, turn, scale) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', TYPES[type][1]);
  p.setAttribute('fill', color);
  p.setAttribute('transform', `rotate(${turn} 50 50) translate(50 50) scale(${scale}) translate(-50 -50)`);
  s.append(p);
  return s;
}

// 도형 맞추기(ShapeMatching · 수학): 겹쳐 쌓인 카드 더미에서 맨 위 카드끼리 같은 모양 짝을 찾아 없앤다.
// 색 · 방향 · 크기가 달라도 모양이 같으면 짝이다. 가려진 카드는 위 카드를 없애야 고를 수 있다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const board = h('div', { class: 'shape-pairs' });
  stage.append(board);
  let b = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(b, R);
    const types = cfg.near ? pickN(NEAR, cfg.pairs) : pickN(Object.keys(TYPES), cfg.pairs);
    // 짝을 차례로 서로 다른 두 더미에 올린다. 나중에 올린 짝이 늘 위에 있어 언제나 끝까지 풀 수 있다
    const stacks = Array.from({ length: cfg.stacks }, () => []);
    types.forEach((type, pid) => {
      const order = shuffle(stacks.map((_, i) => i)).sort((x, y) => stacks[x].length - stacks[y].length);
      const [x, y] = order.slice(0, 2);
      const base = pick(COLORS);
      [x, y].forEach((si, k) => stacks[si].push({
        pid, type,
        color: cfg.color && k ? pick(COLORS.filter((c) => c !== base)) : base,
        turn: cfg.turn ? randInt(-3, 3) * 15 : 0,
        scale: cfg.size ? [0.7, 0.85, 1][randInt(0, 2)] : 0.9,
      }));
    });
    // 더미 자리: 두 줄로 나누어 놓고, 위 카드일수록 오른쪽 아래로 비켜 놓는다
    const perRow = Math.ceil(cfg.stacks / 2);
    const cards = [];
    stacks.forEach((st, si) => {
      const row = Math.floor(si / perRow);
      const col = si % perRow;
      st.forEach((c, layer) => {
        const el = h('button', {
          class: 'sp-card', type: 'button', 'aria-label': TYPES[c.type][0],
          style: { left: `calc(${((col + 0.5) / perRow) * 100}% - 56px + ${layer * 30}px)`, top: `calc(${row * 50 + 4}% + ${layer * 22}px)`, zIndex: layer + 1 },
        }, face(c.type, c.color, c.turn, c.scale));
        el.addEventListener('click', () => tap(card));
        const card = { ...c, el, si, layer };
        cards.push(card);
      });
    });
    board.replaceChildren(...cards.map((c) => c.el));
    let sel = null;
    let missed = false;
    let left = cards.length;
    const isFree = (c) => !c.gone && !cards.some((o) => !o.gone && o.si === c.si && o.layer > c.layer);
    const paint = () => cards.forEach((c) => c.el.classList.toggle('blocked', !c.gone && !isFree(c)));
    paint();

    function tap(c) {
      if (c.gone || !isFree(c)) { wiggle(c.el); return; }
      sfx.tap();
      if (!sel || sel === c) {
        sel?.el.classList.remove('sel');
        sel = sel === c ? null : c;
        sel?.el.classList.add('sel');
        return;
      }
      const a = sel;
      sel = null;
      a.el.classList.remove('sel');
      if (a.type !== c.type) {
        missed = true;
        wiggle(a.el);
        wiggle(c.el);
        const mate = cards.find((o) => o.pid === a.pid && o !== a);
        hinter.miss(isFree(mate) ? mate.el : null);
        return;
      }
      hinter.reset();
      sfx.correct();
      [a, c].forEach((x) => { x.gone = true; x.el.classList.add('gone'); });
      burst(c.el, ['⭐', '✨']);
      speak(TYPES[c.type][0]);
      left -= 2;
      paint();
      if (left) return;
      total++;
      if (!missed) firstTry++;
      cheer(board);
      ctx.later(() => { b++; if (b >= R) ctx.finish({ firstTry, total }); else round(); }, 1600);
    }

    ctx.prompt('맨 위에 있는 카드 중에서 모양이 같은 카드 두 장을 골라요. 색이나 크기가 달라도 모양이 같으면 짝이에요!',
      () => speak('모양이 같은 카드 두 장을 찾아요!'));
  }

  round();
}
