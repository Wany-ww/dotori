import { h, pick, randInt, wiggle, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const ROWS = 5;
const COLS = 6;
const GUESTS = ['👾', '🐙', '🦖', '🐻'];
// 단계별 주문: 수 범위, 곱셈식으로 주문하는지, 한 줄로만 고르면 안 되는지
const CFG = [
  { want: [1, 6] },
  { want: [2, 12] },
  { want: [6, 30], rect: true },
  { want: [6, 30], asMul: true },
  { want: [8, 30], rect: true },
];
// 판(가로 6 × 세로 5) 안에서 만들 수 있는 수만
const fits = (v, rect) => Array.from({ length: ROWS }, (_, r) => r + 1).some((r) => v % r === 0 && v / r <= COLS && (!rect || (r > 1 && v / r > 1)));

// 달걀 묶음 판매(EggsForSale · 달걀 판매): 손님이 말한 수만큼 달걀판의 왼쪽 위에서부터 네모나게 골라 판다.
// 고른 모양이 "3 × 2 = 6" 곱셈식이 된다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const guest = h('div', { class: 'eg-guest' });
  const tray = h('div', { class: 'eg-tray', style: { '--cols': COLS } });
  const label = h('b', { class: 'eg-label' });
  const eq = h('div', { class: 'eg-eq' });
  const board = h('div', { class: 'eg-board' }, h('div', { class: 'eg-cols' }, Array.from({ length: COLS }, (_, i) => h('span', {}, i + 1))), h('div', { class: 'eg-rows' }, Array.from({ length: ROWS }, (_, i) => h('span', {}, i + 1))), tray, label, eq);
  stage.append(h('div', { class: 'eggs-sale' }, guest, board));
  let n = 0;
  let firstTry = 0;
  const cells = [];
  for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) {
    const e = h('span', { class: 'eg-egg' });
    e.dataset.r = r;
    e.dataset.c = c;
    cells.push(e);
  }
  tray.append(...cells);
  let want = 0;
  let pick2 = null;
  let locked = true;
  let missed = false;
  const used = [];

  // 고르기: 누르거나 끌면 왼쪽 위(1, 1)부터 그 칸까지 네모가 골라진다
  const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el?.closest?.('.eg-egg'); };
  function select(el) {
    if (!el) return;
    const r = Number(el.dataset.r);
    const c = Number(el.dataset.c);
    pick2 = { r, c };
    cells.forEach((x) => x.classList.toggle('sel', Number(x.dataset.r) <= r && Number(x.dataset.c) <= c));
    label.textContent = `${c} × ${r}`;
    label.style.left = `calc(${c} * var(--cw))`;
    label.style.top = `calc(${r} * var(--cw))`;
    label.classList.add('on');
  }
  let dragging = false;
  tray.addEventListener('pointerdown', (e) => { if (locked) return; e.preventDefault(); dragging = true; try { tray.setPointerCapture(e.pointerId); } catch {} select(cellAt(e)); sfx.tap(); });
  tray.addEventListener('pointermove', (e) => { if (dragging) select(cellAt(e)); });
  const up = () => { if (!dragging) return; dragging = false; judge(); };
  tray.addEventListener('pointerup', up);
  tray.addEventListener('pointercancel', up);

  function clear() {
    cells.forEach((x) => x.classList.remove('sel', 'sold'));
    label.classList.remove('on');
    pick2 = null;
  }

  function judge() {
    if (!pick2 || locked) return;
    const { r, c } = pick2;
    const got = r * c;
    if (got !== want || (cfg.rect && (r === 1 || c === 1))) {
      missed = true;
      wiggle(tray);
      speak(got === want ? '두 줄 이상으로 네모나게 골라요!' : got > want ? '너무 많아요!' : '조금 모자라요!');
      hinter.miss(null);
      ctx.later(clear, 500);
      return;
    }
    locked = true;
    if (!missed) firstTry++;
    hinter.reset();
    cells.forEach((x) => { if (x.classList.contains('sel')) x.classList.add('sold'); });
    board.classList.add('dim');
    eq.textContent = `${c} × ${r} = ${want}`;
    eq.classList.add('on');
    guest.classList.add('happy');
    sfx.correct();
    cheer(eq);
    burst(board, ['🥚', '⭐', '✨']);
    speak([String(c), '곱하기', String(r), '는', String(want)]);
    ctx.later(() => { board.classList.remove('dim'); eq.classList.remove('on'); guest.classList.remove('happy'); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    clear();
    do want = randInt(...cfg.want); while (!fits(want, cfg.rect || cfg.asMul) || used.includes(want));
    used.push(want);
    missed = false;
    let order = String(want);
    if (cfg.asMul) {
      const rs = Array.from({ length: ROWS }, (_, i) => i + 1).filter((r) => r > 1 && want % r === 0 && want / r <= COLS && want / r > 1);
      const r = pick(rs);
      order = `${want / r} × ${r}`;
    }
    guest.replaceChildren(h('span', { class: 'eg-face', 'aria-hidden': 'true' }, GUESTS[n % GUESTS.length]), h('b', { class: 'eg-say' }, h('i', { 'aria-hidden': 'true' }, '🥚'), order));
    locked = false;
    ctx.prompt(cfg.asMul ? `손님이 달걀을 ${order}개 사고 싶대요. 왼쪽 위에서부터 끌어서 네모나게 골라요!` : `손님이 달걀 ${want}개를 사고 싶대요. 왼쪽 위에서부터 끌어서 네모나게 골라요!`,
      () => speak(cfg.asMul ? [order.split(' × ')[0], '곱하기', order.split(' × ')[1]] : [`${want}개!`]));
  }

  round();
}
