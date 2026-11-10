import { h, pickN, cheer, burst, pop, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, SPELL_WORDS, TRACE_SETS, EN_LETTER_WORDS } from '../data.js';
import { glyph, canWrite } from '../handwriting.js';
import { traceGame } from './trace.js';

const LATIN = new Map(TRACE_SETS.latin.items.map((it) => [it.ch, it]));
const EASY_UPPER = ['L', 'T', 'I', 'E', 'F', 'H', 'V', 'X', 'Z', 'N'];

// 낱말(또는 알파벳 카드) 하나를 글자마다 따라 쓰고, 다 쓰면 그림이 나타난다
function words(mode, L, unit) {
  if (mode === 'ko') {
    const pool = [
      WORDS.filter((w) => [...w.word].length === 2),
      WORDS.filter((w) => [...w.word].length === 2),
      WORDS2.filter((w) => [...w.word].length === 2),
      WORDS2,
      [...WORDS, ...WORDS2].filter((w) => [...w.word].length === 3),
    ][L - 1].filter((w) => [...w.word].every(canWrite));
    return pickN(pool, 3).map((w) => ({ word: w.word, e: w.emoji, chars: [...w.word] }));
  }
  // 영어 차시: 오늘 단어를 따라 쓴다 (짧은 단어부터)
  if (mode === 'en' && unit) {
    // 참고 영상(단어 따라쓰기): 칠판에 단어 4개, 한 글자씩
    return unit.words(4, { spell: true, maxLen: L <= 2 ? 4 : 6 }).map((w) => ({ word: w.w, e: w.e, chars: [...w.w] }));
  }
  if (mode === 'en') {
    const pool = [SPELL_WORDS[3], SPELL_WORDS[3], SPELL_WORDS[4], SPELL_WORDS[4], SPELL_WORDS[5]][L - 1];
    return pickN(pool, 3).map((w) => ({ word: w.w, e: w.e, chars: [...w.w] }));
  }
  // 알파벳 카드: 대문자 → 소문자 → 짝(Aa). 영어 차시는 오늘 배우는 글자를 대 · 소문자 짝으로
  if (unit) {
    return unit.letters(3, { review: true }).map((U) => {
      const x = unit.wordFor(U);
      const chars = unit.track === 'alpha' || L >= 4 ? [U, U.toLowerCase()] : L === 3 ? [U.toLowerCase()] : [U];
      return { word: chars.join(''), say: `${U}. ${unit.sayFor(U)}`, e: x.e, w: x.w, chars };
    });
  }
  const letters = Object.keys(EN_LETTER_WORDS).map((l) => l.toUpperCase());
  const pool = L === 1 ? EASY_UPPER.filter((l) => letters.includes(l)) : letters;
  return pickN(pool.length >= 3 ? pool : letters, 3).map((U) => {
    const w = EN_LETTER_WORDS[U.toLowerCase()];
    const chars = L <= 2 ? [U] : L === 3 ? [U.toLowerCase()] : [U, U.toLowerCase()];
    return { word: chars.join(''), say: `${U}. ${U} is for ${w}.`, e: '', w, chars };
  });
}

// 칠판 따라쓰기(WordTracing · ko) · 단어 따라쓰기(WordTracing · en) · 알파벳 카드(LetterTracingCard · card)
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const en = mode !== 'ko';
  const lang = en ? 'en-US' : 'ko-KR';
  const list = words(mode, L, ctx.unit);
  const total = list.reduce((a, w) => a + w.chars.length, 0);
  const host = h('div', { class: `word-trace mode-${mode}` });
  const reveal = h('div', { class: 'wt-reveal', 'aria-live': 'polite' });
  stage.append(host, reveal);
  let n = 0;
  let done = 0;
  let firstTry = 0;
  let cleanups = [];

  function word() {
    cleanups.forEach((f) => f());
    cleanups = [];
    reveal.replaceChildren();
    const w = list[n];
    const sub = h('div', { class: 'wt-sub' });
    host.replaceChildren(sub);
    const items = w.chars.map((c, i) => ({
      ch: c,
      i,
      strokes: en ? LATIN.get(c).strokes : glyph(c).strokes,
      say: c,
      label: w.word,
    }));
    const set = {
      lang,
      latin: en,
      lines: en,
      cls: mode === 'card' ? 'card' : 'chalk',
      prompt: () => (mode === 'ko' ? `칠판의 '${w.word}'를 한 글자씩 따라 써요. 다 쓰면 그림이 나타나요!` : mode === 'card' ? `알파벳 카드의 ${w.chars.join(' · ')}를 따라 써요!` : `'${w.word}' 철자를 한 글자씩 따라 써요. 다 쓰면 멋진 일이 생겨요!`),
      pick: () => items,
      // 낱말 줄: 지금 쓰는 글자를 반짝 표시
      side: (it) => h('div', { class: `wt-word${en ? ' latin' : ''}` }, w.chars.map((c, k) => h('span', { class: k < it.i ? 'done' : k === it.i ? 'now' : '' }, c))),
    };
    const base = done;
    const subCtx = {
      ...ctx,
      progress: (i) => ctx.progress(base + i, total),
      prompt: (t, say, o) => ctx.prompt(t, () => speak(w.chars.length > 1 && mode !== 'card' ? w.word : w.say || w.word, lang), o),
      onCleanup: (f) => cleanups.push(f),
      finish: (r) => {
        firstTry += r.firstTry;
        done += w.chars.length;
        // 다 쓰면 그림(또는 알파벳 단어)이 짠 하고 나타난다
        sfx.correct();
        reveal.replaceChildren(h('div', { class: 'wt-pic' },
          h('span', { class: 'wt-emoji', 'aria-hidden': 'true' }, wordPic(w.word, w.e) || '✨'),
          h('b', { class: en ? 'latin' : '' }, mode === 'card' ? `${w.chars.join(' ')} · ${w.w}` : w.word)));
        pop(reveal);
        burst(reveal, ['⭐', '✨', '🌟']);
        cheer(reveal, en ? 'en' : 'ko');
        speak(mode === 'card' ? w.say : w.word, lang);
        ctx.later(() => {
          n++;
          if (n >= list.length) { cleanups.forEach((f) => f()); ctx.finish({ firstTry, total }); }
          else word();
        }, 2400);
      },
    };
    traceGame(sub, subCtx, set);
  }
  ctx.onCleanup(() => cleanups.forEach((f) => f()));
  word();
}
