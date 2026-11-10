import { h, shuffle, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 4;
// 동전: 값, 읽는 말, 그림 면
const COINS = {
  10: { say: '10원', art: '🏯' },
  50: { say: '50원', art: '🌾' },
  100: { say: '100원', art: '🧔' },
  500: { say: '500원', art: '🕊️' },
};
// 단계별: 쓰는 동전, 정답에 드는 동전 수, 더 놓는 동전 수, 그림 면도 보일지
const CFG = [
  { kinds: [100], need: [1, 4], extra: [1, 2], art: false },
  { kinds: [10, 100], need: [2, 4], extra: [1, 2], art: false },
  { kinds: [100, 500], need: [1, 3], extra: [2, 3], art: true },
  { kinds: [50, 100, 500], need: [2, 4], extra: [2, 3], art: true },
  { kinds: [10, 50, 100, 500], need: [3, 5], extra: [2, 3], art: true },
];

function coin(v, art) {
  return h('span', { class: `cs-coin v${v}${art ? ' art' : ''}`, 'aria-hidden': 'true' }, art ? COINS[v].art : v);
}

// 동전의 분류와 합(MoneyGameKR): 위 쟁반에 적힌 금액(500원, 1000원 …)이 되도록 아래 쟁반의 동전을 끌어 올린다.
// 동전은 숫자 면이나 그림 면(학 = 500원)으로 놓여 있어, 어떤 동전인지 알아보고 모아야 한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const goal = h('b', { class: 'cs-goal' });
  const sumEl = h('span', { class: 'cs-sum' });
  const top = h('div', { class: 'cs-top', 'aria-label': '모으는 쟁반' }, goal, sumEl);
  const bottom = h('div', { class: 'cs-bottom', 'aria-label': '동전 쟁반' });
  stage.append(h('div', { class: 'coin-sum' }, top, bottom));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const need = Array.from({ length: randInt(...cfg.need) }, () => pick(cfg.kinds));
    const target = need.reduce((a, b) => a + b, 0);
    const all = shuffle([...need, ...Array.from({ length: randInt(...cfg.extra) }, () => pick(cfg.kinds))]);
    let sum = 0;
    let missed = false;
    let done = false;
    goal.textContent = `${target}원`;
    const paint = () => { sumEl.textContent = `${sum}원`; };
    top.querySelectorAll('.cs-btn').forEach((x) => x.remove());
    paint();

    const move = (b, v) => {
      if (done) return;
      const up = b.parentElement === bottom;
      (up ? top : bottom).append(b);
      sum += up ? v : -v;
      sfx.pop();
      pop(b);
      speak(COINS[v].say);
      paint();
      if (sum === target) {
        done = true;
        if (!missed) firstTry++;
        hinter.reset();
        sfx.correct();
        cheer(top);
        ctx.later(() => speak('딱 맞아요!'), 700);
        ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2400);
      } else if (sum > target) {
        // 넘치면 알려 주고, 올린 동전을 눌러 내릴 수 있다
        missed = true;
        wiggle(goal);
        hinter.miss(null);
        speak('너무 많아요!');
      }
    };
    const els = all.map((v, i) => {
      const art = cfg.art && Math.random() < 0.45;
      const b = h('button', { class: 'cs-btn', type: 'button', 'aria-label': COINS[v].say, style: { '--r': `${randInt(-25, 25)}deg`, animationDelay: `${i * 0.05}s` } }, coin(v, art));
      draggable(b, {
        onDrop: (pt) => {
          const into = b.parentElement === bottom ? top : bottom;
          if (hits(into, pt, 0)) move(b, v); else wiggle(b);
        },
      });
      b.addEventListener('click', () => move(b, v));
      return b;
    });
    bottom.replaceChildren(...els);
    ctx.prompt('위 쟁반에 적힌 금액이 되도록, 아래 쟁반의 동전을 끌어 올려요. 동전을 다시 누르면 내려가요!',
      () => speak('금액에 맞게 동전을 모아요!'));
  }

  round();
}
