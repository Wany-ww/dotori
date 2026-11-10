import { h, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 3;
// 단계별: 누를 수의 개수, 가운데 수를 숨길지(기억하기), 시계 숫자를 숨길지, 처음에 자리를 살짝 비춰 줄지
const CFG = { 1: [1, false, false, true], 2: [1, true, false, false], 3: [2, true, false, false], 4: [3, true, false, false], 5: [2, false, true, false] };

// 뻐꾸기 시계(Cuckoo): 가운데에 나온 수를 보고, 시계 둘레에서 그 수의 자리를 차례대로 누른다.
// 높은 단계는 수를 기억했다가 누르고, 5단계는 숫자가 없는 시계에서 뻐꾸기가 알려 준 자리 하나로 자리를 찾는다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [count, hide, blank, peek] = CFG[ctx.level];
  const hinter = makeHinter();
  const center = h('div', { class: 'cu-center', 'aria-live': 'polite' });
  const ring = h('div', { class: `cu-ring${blank ? ' blank' : ''}` });
  const dots = h('div', { class: 'cu-dots', 'aria-hidden': 'true' });
  stage.append(h('div', { class: 'cuckoo-clock' }, dots, h('div', { class: 'cu-face' }, ring, center)));
  let r = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    dots.replaceChildren(...Array.from({ length: R }, (_, i) => h('i', { class: i < r ? 'done' : i === r ? 'now' : '' })));
    const seq = pickN(Array.from({ length: 12 }, (_, i) => i + 1), count);
    // 5단계: 뻐꾸기가 수 하나의 자리를 알려 준다 (누를 수와 겹치지 않게)
    const mark = blank ? pickN(Array.from({ length: 12 }, (_, i) => i + 1).filter((v) => !seq.includes(v)), 1)[0] : 0;
    let at = 0;
    let ready = false;
    let missed = false;
    const btns = Array.from({ length: 12 }, (_, i) => {
      const v = i + 1;
      const a = (v * 30 * Math.PI) / 180;
      const b = h('button', {
        class: `cu-num${v === mark ? ' mark' : ''}`,
        type: 'button',
        style: { left: `${50 + 41 * Math.sin(a)}%`, top: `${50 - 41 * Math.cos(a)}%` },
        'aria-label': blank && v !== mark ? '시계 자리' : String(v),
      }, v === mark ? h('span', { class: 'cu-bird', 'aria-hidden': 'true' }, '🐦') : null, h('b', {}, blank && v !== mark ? '' : String(v)));
      b.addEventListener('click', () => tap(v, b));
      return b;
    });
    ring.replaceChildren(...btns);
    const btnOf = (v) => btns[v - 1];
    center.className = 'cu-center ready';
    center.replaceChildren(h('b', {}, '준비'));
    speak('준비!');

    // 수를 하나씩 보여 준다
    const shown = [];
    seq.forEach((v, i) => {
      ctx.later(() => {
        shown.push(v);
        center.className = 'cu-center';
        center.replaceChildren(...shown.map((x) => h('b', { class: 'cu-chip' }, String(x))));
        sfx.sparkle();
        speak(String(v));
        if (peek) btnOf(v).classList.add('peek');
      }, 1200 + i * 1300);
    });
    ctx.later(() => {
      if (hide) center.replaceChildren(h('span', { class: 'cu-q' }, '?'));
      ready = true;
      btns.forEach((b) => b.classList.remove('peek'));
      speak(count > 1 ? '나온 차례대로 눌러요!' : '어디에 있을까요?');
    }, 1200 + seq.length * 1300 + (hide ? 700 : 0));

    function tap(v, b) {
      if (!ready) return;
      if (b.classList.contains('lit')) return;
      if (v !== seq[at]) {
        missed = true;
        wiggle(b);
        hinter.miss(btnOf(seq[at]));
        if (hide && hinter.count >= 2) center.replaceChildren(...seq.map((x, i) => h('b', { class: `cu-chip${i < at ? ' done' : ''}` }, String(x))));
        return;
      }
      hinter.reset();
      b.classList.add('lit');
      if (blank) b.querySelector('b').textContent = String(v);
      pop(b);
      sfx.pop();
      speak(String(v));
      at++;
      if (at < seq.length) return;
      ready = false;
      if (!missed) firstTry++;
      sfx.correct();
      cheer(ring);
      ctx.later(() => { r++; if (r >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1600);
    }
  }

  ctx.prompt(blank
    ? '숫자가 없는 시계예요. 뻐꾸기가 있는 자리를 보고, 가운데 수의 자리를 차례대로 눌러요!'
    : '가운데에 나온 수를 기억해서, 시계 둘레의 같은 수를 차례대로 눌러요!', () => speak('수의 자리를 눌러요!'));
  round();
}
