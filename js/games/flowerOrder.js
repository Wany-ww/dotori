import { h, pick, pickN, shuffle, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 3;
const KINDS = ['🌸', '🌻', '🌼', '🌺', '🌷'];
// 단계별: 꽃 수, 기억할 차례 길이, 꽃 모양이 모두 같은지
const CFG = { 1: [2, 2, false], 2: [3, 3, false], 3: [4, 3, true], 4: [5, 4, true], 5: [6, 5, true] };
// 꽃밭 자리 (겹치지 않게 3×3 칸 안에서 조금씩 흔든다)
const SPOTS = Array.from({ length: 9 }, (_, i) => [16 + (i % 3) * 34, 18 + Math.floor(i / 3) * 32]);

// 순서 기억하기(Flowers): 꽃이 하나씩 피었다 지는 차례를 보고, 같은 차례로 꽃을 눌러 피운다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [n, len, same] = CFG[ctx.level];
  const hinter = makeHinter();
  const field = h('div', { class: 'flower-order' });
  stage.append(field);
  let r = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    const kind = pick(KINDS);
    const kinds = same ? Array(n).fill(kind) : pickN(KINDS, n);
    const flowers = shuffle(SPOTS).slice(0, n).map(([x, y], i) => {
      const b = h('button', {
        class: 'fo-flower',
        type: 'button',
        style: { left: `${x + (Math.random() * 10 - 5)}%`, top: `${y + (Math.random() * 10 - 5)}%` },
        'aria-label': `꽃 ${i + 1}`,
      }, kinds[i]);
      b.addEventListener('click', () => tap(i));
      return b;
    });
    field.replaceChildren(...flowers);
    // 같은 꽃이 두 번 연달아 나오지 않게 차례를 만든다
    const seq = [];
    while (seq.length < len) {
      const k = Math.floor(Math.random() * n);
      if (k !== seq.at(-1)) seq.push(k);
    }
    let at = 0;
    let ready = false;
    let missed = false;

    function play() {
      ready = false;
      at = 0;
      flowers.forEach((f) => f.classList.remove('on', 'bad'));
      seq.forEach((k, i) => {
        ctx.later(() => { flowers[k].classList.add('on'); sfx.sparkle(); }, 900 + i * 1000);
        ctx.later(() => flowers[k].classList.remove('on'), 900 + i * 1000 + 650);
      });
      ctx.later(() => { ready = true; speak('피어난 차례대로 꽃을 눌러요!'); }, 900 + seq.length * 1000);
    }
    function tap(k) {
      if (!ready) return;
      const f = flowers[k];
      if (k !== seq[at]) {
        // 틀리면 꽃이 시들고 차례를 다시 보여 준다 (벌점 없음)
        ready = false;
        missed = true;
        f.classList.add('bad');
        wiggle(f);
        hinter.miss();
        speak('다시 한번 잘 봐요!');
        ctx.later(() => { flowers.forEach((x) => x.classList.add('wilt')); }, 500);
        ctx.later(() => { flowers.forEach((x) => x.classList.remove('wilt')); play(); }, 1400);
        return;
      }
      f.classList.remove('on');
      void f.offsetWidth;
      f.classList.add('on');
      pop(f);
      sfx.pop();
      at++;
      if (at < seq.length) return;
      ready = false;
      if (!missed) firstTry++;
      flowers.forEach((x) => x.classList.add('on', 'spin'));
      sfx.correct();
      cheer(field);
      ctx.later(() => { r++; if (r >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
    }
    speak('꽃이 피는 차례를 잘 봐요!');
    play();
  }

  ctx.prompt('꽃이 하나씩 피었다 져요. 차례를 잘 기억했다가 같은 차례로 꽃을 눌러요!', () => speak('꽃이 피는 차례를 잘 봐요!'));
  round();
}
