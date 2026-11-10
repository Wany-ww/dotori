import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SPELL_WORDS } from '../data.js';

const R = 5;
const CFG = [
  { pool: [3], ghost: true, extra: 0 },
  { pool: [3], ghost: false, extra: 1 },
  { pool: [4], ghost: false, extra: 1 },
  { pool: [4, 5], ghost: false, extra: 2 },
  { pool: [5], ghost: false, extra: 2 },
];
const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  // 영어 차시: 오늘 단어 중 단계에 맞는 길이로
  const words = ctx.unit ? ctx.unit.words(R, { spell: true, minLen: 3, maxLen: Math.max(...cfg.pool) + 1 }) : pickN(cfg.pool.flatMap((len) => SPELL_WORDS[len]), R);
  const hinter = makeHinter();
  const root = h('div', { class: 'spell' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const w = words[n];
    const letters = w.w.split('');
    const extras = pickN(ABC.filter((c) => !letters.includes(c)), cfg.extra);
    const slots = letters.map((c) => h('span', { class: `spell-slot${cfg.ghost ? ' ghost' : ''}` }, cfg.ghost ? c : ''));
    const bubbles = shuffle([...letters, ...extras]).map((c, i) => h('button', {
      class: 'spell-bubble',
      type: 'button',
      'data-letter': c,
      style: { animationDelay: `${(i % 4) * 0.4}s` },
      'aria-label': `${c} 거품`,
    }, c));
    let k = 0;
    let roundMiss = 0;
    const expected = () => bubbles.find((b) => !b.disabled && b.dataset.letter === letters[k]);

    bubbles.forEach((b) => {
      b.addEventListener('click', () => {
        if (b.disabled || k >= letters.length) return;
        if (b.dataset.letter !== letters[k]) {
          roundMiss++;
          wiggle(b);
          hinter.miss(expected());
          return;
        }
        hinter.reset();
        b.disabled = true;
        b.classList.add('popped');
        slots[k].textContent = letters[k];
        slots[k].classList.remove('ghost');
        slots[k].classList.add('filled');
        pop(slots[k]);
        sfx.pop();
        k++;
        if (k < letters.length) {
          speak(letters[k - 1], 'en-US');
          return;
        }
        if (roundMiss === 0) firstTry++;
        sfx.correct();
        cheer(slots[k - 1], 'en');
        speak([...letters, w.w], 'en-US');
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 2400);
      });
    });

    root.replaceChildren(
      h('div', { class: 'big-pic', 'aria-hidden': 'true' }, w.e),
      h('div', { class: 'spell-row latin', 'aria-label': '단어 칸' }, slots),
      h('div', { class: 'bubble-sea' }, bubbles),
    );
    ctx.prompt('그림을 보고, 알파벳 거품을 순서대로 눌러 단어를 만들어요!', () => speak(w.w, 'en-US'));
  }

  round();
}
