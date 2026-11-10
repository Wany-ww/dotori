import { h, shuffle, pickN, cheer, makeHinter, choiceSet, wordPic } from '../ui.js';
import { speak } from '../audio.js';
import { WORDS, WORDS2 } from '../data.js';
import { galaxyBar } from './galaxy.js';

const Q = 8;
const N_OPT = [2, 3, 3, 4, 4];

// 낱말 퀴즈 은하: 그림(과 소리)에 맞는 낱말을 골라 우주선을 앞으로 보낸다
export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  // 한글 차시: 그 차시의 그림 낱말 (그림이 모자라면 그림 대신 🔊)
  const pool = lesson ? lesson.words(Q + 8, { pic: lesson.picCount >= 4 }) : L >= 4 ? [...WORDS2, ...WORDS] : L === 3 ? [...WORDS, ...WORDS2] : WORDS;
  const qs = lesson ? pool.slice(0, Q) : pickN(pool, Q);
  const hinter = makeHinter();
  const bar = galaxyBar(Q);
  const body = h('div', { class: 'wq-body' });
  stage.append(h('div', { class: 'galaxy wq' }, bar.el, body));
  let n = 0;
  let firstTry = 0;

  // Lv3부터는 글자 수가 같고 글자가 겹치는 낱말을 함정 보기로 고른다
  function distractors(w) {
    const others = pool.filter((x) => x.word !== w.word);
    // 소리와 글자가 다른 차시는 같은 소리로 들리는 철자가 함정 (꽃/꼳)
    if (lesson?.kind === 'rule') {
      const spell = lesson.respell(w.word, N_OPT[L - 1] - 1);
      return [...spell, ...pickN(others, N_OPT[L - 1] - 1).map((x) => x.word)].slice(0, N_OPT[L - 1] - 1);
    }
    if (L < 3) return pickN(others, N_OPT[L - 1] - 1).map((x) => x.word);
    const close = shuffle(others).sort((a, b) => score(b) - score(a));
    function score(x) {
      return (x.word.length === w.word.length ? 2 : 0) + [...x.word].filter((c) => w.word.includes(c)).length;
    }
    return close.slice(0, N_OPT[L - 1] - 1).map((x) => x.word);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, Q);
    const w = qs[n];
    const say = () => speak(w.word);
    body.replaceChildren(
      h('div', { class: 'wq-card' },
        h('button', { class: 'wq-sound', type: 'button', 'aria-label': '낱말 듣기', onclick: say }, '🔊'),
        h('span', { class: 'wq-pic', 'aria-hidden': 'true' }, w.emoji ? wordPic(w.word, w.emoji) : '🔊')),
      choiceSet(shuffle([w.word, ...distractors(w)]), {
        answer: w.word,
        hinter,
        cls: 'choice wq-choice',
        onCorrect: (btn, miss) => {
          if (miss === 0) firstTry++;
          bar.star();
          cheer(btn);
          say();
          ctx.later(() => {
            n++;
            bar.progress(n);
            if (n >= Q) ctx.finish({ firstTry, total: Q });
            else round();
          }, 1300);
        },
      }),
    );
    // Lv4부터는 소리를 저절로 들려주지 않고 글자를 읽어서 고른다
    ctx.prompt(L >= 4 ? '그림에 맞는 낱말을 읽고 골라요. 모르면 🔊를 눌러요.' : '그림을 보고 소리를 들으며 알맞은 낱말을 골라요.', say, { auto: L < 4 });
  }

  round();
}
