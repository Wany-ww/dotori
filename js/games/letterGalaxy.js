import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { LETTER_GALAXY, QUIZ_SYLLABLES, similarSyllables } from '../data.js';
import { galaxyBar } from './galaxy.js';

const R = 5;
const PAD = [8, 8, 10, 12, 12];

// 글자 고르기 은하: 문장을 듣고 빈칸 낱말을 글자 단추로 만든다
export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const len = L <= 2 ? 2 : 3;
  // 한글 차시: 문장 차시는 그 차시의 문장 빈칸, 아니면 그 차시의 낱말을 그림과 함께 만든다
  const fromLesson = () => {
    const ss = lesson.sentences(R).filter((s) => s.blank);
    if (ss.length >= 3) return ss.map((s) => ({ w: s.blank.answer, before: s.blank.before, after: s.blank.after, e: s.e }));
    return lesson.words(R, { minLen: 2, maxLen: 3 }).map((w) => ({ w: w.word, before: '', after: '', e: w.emoji || '🔊' }));
  };
  const items = lesson ? fromLesson() : pickN(LETTER_GALAXY.filter((x) => [...x.w].length === len), R);
  const nearOf = (c, n) => (lesson ? lesson.alike(c, n) : similarSyllables(c).slice(0, n));
  const fillPool = lesson ? lesson.syllables(16) : QUIZ_SYLLABLES;
  const hinter = makeHinter();
  const bar = galaxyBar(R, { counter: 'hearts' });
  const body = h('div', { class: 'lt-body' });
  stage.append(h('div', { class: 'galaxy letters' }, bar.el, body));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = items[n];
    const target = [...it.w];
    const full = (it.before || '') + it.w + it.after;
    let typed = [];
    let roundMiss = 0;
    let done = false;

    // 정답 글자 + 모양이 비슷한 함정 글자 + 아무 글자로 단추판을 채운다
    const near = target.flatMap((c) => nearOf(c, L >= 4 ? 2 : 1));
    const fill = shuffle([...fillPool, ...QUIZ_SYLLABLES].filter((s) => !target.includes(s)));
    const keys = shuffle([...new Set([...target, ...near, ...fill])].slice(0, PAD[L - 1]));

    const boxes = target.map(() => h('span', { class: 'lt-box' }));
    const input = h('span', { class: 'lt-typed' });
    const pad = keys.map((s) => h('button', { class: 'lt-key', type: 'button', 'data-s': s }, s));

    const paint = () => {
      boxes.forEach((b, i) => { b.textContent = typed[i] || ''; b.classList.toggle('on', i < typed.length); });
      input.replaceChildren(...target.map((_, i) => h('i', { class: i < typed.length ? 'got' : i === typed.length ? 'now' : '' }, typed[i] || '')));
    };
    function submit() {
      if (typed.join('') === it.w) {
        done = true;
        if (roundMiss === 0) firstTry++;
        boxes.forEach((b) => b.classList.add('ok'));
        sfx.correct();
        cheer(boxes[boxes.length - 1]);
        speak(full);
        ctx.later(() => {
          n++;
          bar.progress(n);
          if (n >= R) ctx.finish({ firstTry, total: R, bonus: bar.hearts });
          else round();
        }, 2000);
        return;
      }
      roundMiss++;
      bar.loseHeart();
      boxes.forEach((b) => wiggle(b));
      const wrongAt = typed.findIndex((c, i) => c !== target[i]);
      typed = typed.slice(0, Math.max(0, wrongAt));
      paint();
      hinter.miss(pad.find((b) => b.dataset.s === target[typed.length]));
    }
    pad.forEach((b) => b.addEventListener('click', () => {
      if (done || typed.length >= target.length) return;
      typed.push(b.dataset.s);
      sfx.tap();
      pop(b);
      paint();
      if (typed.length === target.length) ctx.later(submit, 250);
    }));
    const back = h('button', {
      class: 'lt-back', type: 'button', 'aria-label': '한 글자 지우기',
      onclick: () => { if (!done && typed.length) { typed.pop(); paint(); } },
    }, '⌫');

    body.replaceChildren(
      h('p', { class: 'lt-sentence' },
        L <= 3 || lesson ? h('span', { class: 'lt-emoji', 'aria-hidden': 'true' }, wordPic(it.w, it.e)) : null,
        it.before ? h('span', {}, it.before) : null,
        h('span', { class: 'lt-boxes', 'aria-label': `빈칸 ${target.length}글자` }, boxes),
        h('span', {}, it.after)),
      h('div', { class: 'lt-input' }, input, back),
      h('div', { class: 'lt-pad', style: { gridTemplateColumns: `repeat(${Math.ceil(keys.length / 2)}, 1fr)` } }, pad),
    );
    paint();
    ctx.prompt(
      L >= 5 ? '문장을 읽고, 빈칸에 들어갈 낱말을 글자 단추로 만들어요.' : '문장을 잘 듣고, 빈칸에 들어갈 낱말을 글자 단추로 만들어요.',
      () => speak(full),
      { auto: L < 5 },
    );
  }

  round();
}
