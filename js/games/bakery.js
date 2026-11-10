import { h, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 5;
// 수 뒤 조사: 12가 · 13이
const iga = (v) => ([2, 4, 5, 9].includes(v % 10) ? '가' : '이');
const COOKIES = ['🍪', '🍩', '🧁', '🥯', '🥮'];
// 단계별: 앞 다이얼 수(줄마다 몇 개), 주문 수 범위, 앞 다이얼도 돌리는지
const CFG = [
  { a: [2, 2], top: 10 },
  { a: [2, 3], top: 15 },
  { a: [2, 5], top: 25 },
  { a: [3, 9], top: 45 },
  { a: [2, 6], top: 36, both: true },
];

// 빵집 연산(BakeryMath · 쿠키 만들기): 주문 수(12)를 보고 반죽 기계의 다이얼(3 × ?)을 돌리면
// 쟁반에 반죽이 줄줄이 놓인다. 3 × 4 = 12가 되면 ✓를 눌러 쿠키를 굽는다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const order = h('div', { class: 'bk-order' });
  const tray = h('div', { class: 'bk-tray' });
  const dials = [0, 1].map(() => h('div', { class: 'bk-dial' }));
  const ok = h('button', { class: 'bk-ok', type: 'button', 'aria-label': '굽기' }, '✓');
  const machine = h('div', { class: 'bk-machine' }, h('div', { class: 'bk-dials' }, dials[0], h('b', {}, '×'), dials[1]), ok);
  stage.append(h('div', { class: 'bakery' }, h('div', { class: 'bk-oven' }, tray), h('div', { class: 'bk-right' }, order, machine)));
  let n = 0;
  let firstTry = 0;
  const used = [];

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let a0; let b0;
    do { a0 = randInt(...cfg.a); b0 = randInt(2, Math.min(9, Math.floor(cfg.top / a0))); } while (used.includes(a0 * b0));
    const target = a0 * b0;
    used.push(target);
    const val = [cfg.both ? 1 : a0, 0];
    let missed = false;
    let locked = false;
    const cookie = pick(COOKIES);
    order.replaceChildren(h('span', { class: 'bk-num' }, String(target)));
    ok.classList.remove('lit');

    // 다이얼: 위 · 아래를 눌러 돌린다 (앞 다이얼은 높은 단계에서만 돌아간다)
    dials.forEach((d, i) => {
      const fixed = i === 0 && !cfg.both;
      const up = h('button', { class: 'bk-turn', type: 'button', 'aria-label': '하나 더', disabled: fixed }, '▲');
      const down = h('button', { class: 'bk-turn', type: 'button', 'aria-label': '하나 덜', disabled: fixed }, '▼');
      const show = h('span', { class: 'bk-val' });
      d.replaceChildren(up, show, down);
      d.classList.toggle('fixed', fixed);
      const turn = (dv) => {
        if (locked) return;
        const v = Math.max(i === 0 ? 1 : 0, Math.min(10, val[i] + dv));
        if (v === val[i]) { wiggle(d); return; }
        val[i] = v;
        sfx.tap();
        paint();
        pop(show);
      };
      up.addEventListener('click', () => turn(1));
      down.addEventListener('click', () => turn(-1));
    });

    // 쟁반: 앞 수만큼 한 줄, 뒤 수만큼 줄이 생긴다 (뒤 수가 0이면 점선 자리만)
    function paint() {
      dials.forEach((d, i) => { d.querySelector('.bk-val').textContent = val[i]; });
      const [c, r] = val;
      tray.style.setProperty('--c', c);
      tray.replaceChildren(...(r === 0 ? Array.from({ length: c }, () => h('i', { class: 'bk-spot' })) : Array.from({ length: c * r }, () => h('i', { class: 'bk-dough' }))));
      ok.classList.toggle('lit', c * r === target);
    }
    paint();

    ok.onclick = () => {
      if (locked) return;
      const [c, r] = val;
      if (c * r !== target) {
        missed = true;
        wiggle(ok);
        speak(c * r > target ? '반죽이 너무 많아요!' : '반죽이 모자라요!');
        hinter.miss(dials[1]);
        return;
      }
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      order.replaceChildren(h('span', { class: 'bk-num eq' }, `${c} × ${r} = ${target}`));
      tray.classList.add('bake');
      ctx.later(() => { tray.replaceChildren(...Array.from({ length: c * r }, () => h('i', { class: 'bk-cookie' }, cookie))); tray.classList.remove('bake'); }, 700);
      sfx.correct();
      cheer(order);
      burst(tray, ['⭐', '✨', cookie]);
      speak([String(c), '곱하기', String(r), '는', String(target)]);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2600);
    };
    ctx.prompt(cfg.both ? `쿠키 ${target}개를 구워요! 두 다이얼을 돌려 곱이 ${target}${iga(target)} 되게 하고 ✓를 눌러요.` : `쿠키 ${target}개를 구워요! 다이얼을 돌려 ${a0} × ? = ${target}${iga(target)} 되게 하고 ✓를 눌러요.`,
      () => speak(['쿠키', `${target}개!`]));
  }

  round();
}
