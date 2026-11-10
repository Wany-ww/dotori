import { h, shuffle, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const NS = 'http://www.w3.org/2000/svg';
const U = 40;
// 조각 기본 모양 (한 칸 = 1)
const BASE = {
  tri: [[0, 0], [1, 0], [0, 1]],
  big: [[0, 0], [2, 0], [0, 2]],
  sq: [[0, 0], [1, 0], [1, 1], [0, 1]],
  rect: [[0, 0], [2, 0], [2, 1], [0, 1]],
};
const COLORS = { tri: '#F2B630', big: '#4A90E2', sq: '#5DBB63', rect: '#E8574F' };
// 퍼즐: 이름과 자리(조각 종류, 꼭짓점들)
const CREATE = [
  { name: '네모', parts: [['tri', [[0, 0], [1, 0], [0, 1]]], ['tri', [[1, 0], [1, 1], [0, 1]]]] },
  { name: '큰 세모', parts: [['sq', [[0, 0], [1, 0], [1, 1], [0, 1]]], ['tri', [[1, 0], [2, 0], [1, 1]]], ['tri', [[0, 1], [1, 1], [0, 2]]]] },
  { name: '긴 네모', parts: [['sq', [[0, 0], [1, 0], [1, 1], [0, 1]]], ['tri', [[1, 0], [2, 0], [1, 1]]], ['tri', [[2, 0], [2, 1], [1, 1]]]] },
  { name: '큰 네모', parts: [['big', [[0, 0], [2, 0], [0, 2]]], ['tri', [[2, 0], [2, 1], [1, 1]]], ['tri', [[1, 1], [1, 2], [0, 2]]], ['sq', [[1, 1], [2, 1], [2, 2], [1, 2]]]] },
  { name: '아주 큰 세모', parts: [['big', [[0, 0], [2, 0], [0, 2]]], ['tri', [[2, 0], [2, 1], [1, 1]]], ['tri', [[2, 0], [3, 0], [2, 1]]], ['tri', [[1, 1], [2, 1], [1, 2]]], ['tri', [[1, 1], [1, 2], [0, 2]]], ['tri', [[0, 2], [1, 2], [0, 3]]]] },
];
// 칠교놀이 단계별 빈 조각 수 (참고 영상: 그림이 거의 다 맞춰져 있고 1~3조각이 비어 있다). 0은 모두 빈 자리
const MISSING = [1, 2, 2, 3, 0];
const TANGRAM = [
  { name: '집', e: '🏠', parts: [['rect', [[0, 1], [2, 1], [2, 2], [0, 2]]], ['tri', [[0, 1], [1, 0], [1, 1]]], ['tri', [[1, 0], [2, 1], [1, 1]]]] },
  { name: '배', e: '⛵', parts: [['big', [[2, 0], [2, 2], [0, 2]]], ['rect', [[0, 2], [2, 2], [2, 3], [0, 3]]], ['tri', [[2, 2], [3, 2], [2, 3]]]] },
  { name: '로켓', e: '🚀', parts: [['tri', [[1, 0], [2, 1], [1, 1]]], ['rect', [[1, 1], [2, 1], [2, 3], [1, 3]]], ['tri', [[0, 2], [1, 2], [1, 3]]], ['tri', [[2, 2], [3, 2], [2, 3]]]] },
  { name: '나무', e: '🌲', parts: [['tri', [[2, 0], [2, 1], [1, 1]]], ['tri', [[2, 0], [3, 1], [2, 1]]], ['big', [[2, 1], [2, 3], [0, 3]]], ['big', [[2, 1], [4, 3], [2, 3]]], ['sq', [[2, 3], [3, 3], [3, 4], [2, 4]]]] },
  { name: '물고기', e: '🐟', parts: [['big', [[1, 0], [3, 0], [1, 2]]], ['big', [[3, 0], [3, 2], [1, 2]]], ['tri', [[0, 0], [1, 1], [0, 1]]], ['tri', [[0, 1], [1, 1], [0, 2]]], ['tri', [[3, 0], [4, 1], [3, 1]]], ['tri', [[3, 1], [4, 1], [3, 2]]]] },
];

// 회전(시계 방향 90°)하고 (0,0)부터 오게 옮긴다
const rotate = (pts, r) => {
  let p = pts;
  for (let i = 0; i < r; i++) p = p.map(([x, y]) => [-y, x]);
  const mx = Math.min(...p.map((q) => q[0]));
  const my = Math.min(...p.map((q) => q[1]));
  return p.map(([x, y]) => [x - mx, y - my]);
};
const key = (pts) => pts.map(([x, y]) => `${x},${y}`).sort().join(' ');
const norm = (pts) => rotate(pts, 0);
const poly = (pts, attrs) => {
  const p = document.createElementNS(NS, 'polygon');
  p.setAttribute('points', pts.map(([x, y]) => `${x * U},${y * U}`).join(' '));
  Object.entries(attrs).forEach(([k, v]) => p.setAttribute(k, v));
  return p;
};
const pieceSvg = (type, r) => {
  const pts = rotate(BASE[type], r);
  const w = Math.max(...pts.map((q) => q[0]));
  const hh = Math.max(...pts.map((q) => q[1]));
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', `-4 -4 ${w * U + 8} ${hh * U + 8}`);
  s.setAttribute('width', w * U * 0.8 + 8);
  s.setAttribute('height', hh * U * 0.8 + 8);
  s.append(poly(pts, { fill: COLORS[type], stroke: 'rgba(0,0,0,.25)', 'stroke-width': 3 }));
  return s;
};

// 칠교놀이(Tangram · tangram) · 도형 조합 만들기(CreateShapes · create):
// 조각을 골라 ⟳로 돌린 뒤, 그림자 판의 같은 모양 자리를 눌러 끼운다
export function mount(stage, ctx) {
  const create = ctx.opts.mode === 'create';
  const L = ctx.level;
  const hinter = makeHinter();
  const board = document.createElementNS(NS, 'svg');
  board.setAttribute('class', 'tg-board');
  const tray = h('div', { class: 'tg-tray' });
  const turn = h('button', { class: 'btn btn-ghost tg-turn', type: 'button' }, '⟳ 돌리기');
  const title = h('p', { class: 'tg-title' });
  stage.append(h('div', { class: 'tangram' }, title, board, h('div', { class: 'tg-tools' }, turn), tray));
  const list = create ? [CREATE[L - 1], CREATE[Math.min(4, L)]] : [TANGRAM[L - 1], TANGRAM[(L + 1) % 5]];
  let p = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(p, list.length);
    const pz = list[p];
    const parts = pz.parts;
    const w = Math.max(...parts.flatMap(([, pts]) => pts.map((q) => q[0])));
    const hh = Math.max(...parts.flatMap(([, pts]) => pts.map((q) => q[1])));
    board.setAttribute('viewBox', `-8 -8 ${w * U + 16} ${hh * U + 16}`);
    board.replaceChildren();
    // 그림자(실루엣)와 자리. 낮은 단계는 조각마다 점선 테두리를 보여 준다
    // 칠교놀이는 몇 조각만 비워 두고 나머지는 미리 맞춰 둔다
    const nMiss = create || !MISSING[L - 1] ? parts.length : Math.min(MISSING[L - 1], parts.length);
    const missIdx = new Set(shuffle(parts.map((_, i) => i)).slice(0, nMiss));
    const slots = parts.map(([type, pts], i) => {
      const el = poly(pts, { class: `tg-slot${L <= (create ? 3 : 2) ? ' outline' : ''}` });
      el.dataset.type = type;
      el.dataset.shape = key(norm(pts));
      board.append(el);
      el.addEventListener('click', () => place(el, pts));
      if (!missIdx.has(i)) { el.classList.add('done'); board.append(poly(pts, { class: 'tg-placed', fill: COLORS[type] })); }
      return el;
    });
    const open = slots.filter((x) => !x.classList.contains('done'));
    title.textContent = create ? `조각을 모아 '${pz.name}'를 만들어요!` : `칠교 조각으로 ${pz.e} ${pz.name} 모양을 완성해요!`;
    let sel = null;
    let missed = false;
    total += open.length;
    const pieces = shuffle(open.map((x) => x.dataset.type)).map((type) => {
      const r = randInt(0, 3);
      const b = h('button', { class: 'tg-piece', type: 'button', 'aria-label': `${type} 조각` }, pieceSvg(type, r));
      b.dataset.type = type;
      b.dataset.r = r;
      b.dataset.shape = key(rotate(BASE[type], r));
      b.addEventListener('click', () => { sfx.tap(); sel?.classList.remove('sel'); sel = b; b.classList.add('sel'); });
      // 끌어서 자리에 놓아도 된다
      draggable(b, {
        onDrop: (pt) => {
          sel?.classList.remove('sel');
          sel = b;
          b.classList.add('sel');
          const slot = open.find((x) => !x.classList.contains('done') && hits(x, pt, 6));
          if (slot) place(slot, parts[slots.indexOf(slot)][1]); else wiggle(b);
        },
      });
      return b;
    });
    tray.replaceChildren(...pieces);
    turn.onclick = () => {
      if (!sel) { wiggle(turn); return; }
      const r = (Number(sel.dataset.r) + 1) % 4;
      sel.dataset.r = r;
      sel.dataset.shape = key(rotate(BASE[sel.dataset.type], r));
      sel.replaceChildren(pieceSvg(sel.dataset.type, r));
      sfx.tap();
    };

    function place(slot, pts) {
      if (!sel || slot.classList.contains('done')) return;
      const shape = key(rotate(BASE[sel.dataset.type], Number(sel.dataset.r)));
      if (sel.dataset.type !== slot.dataset.type || shape !== slot.dataset.shape) {
        missed = true;
        wiggle(sel);
        // 같은 종류면 돌리기 단추를, 아니면 맞는 조각을 반짝여 준다
        hinter.miss(sel.dataset.type === slot.dataset.type ? turn : pieces.find((x) => x.isConnected && x.dataset.type === slot.dataset.type));
        return;
      }
      hinter.reset();
      slot.classList.add('done');
      board.append(poly(pts, { class: 'tg-placed', fill: COLORS[sel.dataset.type] }));
      sel.remove();
      sel = null;
      sfx.pop();
      pop(board);
      if (slots.every((s) => s.classList.contains('done'))) {
        if (!missed) firstTry += open.length;
        else firstTry += Math.max(0, open.length - 1);
        sfx.correct();
        cheer(board);
        speak(create ? `${pz.name} 완성!` : `${pz.name} 완성!`);
        ctx.later(() => {
          p++;
          if (p >= list.length) ctx.finish({ firstTry, total });
          else round();
        }, 2000);
      }
    }
    ctx.prompt(create ? (L <= 3 ? '조각을 고르고 ⟳로 방향을 맞춘 뒤, 점선 자리를 눌러 끼워요!' : '조각을 고르고 ⟳로 돌려서, 그림자 속 알맞은 자리를 눌러 끼워요!')
      : '그림에서 빈 자리를 찾아요. 남은 조각을 ⟳로 돌려 방향을 맞추고, 빈 자리에 끌어 놓아요!', () => speak(create ? '조각을 모아 도형을 만들어요!' : '칠교 조각으로 모양을 완성해요!'));
  }

  round();
}
