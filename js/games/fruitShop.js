import { h, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const FRUITS = ['🍓', '🍎', '🍑', '🍊'];
// 단계별: 셈 종류와 수 범위
const CFG = [
  { ops: ['+'], sum: [10, 10] },
  { ops: ['+'], sum: [11, 13] },
  { ops: ['+'], sum: [11, 18] },
  { ops: ['-'], sum: [11, 18] },
  { ops: ['+', '-'], sum: [11, 18] },
];

// 과일 가게 덧셈(MangoShop · 과일 가게): 상자 두 개(10칸)의 과일을 옮겨 한 상자를 10으로 채우면 "10" 과일이 되고,
// 10과 남은 과일로 답을 넣는다. 빼기는 10 과일을 눌러 풀어서 덜어 낸다 (참고 영상 기준, 받아올림 · 받아내림)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const boxes = [0, 1].map(() => h('div', { class: 'fs-box' }));
  const eq = h('div', { class: 'fs-eq' });
  const keys = h('div', { class: 'fs-keys' });
  stage.append(h('div', { class: 'fruit-shop' }, h('div', { class: 'fs-boxes' }, boxes), h('div', { class: 'fs-counter' }, eq, keys)));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const op = pick(cfg.ops);
    const fruit = FRUITS[n % FRUITS.length];
    let a; let b; let ans;
    if (op === '+') { const s = randInt(...cfg.sum); a = randInt(Math.max(1, s - 9), Math.min(9, s - 1)); b = s - a; ans = s; }
    else { a = randInt(...cfg.sum); b = randInt(a - 9, 9); ans = a - b; }
    let missed = false;
    let phase = 'move';
    let taken = 0;
    const blanks = String(ans).split('').map(() => h('span', { class: 'fs-blank' }));
    eq.replaceChildren(h('span', { class: 'fs-q' }, `${a} ${op === '+' ? '+' : '−'} ${b}`), '=', ...blanks);
    keys.replaceChildren();
    keys.classList.remove('on');

    const berry = () => {
      const f = h('button', { class: 'fs-fruit', type: 'button', 'aria-label': '과일' }, fruit);
      f.addEventListener('click', () => tapFruit(f));
      return f;
    };
    const ten = () => {
      const t = h('button', { class: 'fs-ten', type: 'button', 'aria-label': '과일 10개' }, h('span', {}, fruit), h('b', {}, '10'));
      t.addEventListener('click', () => tapTen(t));
      return t;
    };
    const fill = (box, k) => box.replaceChildren(...Array.from({ length: k }, berry));
    const count = (box) => box.querySelectorAll('.fs-fruit:not(.gone)').length + box.querySelectorAll('.fs-ten').length * 10;
    if (op === '+') { fill(boxes[0], a); fill(boxes[1], b); }
    else { boxes[0].replaceChildren(ten()); fill(boxes[1], a - 10); }
    boxes.forEach((x) => x.classList.remove('done'));

    function tapFruit(f) {
      if (phase !== 'move' || f.classList.contains('gone')) return;
      const from = f.parentElement;
      if (op === '+') {
        // 다른 상자로 옮긴다. 상자는 10칸
        const to = boxes.find((x) => x !== from);
        if (count(to) >= 10) { wiggle(to); return; }
        to.append(f);
        sfx.pop();
        pop(f);
        const full = boxes.find((x) => count(x) === 10 && !x.querySelector('.fs-ten'));
        if (full) merge(full);
        return;
      }
      // 빼기: 눌러서 덜어 낸다
      f.classList.add('gone');
      taken++;
      sfx.tap();
      speak(String(taken));
      if (taken === b) ask();
    }

    function tapTen(t) {
      if (phase !== 'move' || op === '+') return;
      // 10 과일을 풀어 낱개 10개로 (덜어 낼 낱개가 모자랄 때)
      const box = t.parentElement;
      t.replaceWith(...Array.from({ length: 10 }, berry));
      sfx.sparkle();
      pop(box);
      speak('10을 낱개 10개로 풀었어요!');
    }

    function merge(box) {
      phase = 'merge';
      box.classList.add('merging');
      sfx.sparkle();
      ctx.later(() => {
        box.classList.remove('merging');
        box.replaceChildren(ten());
        box.classList.add('done');
        speak('10이 되었어요!');
        ask();
      }, 700);
    }

    // 답 넣기: 숫자판이 나오고 빈칸을 앞에서부터 채운다
    function ask() {
      phase = 'answer';
      keys.classList.add('on');
      const btns = Array.from({ length: 10 }, (_, d) => {
        const k = h('button', { class: 'fs-key', type: 'button' }, String(d));
        k.addEventListener('click', () => {
          if (phase !== 'answer') return;
          const i = blanks.findIndex((s) => !s.textContent);
          const want = String(ans)[i];
          if (String(d) !== want) { missed = true; wiggle(k); hinter.miss(btns[Number(want)]); return; }
          blanks[i].textContent = d;
          blanks[i].classList.add('in');
          sfx.pop();
          if (i === blanks.length - 1) win();
        });
        return k;
      });
      keys.replaceChildren(...btns);
    }

    function win() {
      phase = 'done';
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(eq);
      burst(eq, ['⭐', '✨', fruit]);
      speak([String(a), op === '+' ? '더하기' : '빼기', String(b), '는', String(ans)]);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2300);
    }

    ctx.prompt(op === '+' ? '과일을 눌러 다른 상자로 옮겨서 한 상자를 10개로 채워요! 그다음 답을 넣어요.' : `과일 ${b}개를 눌러 덜어 내요! 낱개가 모자라면 10 과일을 눌러 풀어요.`,
      () => speak(op === '+' ? '한 상자를 10개로 채워요!' : [String(b), '개를 덜어 내요!']));
  }

  round();
}
