import { h, shuffle, pickN, cheer, makeHinter, choiceSet } from '../ui.js';
import { speak } from '../audio.js';
import { PHONICS, END_WORDS } from '../data.js';

const R = 5;
const LETTERS = 'abcdefghijklmnoprstuvwxy'.split('');

// Lv1~3: 첫소리 / Lv4: 첫소리·끝소리 섞기 / Lv5: 끝소리 위주
function buildRounds(L) {
  const endCount = L >= 5 ? 3 : L === 4 ? 2 : 0;
  const starts = pickN(PHONICS, R - endCount).map((p) => ({ w: p.w, e: p.e, letter: p.l, pos: 'start' }));
  const ends = pickN(END_WORDS, endCount).map((p) => ({ w: p.w, e: p.e, letter: p.w.slice(-1), pos: 'end' }));
  return shuffle([...starts, ...ends]);
}

// 영어 차시: 오늘 단어의 첫소리 (단어 가족 · 장모음 차시는 끝소리도 섞는다)
function unitRounds(unit, L) {
  const ws = unit.words(R, { spell: true, maxLen: 6 });
  const ends = unit.kind === 'family' || unit.kind === 'long' ? 2 : L >= 5 ? 2 : 0;
  return shuffle(ws.map((x, i) => (i < ends ? { w: x.w, e: x.e, letter: x.w.slice(-1), pos: 'end' } : { w: x.w, e: x.e, letter: x.w[0], pos: 'start' })));
}

export function mount(stage, ctx) {
  const L = ctx.level;
  const rounds = ctx.unit ? unitRounds(ctx.unit, L) : buildRounds(L);
  const nOpt = [2, 3, 3, 4, 4][L - 1];
  const hinter = makeHinter();
  const gemCount = h('b', {}, '0');
  const root = h('div', { class: 'mine' });
  stage.append(
    h('div', { class: 'mine-top' },
      h('span', { class: 'mine-mole', 'aria-hidden': 'true' }, '🐹⛏️'),
      h('span', { class: 'cart', 'aria-label': '모은 보석' }, '💎 × ', gemCount)),
    root,
  );
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = rounds[n];
    const others = pickN(LETTERS.filter((l) => l !== it.letter), nOpt - 1);
    const say = () => speak([it.w, it.w], 'en-US');
    const hole = h('span', { class: 'hole' }, '_');
    const word = it.pos === 'start'
      ? h('span', { class: 'pic-word' }, hole, it.w.slice(1))
      : h('span', { class: 'pic-word' }, it.w.slice(0, -1), hole);

    root.replaceChildren(
      h('span', { class: `sound-pos ${it.pos}` }, it.pos === 'start' ? '첫소리 찾기' : '끝소리 찾기'),
      h('button', { class: 'pic-card', type: 'button', 'aria-label': '단어 다시 듣기', onclick: say },
        h('span', { class: 'pic-emoji', 'aria-hidden': 'true' }, it.e), word),
      h('div', { class: 'mine-wall' },
        choiceSet(shuffle([it.letter, ...others]), {
          answer: it.letter,
          hinter,
          cls: 'jewel',
          label: (l) => `${l} 보석`,
          render: (l) => [h('span', { class: 'gem', 'aria-hidden': 'true' }, '💎'), h('span', { class: 'jewel-letter' }, l)],
          onCorrect: (b, miss) => {
            if (miss === 0) firstTry++;
            gemCount.textContent = n + 1;
            hole.textContent = it.letter;
            cheer(b, 'en');
            speak([`${it.letter}!`, `${it.w} ${it.pos === 'start' ? 'starts' : 'ends'} with ${it.letter}.`], 'en-US');
            ctx.later(() => {
              n++;
              if (n >= R) ctx.finish({ firstTry, total: R });
              else round();
            }, 2100);
          },
        })),
    );
    ctx.prompt(
      it.pos === 'start' ? '단어를 잘 듣고, 첫소리 글자가 박힌 보석을 캐요!' : '이번엔 끝소리! 단어의 마지막 소리 글자 보석을 캐요!',
      say,
    );
  }

  round();
}
