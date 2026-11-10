import { h, shuffle, pick, pickN, wiggle, cheer, makeHinter, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { QUIZ_SYLLABLES, QUIZ_BATCHIM, similarSyllables } from '../data.js';

const R = 5;
const COUNT = [6, 7, 8, 9, 10];
const MATCHES = [2, 2, 3, 3, 3];
const GEMS = ['pink', 'sky', 'lilac', 'mint', 'peach'];

export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const pool = L >= 4 ? [...QUIZ_BATCHIM, ...pickN(QUIZ_SYLLABLES, 6)] : QUIZ_SYLLABLES;
  // 한글 차시: 그 차시의 글자를 캐고, 함정 보석은 그 차시에서 헷갈리는 글자
  const targets = lesson ? lesson.syllables(R) : pickN(pool, R);
  const fillers = lesson ? lesson.syllables(16) : QUIZ_SYLLABLES;
  const hinter = makeHinter();
  const root = h('div', { class: 'mine' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const t = targets[n];
    const need = MATCHES[L - 1];
    // Lv1~2는 모양이 확실히 다른 글자, Lv3부터는 모음·자음이 비슷한 함정 글자
    const near = lesson ? lesson.alike(t, 4) : similarSyllables(t);
    const others = L >= 3 && near.length
      ? near
      : shuffle(fillers.filter((s) => s !== t));
    const fakes = Array.from({ length: COUNT[L - 1] - need }, (_, i) => others[i % Math.min(others.length, L >= 3 ? 4 : 99)]);
    const letters = shuffle([...Array(need).fill(t), ...fakes]);
    let found = 0;
    let roundMiss = 0;
    const cartCount = h('b', {}, '0');
    const cart = h('div', { class: 'mine-cart', 'aria-label': `캔 보석 0 / ${need}` }, '🛒 ', cartCount, ` / ${need}`);

    const jewels = letters.map((s, i) => {
      const b = h('button', { class: `jewel-hex gem-${pick(GEMS)}`, type: 'button', 'data-s': s, style: { animationDelay: `${(i % 5) * 0.25}s` } },
        h('span', {}, s));
      b.addEventListener('click', () => {
        if (b.disabled) return;
        speak(s);
        if (s !== t) {
          roundMiss++;
          wiggle(b);
          hinter.miss(jewels.find((j) => !j.disabled && j.dataset.s === t));
          return;
        }
        hinter.reset();
        b.disabled = true;
        b.classList.add('mined');
        sfx.correct();
        const cr = cart.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        b.animate([{ transform: 'none' }, { transform: `translate(${cr.left - br.left}px, ${cr.top - br.top}px) scale(.3)`, opacity: 0.2 }],
          { duration: 600, easing: 'ease-in', fill: 'forwards' });
        found++;
        cartCount.textContent = String(found);
        if (found < need) return;
        total++;
        if (roundMiss === 0) firstTry++;
        cheer(cart);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total });
          else round();
        }, 1500);
      });
      return b;
    });

    root.replaceChildren(
      h('div', { class: 'mine-top' },
        h('div', { class: 'mine-sign' }, h('span', { class: 'mine-miner', 'aria-hidden': 'true' }, charFace('mole', '🐿️')),
          h('span', { class: 'mine-board' }, L >= 5 ? '🔊' : t)),
        cart),
      h('div', { class: 'jewel-wall' }, jewels),
    );
    ctx.prompt(
      L >= 5 ? `소리를 잘 듣고, 같은 글자 보석을 ${need}개 모두 캐요!` : `'${t}' 보석을 ${need}개 모두 찾아 캐요!`,
      () => speak([t, '보석을 찾아 줘!']),
    );
  }

  round();
}
