import { h, shuffle, pickN, pick, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SPELL_WORDS, EN_TOY_ALIKE } from '../data.js';

const R = 4;
const en = (t) => speak(t, 'en-US');
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SPIN = 14; // 한 줄이 멈추기 전까지 지나가는 글자 수
// 단계별: 단어 묶음, 그림 카드 수, 멈춘 뒤 단어를 읽어 줄지
const CFG = [
  { pool: () => SPELL_WORDS[3], cards: 2, read: true },
  { pool: () => SPELL_WORDS[3], cards: 2, read: false },
  { pool: () => SPELL_WORDS[4], cards: 3, read: false },
  { alike: true, cards: 3, read: false },
  { pool: () => SPELL_WORDS[5], cards: 3, read: false },
];

// 단어 맞히기(WordMachine): 단추를 누르면 글자 통이 돌다가 단어에서 멈춘다. 단어를 읽고 뜻이 맞는 그림을 고른다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const reels = h('div', { class: 'wm-reels' });
  const lever = h('button', { class: 'wm-lever', type: 'button', 'aria-label': '단어 기계 돌리기' });
  const left = h('div', { class: 'wm-slot' });
  const right = h('div', { class: 'wm-slot' });
  const extra = h('div', { class: 'wm-slot' });
  const row = h('div', { class: 'wm-row' }, left, lever, right);
  stage.append(h('div', { class: 'word-machine' }, h('div', { class: 'wm-box' }, reels), row, extra));
  // 그림 카드 자리: 둘이면 단추 양옆, 셋이면 아래에 하나 더
  const slots = [left, right, extra];
  const rounds = Array.from({ length: R }, () => null);
  const used = new Set();
  // 영어 차시: 오늘 단어로 기계를 돌린다
  const unitPool = ctx.unit ? ctx.unit.words(R + cfg.cards + 2, { spell: true, maxLen: 6 }) : null;
  for (let i = 0; i < R; i++) {
    if (unitPool) {
      const word = unitPool[i % unitPool.length];
      rounds[i] = { word, others: pickN(unitPool.filter((x) => x.w !== word.w), cfg.cards - 1) };
    } else if (cfg.alike) {
      const pair = pick(EN_TOY_ALIKE.filter((p) => !used.has(p[0][0])));
      used.add(pair[0][0]);
      const [a, b] = shuffle(pair).map(([w, e]) => ({ w, e }));
      const third = pick(SPELL_WORDS[3].filter((x) => x.w !== a.w && x.w !== b.w));
      rounds[i] = { word: a, others: [b, third] };
    } else {
      const pool = cfg.pool();
      const word = pick(pool.filter((x) => !used.has(x.w)));
      used.add(word.w);
      rounds[i] = { word, others: pickN(pool.filter((x) => x.w !== word.w), cfg.cards - 1) };
    }
  }
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const { word, others } = rounds[n];
    const W = word.w.toUpperCase();
    slots.forEach((s) => s.replaceChildren());
    extra.hidden = cfg.cards < 3;
    // 처음에는 아무 글자나 보이는 통
    reels.replaceChildren(...[...W].map(() => h('div', { class: 'wm-reel' }, h('div', { class: 'wm-strip' }, h('span', {}, pick([...ABC]))))));
    lever.disabled = false;
    lever.classList.add('ready');
    let spun = false;
    lever.onclick = () => {
      if (spun) return;
      spun = true;
      sfx.tap();
      lever.classList.remove('ready');
      lever.classList.add('pull');
      lever.disabled = true;
      spin();
    };

    // 통마다 글자 띠를 굴려서 왼쪽부터 차례로 단어 글자에서 멈춘다
    function spin() {
      const strips = [...W].map((c, i) => {
        const letters = [...Array.from({ length: SPIN + i * 4 }, () => pick([...ABC])), c];
        const strip = h('div', { class: 'wm-strip spin' }, letters.map((x) => h('span', {}, x)));
        strip.style.setProperty('--n', letters.length - 1);
        strip.style.setProperty('--t', `${0.9 + i * 0.45}s`);
        reels.children[i].replaceChildren(strip);
        return strip;
      });
      requestAnimationFrame(() => requestAnimationFrame(() => strips.forEach((s) => s.classList.add('stop'))));
      const stopAt = (0.9 + (W.length - 1) * 0.45) * 1000 + 250;
      [...W].forEach((_, i) => ctx.later(() => sfx.pop(), (0.9 + i * 0.45) * 1000));
      ctx.later(showCards, stopAt);
    }

    function showCards() {
      reels.classList.add('done');
      pop(reels);
      if (cfg.read) en(word.w);
      const opts = shuffle([word, ...others]).slice(0, cfg.cards);
      if (!opts.includes(word)) opts[0] = word;
      const cards = shuffle(opts).map((o, i) => {
        const c = h('button', { class: 'wm-card', type: 'button', style: { animationDelay: `${i * 0.12}s` }, 'aria-label': `그림 ${i + 1}` }, h('span', { 'aria-hidden': 'true' }, o.e));
        c.addEventListener('click', () => {
          if (o !== word) {
            wiggle(c);
            hinter.miss(cards.find((x) => x.dataset.w === word.w));
            return;
          }
          if (hinter.count === 0) firstTry++;
          hinter.reset();
          sfx.correct();
          c.classList.add('right');
          c.append(h('span', { class: 'wm-ok', 'aria-hidden': 'true' }, '☺'));
          cheer(c, 'en');
          en(word.w);
          cards.forEach((x) => { x.disabled = true; });
          ctx.later(() => {
            n++;
            reels.classList.remove('done');
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 2000);
        });
        c.dataset.w = o.w;
        return c;
      });
      cards.forEach((c, i) => slots[i].replaceChildren(c));
    }

    ctx.prompt(cfg.read ? '단추를 눌러 단어 기계를 돌려요. 나온 단어를 듣고, 알맞은 그림을 골라요!' : '단추를 눌러 단어 기계를 돌려요. 나온 단어를 읽고, 알맞은 그림을 골라요!',
      () => en('Push the button!'));
  }

  round();
}
