import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { numEn } from '../data.js';
import { CATEGORIES, EN_SHOP, SHOPPERS } from '../content.js';

const R = 3;
const KO_COUNT = ['한', '두', '세', '네', '다섯'];
const SHOP_CATS = ['fruit', 'veg', 'drink', 'snack'];
const cat = (id) => CATEGORIES.find((c) => c.id === id);
// 단계별: 주문 줄 수, 한 줄의 개수 범위, 주문서에 그림을 보여 줄지
const CFG = [
  { lines: 1, n: [1, 1], pic: true },
  { lines: 1, n: [2, 3], pic: true },
  { lines: 2, n: [1, 2], pic: true },
  { lines: 2, n: [1, 3], pic: false },
  { lines: 3, n: [1, 3], pic: false },
];
const MATH = [
  { lines: 1, n: [1, 3], pic: true },
  { lines: 1, n: [3, 5], pic: true },
  { lines: 2, n: [1, 4], pic: true },
  { lines: 2, n: [2, 5], pic: false },
  { lines: 3, n: [1, 5], pic: false },
];
const article = (w) => (/^[aeiou]/.test(w) ? 'an' : 'a');

// 동물 마트(WordGrocery): 동물 손님의 주문서를 보고 진열대에서 물건을 골라 바구니에 담는다.
// 한글: 갈래별("과일 2개") · 영어: 단어로("two apples") · 수학(opts.mode 'math'): 문장제("사과 3개와 바나나 2개")
export function mount(stage, ctx) {
  if (ctx.opts.mode === 'math') return findAll(stage, ctx);
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const math = ctx.opts.mode === 'math';
  const cfg = (math ? MATH : CFG)[L - 1];
  const lang = en ? 'en-US' : 'ko-KR';
  const hinter = makeHinter();
  const who = h('span', { class: 'gr-who', 'aria-hidden': 'true' });
  const order = h('div', { class: 'gr-order' });
  const shelf = h('div', { class: 'gr-shelf' });
  const cart = h('div', { class: 'gr-cart', 'aria-label': '바구니' });
  const done = h('button', { class: 'btn btn-primary gr-done', type: 'button' }, en ? '다 담았어요 (Done!)' : '다 담았어요');
  stage.append(h('div', { class: `grocery${en ? ' en' : ''}` }, h('div', { class: 'gr-counter' }, who, order), shelf, h('div', { class: 'gr-bottom' }, h('span', { class: 'gr-basket', 'aria-hidden': 'true' }, '🧺'), cart, done)));
  let r = 0;
  let firstTry = 0;

  // 진열대의 물건: { e, name, key(주문과 맞춰 보는 값) }
  function makeRound() {
    const n = () => randInt(cfg.n[0], cfg.n[1]);
    if (en) {
      const items = pickN(EN_SHOP, 8);
      const lines = pickN(items, cfg.lines).map((t) => ({ key: t[1], n: n(), e: t[0], text: '' }));
      lines.forEach((l) => { const t = items.find((x) => x[1] === l.key); l.text = l.n === 1 ? `${article(t[1])} ${t[1]}` : `${numEn(l.n)} ${t[2]}`; });
      return { lines, shelf: items.map((t) => ({ e: t[0], name: t[1], key: t[1] })), say: ['I want', ...lines.map((l) => l.text), 'please!'] };
    }
    if (math) {
      const items = pickN(SHOP_CATS.flatMap((id) => cat(id).items), 8);
      const lines = pickN(items, cfg.lines).map((t) => ({ key: t[1], n: n(), e: t[0], text: '' }));
      lines.forEach((l) => { l.text = `${l.key} ${l.n}개`; });
      return { lines, shelf: items.map((t) => ({ e: t[0], name: t[1], key: t[1] })), say: [...lines.map((l) => `${l.key} ${KO_COUNT[l.n - 1]} 개`), '주세요'] };
    }
    const cats = pickN(SHOP_CATS, cfg.lines);
    const lines = cats.map((id) => ({ key: id, n: n(), e: cat(id).e, text: '' }));
    lines.forEach((l) => { l.text = `${cat(l.key).ko} ${l.n}개`; });
    const shelfItems = shuffle(SHOP_CATS.flatMap((id) => pickN(cat(id).items, 2).map((t) => ({ e: t[0], name: t[1], key: id }))));
    return { lines, shelf: shelfItems, say: [...lines.map((l) => `${cat(l.key).ko} ${KO_COUNT[l.n - 1]} 개`), '주세요'] };
  }

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    const q = makeRound();
    let missed = false;
    const inCart = [];
    who.textContent = pick(SHOPPERS);
    who.classList.remove('happy');
    const lineEls = q.lines.map((l) => h('div', { class: 'gr-line', 'data-key': l.key, 'data-n': l.n },
      cfg.pic ? h('span', { class: 'gr-line-e', 'aria-hidden': 'true' }, l.e) : null,
      h('b', { class: en ? 'latin' : '' }, l.text)));
    order.replaceChildren(h('span', { class: 'gr-ear', role: 'button', tabindex: 0, 'aria-label': '주문 다시 듣기', onclick: () => speak(q.say, lang) }, '🔊'), ...lineEls);
    shelf.replaceChildren(...q.shelf.map((it, i) => {
      const b = h('button', { class: 'gr-item', type: 'button', style: { animationDelay: `${i * 0.05}s` }, 'aria-label': it.name },
        h('span', { 'aria-hidden': 'true' }, it.e), h('small', { class: en ? 'latin' : '' }, it.name));
      b.dataset.key = it.key;
      b.addEventListener('click', () => add(it, b));
      return b;
    }));
    cart.replaceChildren();

    function add(it, b) {
      if (inCart.length >= 12) { wiggle(b); return; }
      sfx.pop();
      pop(b);
      speak(it.name, lang);
      const c = h('button', { class: 'gr-in', type: 'button', 'aria-label': `${it.name} 빼기` }, it.e);
      c.addEventListener('click', () => { sfx.tap(); inCart.splice(inCart.indexOf(entry), 1); c.remove(); });
      const entry = { it, el: c };
      inCart.push(entry);
      cart.append(c);
    }

    done.onclick = () => {
      const count = (key) => inCart.filter((x) => x.it.key === key).length;
      const bad = q.lines.filter((l) => count(l.key) !== l.n);
      const extra = inCart.filter((x) => !q.lines.some((l) => l.key === x.it.key));
      if (bad.length || extra.length) {
        missed = true;
        wiggle(done);
        extra.forEach((x) => wiggle(x.el));
        bad.forEach((l) => wiggle(lineEls[q.lines.indexOf(l)]));
        // 모자라거나 넘친 줄을 반짝여 알려 준다
        hinter.miss(lineEls[q.lines.indexOf(bad[0] || q.lines[0])]);
        return;
      }
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      who.classList.add('happy');
      cheer(cart, en ? 'en' : 'ko');
      speak(en ? 'Thank you!' : '고마워요!', lang);
      ctx.later(() => {
        r++;
        if (r >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2000);
    };

    ctx.prompt(
      math ? '주문서의 문장을 읽고, 물건을 개수만큼 바구니에 담아요. 잘못 담은 것은 눌러서 빼요!'
        : en ? '동물 손님이 영어로 주문해요. 주문서를 보고 물건을 바구니에 담아요!'
          : '동물 손님이 원하는 것을 잘 보고, 종류에 맞는 물건을 개수만큼 담아요!',
      () => speak(q.say, lang),
    );
  }

  round();
}

// 동물 마트 수학판(WordGrocery · math): 손님이 "마실 것을 모두 찾아 주세요."라고 하면
// 진열대에서 그 종류를 모두 눌러 바구니에 담는다. 다른 것을 누르면 손님이 시무룩해진다 (참고 영상 기준)
const FIND = [
  { id: 'drink', say: '마실 것을 모두 찾아 주세요.', items: ['🥛', '🧃', '🧋', '🍵', '🥤', '🍼'], near: ['fruit', 'cake'] },
  { id: 'fruit', say: '과일을 모두 찾아 주세요.', items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍑'], near: ['veg'] },
  { id: 'veg', say: '채소를 모두 찾아 주세요.', items: ['🥕', '🍆', '🥒', '🥦', '🌽', '🫑', '🥔'], near: ['fruit'] },
  { id: 'bread', say: '빵을 모두 찾아 주세요.', items: ['🥐', '🍞', '🥖', '🥯', '🥨'], near: ['cake', 'cookie'] },
  { id: 'cake', say: '케이크를 모두 찾아 주세요.', items: ['🧁', '🍰', '🎂'], near: ['bread', 'cookie'] },
  { id: 'cookie', say: '쿠키를 모두 찾아 주세요.', items: ['🍪'], near: ['cake', 'bread'] },
];
// 단계별: 고를 수 있는 갈래, 진열대 칸 수, 찾을 물건 수, 비슷한 갈래를 섞을지
const FIND_CFG = [
  { cats: ['drink', 'fruit', 'veg'], spots: 6, k: [1, 2], near: false },
  { cats: ['drink', 'fruit', 'veg'], spots: 6, k: [2, 3], near: false },
  { cats: FIND.map((c) => c.id), spots: 6, k: [2, 3], near: true },
  { cats: FIND.map((c) => c.id), spots: 9, k: [2, 4], near: true },
  { cats: FIND.map((c) => c.id), spots: 9, k: [3, 4], near: true },
];
function findAll(stage, ctx) {
  const cfg = FIND_CFG[ctx.level - 1];
  const R = 4;
  const hinter = makeHinter();
  const bubble = h('div', { class: 'gf-bubble' });
  const pig = h('span', { class: 'gf-pig', 'aria-hidden': 'true' }, '🐷');
  const shelves = h('div', { class: 'gf-shelves' });
  const basket = h('div', { class: 'gf-basket', 'aria-label': '바구니' });
  stage.append(h('div', { class: 'grocery-find' }, h('span', { class: 'gf-awning', 'aria-hidden': 'true' }), h('div', { class: 'gf-shop' }, h('div', { class: 'gf-who' }, bubble, pig, basket), shelves)));
  let n = 0;
  let firstTry = 0;
  let last = '';

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let c;
    do { const id = pick(cfg.cats); c = FIND.find((x) => x.id === id); } while (c.id === last);
    last = c.id;
    const k = randInt(...cfg.k);
    const pool = shuffle(c.items);
    const want = Array.from({ length: k }, (_, i) => pool[i % pool.length]);
    const others = FIND.filter((x) => x.id !== c.id && cfg.cats.includes(x.id));
    const nearCats = cfg.near ? others.filter((x) => c.near.includes(x.id)) : [];
    // 다른 물건은 겹치지 않게: 비슷한 갈래 하나, 먼 갈래 하나씩 번갈아
    const nearPool = shuffle(nearCats.flatMap((x) => x.items));
    const farPool = shuffle(others.filter((x) => !nearCats.includes(x)).flatMap((x) => x.items));
    const rest = Array.from({ length: cfg.spots - k }, (_, i) => ((i % 2 === 0 && nearPool.length) || !farPool.length ? nearPool : farPool).shift());
    const goods = shuffle([...want.map((e) => ({ e, ok: true })), ...rest.map((e) => ({ e, ok: false }))]);
    let left = k;
    let missed = false;
    pig.classList.remove('sad', 'happy');
    basket.replaceChildren();
    bubble.replaceChildren(h('button', { class: 'gf-ear', type: 'button', 'aria-label': '다시 듣기', onclick: () => speak(c.say) }, '🔊'), h('span', {}, c.say));
    const els = goods.map((g, i) => {
      const b = h('button', { class: 'gf-item', type: 'button', 'aria-label': '물건', style: { animationDelay: `${i * 0.05}s` } }, g.e);
      b.addEventListener('click', () => {
        if (b.classList.contains('taken') || !left) return;
        if (!g.ok) {
          missed = true;
          wiggle(b);
          pig.classList.add('sad');
          ctx.later(() => pig.classList.remove('sad'), 1200);
          hinter.miss(els.find((x, j) => goods[j].ok && !x.classList.contains('taken')));
          return;
        }
        hinter.reset();
        sfx.pop();
        b.classList.add('taken');
        basket.append(h('span', { class: 'gf-in', 'aria-hidden': 'true' }, g.e));
        pig.classList.add('happy');
        ctx.later(() => pig.classList.remove('happy'), 700);
        left--;
        if (left) return;
        if (!missed) firstTry++;
        sfx.correct();
        cheer(basket);
        speak('고마워요!');
        ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
      });
      return b;
    });
    shelves.style.setProperty('--rows', cfg.spots / 3);
    shelves.replaceChildren(...els);
    ctx.prompt('돼지 손님의 말을 듣고, 진열대에서 알맞은 물건을 모두 눌러 바구니에 담아요!', () => speak(c.say));
  }
  round();
}
