import { h, shuffle, pickN, cheer, makeHinter, choiceSet } from '../ui.js';
import { speak } from '../audio.js';
import { VOCAB, VOCAB2 } from '../data.js';

const R = 6;
const article = (w) => (/^[aeiou]/.test(w) ? 'an' : 'a');

// 모드: picture(그림→단어 고르기), listen(소리→그림 고르기), read(소리 없이 단어 읽고→그림 고르기, Lv5)
const MODES = [
  ['picture', 'listen'],
  ['picture', 'listen'],
  ['picture', 'listen'],
  ['picture', 'listen', 'picture'],
  ['picture', 'read', 'listen'],
];

export function mount(stage, ctx) {
  const L = ctx.level;
  const pool = ctx.unit ? ctx.unit.words(R + 4) : L >= 4 ? VOCAB2 : L === 3 ? [...VOCAB, ...VOCAB2] : VOCAB;
  const words = pickN(pool, R);
  const nOpt = [2, 3, 3, 4, 4][L - 1];
  const modes = MODES[L - 1];
  const hinter = makeHinter();
  const root = h('div', { class: 'what' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  const next = () => {
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 1700);
  };

  function pictureChoices(it, options, onDone) {
    return choiceSet(options, {
      answer: it,
      hinter,
      cls: 'choice emoji',
      label: (o) => `그림 ${options.indexOf(o) + 1}`,
      render: (o) => o.e,
      onCorrect: (b, miss) => {
        if (miss === 0) firstTry++;
        b.append(h('span', { class: 'latin choice-caption' }, it.w));
        cheer(b, 'en');
        onDone();
        next();
      },
    });
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = words[n];
    const options = shuffle([it, ...pickN(pool.filter((v) => v.w !== it.w), nOpt - 1)]);
    const mode = modes[n % modes.length];

    if (mode === 'picture') {
      root.replaceChildren(
        h('div', { class: 'big-pic', 'aria-hidden': 'true' }, it.e),
        choiceSet(options, {
          answer: it,
          hinter,
          cls: 'choice word latin',
          render: (o) => o.w,
          onCorrect: (b, miss) => {
            if (miss === 0) firstTry++;
            cheer(b, 'en');
            speak(`It is ${article(it.w)} ${it.w}!`, 'en-US');
            next();
          },
        }),
      );
      ctx.prompt('What is this? 그림에 맞는 영어 단어를 골라요.', () => speak('What is this?', 'en-US'));
    } else if (mode === 'listen') {
      const say = () => speak([it.w, it.w], 'en-US');
      root.replaceChildren(
        h('button', { class: 'btn btn-sun listen-btn', type: 'button', onclick: say }, '🔊 Listen'),
        pictureChoices(it, options, () => speak(it.w, 'en-US')),
      );
      ctx.prompt('단어를 잘 듣고, 알맞은 그림을 골라요.', say);
    } else {
      root.replaceChildren(
        h('div', { class: 'read-word latin' }, it.w),
        pictureChoices(it, options, () => speak(it.w, 'en-US')),
      );
      ctx.prompt('소리 없이 읽기 도전! 단어를 읽고 알맞은 그림을 골라요.', () => speak('Read the word.', 'en-US'));
    }
  }

  round();
}
