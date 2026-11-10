import { h, shuffle, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable } from './dragTap.js';

const R = 2;
const COLORS = ['#F06C9B', '#2EC46A', '#9C6BE0', '#4AA8E8', '#F0883A', '#F2C230', '#35B6D8', '#E85B5B', '#7CC24A', '#6A7FE8'];
// 단계별: 판에 끼울 단(줄) 고르기
const SETS = [
  () => shuffle([2, 5, 10]),
  () => shuffle([1, 2, 3, 4, 5]).slice(0, 4),
  () => shuffle([6, 7, 8, 9]),
  () => shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6),
  () => shuffle([2, 3, 4, 5, 6, 7, 8, 9]),
];

// 구구단 마스터(MultiplicationTable · 곱셈 퍼즐): 0~10 곱셈표 판에 단 막대(0, 8, 16, … 80)를
// 알맞은 세로줄에 끼워 구구단 표를 완성한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const grid = h('div', { class: 'mp-grid' });
  const shelf = h('div', { class: 'mp-shelf' });
  stage.append(h('div', { class: 'mul-puzzle' }, grid, shelf));
  // 판: 맨 위 × 0 … 10, 왼쪽 0 … 10, 세로줄마다 끼울 자리
  const head = h('div', { class: 'mp-head' }, h('b', {}, '×'), Array.from({ length: 11 }, (_, k) => h('span', {}, k)));
  const side = h('div', { class: 'mp-side' }, Array.from({ length: 11 }, (_, i) => h('span', {}, i)));
  const slots = Array.from({ length: 11 }, (_, k) => { const s = h('button', { class: 'mp-slot', type: 'button', 'aria-label': `${k}단 자리` }); s.dataset.k = k; return s; });
  grid.append(head, side, h('div', { class: 'mp-slots' }, slots));
  let n = 0;
  let firstTry = 0;
  let sel = null;

  const bar = (k) => h('span', { class: 'mp-bar', style: { '--c': COLORS[k % COLORS.length] } }, Array.from({ length: 11 }, (_, i) => h('i', {}, k * i)));

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const ks = SETS[L - 1]();
    let left = ks.length;
    let missed = false;
    sel = null;
    slots.forEach((s) => { s.replaceChildren(); s.classList.remove('full'); });
    const pieces = ks.map((k, i) => {
      const b = h('button', { class: 'mp-piece', type: 'button', style: { animationDelay: `${i * 0.08}s` }, 'aria-label': `${k}단 막대` }, bar(k));
      b.dataset.k = k;
      draggable(b, {
        can: () => b.parentElement === shelf,
        onDrop: (pt) => {
          const s = slots.find((x) => { const r = x.getBoundingClientRect(); return pt.x > r.left - 6 && pt.x < r.right + 6 && pt.y > r.top - 40 && pt.y < r.bottom + 40; });
          if (s) put(b, s); else wiggle(b);
        },
      });
      b.addEventListener('click', () => {
        if (b.parentElement !== shelf) return;
        sfx.tap();
        speak(`${k}단!`);
        sel?.classList.remove('sel');
        sel = sel === b ? null : b;
        sel?.classList.add('sel');
      });
      return b;
    });
    shelf.replaceChildren(...pieces);
    slots.forEach((s) => { s.onclick = () => { if (sel) put(sel, s); }; });

    function put(b, s) {
      const k = Number(b.dataset.k);
      sel?.classList.remove('sel');
      sel = null;
      if (s.classList.contains('full') || Number(s.dataset.k) !== k) {
        missed = true;
        wiggle(b);
        hinter.miss(slots[k]);
        speak(`${k}단!`);
        return;
      }
      s.append(b.firstElementChild);
      s.classList.add('full');
      b.remove();
      pop(s);
      sfx.pop();
      left--;
      if (left) return;
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(grid);
      burst(grid, ['⭐', '✨', '✖️']);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
    }
    ctx.prompt('단 막대를 알맞은 세로줄에 끼워 곱셈표를 완성해요! 막대 맨 위 수와 둘째 수를 보면 몇 단인지 알 수 있어요.', () => speak('단 막대를 알맞은 줄에 끼워요!'));
  }

  round();
}
