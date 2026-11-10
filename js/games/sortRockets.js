import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CATEGORIES, NEAR_CATS } from '../content.js';
import { draggable, hits } from './dragTap.js';

const R = 3;
const NS = 'http://www.w3.org/2000/svg';
// 단계별: 카드 수, 실을 카드 수, 그림을 보여 줄지, 헷갈리는 갈래를 섞을지
const CFG = [
  { cards: 4, match: 2, pic: true, near: false },
  { cards: 6, match: 3, pic: true, near: false },
  { cards: 6, match: 3, pic: false, near: false },
  { cards: 8, match: 4, pic: true, near: true },
  { cards: 8, match: 4, pic: false, near: true },
];

// 수학 속성별 분류: 색 · 모양 · 크기
const COLORS = [['red', '빨간', '#E8574F'], ['blue', '파란', '#4A90E2'], ['yellow', '노란', '#F2C230'], ['green', '초록', '#5DBB63']];
const SHAPES = [['circle', '동그라미'], ['triangle', '세모'], ['square', '네모'], ['star', '별']];
const PATHS = {
  circle: 'M50 14a36 36 0 1 0 0.1 0Z', square: 'M18 18H82V82H18Z', triangle: 'M50 12L88 84H12Z',
  star: 'M50 8L61 38H93L67 57L77 89L50 70L23 89L33 57L7 38H39Z',
};
function shapeEl({ c, s, big }) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `sr-shape${big ? ' big' : ''}`);
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', PATHS[s[0]]);
  p.setAttribute('fill', c[2]);
  p.setAttribute('stroke', 'rgba(0,0,0,.2)');
  p.setAttribute('stroke-width', '4');
  svg.append(p);
  return svg;
}
// 수학: 단계별 조건 (색 → 모양 → 크기 → 색+모양 → 색+모양+크기)
function mathRound(L, cfg) {
  const all = COLORS.flatMap((c) => SHAPES.flatMap((s) => [true, false].map((big) => ({ c, s, big }))));
  const kinds = ['color', 'shape', 'size', 'color+shape', 'all'][L - 1];
  const t = pick(all);
  const test = {
    color: (x) => x.c === t.c,
    shape: (x) => x.s === t.s,
    size: (x) => x.big === t.big,
    'color+shape': (x) => x.c === t.c && x.s === t.s,
    all: (x) => x.c === t.c && x.s === t.s && x.big === t.big,
  }[kinds];
  const label = {
    color: `${t.c[1]}색 도형`, shape: `${t.s[1]}`, size: t.big ? '큰 도형' : '작은 도형',
    'color+shape': `${t.c[1]} ${t.s[1]}`, all: `${t.big ? '큰' : '작은'} ${t.c[1]} ${t.s[1]}`,
  }[kinds];
  const yes = shuffle(all.filter(test));
  const no = shuffle(all.filter((x) => !test(x)));
  const match = Math.min(cfg.match, yes.length);
  // 같은 물건이 두 번 나오는 것은 괜찮다 (조건이 좁으면 맞는 도형이 하나뿐일 수 있다)
  const picks = Array.from({ length: match }, (_, i) => yes[i % yes.length]);
  const cards = shuffle([...picks.map((x) => ({ x, ok: true })), ...no.slice(0, cfg.cards - match).map((x) => ({ x, ok: false }))]);
  return { label, icon: kinds === 'size' ? (t.big ? '⬛' : '▪️') : null, say: `${label}만 로켓에 실어요!`, cards: cards.map((c) => ({ ...c, face: () => shapeEl(c.x), name: '' })) };
}

