import { h, shuffle, pickN, cheer, burst, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SENTENCES, READ_PASSAGES } from '../data.js';
import { EASY_SENTENCES } from '../lexicon.js';
import { makeMic } from './sayKit.js';

// 단계별 문장 길이(어절 수)와 먼저 읽어 주는지
const CFG = [
  { len: 2, model: true },
  { len: 2, model: false },
  { len: 3, model: false },
  { len: 4, model: false },
  { len: 4, model: false },
];

// 한 줄을 어절마다 전구가 달린 글줄로 만든다
function bulbLine(text) {
  const words = text.split(' ');
  const cells = words.map((w) => h('span', { class: 'lu-word' }, h('i', { class: 'lu-bulb', 'aria-hidden': 'true' }), h('span', { class: 'lu-w' }, w)));
  const el = h('p', { class: 'lu-line' }, cells);
  return {
    el,
    words: words.map((w) => w.replace(/[.,!?]/g, '')),
    light(hits) { hits.forEach((on, i) => { if (on) cells[i].classList.add('on'); }); },
    all() { cells.forEach((c) => c.classList.add('on')); },
  };
}

// 전구 켜기(LightUp): 문장을 소리 내어 읽으면 읽은 어절마다 전구에 불이 켜진다
// 읽고 답해요(ReadingActivity, opts.passage): 짧은 글을 한 줄씩 읽어 불을 켠 다음, 글에 대한 질문에 답한다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const passage = Boolean(ctx.opts.passage);
  const hinter = makeHinter();
  const room = h('div', { class: 'lu-room' });
  const board = h('div', { class: 'lu-board' });
  const below = h('div', { class: 'lu-below' });
  const mic = makeMic(ctx, { lang: 'ko-KR' });
  stage.append(h('div', { class: `lightup${passage ? ' passage' : ''}` }, room, board, mic.el, below));

  let firstTry = 0;
  let n = 0;

  // 읽을 문장: 차시에 문장이 있으면 그 문장, 없으면 단계별 어절 수의 문장
  const pickSentences = (k) => {
    const fromLesson = ctx.lesson?.sentences(k).map((s) => ({ text: s.text, e: s.e })) || [];
    if (fromLesson.length >= k) return fromLesson;
    const pool = cfg.len === 2
      ? [...SENTENCES[2].map((s) => ({ text: s.words.join(' '), e: s.e })), ...EASY_SENTENCES.map(([e, text]) => ({ text, e }))]
      : SENTENCES[cfg.len].map((s) => ({ text: s.words.join(' '), e: s.e }));
    return [...fromLesson, ...pickN(pool, k)].slice(0, k);
  };

  async function readLine(line, model) {
    if (model) {
      mic.wait('먼저 들어 봐요');
      await speak(line.el.textContent.trim());
      if (!ctx.alive) return null;
    }
    line.el.classList.add('now');
    const res = await mic.ask({
      words: line.words,
      hint: '마이크를 누르고 소리 내어 읽어요!',
      onHits: (hits) => line.light(hits),
    });
    line.el.classList.remove('now');
    line.all();
    return res;
  }

  /* ---------- 전구 켜기 ---------- */
  const R = 4;
  const sentences = passage ? [] : pickSentences(R);

  async function sentenceRound() {
    ctx.progress(n, R);
    const s = sentences[n];
    room.classList.remove('lit');
    room.replaceChildren(h('span', { class: 'lu-art', 'aria-hidden': 'true' }, s.e || '💡'));
    const line = bulbLine(s.text);
    board.replaceChildren(line.el);
    ctx.prompt('문장을 소리 내어 읽어 봐요. 읽은 낱말마다 전구에 불이 켜져요!', () => speak(s.text), { auto: false });
    const res = await readLine(line, cfg.model);
    if (!res || !ctx.alive) return;
    if (res.tries === 1 && !res.skipped) firstTry++;
    room.classList.add('lit');
    sfx.correct();
    burst(board, ['💡', '✨', '⭐']);
    cheer(board);
    ctx.later(() => speak(s.text), 400);
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else sentenceRound();
    }, 2600);
  }

  /* ---------- 읽고 답해요 ---------- */
  const PR = 2;
  const passages = passage ? pickN(READ_PASSAGES.filter((x) => x.min <= L && x.min >= L - 2), PR) : [];
  let total = 0;

  async function passageRound() {
    ctx.progress(n, PR);
    const ps = passages[n];
    hinter.reset();
    below.replaceChildren();
    room.classList.remove('lit');
    room.replaceChildren(h('span', { class: 'lu-art', 'aria-hidden': 'true' }, '📖'));
    const lines = ps.lines.map(bulbLine);
    board.replaceChildren(...lines.map((l) => l.el));
    ctx.prompt('글을 한 줄씩 또박또박 소리 내어 읽어요. 다 읽으면 질문에 답해요!', () => speak(ps.lines.join(' ')), { auto: false });
    for (const line of lines) {
      const res = await readLine(line, L === 1);
      if (!res || !ctx.alive) return;
      total++;
      if (res.tries === 1 && !res.skipped) firstTry++;
      sfx.pop();
    }
    room.classList.add('lit');
    mic.wait('');
    // 질문: 그림과 낱말 보기 셋 중에서 고른다
    const opts = shuffle(ps.a);
    total++;
    below.replaceChildren(
      h('p', { class: 'lu-q' }, `❓ ${ps.q}`),
      choiceSet(opts, {
        answer: ps.a[0],
        hinter,
        cls: 'choice lu-choice',
        render: ([w, e]) => [h('span', { class: 'lu-ce', 'aria-hidden': 'true' }, e), h('span', {}, w)],
        label: ([w]) => w,
        onCorrect: (btn, miss) => {
          if (miss === 0) firstTry++;
          cheer(btn);
          speak(ps.a[0][0]);
          ctx.later(() => {
            n++;
            if (n >= PR) ctx.finish({ firstTry, total });
            else passageRound();
          }, 1800);
        },
      }),
    );
    speak(ps.q);
  }

  if (passage) passageRound();
  else sentenceRound();
}
