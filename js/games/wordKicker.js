import { h, shuffle, pick, makeHinter, choiceSet, charFace } from '../ui.js';
import { speak } from '../audio.js';
import { JOSA_PAIRS, KICKER_NOUNS, KICKER_TEMPLATES, EN_KICK, hasBatchim } from '../data.js';

const R = 5;
const PAIRS_BY_LEVEL = [['subj'], ['subj', 'obj'], ['subj', 'obj', 'topic'], ['subj', 'obj', 'topic', 'with'], ['subj', 'obj', 'topic', 'with']];
const N_OPT = [2, 2, 2, 3, 4];
// 영어: 단계별 빈칸 종류 (a/an → is/are → he/she/they → likes/like)
const EN_KINDS = [['aan'], ['aan', 'isare'], ['isare', 'pron'], ['aan', 'isare', 'pron', 'verb'], ['aan', 'isare', 'pron', 'verb']];

function makeRound(L, used) {
  const tpl = pick(KICKER_TEMPLATES.filter((t) => PAIRS_BY_LEVEL[L - 1].includes(t.pair)));
  let noun;
  do noun = pick(KICKER_NOUNS.filter((x) => !tpl.animal || x.a));
  while (used.has(noun.w) && used.size < KICKER_NOUNS.length - 2);
  used.add(noun.w);
  const pair = JOSA_PAIRS[tpl.pair];
  const answer = hasBatchim(noun.w) ? pair[0] : pair[1];
  // Lv4~5: 다른 짝의 조사를 함정 보기로 섞는다
  const traps = shuffle(Object.entries(JOSA_PAIRS).filter(([k]) => k !== tpl.pair).flatMap(([, p]) => p));
  const options = shuffle([...pair, ...traps].slice(0, N_OPT[L - 1]));
  return { e: noun.e, before: noun.w, after: tpl.rest, answer, options, text: `${noun.w}${answer} ${tpl.rest}` };
}

// 영어: 그림을 보고 빈칸에 들어갈 a/an · is/are · He/She/They · likes/like 고르기
function enRound(L, used) {
  const kind = pick(EN_KINDS[L - 1]);
  const { opts, items } = EN_KICK[kind];
  let it;
  do it = pick(items);
  while (used.has(it[1] + it[3]) && used.size < 12);
  used.add(it[1] + it[3]);
  const [e, before, answer, after, other] = it;
  const pair = opts || [answer, other];
  const traps = shuffle(Object.values(EN_KICK).flatMap((k) => k.opts || []).filter((o) => !pair.includes(o)));
  const options = shuffle([...new Set([...pair, ...traps])].slice(0, Math.max(pair.length, N_OPT[L - 1])));
  return { e, before, after, answer, options, text: [before, answer, after].filter(Boolean).join(' ') };
}

export function mount(stage, ctx) {
  // 조사 고르기는 받침을 알아야 해서, 한글 차시에서는 받침을 배운 뒤 난이도를 따른다
  const L = ctx.lesson && !ctx.lesson.batchim ? Math.min(ctx.level, 2) : ctx.level;
  const en = ctx.lang === 'en';
  const used = new Set();
  // 영어 차시: 오늘 문장의 빈칸 (보기는 그 문장의 함정 말)
  const rounds = en && ctx.unit
    ? ctx.unit.sentences(R).map((x) => ({ e: x.e, before: x.before, after: x.after, answer: x.answer, options: shuffle([x.answer, ...x.wrong]), text: x.text }))
    : Array.from({ length: R }, () => (en ? enRound(L, used) : makeRound(L, used)));
  const say = (t) => speak(t, en ? 'en-US' : 'ko-KR');
  const hinter = makeHinter();
  const root = h('div', { class: `kicker${en ? ' en' : ''}` });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const q = rounds[n];
    const blank = h('span', { class: 'kick-blank', 'aria-label': '빈칸' }, '?');
    const ball = h('span', { class: 'ball', 'aria-hidden': 'true' }, '⚽');
    const goal = h('span', { class: 'goal', 'aria-hidden': 'true' });
    const keeper = h('span', { class: 'keeper', 'aria-hidden': 'true' }, charFace('penguin', '🐧'));

    root.replaceChildren(
      h('div', { class: 'kick-sentence' },
        h('span', { class: 'kick-emoji', 'aria-hidden': 'true' }, q.e),
        q.before ? h('span', {}, q.before) : null, blank, h('span', {}, q.after)),
      h('div', { class: 'pitch', 'aria-hidden': 'true' },
        h('span', { class: 'kick-bird' }, charFace('chick', '🐥')), ball, goal, keeper),
      choiceSet(q.options, {
        answer: q.answer,
        hinter,
        cls: 'choice kick-choice',
        onCorrect: (btn, miss) => {
          if (miss === 0) firstTry++;
          blank.textContent = q.answer;
          blank.classList.add('filled');
          ball.classList.add('shoot');
          keeper.classList.add('dive');
          ctx.later(() => { goal.classList.add('shake'); }, 650);
          ctx.later(() => { say(q.text); }, 300);
          ctx.later(() => {
            n++;
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 2300);
        },
      }),
    );
    ctx.prompt(
      L >= 5 ? '문장을 읽고, 빈칸에 알맞은 말을 골라 공을 차요! ⚽' : '새 친구의 말을 듣고, 빈칸에 알맞은 말을 골라 공을 차요! ⚽',
      () => say(q.text),
      { auto: L < 5 },
    );
  }

  round();
}
