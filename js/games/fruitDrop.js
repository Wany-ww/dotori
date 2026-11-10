import { h, shuffle, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable } from './dragTap.js';

const R = 4;
const COLORS = ['#F39A3B', '#F5C531', '#8CCB4E', '#35B6D8', '#9C6BE0', '#F06C9B'];
const FRUITS = ['🍅', '🍎', '🍐', '🍉', '🍑', '🍊'];
const range = (a, k, s = 1) => Array.from({ length: k }, (_, i) => a + i * s);
// 단계별: 몸통 수 차례 만들기, 몸 크기가 수에 따라 커지는지(크기도 단서), 섞을 때 몇 번 바꾸는지
const CFG = [
  { seq: () => range(1, 3), grow: true, swaps: 1 },
  { seq: () => range(1, 5), grow: true, swaps: 2 },
  { seq: () => range(randInt(3, 15), 5), grow: true, swaps: 3 },
  { seq: () => { const s = pick([2, 5, 10]); return range(s, 5, s); }, grow: false, swaps: 4 },
  { seq: () => { const s = new Set(); while (s.size < 5) s.add(randInt(10, 99)); return [...s].sort((a, b) => a - b); }, grow: false, swaps: 4 },
];

// 배고픈 애벌레(HungryCaterpillar): 과일이 쿵 떨어지자 놀란 애벌레의 몸통이 뒤죽박죽이 된다.
// 몸통을 끌어 옮기거나 둘을 차례로 눌러 바꿔서 작은 수부터 차례대로 맞추면 과일을 먹는다 (참고 영상 "과일이 쿵!" 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const body = h('div', { class: 'fd-body' });
  const fruit = h('div', { class: 'fd-fruit', 'aria-hidden': 'true' });
  const thud = h('b', { class: 'fd-thud', 'aria-hidden': 'true' }, '쿵!');
  const ground = h('div', { class: 'fd-ground' }, body, fruit, thud);
  stage.append(h('div', { class: 'fruit-drop' }, ground));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const seq = cfg.seq();
    const last = seq.length - 1;
    let locked = true;
    let missed = false;
    let misses = 0;
    let sel = null;
    // 몸통: 맨 끝(가장 큰 수)이 머리. 크기는 차례(자리)가 아니라 수에 따라 정한다
    const segs = seq.map((v, i) => {
      const s = h('button', { class: `fd-seg${i === last ? ' head' : ''}`, type: 'button', style: { '--c': COLORS[i % COLORS.length], '--s': cfg.grow ? 0.72 + (0.28 * i) / last : 0.92 }, 'aria-label': `${v} 몸통` },
        i === last ? h('span', { class: 'fd-eyes', 'aria-hidden': 'true' }, h('i'), h('i')) : null, h('b', {}, String(v)));
      s.dataset.v = v;
      draggable(s, {
        can: () => !locked,
        onDrop: (pt) => {
          // 놓은 자리 앞뒤의 몸통 사이로 끼워 넣는다
          const others = [...body.children].filter((x) => x !== s);
          const at = others.findIndex((x) => { const b = x.getBoundingClientRect(); return pt.x < b.left + b.width / 2; });
          if (at < 0) body.append(s); else body.insertBefore(s, others[at]);
          moved();
        },
      });
      s.addEventListener('click', () => {
        if (locked) return;
        sfx.tap();
        speak(String(v));
        if (!sel) { sel = s; s.classList.add('sel'); return; }
        if (sel === s) { s.classList.remove('sel'); sel = null; return; }
        // 둘을 차례로 누르면 자리를 바꾼다
        const a = sel; sel = null; a.classList.remove('sel');
        const mark = document.createComment('');
        body.replaceChild(mark, a);
        body.replaceChild(a, s);
        body.replaceChild(s, mark);
        moved();
      });
      return s;
    });
    body.replaceChildren(...segs);
    body.className = 'fd-body walk';
    fruit.className = 'fd-fruit';
    fruit.textContent = FRUITS[n % FRUITS.length];
    thud.classList.remove('on');
    const right = () => [...body.children].filter((x, i) => Number(x.dataset.v) === seq[i]).length;
    let best = 0;

    // 걷다가 → 과일이 쿵 → 몸통이 뒤죽박죽
    ctx.later(() => { fruit.classList.add('drop'); }, 700);
    ctx.later(() => { thud.classList.add('on'); sfx.chomp(); ground.classList.add('shake'); body.classList.remove('walk'); body.classList.add('jolt'); }, 1150);
    ctx.later(() => {
      ground.classList.remove('shake');
      body.classList.remove('jolt');
      thud.classList.remove('on');
      let order;
      do {
        order = [...segs];
        for (let k = 0; k < cfg.swaps; k++) { const i = randInt(0, last); let j = randInt(0, last); if (j === i) j = (i + 1) % seq.length; [order[i], order[j]] = [order[j], order[i]]; }
      } while (order.every((x, i) => x === segs[i]));
      body.replaceChildren(...order);
      order.forEach((x) => pop(x));
      best = right();
      locked = false;
    }, 1700);

    function moved() {
      sfx.pop();
      const now = right();
      if (now === seq.length) { win(); return; }
      // 맞은 몸통 수가 늘지 않으면 실수로 센다. 두 번째부터 첫 번째로 틀린 자리에 올 몸통을 반짝여 준다
      if (now <= best) {
        missed = true;
        misses++;
        hinter.miss(misses >= 2 ? segs[[...body.children].findIndex((x, i) => Number(x.dataset.v) !== seq[i])] : null);
      }
      best = Math.max(best, now);
    }

    function win() {
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      body.classList.add('happy');
      cheer(body);
      speak([...seq.map(String), '냠냠! 과일을 먹었어요!']);
      ctx.later(() => { fruit.classList.add('eaten'); sfx.chomp(); burst(fruit, ['💛', '❤️', '✨']); }, 600 + seq.length * 420);
      ctx.later(() => { body.classList.remove('happy'); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1900 + seq.length * 420);
    }

    ctx.prompt('과일이 쿵! 애벌레 몸통이 뒤죽박죽이 되었어요. 작은 수부터 차례대로 맞춰 주세요! 몸통을 끌거나 둘을 차례로 눌러 바꿔요.',
      () => speak('몸통을 작은 수부터 차례대로 맞춰 주세요!'));
  }

  round();
}
