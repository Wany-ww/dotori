import { h, shuffle, pick, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, PUZZLE_WORDS, SEARCH_SETS, FLASH_SETS, SYLLABLE_WORDS, QUIZ_SYLLABLES, hasBatchim, similarSyllables } from '../data.js';
import { draggable, hits } from './dragTap.js';

const ROUNDS = 4;
const COLORS = ['#F48FB1', '#F6A55A', '#8FCBEF', '#7ED9B5', '#F2CC4E', '#B9A2F0'];
const ALL = [...new Set([
  ...[...WORDS, ...WORDS2, ...PUZZLE_WORDS].map((w) => w.word),
  ...[...SEARCH_SETS, ...FLASH_SETS].flatMap((s) => s.words.map((w) => w[0])),
  ...Object.values(SYLLABLE_WORDS).flat(),
])];
const plain = (w) => ![...w].some(hasBatchim);
// 단계별: 낱말, 비워 둘 자리 수(all이면 모두), 함정 친구 수, 함정이 비슷한 소리인지, 간판에 낱말을 보여 줄지
const CFG = [
  { words: ALL.filter((w) => w.length === 2 && plain(w)), empty: 1, extra: 1, alike: false, sign: true },
  { words: ALL.filter((w) => w.length === 2 && plain(w)), empty: 1, extra: 2, alike: true, sign: true },
  { words: ALL.filter((w) => w.length === 3 && plain(w)), empty: 2, extra: 1, alike: true, sign: true },
  { words: ALL.filter((w) => w.length >= 2 && w.length <= 3 && plain(w)), empty: 'all', extra: 2, alike: true, sign: false },
  { words: ALL.filter((w) => w.length >= 2 && w.length <= 3 && !plain(w)), empty: 'all', extra: 2, alike: true, sign: false },
];

