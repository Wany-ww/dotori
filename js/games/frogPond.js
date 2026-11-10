import { h, shuffle, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 6;
// 단계별 단: 1단 → 2단 → 5 · 10단 → 3 · 4단 → 6~9단
const DAN = [[1], [2], [5, 10], [3, 4], [6, 7, 8, 9]];
// 연잎 자리(%): 개구리가 뛰어갈 수 있는 곳
const SPOTS = [[18, 24], [42, 18], [68, 22], [86, 40], [30, 52], [56, 48], [78, 70], [20, 78], [46, 80]];

// 개구리 수직선 점프(FroggyHop · 연못 건너기): "1 × 3 = ?"을 보고 답이 적힌 연잎으로 개구리를 뛰게 해
// 한 단을 차례로 건너간다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const ask = h('div', { class: 'fp-ask', 'aria-live': 'polite' });
  const pond = h('div', { class: 'fp-pond' });
  const frog = h('span', { class: 'fp-frog', 'aria-hidden': 'true' }, '🐸');
  pond.append(h('span', { class: 'fp-rock', 'aria-hidden': 'true' }), frog);
  stage.append(h('div', { class: 'frog-pond' }, ask, pond));
  const dan = pick(DAN[L - 1]);
  // 1단계 · 2단계는 1부터 차례로, 그 위는 띄엄띄엄
  const ks = L <= 2 ? [1, 2, 3, 4, 5, 6] : shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, R).sort((a, b) => a - b);
  let n = 0;
  let firstTry = 0;
  let spot = [8, 86];
  const place = (el, [x, y]) => { el.style.left = `${x}%`; el.style.top = `${y}%`; };
  place(frog, spot);

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const k = ks[n];
    const ans = dan * k;
    let missed = false;
    let locked = false;
    ask.replaceChildren(`${dan} × ${k} = `, h('b', { class: 'q' }, '?'));
    // 보기: 답, 이웃한 곱, 곱하는 수 자체 등
    const opts = new Set([ans]);
    [dan * (k + 1), dan * (k - 1), k, ans + 1, dan + k, ans + dan * 2].forEach((v) => { if (opts.size < (L === 1 ? 3 : 5) && v > 0) opts.add(v); });
    const free = shuffle(SPOTS.filter(([x, y]) => Math.hypot(x - spot[0], y - spot[1]) > 18)).slice(0, opts.size);
    pond.querySelectorAll('.fp-pad:not(.home)').forEach((p) => p.remove());
    const pads = shuffle([...opts]).map((v, i) => {
      const p = h('button', { class: 'fp-pad', type: 'button', style: { animationDelay: `${i * 0.08}s` } }, String(v));
      place(p, free[i]);
      p.addEventListener('click', () => {
        if (locked) return;
        if (v !== ans) {
          missed = true;
          p.classList.add('sink');
          wiggle(p);
          hinter.miss(pads.find((x) => x.textContent === String(ans)));
          speak([String(dan), '곱하기', String(k)]);
          return;
        }
        locked = true;
        if (!missed) firstTry++;
        hinter.reset();
        spot = free[i];
        frog.classList.add('jump');
        place(frog, spot);
        ctx.later(() => frog.classList.remove('jump'), 500);
        p.classList.add('home');
        pads.forEach((x) => { if (x !== p) x.classList.add('gone'); });
        ask.replaceChildren(`${dan} × ${k} = `, h('b', {}, String(ans)));
        p.append(h('small', { class: 'fp-tag' }, `${dan}×${k}=${ans}`));
        sfx.correct();
        cheer(p);
        burst(p, ['💧', '⭐', '✨']);
        speak([String(dan), '곱하기', String(k), '는', String(ans)]);
        ctx.later(() => { pond.querySelectorAll('.fp-pad.home').forEach((x) => x !== p && x.remove()); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1700);
      });
      return p;
    });
    pond.append(...pads);
    pond.append(frog);
    ctx.prompt(`${dan}단을 건너가요! ${dan} × ${k}의 답이 적힌 연잎을 눌러 개구리를 뛰게 해요.`, () => speak([String(dan), '곱하기', String(k)]));
  }

  round();
}
