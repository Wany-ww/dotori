import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { STICKY } from '../data.js';

const R = 5;
// 단계별: 빈칸 수, 빈칸마다 틀린 맞춤법 조각 수, 뜻이 다른 낱말 조각 수
const CFG = [
  { blanks: 1, wrong: 0, other: 1 },
  { blanks: 1, wrong: 0, other: 1 },
  { blanks: 1, wrong: 1, other: 1 },
  { blanks: 2, wrong: 1, other: 0 },
  { blanks: 2, wrong: 2, other: 0 },
];

export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = { ...CFG[L - 1] };
  // 한글 차시(소리와 글자가 다른 낱말): 그 차시의 문장, 빈칸에는 바른 철자와 소리 나는 대로 쓴 철자가 섞인다
  const ruleItems = ctx.lesson?.kind === 'rule'
    ? ctx.lesson.sentences(R).filter((s) => s.blank).map((s) => ({ e: s.e, parts: [s.blank.before, [s.blank.answer, ...s.blank.wrong], s.blank.after] }))
    : [];
  if (ruleItems.length >= 3) Object.assign(cfg, { blanks: 1, wrong: 2, other: 0 });
  const items = ruleItems.length >= 3 ? ruleItems : pickN(STICKY, R);
  const RN = items.length;
  const hinter = makeHinter();
  const root = h('div', { class: 'sticky' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, RN);
    const it = items[n];
    const gaps = it.parts.filter(Array.isArray);
    const open = gaps.slice(0, cfg.blanks);
    const full = it.parts.map((p) => (Array.isArray(p) ? p[0] : p)).join('');
    const answers = open.map((g) => g[0]);
    const others = shuffle(STICKY.filter((s) => s !== it).flatMap((s) => s.parts.filter(Array.isArray).map((g) => g[0])))
      .filter((w) => !answers.includes(w)).slice(0, cfg.other);
    const pieces = shuffle([...open.flatMap((g) => [g[0], ...g.slice(1, 1 + cfg.wrong)]), ...others]);

    const blanks = [];
    const line = it.parts.map((p) => {
      if (!Array.isArray(p)) return h('span', {}, p);
      if (!open.includes(p)) return h('span', {}, p[0]);
      const el = h('span', { class: 'sticky-blank', 'data-answer': p[0], style: { minWidth: `${p[0].length * 1.1 + 0.6}em` } }, '');
      blanks.push(el);
      return el;
    });
    let k = 0;
    let roundMiss = 0;
    const mark = () => blanks.forEach((el, i) => el.classList.toggle('active', i === k));

    const tiles = pieces.map((w) => {
      const t = h('button', { class: 'word-tile sticky-tile', type: 'button' }, w);
      t.addEventListener('click', () => {
        if (t.disabled || k >= blanks.length) return;
        const want = blanks[k].dataset.answer;
        if (w !== want) {
          roundMiss++;
          wiggle(t);
          hinter.miss(tiles.find((x) => !x.disabled && x.textContent.replace('👆', '') === want));
          return;
        }
        hinter.reset();
        t.disabled = true;
        t.classList.add('used');
        blanks[k].textContent = w;
        blanks[k].classList.add('filled');
        pop(blanks[k]);
        sfx.pop();
        k++;
        mark();
        if (k < blanks.length) return;
        if (roundMiss === 0) firstTry++;
        sfx.correct();
        cheer(blanks[k - 1]);
        speak(full);
        ctx.later(() => {
          n++;
          if (n >= RN) ctx.finish({ firstTry, total: RN });
          else round();
        }, 2300);
      });
      return t;
    });

    root.replaceChildren(
      h('div', { class: 'sticky-paper' },
        h('div', { class: 'sticky-pic', 'aria-hidden': 'true' }, it.e),
        h('p', { class: 'sticky-line' }, line)),
      h('div', { class: 'word-tray' }, tiles),
    );
    mark();
    ctx.prompt(
      cfg.wrong ? '바르게 쓴 종이 조각을 찾아 빈칸에 붙여요! 비슷하게 생긴 조각을 조심해요.' : '문장을 듣고, 빈칸에 알맞은 종이 조각을 붙여요.',
      () => speak(full),
      { auto: L < 5 },
    );
  }

  round();
}
