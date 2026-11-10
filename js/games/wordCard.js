import { h, shuffle, pickN, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, SPELL_WORDS, QUIZ_SYLLABLES, similarSyllables } from '../data.js';
import { draggable, hits } from './dragTap.js';

const R = 4;
const ABC = 'abcdefghijklmnopqrstuvwxyz';
// 단계별: 낱말 길이, 헷갈리는 조각 수
const KO = [{ len: [2], extra: 0 }, { len: [2, 3], extra: 1 }, { len: [3], extra: 1 }, { len: [2, 3], extra: 2, batchim: true }, { len: [3], extra: 3, batchim: true }];
const EN = [{ len: [3], extra: 0 }, { len: [3], extra: 1 }, { len: [4], extra: 1 }, { len: [4], extra: 2 }, { len: [5], extra: 2 }];

// 낱말 조각 맞추기(WordCardPuzzle · 한글 글자 조각) · 워드 노트(WordNote · 영어 철자 종이 조각):
// 흐릿한 그림 아래 빈칸에 글자 조각을 차례로 붙이면 그림이 점점 또렷해지고, 다 붙이면 그림이 살아 움직인다
export function mount(stage, ctx) {
  const en = ctx.lang === 'en';
  const lang = en ? 'en-US' : 'ko-KR';
  const cfg = (en ? EN : KO)[ctx.level - 1];
  const hinter = makeHinter();
  const pool = en && ctx.unit ? ctx.unit.words(8, { spell: true, minLen: 3, maxLen: Math.max(...cfg.len) + 1 })
    : en ? cfg.len.flatMap((n) => SPELL_WORDS[n]).map((x) => ({ w: x.w, e: x.e }))
    : (cfg.batchim || cfg.len[0] === 3 ? [...WORDS, ...WORDS2] : WORDS).filter((x) => cfg.len.includes([...x.word].length)).map((x) => ({ w: x.word, e: x.emoji }));
  const list = pickN(pool, R);
  const pic = h('div', { class: 'wc-pic', 'aria-hidden': 'true' });
  const slotsEl = h('div', { class: 'wc-slots' });
  const tray = h('div', { class: 'wc-tray' });
  stage.append(h('div', { class: `word-card${en ? ' en' : ''}` }, h('div', { class: 'wc-card' }, pic, slotsEl), tray));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = list[n];
    const parts = [...it.w];
    let missed = false;
    let sel = null;
    pic.textContent = it.e;
    pic.className = 'wc-pic';
    pic.style.setProperty('--blur', '14px');
    const slots = parts.map((c) => {
      const s = h('button', { class: 'wc-slot', type: 'button', 'aria-label': '빈칸' });
      s.dataset.c = c;
      s.addEventListener('click', () => { if (sel && !s.classList.contains('full')) put(sel, s); });
      return s;
    });
    slotsEl.replaceChildren(...slots);
    const traps = en
      ? pickN([...ABC].filter((c) => !parts.includes(c)), cfg.extra)
      : pickN([...new Set(parts.flatMap((c) => similarSyllables(c)).concat(QUIZ_SYLLABLES))].filter((c) => !parts.includes(c)), cfg.extra);
    const tiles = shuffle([...parts, ...traps]).map((c, i) => {
      const t = h('button', { class: 'wc-tile', type: 'button', style: { '--r': `${randInt(-8, 8)}deg`, animationDelay: `${i * 0.07}s` } }, c);
      t.dataset.c = c;
      draggable(t, {
        onDrop: (pt) => {
          const s = slots.find((x) => !x.classList.contains('full') && hits(x, pt, 8));
          if (s) put(t, s);
          else wiggle(t);
        },
      });
      t.addEventListener('click', () => {
        sfx.tap();
        if (sel === t) { t.classList.remove('sel'); sel = null; return; }
        sel?.classList.remove('sel');
        sel = t;
        t.classList.add('sel');
      });
      return t;
    });
    tray.replaceChildren(...tiles);

    function put(t, s) {
      if (t.dataset.c !== s.dataset.c) {
        missed = true;
        wiggle(t);
        wiggle(s);
        hinter.miss(tiles.find((x) => x.isConnected && x.dataset.c === s.dataset.c));
        return;
      }
      hinter.reset();
      if (sel === t) sel = null;
      t.remove();
      s.textContent = s.dataset.c;
      s.classList.add('full');
      pop(s);
      sfx.pop();
      // 붙일 때마다 그림이 조금씩 또렷해진다
      const left = slots.filter((x) => !x.classList.contains('full')).length;
      pic.style.setProperty('--blur', `${Math.round((14 * left) / slots.length)}px`);
      if (left > 0) return;
      if (!missed) firstTry++;
      tray.replaceChildren();
      pic.classList.add('alive');
      sfx.correct();
      burst(pic, ['✨', '⭐', '🌟']);
      cheer(slotsEl, en ? 'en' : 'ko');
      speak(it.w, lang);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2300);
    }

    ctx.prompt(en ? '흐릿한 그림의 단어를 떠올리며, 철자 종이 조각을 차례로 붙여요!' : '흐릿한 그림을 보고, 글자 조각을 제자리에 놓아 낱말을 완성해요!',
      () => (en ? speak('What is it? Spell the word!', lang) : speak('무엇일까요? 글자를 제자리에 놓아요!')));
  }

  round();
}
