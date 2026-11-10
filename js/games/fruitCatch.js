import { h, pick, pickN, wiggle, pop, burst, makeHinter, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { FRUIT_WORDS, QUIZ_SYLLABLES, similarSyllables } from '../data.js';

const ROUNDS = 4;
// 단계별: 낱말, 아무 순서로 받아도 되는지, 바구니에 흐린 글자를 보여 줄지, 떨어지는 빠르기(px/초), 함정이 비슷한 글자인지, 필요한 열매가 나올 확률
const CFG = [
  { words: FRUIT_WORDS[2], anyOrder: true, ghost: true, speed: 90, alike: false, need: 0.6 },
  { words: [...FRUIT_WORDS[2], ...FRUIT_WORDS[3]], anyOrder: true, ghost: true, speed: 100, alike: true, need: 0.5 },
  { words: FRUIT_WORDS[3], anyOrder: false, ghost: true, speed: 110, alike: true, need: 0.5 },
  { words: FRUIT_WORDS[3], anyOrder: false, ghost: false, speed: 120, alike: true, need: 0.5 },
  { words: FRUIT_WORDS.b, anyOrder: false, ghost: false, speed: 130, alike: true, need: 0.5 },
];
const MAX_FRUITS = 4;
const GAP = 1150;

// 열매를 받아라(SpellBalls): 나무에서 떨어지는 글자 열매를 바구니를 움직여 받아 낱말을 완성한다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const lesson = ctx.lesson;
  const hinter = makeHinter();
  // 한글 차시: 그 차시의 두세 글자 그림 낱말, 함정 열매는 그 차시에서 헷갈리는 글자
  const words = lesson
    ? lesson.words(ROUNDS, { pic: true, minLen: 2, maxLen: 3 }).map((w) => [w.word, w.emoji])
    : pickN(cfg.words, ROUNDS);
  const alikeOf = (s) => (lesson ? lesson.alike(s, 4) : similarSyllables(s).slice(0, 4));
  const fillers = lesson ? lesson.syllables(20) : QUIZ_SYLLABLES;
  const pic = h('button', { class: 'fc-pic', type: 'button', 'aria-label': '낱말 듣기' });
  const slotRow = h('div', { class: 'fc-slots' });
  const basket = h('div', { class: 'fc-basket' }, slotRow, h('i', { class: 'fc-bowl' }));
  const field = h('div', { class: 'fc-field', tabindex: '0', 'aria-label': '바구니를 좌우로 움직여 열매를 받아요' },
    h('i', { class: 'fc-trunk' }), h('i', { class: 'fc-canopy' }), pic, basket);
  stage.append(h('div', { class: 'fruit-tree' }, field));

  let r = 0;
  let total = 0;
  let misses = 0;
  let slots = [];
  let fruits = [];
  let bx = 0;
  let playing = false;
  let spawnIn = 0;
  let dry = 0;
  let raf = 0;
  let last = 0;

  const W = () => field.clientWidth;
  const open = () => slots.filter((s) => !s.done);
  const wanted = () => (cfg.anyOrder ? open() : open().slice(0, 1));

  /* ---------- 바구니 ---------- */
  function moveBasket(x) {
    const half = basket.offsetWidth / 2;
    bx = Math.max(half, Math.min(W() - half, x));
    basket.style.translate = `${bx - half}px 0`;
  }
  let dragging = false;
  const toX = (e) => e.clientX - field.getBoundingClientRect().left;
  field.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.fc-pic')) return;
    dragging = true;
    try { field.setPointerCapture(e.pointerId); } catch {}
    moveBasket(toX(e));
  });
  field.addEventListener('pointermove', (e) => { if (dragging) moveBasket(toX(e)); });
  const stop = () => { dragging = false; };
  field.addEventListener('pointerup', stop);
  field.addEventListener('pointercancel', stop);
  field.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveBasket(bx - 40);
    else if (e.key === 'ArrowRight') moveBasket(bx + 40);
    else return;
    e.preventDefault();
  });
  pic.addEventListener('click', () => speak(words[r][0]));

  /* ---------- 열매 ---------- */
  function spawn() {
    const need = wanted().map((s) => s.syl);
    const word = words[r][0];
    let syl;
    // 필요한 열매가 한동안 안 나왔으면 꼭 하나 떨어뜨린다
    if (need.length && (Math.random() < cfg.need || dry >= 2)) {
      syl = pick(need);
      dry = 0;
    } else {
      const pool = cfg.alike ? need.flatMap(alikeOf) : fillers;
      const ok = pool.filter((x) => !word.includes(x));
      syl = pick(ok.length ? ok : QUIZ_SYLLABLES.filter((x) => !word.includes(x)));
      dry++;
    }
    const el = h('span', { class: 'fc-fruit', 'aria-hidden': 'true' }, syl);
    field.append(el);
    const size = el.offsetWidth;
    // 바로 앞 열매와 너무 붙지 않는 자리에서 떨어진다
    let x;
    for (let k = 0; k < 6; k++) {
      x = size / 2 + Math.random() * (W() - size);
      if (!fruits.some((f) => f.y < 120 && Math.abs(f.x - x) < size * 1.4)) break;
    }
    const f = { el, syl, x, y: 54, vx: 0, vy: cfg.speed * (0.9 + Math.random() * 0.2), size, state: 'fall' };
    fruits.push(f);
    draw(f);
  }

  const draw = (f) => { f.el.style.translate = `${f.x - f.size / 2}px ${f.y - f.size / 2}px`; };

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!playing) return;
    spawnIn -= dt * 1000;
    if (spawnIn <= 0 && fruits.filter((f) => f.state === 'fall').length < MAX_FRUITS) {
      spawn();
      spawnIn = GAP;
    }
    const catchY = basket.offsetTop + slotRow.offsetTop + slotRow.offsetHeight * 0.5;
    const half = basket.offsetWidth / 2;
    for (const f of [...fruits]) {
      if (f.state === 'fall') {
        const before = f.y;
        f.y += f.vy * dt;
        if (before < catchY && f.y >= catchY && Math.abs(f.x - bx) < half + f.size * 0.2) land(f);
      } else if (f.state === 'bounce') {
        f.vy += 900 * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
      } else continue;
      if (f.y - f.size > field.clientHeight) { f.el.remove(); fruits.splice(fruits.indexOf(f), 1); continue; }
      draw(f);
    }
  }

  // 바구니에 닿은 열매: 알맞은 자리가 비어 있으면 쏙, 아니면 통 튕겨 나간다
  function land(f) {
    const s = wanted().find((o) => o.syl === f.syl);
    if (!s) {
      misses++;
      f.state = 'bounce';
      f.vy = -260;
      f.vx = f.x < bx ? -160 : 160;
      f.el.classList.add('bad');
      wiggle(basket);
      sfx.wrong();
      hinter.miss(open()[0]?.el);
      return;
    }
    hinter.reset();
    f.state = 'caught';
    fruits.splice(fruits.indexOf(f), 1);
    f.el.remove();
    s.done = true;
    s.el.classList.remove('now');
    s.el.classList.add('got');
    pop(s.el);
    sfx.pop();
    speak(f.syl);
    markNext();
    ctx.progress(r + slots.filter((o) => o.done).length / slots.length, ROUNDS);
    if (!open().length) win();
  }

  function markNext() {
    if (cfg.anyOrder) return;
    open()[0]?.el.classList.add('now');
  }

  // 낱말이 완성되면 원숭이가 덩굴을 타고 내려와 축하해 준다
  function win() {
    playing = false;
    fruits.forEach((f) => f.el.classList.add('fade'));
    const monkey = h('span', { class: 'fc-monkey', 'aria-hidden': 'true' }, charFace('monkey', '🐒'));
    field.append(monkey);
    sfx.correct();
    burst(basket);
    speak(words[r][0]);
    ctx.later(() => {
      monkey.remove();
      fruits.forEach((f) => f.el.remove());
      fruits = [];
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
      else round();
    }, 2800);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    const [word, e] = words[r];
    const syls = [...word];
    total += syls.length;
    slots = syls.map((syl) => ({ syl, done: false, el: h('span', { class: `fc-slot${cfg.ghost ? '' : ' hide'}` }, h('b', {}, syl)) }));
    slotRow.replaceChildren(...slots.map((s) => s.el));
    pic.replaceChildren(h('span', { 'aria-hidden': 'true' }, e), h('small', {}, '🔊'));
    markNext();
    moveBasket(bx || W() / 2);
    spawnIn = 600;
    dry = 0;
    playing = true;
    ctx.prompt(
      cfg.anyOrder
        ? '나무에서 떨어지는 글자 열매를 바구니로 받아 낱말을 완성해요! 바구니를 좌우로 끌어요.'
        : '낱말 순서대로 첫 글자부터 열매를 받아요! 바구니를 좌우로 끌어요.',
      () => speak(words[r][0]),
    );
  }

  raf = requestAnimationFrame(tick);
  ctx.onCleanup(() => cancelAnimationFrame(raf));
  round();
}