// 무대 위로 올라가(GoupStage): 낱말을 이루는 글자 소리를 가진 친구들을 찾아 무대 위 빈자리에 올린다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const lesson = ctx.lesson;
  const hinter = makeHinter();
  // 한글 차시: 그 차시의 두세 글자 낱말, 함정 친구는 그 차시에서 헷갈리는 글자
  const words = lesson ? lesson.words(ROUNDS, { minLen: 2, maxLen: 3 }).map((w) => w.word) : pickN(cfg.words, ROUNDS);
  const alikeOf = (s) => (lesson ? lesson.alike(s, 4) : similarSyllables(s).slice(0, 4));
  const sign = h('div', { class: 'gs-sign' });
  const spots = h('div', { class: 'gs-spots' });
  const crowd = h('div', { class: 'gs-crowd' });
  // 간판에 낱말이 없는 단계는 소리만 듣고 고르도록 아래 친구들의 글자를 숨긴다
  const show = h('div', { class: `gs-show${cfg.sign ? '' : ' listen'}` }, sign, h('div', { class: 'gs-boards' }, spots, h('i', { class: 'gs-curtain l' }), h('i', { class: 'gs-curtain r' })), crowd);
  stage.append(show);

  let r = 0;
  let firstTry = 0;
  let total = 0;
  let misses = 0;
  let slots = [];
  let pals = [];
  let sel = null;
  let busy = true;

  const wait = (ms) => new Promise((res) => ctx.later(res, ms));

  function pal(syl, color) {
    const el = h('button', { class: 'gs-pal', type: 'button', 'aria-label': '소리 친구', style: { '--c': color } },
      h('span', { class: 'gs-say', 'aria-hidden': 'true' }, syl), h('i', { class: 'gs-eyes' }), h('i', { class: 'gs-feet' }));
    el.dataset.syl = syl;
    return el;
  }

  // 친구가 자기 글자 소리를 내면 머리 위에 글자가 잠깐 보인다
  async function voice(el, syl) {
    el.classList.remove('talk');
    void el.offsetWidth;
    el.classList.add('talk');
    await Promise.all([speak(syl), wait(800)]);
    el.classList.remove('talk');
  }

  // 막이 닫힌 채 그림자 친구들이 차례로 소리를 내고, 낱말을 들려준 뒤 막이 열린다
  async function intro(word) {
    const my = r;
    busy = true;
    show.classList.add('closed');
    for (const s of slots) {
      if (my !== r || !stage.isConnected) return;
      await voice(s.shadow, s.syl);
    }
    if (my !== r) return;
    await Promise.all([speak(word), wait(900)]);
    show.classList.remove('closed');
    busy = false;
  }

  function select(p) {
    if (busy) return;
    if (sel === p) {
      p.el.classList.remove('sel');
      sel = null;
      return;
    }
    sel?.el.classList.remove('sel');
    sel = p;
    p.el.classList.add('sel');
    voice(p.el, p.syl);
  }

  function place(p, s) {
    if (busy || s.done) return;
    p.el.classList.remove('sel');
    sel = null;
    if (p.syl !== s.syl) {
      misses++;
      wiggle(p.el);
      hinter.miss(pals.find((o) => !o.used && o.syl === s.syl)?.el);
      voice(s.shadow, s.syl);
      return;
    }
    hinter.reset();
    p.used = true;
    s.done = true;
    s.el.replaceChildren(p.el);
    s.el.classList.add('lit');
    p.el.disabled = true;
    pop(p.el);
    sfx.pop();
    voice(p.el, p.syl);
    if (slots.some((o) => !o.done)) return;
    finale();
  }

  // 모두 올라오면 조명이 켜지고 한 명씩 소리를 낸 뒤 다 함께 낱말을 말한다
  async function finale() {
    busy = true;
    const my = r;
    const word = words[r];
    sign.replaceChildren(word);
    sign.classList.add('on');
    sfx.correct();
    await wait(700);
    for (const s of slots) {
      if (my !== r || !stage.isConnected) return;
      await voice(s.el.firstChild, s.syl);
    }
    slots.forEach((s) => s.el.firstChild.classList.add('talk'));
    cheer(spots);
    await Promise.all([speak(word), wait(1200)]);
    if (my !== r) return;
    r++;
    ctx.progress(r, ROUNDS);
    if (r >= ROUNDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
    else round();
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    sel = null;
    const word = words[r];
    const syls = [...word];
    const colors = shuffle(COLORS);
    const emptyAt = new Set(cfg.empty === 'all' ? syls.keys() : pickN([...syls.keys()], cfg.empty));
    total += emptyAt.size;

    slots = syls.map((syl, i) => {
      const shadow = pal(syl, '#2B2140');
      shadow.classList.add('shadow');
      const el = h('div', { class: 'gs-slot' });
      const s = { el, syl, shadow, done: !emptyAt.has(i) };
      if (s.done) {
        const p = pal(syl, colors[i % colors.length]);
        p.disabled = true;
        el.append(p);
        el.classList.add('lit');
      } else {
        el.append(shadow);
        shadow.addEventListener('click', () => { if (sel) place(sel, s); else if (!busy) voice(shadow, syl); });
      }
      return s;
    });
    // 막이 닫혀 있는 동안에는 모든 자리에 그림자 친구가 선다
    spots.replaceChildren(...slots.map((s) => s.el));
    const closedView = slots.map((s) => {
      const p = s.el.firstChild;
      if (p !== s.shadow) { s.shown = p; s.el.replaceChildren(s.shadow); }
      return s;
    });

    // 아래 친구들: 빈자리 글자 + 함정 글자
    const need = syls.filter((_, i) => emptyAt.has(i));
    const trapPool = cfg.alike
      ? need.flatMap(alikeOf)
      : lesson ? lesson.syllables(12) : QUIZ_SYLLABLES;
    const traps = shuffle([...new Set(trapPool)].filter((x) => !syls.includes(x))).slice(0, cfg.extra);
    pals = shuffle([...need, ...traps]).map((syl, i) => {
      const el = pal(syl, colors[(syls.length + i) % colors.length]);
      const p = { el, syl, used: false };
      el.addEventListener('click', () => select(p));
      draggable(el, {
        can: () => !busy && !p.used,
        onMove: (pt) => slots.forEach((s) => s.el.classList.toggle('over', !s.done && hits(s.el, pt))),
        onDrop: (pt) => {
          slots.forEach((s) => s.el.classList.remove('over'));
          const s = slots.find((o) => !o.done && hits(o.el, pt));
          if (s) place(p, s);
        },
      });
      return p;
    });
    crowd.replaceChildren(...pals.map((p) => p.el));
    sign.classList.remove('on');
    sign.replaceChildren(cfg.sign ? word : syls.map(() => '○').join(''));

    ctx.prompt(
      '낱말을 만드는 소리 친구를 찾아 무대 위 빈자리로 올려 주세요! 친구를 누르면 소리를 들려줘요.',
      () => { if (!busy) intro(word).then(() => restore(closedView)); },
      { auto: false },
    );
    intro(word).then(() => restore(closedView));
  }

  // 막이 열리면 이미 무대에 있던 친구들이 제자리로 돌아온다
  function restore(list) {
    list.forEach((s) => { if (s.shown) s.el.replaceChildren(s.shown); });
  }

  round();
}