// 낱말 로켓(SortingRockets): 이번 로켓에 실을 갈래를 듣고, 그 갈래의 낱말 카드만 골라 실어 발사한다.
// 수학 속성별 분류(Classification, opts.mode = 'shape')는 조건에 맞는 도형만 싣는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const en = ctx.lang === 'en';
  const shapes = ctx.opts.mode === 'shape';
  const lang = en ? 'en-US' : 'ko-KR';
  const hinter = makeHinter();
  const rocket = h('div', { class: 'srk-rocket' });
  const sign = h('div', { class: 'srk-sign' });
  const pad = h('div', { class: 'srk-pad' });
  stage.append(h('div', { class: `sort-rockets${en ? ' en' : ''}` }, h('div', { class: 'srk-launch' }, sign, rocket), pad));
  const used = new Set();
  let r = 0;
  let firstTry = 0;
  let total = 0;

  function wordRound() {
    let cat;
    let others;
    if (cfg.near) {
      const pair = pick(NEAR_CATS.filter((p) => !used.has(p[0]) || !used.has(p[1])));
      const [a, b] = shuffle(pair).map((id) => CATEGORIES.find((c) => c.id === id));
      cat = used.has(a.id) ? b : a;
      others = [cat === a ? b : a];
    } else {
      cat = pick(CATEGORIES.filter((c) => !used.has(c.id)));
      others = pickN(CATEGORIES.filter((c) => c !== cat), 2);
    }
    used.add(cat.id);
    const yes = pickN(cat.items, cfg.match).map((t) => ({ t, ok: true }));
    const no = pickN(others.flatMap((c) => c.items), cfg.cards - cfg.match).map((t) => ({ t, ok: false }));
    const label = en ? cat.en : cat.ko;
    return {
      label, icon: cat.e,
      say: en ? `Load the ${cat.en}!` : `${label} 낱말만 로켓에 실어요!`,
      cards: shuffle([...yes, ...no]).map(({ t, ok }) => ({
        ok, name: en ? t[2] : t[1],
        face: () => [cfg.pic ? h('span', { class: 'srk-e', 'aria-hidden': 'true' }, t[0]) : null, h('b', {}, en ? t[2] : t[1])],
      })),
    };
  }

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    const q = shapes ? mathRound(L, cfg) : wordRound();
    const need = q.cards.filter((c) => c.ok).length;
    let got = 0;
    let sel = null;
    total += need;
    const holds = Array.from({ length: need }, () => h('span', { class: 'srk-hold' }));
    rocket.className = 'srk-rocket';
    rocket.replaceChildren(h('span', { class: 'srk-nose', 'aria-hidden': 'true' }), h('div', { class: 'srk-body' }, ...holds), h('span', { class: 'srk-fire', 'aria-hidden': 'true' }));
    sign.replaceChildren(...[q.icon ? h('span', { 'aria-hidden': 'true' }, q.icon) : null, h('b', { class: en ? 'latin' : '' }, q.label)].filter(Boolean));
    const cards = q.cards.map((c, i) => {
      const el = h('button', { class: `srk-card${shapes ? ' shape' : ''}`, type: 'button', style: { '--r': `${randInt(-6, 6)}deg`, animationDelay: `${i * 0.06}s` }, 'aria-label': c.name || '도형 카드' }, ...[].concat(c.face()));
      el.dataset.ok = c.ok ? '1' : '';
      el.dataset.miss = '0';
      draggable(el, { onDrop: (pt) => (hits(rocket, pt, 10) ? load(el, c) : wiggle(el)) });
      el.addEventListener('click', () => {
        sfx.tap();
        if (c.name) speak(c.name, lang);
        if (sel === el) { load(el, c); return; }
        sel?.classList.remove('sel');
        sel = el;
        el.classList.add('sel');
      });
      return el;
    });
    rocket.onclick = () => { if (sel) load(sel, q.cards[cards.indexOf(sel)]); };
    pad.replaceChildren(...cards);

    function load(el, c) {
      if (!c.ok) {
        el.dataset.miss = '1';
        wiggle(el);
        wiggle(rocket);
        hinter.miss(cards.find((x) => x.isConnected && x.dataset.ok));
        return;
      }
      hinter.reset();
      if (sel === el) sel = null;
      el.remove();
      if (el.dataset.miss === '0') firstTry++;
      holds[got].replaceChildren(...[].concat(c.face()).filter(Boolean).map((x) => (x.cloneNode ? x.cloneNode(true) : x)));
      holds[got].classList.add('full');
      pop(holds[got]);
      sfx.pop();
      got++;
      ctx.progress(r + got / need, R);
      if (got < need) return;
      // 다 실으면 카운트다운하고 발사!
      cards.forEach((x) => { x.disabled = true; });
      sfx.correct();
      cheer(rocket, en ? 'en' : 'ko');
      speak(en ? 'Three, two, one, blast off!' : '셋, 둘, 하나, 발사!', lang);
      ctx.later(() => rocket.classList.add('go'), 1500);
      ctx.later(() => {
        r++;
        if (r >= R) ctx.finish({ firstTry, total });
        else round();
      }, 3000);
    }

    ctx.prompt(shapes ? `${q.label}만 골라 로켓에 실어요!` : en ? `외계인이 말하는 종류(${q.label})의 단어만 로켓에 실어요!` : `'${q.label}'에 들어가는 낱말만 골라 로켓에 실어요!`,
      () => speak(q.say, lang));
  }

  round();
}
