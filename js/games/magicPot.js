import { h, pick, randInt, wiggle, pop, burst, cheer, makeHinter, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { POT_RECIPES, compose, decompose, hasBatchim, CHO, JUNG, JONG } from '../data.js';

const CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const TENSE = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];
const VOWS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅒ', 'ㅖ'];
const BREW = ['#7FE7F2', '#B6F27F', '#FFB3E6', '#FFE07A', '#C7A8FF'];
const JOIN_V = { ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ' };
const JOIN_T = { ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ' };
// 단계별: 받침 레시피인지, 빈칸 수(all이면 낱말 전체), 빈칸에 흐린 글자를 보여 줄지, 레시피에 낱말을 쓸지
const CFG = [
  { batchim: false, blanks: 1, ghost: true, written: true },
  { batchim: false, blanks: 1, ghost: false, written: true },
  { batchim: false, blanks: 'all', ghost: false, written: true },
  { batchim: true, blanks: 1, ghost: false, written: true },
  { batchim: true, blanks: 'all', ghost: false, written: false },
];

const parts = (s) => {
  const d = decompose(s);
  return { c: CHO[d.c], j: JUNG[d.j], t: d.t ? JONG[d.t] : null };
};

// 마법의 솥(MagicPot): 레시피의 재료 이름 빈칸을 자음·모음 자판으로 만들어 솥에 넣는다. 네 가지를 다 넣으면 무언가 나온다
export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const cfg = { ...CFG[L - 1] };
  const hinter = makeHinter();
  // 한글 차시: 그 차시의 낱말 4개가 레시피 재료가 된다. 받침을 배운 뒤에만 받침 자판(쌍자음)이 나온다
  if (lesson) cfg.batchim = lesson.batchim;
  const recipe = lesson
    ? { items: lesson.words(4, { maxLen: 3 }).map((w) => [w.word, w.emoji || '✨']), out: pick(POT_RECIPES).out }
    : pick(POT_RECIPES.filter((r) => Boolean(r.batchim) === cfg.batchim));
  const items = recipe.items;
  const focusAt = (syls) => {
    if (!lesson) return -1;
    const i = syls.findIndex((s) => lesson.hasFocus(s) && lesson.kind !== 'rule' && lesson.slot);
    return i;
  };

  const word = h('button', { class: 'pot-word', type: 'button', 'aria-label': '재료 이름 듣기' });
  const list = h('ol', { class: 'pot-recipe' });
  const liquid = h('i', { class: 'pot-liquid' });
  const pot = h('div', { class: 'pot-pot' }, liquid, h('i', { class: 'pot-rim' }));
  const screen = h('div', { class: 'pot-screen', 'aria-live': 'polite' });
  const keyEls = {};
  const key = (k) => {
    const b = h('button', { class: 'pot-key', type: 'button' }, k);
    b.addEventListener('click', () => press(k));
    keyEls[k] = b;
    return b;
  };
  const undo = h('button', { class: 'pot-key wide undo', type: 'button', 'aria-label': '지우기' }, '↺');
  const ok = h('button', { class: 'pot-key wide ok', type: 'button', 'aria-label': '확인' }, '✔');
  // 재료 이름에 쌍자음이 있으면 받침 단계가 아니어도 쌍자음 글쇠를 놓는다
  const needTense = items.some(([w]) => [...w].some((s) => { const p = parts(s); return TENSE.includes(p.c) || TENSE.includes(p.t); }));
  const cons = h('div', { class: 'pot-keys cons' }, ...CONS.map(key), ...(cfg.batchim || needTense ? TENSE.map(key) : []), undo);
  const vows = h('div', { class: 'pot-keys vows' }, ...VOWS.map(key), ok);
  stage.append(h('div', { class: 'pot-room' },
    h('div', { class: 'pot-top' }, h('span', { class: 'pot-witch', 'aria-hidden': 'true' }, charFace('witch', '🧙')), h('div', { class: 'pot-stand' }, word, pot), h('div', { class: 'pot-scroll' }, list)),
    h('div', { class: 'pot-pad' }, cons, screen, vows)));

  let n = 0;
  let slots = [];
  let at = 0;
  let st = { c: null, j: null, t: null };
  let busy = false;
  let total = 0;
  let firstTry = 0;
  let missed = false;

  const wait = (ms) => new Promise((res) => ctx.later(res, ms));

  /* ---------- 레시피 ---------- */
  const lines = items.map(([w, e], i) => {
    const li = h('li', {}, h('span', { class: 'pot-ico', 'aria-hidden': 'true' }, e), cfg.written ? w : [...w].map(() => '○').join(''));
    li.addEventListener('click', () => { if (i <= n) speak(w); });
    return li;
  });
  list.replaceChildren(...lines);
  word.addEventListener('click', () => speak(items[n][0]));

  /* ---------- 자판 ---------- */
  function show() {
    const { c, j, t } = st;
    screen.classList.toggle('empty', !c && !j);
    if (c && j) screen.replaceChildren(h('b', {}, compose(c, j, t || 0)));
    else screen.replaceChildren(h('b', { class: 'part' }, c || j || ''));
    ok.classList.toggle('ready', Boolean(c && j));
  }

  function press(k) {
    if (busy) return;
    sfx.tap();
    const isVowel = VOWS.includes(k);
    // 모음 두 개(ㅗ+ㅏ=ㅘ), 받침 두 개(ㄹ+ㄱ=ㄺ)는 이어 누르면 합쳐진다
    const vv = isVowel && st.j && !st.t && JOIN_V[st.j + k];
    const tt = !isVowel && st.t && JOIN_T[st.t + k];
    if (vv) st = { ...st, j: vv };
    else if (isVowel) st = { ...st, j: k };
    else if (tt && cfg.batchim) st = { ...st, t: tt };
    else if (!st.c || !st.j) st = { c: k, j: null, t: null };
    else if (cfg.batchim && JONG.includes(k) && !st.t) st = { ...st, t: k };
    else st = { c: k, j: null, t: null };
    const b = keyEls[k];
    b.classList.remove('hit');
    void b.offsetWidth;
    b.classList.add('hit');
    show();
  }

  undo.addEventListener('click', () => {
    if (busy) return;
    sfx.tap();
    // 받침 → 모음 → 자음 순서로 하나씩 지운다
    if (st.t) st = { ...st, t: null };
    else if (st.j) st = { ...st, j: null };
    else st = { c: null, j: null, t: null };
    show();
  });

  ok.addEventListener('click', () => {
    if (busy) return;
    const s = slots[at];
    const want = s.syl;
    const got = st.c && st.j ? compose(st.c, st.j, st.t || 0) : '';
    if (got !== want) {
      missed = true;
      wiggle(screen);
      sfx.wrong();
      speak(want);
      st = { c: null, j: null, t: null };
      show();
      // 두 번 틀리면 빈칸에 흐린 글자가 보이고, 자판의 첫 글쇠가 반짝인다
      s.misses = (s.misses || 0) + 1;
      if (s.misses >= 2) s.el.classList.add('ghost');
      hinter.miss(keyEls[parts(want).c]);
      return;
    }
    hinter.reset();
    if (!missed) firstTry++;
    missed = false;
    s.el.classList.remove('now', 'ghost');
    s.el.classList.add('got');
    s.el.textContent = want;
    pop(s.el);
    sfx.correct();
    st = { c: null, j: null, t: null };
    show();
    at = slots.findIndex((o, i) => i > at && o.blank);
    if (at >= 0) {
      slots[at].el.classList.add('now');
      speak(want);
      return;
    }
    brew();
  });

  /* ---------- 솥 ---------- */
  // 재료 이름이 완성되면 그림이 나타나 솥으로 퐁당 들어간다
  async function brew() {
    busy = true;
    const [w, e] = items[n];
    speak(w);
    const drop = h('span', { class: 'pot-drop', 'aria-hidden': 'true' }, e);
    pot.append(drop);
    await wait(900);
    drop.remove();
    sfx.pop();
    burst(pot, ['🫧', '✨', '🫧', '💜']);
    liquid.style.setProperty('--brew', BREW[n % BREW.length]);
    pot.classList.remove('splash');
    void pot.offsetWidth;
    pot.classList.add('splash');
    lines[n].classList.remove('now');
    lines[n].classList.add('done');
    n++;
    ctx.progress(n, items.length);
    await wait(1100);
    if (n < items.length) { next(); return; }
    // 레시피 완성: 솥이 부글부글 끓고 마법의 결과가 솟아오른다
    const [name, art] = recipe.out;
    word.replaceChildren(h('span', { class: 'pot-made' }, name));
    pot.classList.add('boil');
    await wait(1000);
    const out = h('span', { class: 'pot-out', 'aria-hidden': 'true' }, art);
    pot.append(out);
    sfx.win();
    cheer(pot);
    await Promise.all([speak(`짜잔! ${name}${hasBatchim(name) ? '이' : '가'} 나왔어요!`), wait(2400)]);
    ctx.finish({ firstTry, total });
  }

  function next() {
    hinter.reset();
    busy = false;
    missed = false;
    const w = items[n][0];
    const syls = [...w];
    const blankAt = new Set(cfg.blanks === 'all' ? syls.keys() : [preferBlank(syls)]);
    total += blankAt.size;
    slots = syls.map((syl, i) => {
      const blank = blankAt.has(i);
      const el = h('span', { class: `pot-syl${blank ? ' blank' : ''}${blank && cfg.ghost ? ' ghost' : ''}` }, syl);
      return { el, syl, blank };
    });
    at = slots.findIndex((s) => s.blank);
    slots[at].el.classList.add('now');
    word.replaceChildren(...slots.map((s) => s.el));
    lines.forEach((li, i) => li.classList.toggle('now', i === n));
    st = { c: null, j: null, t: null };
    show();
    speak(w);
  }

  // 배우는 낱자가 들어간 글자, 받침 단계에서는 받침이나 쌍자음이 있는 글자를 빈칸으로 고른다
  function preferBlank(syls) {
    const f = focusAt(syls);
    if (f >= 0) return f;
    if (!cfg.batchim) return randInt(0, syls.length - 1);
    const hard = [...syls.keys()].filter((i) => { const p = parts(syls[i]); return p.t || TENSE.includes(p.c); });
    return hard.length ? pick(hard) : randInt(0, syls.length - 1);
  }

  ctx.prompt(
    cfg.blanks === 'all'
      ? '마법의 레시피 재료 이름을 자음과 모음으로 한 글자씩 만들고 ✔를 눌러요!'
      : '재료 이름의 빈칸 글자를 자음과 모음으로 만들고 ✔를 눌러요! 다 넣으면 무엇이 나올까요?',
    () => speak(items[n] ? items[n][0] : recipe.out[0]),
    { auto: false },
  );
  ctx.progress(0, items.length);
  next();
}
