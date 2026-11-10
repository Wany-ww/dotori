import { h, shuffle, pick, pickN, cheer, makeHinter, choiceSet, wordPic, charFace } from '../ui.js';
import { speak } from '../audio.js';
import { WORDS, WORDS2, QUIZ_SYLLABLES, QUIZ_BATCHIM, similarSyllables } from '../data.js';

const Q = 6;

export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const nOpt = [2, 3, 3, 4, 4][L - 1];
  // 한글 차시: 그 차시의 글자와 그림 낱말로 문제를 낸다 (그림 낱말이 적은 차시는 소리 문제만)
  const syllables = lesson ? lesson.syllables(12) : L >= 4 ? [...QUIZ_SYLLABLES, ...QUIZ_BATCHIM] : QUIZ_SYLLABLES;
  const words = lesson ? lesson.words(12, { pic: true }) : L >= 4 ? WORDS2 : WORDS;
  const pictures = !lesson || lesson.picCount >= 4;
  const near = (s, n) => (lesson ? lesson.alike(s, n) : similarSyllables(s).slice(0, n));
  const hinter = makeHinter();
  const stamps = Array.from({ length: Q }, () => h('span', { class: 'stamp' }));
  const bubble = h('div', { class: 'quiz-bubble' }, '퀴즈를 풀어서 우표를 모아 보자!');
  const body = h('div', { class: 'quiz-body' });
  stage.append(h('div', { class: 'quiz' },
    h('div', { class: 'quiz-host' }, h('span', { class: 'quiz-pet', 'aria-hidden': 'true' }, charFace('fox', '🦊')), bubble),
    h('div', { class: 'stamps', 'aria-label': '모은 우표' }, stamps),
    body));
  let n = 0;
  let firstTry = 0;
  let lastSyl = '';

  const done = (miss) => {
    if (miss === 0) firstTry++;
    stamps[n].replaceChildren(h('img', { class: 'stamp-img', src: 'assets/ui/stamp.webp', alt: '', onerror: (e) => e.currentTarget.replaceWith('💌') }));
    stamps[n].classList.add('got');
    bubble.textContent = ['우와, 맞았어!', '최고야!', '정말 잘한다!'][n % 3];
    ctx.later(() => {
      n++;
      if (n >= Q) ctx.finish({ firstTry, total: Q });
      else round();
    }, 1500);
  };

  function listenRound() {
    let ans = pick(syllables);
    while (ans === lastSyl) ans = pick(syllables);
    lastSyl = ans;
    const options = shuffle([ans, ...near(ans, nOpt - 1)]);
    body.replaceChildren(
      h('button', { class: 'btn btn-sun listen-btn', type: 'button', onclick: () => speak(ans) }, '🔊 소리 듣기'),
      choiceSet(options, {
        answer: ans,
        hinter,
        cls: 'choice',
        onCorrect: (b, miss) => { cheer(b); speak(ans); done(miss); },
      }),
    );
    ctx.prompt('소리를 잘 듣고 알맞은 글자를 골라요.', () => speak(ans));
  }

  function pictureRound() {
    const w = pick(words);
    // 소리와 글자가 다른 차시는 같은 소리로 들리는 철자를 함정으로 (숲/숩)
    const spell = lesson?.kind === 'rule' ? lesson.respell(w.word, nOpt - 1) : [];
    const others = [...spell, ...pickN(words.filter((x) => x.word !== w.word), nOpt - 1).map((x) => x.word)].slice(0, nOpt - 1);
    body.replaceChildren(
      h('div', { class: 'big-pic', 'aria-hidden': 'true' }, wordPic(w.word, w.emoji)),
      choiceSet(shuffle([w.word, ...others]), {
        answer: w.word,
        hinter,
        cls: 'choice word',
        onCorrect: (b, miss) => { cheer(b); speak(w.word); done(miss); },
      }),
    );
    ctx.prompt('그림에 알맞은 낱말을 골라요.', () => speak('이 그림은 무엇일까요?'));
  }

  function round() {
    hinter.reset();
    ctx.progress(n, Q);
    if (n % 2 === 0 || !pictures) listenRound();
    else pictureRound();
  }

  round();
}
