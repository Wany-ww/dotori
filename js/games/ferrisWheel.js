import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

// 단계별: 칸에 붙는 수(1~12 또는 0~55를 5씩), 미리 매달린 칸, 판 수
// given: 'all-but-1'은 하나만 빼고 다 매달려 있다
const CFG = [
  { step: 1, given: 'all-but-1', boards: 4 },
  { step: 1, given: [0, 3, 6, 9], boards: 2 },
  { step: 1, given: [], boards: 2 },
  { step: 5, given: [0, 3, 6, 9], boards: 2 },
  { step: 5, given: [], boards: 2 },
];
const COLORS = ['#E8574F', '#F2A23A', '#C2469A', '#2F8FD8', '#8A4CC8', '#E04848', '#5A5F6A', '#E2462E', '#2F7FD0', '#F08A2E', '#E85C7A', '#21456E'];

// 관람차(FerrisWheel): 시계처럼 둘러선 관람차 자리에 수가 적힌 칸을 순서대로 매단다.
// 1~12(시) → 0~55(5분씩)로 1이나 5 단위 수 세기를 익힌다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const wheel = h('div', { class: 'fw-wheel' }, h('span', { class: 'fw-rim', 'aria-hidden': 'true' }), h('span', { class: 'fw-hub', 'aria-hidden': 'true' }));
  const left = h('div', { class: 'fw-dock left' });
  const right = h('div', { class: 'fw-dock right' });
  stage.append(h('div', { class: 'ferris' }, h('span', { class: 'fw-stand', 'aria-hidden': 'true' }), wheel, left, right));
  let b = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(b, cfg.boards);
    // 자리 i(맨 위가 0)에 붙는 수: 1단위는 12, 1, 2 … 11 / 5단위는 0, 5 … 55
    const val = (i) => (cfg.step === 1 ? i || 12 : i * 5);
    const given = new Set(cfg.given === 'all-but-1' ? pickN([...Array(12).keys()], 11) : cfg.given);
    const slots = [];
    let sel = null;
    const cabin = (i) => h('span', { class: 'fw-cabin', style: { '--c': COLORS[val(i) % 12] } }, h('b', {}, val(i)));
    wheel.classList.remove('spin');
    wheel.querySelectorAll('.fw-slot').forEach((s) => s.remove());
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      const s = h('button', { class: 'fw-slot', type: 'button', 'aria-label': given.has(i) ? String(val(i)) : '빈 자리', style: { left: `${50 + 41 * Math.sin(a)}%`, top: `${50 - 41 * Math.cos(a)}%` } });
      s.dataset.i = i;
      if (given.has(i)) { s.classList.add('filled'); s.append(cabin(i)); }
      s.addEventListener('click', () => {
        if (s.classList.contains('filled')) { sfx.tap(); pop(s); speak(String(val(i))); return; }
        if (sel) place(sel, s);
      });
      slots.push(s);
      wheel.append(s);
    }

    const todo = shuffle([...Array(12).keys()].filter((i) => !given.has(i)));
    let leftN = todo.length;
    total += todo.length;
    const pieces = todo.map((i, k) => {
      const p = h('button', { class: 'fw-piece', type: 'button', 'aria-label': `${val(i)} 칸`, style: { animationDelay: `${k * 0.06}s` } }, cabin(i));
      p.dataset.i = i;
      p.dataset.miss = '0';
      draggable(p, {
        onDrop: (pt) => {
          const s = slots.find((x) => !x.classList.contains('filled') && hits(x, pt, 6));
          if (s) place(p, s); else wiggle(p);
        },
      });
      p.addEventListener('click', () => {
        sfx.tap();
        speak(String(val(i)));
        sel?.classList.remove('sel');
        sel = sel === p ? null : p;
        sel?.classList.add('sel');
      });
      return p;
    });
    // 양쪽 승강장에 나눠 쌓는다
    left.replaceChildren(...pieces.filter((_, k) => k % 2 === 0));
    right.replaceChildren(...pieces.filter((_, k) => k % 2 === 1));

    function place(p, s) {
      const want = slots[Number(p.dataset.i)];
      if (s !== want) {
        p.dataset.miss = '1';
        wiggle(p);
        wiggle(s);
        hinter.miss(want);
        return;
      }
      hinter.reset();
      if (sel === p) sel = null;
      if (p.dataset.miss === '0') firstTry++;
      p.remove();
      s.classList.add('filled');
      s.append(cabin(Number(p.dataset.i)));
      s.setAttribute('aria-label', String(val(Number(p.dataset.i))));
      pop(s);
      sfx.pop();
      speak(String(val(Number(p.dataset.i))));
      leftN--;
      ctx.progress(b + (todo.length - leftN) / todo.length, cfg.boards);
      if (leftN) return;
      ctx.later(() => {
        sfx.correct();
        cheer(wheel);
        wheel.classList.add('spin');
        speak('관람차가 돌아가요!');
      }, 600);
      ctx.later(() => { b++; if (b >= cfg.boards) ctx.finish({ firstTry, total }); else round(); }, 3200);
    }

    ctx.prompt(cfg.step === 1
      ? '1부터 12까지 시계처럼 차례대로 관람차 칸을 매달아요! 12는 맨 위예요.'
      : '0부터 55까지 5씩 커지게 관람차 칸을 매달아요! 0은 맨 위예요.',
    () => speak(cfg.step === 1 ? '관람차 칸을 순서대로 매달아요!' : '5씩 세면서 관람차 칸을 매달아요!'));
  }

  round();
}
