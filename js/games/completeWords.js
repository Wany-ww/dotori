import { h, shuffle, pickN, cheer, makeHinter, choiceSet, wordPic } from '../ui.js';
import { speak } from '../audio.js';
import { WORDS, WORDS2, similarSyllables } from '../data.js';

const R = 5;

export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const pool = L >= 4 ? WORDS2 : L === 3 ? [...WORDS, ...WORDS2] : WORDS;
  // 한글 차시: 그 차시의 그림 낱말. 빈칸은 배우는 낱자가 들어간 글자, 보기는 그 차시에서 헷갈리는 글자
  // (소리와 글자가 다른 차시는 같은 소리가 나는 다른 철자가 함정: 앞/압)
  const words = lesson ? lesson.words(R, { pic: lesson.picCount >= 4 }) : pickN(pool, R);
  const blankOf = (chars) => {
    if (!lesson) return Math.floor(Math.random() * chars.length);
    const i = chars.findIndex((s) => (lesson.kind === 'rule' ? lesson.respell(s, 1).length : lesson.slot && lesson.hasFocus(s)));
    return i >= 0 ? i : Math.floor(Math.random() * chars.length);
  };
  const optionsFor = (answer, n) => {
    const near = lesson ? lesson.alike(answer, n) : similarSyllables(answer).slice(0, n);
    return near.length >= n ? near : [...near, ...similarSyllables(answer).filter((s) => !near.includes(s))].slice(0, n);
  };
  const count = [2, 3, 3, 4, 5][L - 1];
  const hinter = makeHinter();
  const root = h('div', { class: 'complete' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const w = words[n];
    const chars = [...w.word];
    const bi = blankOf(chars);
    const answer = chars[bi];
    const options = shuffle([answer, ...optionsFor(answer, count - 1)]);
    const boxes = chars.map((ch, i) => h('span', { class: `char-box${i === bi ? ' blank' : ''}` }, i === bi ? '?' : ch));

    root.replaceChildren(
      h('div', { class: 'flash-card' },
        h('div', { class: 'flash-head' }, h('span', {}, '낱말 카드'), h('span', { class: 'flash-no' }, `${n + 1} / ${R}`)),
        h('div', { class: 'flash-body' },
          h('span', { class: 'flash-pic', 'aria-hidden': 'true' }, w.emoji ? wordPic(w.word, w.emoji) : '🔊'),
          h('div', { class: 'char-row', 'aria-label': '빈칸이 있는 낱말' }, boxes))),
      choiceSet(options, {
        answer,
        hinter,
        cls: 'choice letter-tile',
        onCorrect: (btn, miss) => {
          if (miss === 0) firstTry++;
          const box = boxes[bi];
          box.textContent = answer;
          box.classList.remove('blank');
          box.classList.add('filled');
          cheer(box);
          speak(w.word);
          ctx.later(() => {
            n++;
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 1600);
        },
      }),
    );
    // Lv4 이상은 소리 힌트를 자동으로 들려주지 않고, 스피커 버튼으로만 듣는다
    ctx.prompt(
      L >= 4 ? '그림을 보고 빈칸에 들어갈 글자를 골라요. 모르면 🔊를 눌러요.' : '그림을 보고 소리를 들으며, 빈칸에 들어갈 글자를 골라요.',
      () => speak(w.word),
      { auto: L < 4 },
    );
  }

  round();
}
