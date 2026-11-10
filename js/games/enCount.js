import { h, shuffle, pickN, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_COUNT_ITEMS, COUNT_ITEMS, NATIVE_NUM, numEn } from '../data.js';

const R = 5;
// 단계별: 세는 수의 범위, 카드 수, 카드에 점(수만큼)이 보이는지, 카드에 영어 낱말이 함께 있는지
const CFG = [
  { min: 1, max: 3, cards: 2, dots: true },
  { min: 1, max: 5, cards: 2, dots: true },
  { min: 3, max: 10, cards: 3, dots: true },
  { min: 4, max: 10, cards: 3, dots: false },
  { min: 11, max: 20, cards: 3, dots: false, words: true },
];
// 수 세기 기초(BasicCounting · 수학 CountingMC): 위의 물건을 하나씩 눌러 세고, 아래 숫자 카드 중 맞는 수를 고른다.
// 영어판은 one, two…로, 수학판(ctx.lang 'ko')은 하나, 둘…로 센다
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  const en = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  const word = (k) => (ko ? NATIVE_NUM[k - 1] : numEn(k));
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const things = h('div', { class: 'ec-things', 'aria-label': '세어 볼 물건' });
  const cards = h('div', { class: 'ec-cards' });
  stage.append(h('div', { class: 'en-count' }, things, h('div', { class: 'ec-line', 'aria-hidden': 'true' }), cards));
  const span = cfg.max - cfg.min + 1;
  const counts = shuffle([...Array(span).keys()].map((i) => cfg.min + i));
  const items = pickN(ko ? COUNT_ITEMS : EN_COUNT_ITEMS, R);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const total = counts[n % counts.length];
    const it = items[n];
    const noun = (k) => (k === 1 ? it.one : it.many);
    let counted = 0;
    let done = false;

    // 열 개씩 한 줄 (열이 넘으면 두 줄로 나눠 세기 쉽게)
    const perRow = total > 10 ? 10 : total > 5 ? 5 : total;
    things.classList.toggle('big', total > 10);
    things.replaceChildren(...Array.from({ length: Math.ceil(total / perRow) }, (_, r) => h('div', { class: 'ec-row' },
      Array.from({ length: Math.min(perRow, total - r * perRow) }, () => {
        const b = h('button', { class: 'ec-thing', type: 'button', 'aria-label': '하나 세기' }, it.e);
        b.addEventListener('click', () => {
          if (b.dataset.n || done) { wiggle(b); return; }
          counted++;
          b.dataset.n = counted;
          b.classList.add('counted');
          b.append(h('span', { class: 'ec-badge' }, counted));
          sfx.pop();
          en(word(counted));
        });
        return b;
      }))));

    const near = [total - 2, total - 1, total + 1, total + 2].filter((x) => x >= Math.max(1, cfg.min - 2) && x <= cfg.max + 2);
    const nums = shuffle([total, ...pickN(near, cfg.cards - 1)]);
    const btns = nums.map((k, i) => {
      const b = h('button', { class: 'ec-card', type: 'button', style: { animationDelay: `${0.15 + i * 0.18}s` }, 'aria-label': `${k} (${word(k)})` },
        cfg.dots ? h('span', { class: 'ec-dots', 'aria-hidden': 'true' }, Array.from({ length: k }, () => h('i'))) : null,
        h('b', {}, k),
        cfg.words ? h('small', {}, word(k)) : null);
      b.addEventListener('click', () => {
        if (done) return;
        if (k !== total) {
          en(ko ? String(k) : numEn(k));
          wiggle(b);
          hinter.miss(btns[nums.indexOf(total)]);
          return;
        }
        done = true;
        if (hinter.count === 0) firstTry++;
        hinter.reset();
        sfx.correct();
        b.classList.add('right');
        b.append(h('span', { class: 'ec-check', 'aria-hidden': 'true' }, '✔'));
        btns.forEach((x) => { if (x !== b) x.classList.add('back'); });
        cheer(b, ko ? 'ko' : 'en');
        en(ko ? ['모두', word(total)] : [numEn(total), noun(total)]);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 2200);
      });
      return b;
    });
    cards.replaceChildren(...btns);
    if (ko) ctx.prompt(`${it.e} 몇 개일까요? 하나씩 눌러 세어 보고, 맞는 숫자 카드를 골라요!`, () => en([it.q, '모두 몇 개일까요?']));
    else ctx.prompt(`${it.e} How many ${it.many}? Tap and count them, then pick the number card!`, () => en(`How many ${it.many}?`));
  }

  round();
}
