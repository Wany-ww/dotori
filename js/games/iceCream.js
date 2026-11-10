import { h, pick, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 3;
const CAP = 3;
const FLAVORS = { g: '녹차', v: '바닐라', p: '딸기', c: '초코', m: '민트', b: '블루베리' };
// 단계별: 스쿱 수, 가장 짧은 풀이 횟수, 하트(옮길 수 있는 횟수)
const CFG = { 1: [3, 1, 4], 2: [3, 2, 5], 3: [4, 3, 5], 4: [5, 4, 6], 5: [6, 5, 7] };

const key = (s) => s.join('|');
const nexts = (s) => {
  const out = [];
  s.forEach((from, i) => {
    if (!from) return;
    s.forEach((to, j) => {
      if (i === j || to.length >= CAP) return;
      const t = s.slice();
      t[i] = from.slice(0, -1);
      t[j] = to + from.at(-1);
      out.push(t);
    });
  });
  return out;
};
// 목표에서 정확히 d번 떨어진 처음 모양 (옮기기는 되돌릴 수 있으니 목표에서 거꾸로 퍼져 나간다)
function puzzle(n, d) {
  const flavors = pickN(Object.keys(FLAVORS), n);
  let goal;
  do {
    goal = ['', '', ''];
    flavors.forEach((f) => { const open = [0, 1, 2].filter((i) => goal[i].length < CAP); goal[pick(open)] += f; });
  } while (goal.filter(Boolean).length < Math.min(2, n));
  const seen = new Set([key(goal)]);
  let layer = [goal];
  for (let k = 0; k < d; k++) {
    const next = [];
    layer.forEach((s) => nexts(s).forEach((t) => { if (!seen.has(key(t))) { seen.add(key(t)); next.push(t); } }));
    if (!next.length) break;
    layer = next;
  }
  return [goal, pick(layer)];
}

const scoopEl = (f, small) => h('i', { class: `ic-scoop f-${f}${small ? ' sm' : ''}`, 'aria-hidden': 'true' });

// 아이스크림 옮기기(IceCream): 위에 작게 보이는 아이스크림과 똑같아지도록 맨 위 스쿱을 다른 콘으로 옮긴다.
// 하트만큼만 옮길 수 있고, 다 쓰면 처음 모양으로 돌아가 다시 한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [n, d, hearts] = CFG[ctx.level];
  const hinter = makeHinter();
  const lives = h('div', { class: 'ic-hearts', 'aria-live': 'polite' });
  const target = h('div', { class: 'ic-target' });
  const row = h('div', { class: 'ic-cones' });
  stage.append(h('div', { class: 'ice-cream' }, h('div', { class: 'ic-top' }, lives, target), row));
  let r = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    const [goal, start] = puzzle(n, d);
    let now = start.slice();
    let left = hearts;
    let missed = false;
    let busy = false;
    let sel = null;
    target.replaceChildren(...goal.map((s) => h('div', { class: 'ic-mini' }, h('div', { class: 'ic-stack' }, ...[...s].map((f) => scoopEl(f, true))), h('i', { class: 'ic-cone sm' }))));
    const cones = [0, 1, 2].map((i) => {
      const stack = h('div', { class: 'ic-stack' });
      const el = h('button', { class: 'ic-slot', type: 'button', 'aria-label': `${i + 1}번 콘` }, h('span', { class: 'ic-ghost', 'aria-hidden': 'true' }), stack, h('i', { class: 'ic-cone' }));
      el.addEventListener('click', () => tap(i));
      return { el, stack };
    });
    row.replaceChildren(...cones.map((c) => c.el));

    const draw = () => {
      lives.replaceChildren(...Array.from({ length: hearts }, (_, i) => h('i', { class: i < left ? '' : 'off' }, '♥')));
      lives.setAttribute('aria-label', `하트 ${left}개`);
      target.querySelectorAll('.ic-mini').forEach((m, i) => m.classList.toggle('ok', now[i] === goal[i]));
      cones.forEach((c, i) => {
        c.stack.replaceChildren(...[...now[i]].map((f, k) => {
          const s = scoopEl(f);
          if (k === now[i].length - 1) {
            s.classList.add('top');
            draggable(s, {
              can: () => !busy,
              onDrop: (pt) => {
                const j = cones.findIndex((o, jj) => jj !== i && hits(o.el, pt, 10));
                if (j >= 0) move(i, j);
              },
            });
          }
          return s;
        }));
        c.el.classList.toggle('sel', sel === i);
      });
    };
    function tap(i) {
      if (busy) return;
      if (sel === null) {
        if (!now[i]) { wiggle(cones[i].el); return; }
        sel = i;
        sfx.tap();
        draw();
        return;
      }
      const from = sel;
      sel = null;
      if (from === i) { draw(); return; }
      move(from, i);
    }
    function move(i, j) {
      sel = null;
      if (now[j].length >= CAP) { wiggle(cones[j].el); sfx.wrong(); speak('콘에는 세 개까지만 올라가요.'); draw(); return; }
      now[j] += now[i].at(-1);
      now[i] = now[i].slice(0, -1);
      left--;
      sfx.pop();
      draw();
      pop(cones[j].stack.lastChild);
      if (key(now) === key(goal)) {
        busy = true;
        hinter.reset();
        if (!missed) firstTry++;
        sfx.correct();
        cheer(row);
        speak('똑같이 만들었어요!');
        ctx.later(() => { r++; if (r >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
        return;
      }
      if (!left) {
        // 하트를 다 쓰면 처음 모양으로 돌아가 다시 (벌점 없음)
        busy = true;
        missed = true;
        hinter.miss();
        speak('하트를 다 썼어요. 처음부터 다시 해 봐요!');
        ctx.later(() => { now = start.slice(); left = hearts; busy = false; draw(); }, 1400);
      }
    }
    draw();
    speak('위의 아이스크림과 똑같이 만들어 봐요!');
  }

  ctx.prompt('위에 작게 보이는 아이스크림과 똑같아지도록, 맨 위 스쿱을 다른 콘으로 끌어 옮겨요. 하트만큼만 옮길 수 있어요!', () => speak('위의 아이스크림과 똑같이 만들어 봐요!'));
  round();
}
