import { h, shuffle, pick, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SENTENCES } from '../data.js';

const R = 4;

export function mount(stage, ctx) {
  const L = ctx.level;
  const len = L <= 2 ? 2 : L === 3 ? 3 : 4;
  // 한글 차시: 그 차시의 문장 (받침 전에는 받침 없는 쉬운 문장, 소리와 글자가 다른 차시는 그 낱말이 든 문장)
  const fromLesson = ctx.lesson ? ctx.lesson.sentences(R).map((s) => ({ words: s.words, e: s.e })) : [];
  const sentences = fromLesson.length >= R ? fromLesson : [...fromLesson, ...pickN(SENTENCES[len], R)].slice(0, R);
  const hinter = makeHinter();
  const root = h('div', { class: 'sentence' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const s = sentences[n];
    const text = s.words.join(' ');
    const extra = L >= 5 ? [pick(SENTENCES.extra)] : [];
    const slots = s.words.map(() => h('span', { class: 'sent-slot' }, '?'));
    const cards = shuffle([...s.words, ...extra]).map((w) => h('button', { class: 'word-tile', type: 'button' }, w));
    let k = 0;
    let roundMiss = 0;

    const expectedCard = () => cards.find((c) => !c.disabled && c.textContent.replace('👆', '') === s.words[k]);

    cards.forEach((card) => {
      const word = card.textContent;
      card.addEventListener('click', () => {
        if (card.disabled || k >= s.words.length) return;
        if (word !== s.words[k]) {
          roundMiss++;
          wiggle(card);
          hinter.miss(expectedCard());
          return;
        }
        hinter.reset();
        card.disabled = true;
        card.classList.add('used');
        slots[k].textContent = word;
        slots[k].classList.add('filled');
        pop(slots[k]);
        sfx.pop();
        k++;
        if (k < s.words.length) {
          speak(word);
          return;
        }
        if (roundMiss === 0) firstTry++;
        sfx.correct();
        cheer(slots[k - 1]);
        speak(text);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 2200);
      });
    });

    root.replaceChildren(
      h('div', { class: 'sketchbook' },
        h('span', { class: 'sketch-rings', 'aria-hidden': 'true' }),
        h('div', { class: 'sketch-art', 'aria-hidden': 'true' }, s.e),
        h('div', { class: 'sent-row', 'aria-label': '문장 칸' }, slots)),
      h('div', { class: 'word-tray' }, cards),
    );
    ctx.prompt(
      extra.length ? '문장에 필요 없는 낱말이 하나 숨어 있어요! 알맞은 낱말만 순서대로 눌러요.' : '문장을 듣고, 낱말 조각을 순서대로 눌러 문장을 만들어요.',
      () => speak(text),
      { auto: L < 5 },
    );
  }

  round();
}
