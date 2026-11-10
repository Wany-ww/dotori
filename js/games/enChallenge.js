import { h, shuffle, pickN } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { enUnitOf, grammarPhrase, grammarForms } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const Q = 5;
const CONSONANTS = 'bcdfghjklmnprstvw'.split('');
const VOWELS = 'aeiou'.split('');

export const TITLES = { word: 'WORD CHALLENGE', phonics: 'PHONICS CHALLENGE', listening: 'LISTENING CHALLENGE', grammar: 'GRAMMAR CHALLENGE', pet: 'PET QUIZ' };
export const SAY_TITLE = { word: 'Word Challenge!', phonics: 'Phonics Challenge!', listening: 'Listening Challenge!', grammar: 'Grammar Challenge!', pet: 'Pet Quiz!' };
export const ASK = {
  word: ['Read and choose the correct picture.', 'Listen and choose the correct picture.'],
  phonics: 'Listen and choose the missing letter.',
  listening: 'Listen and choose the correct picture.',
  grammar: 'Read and choose the correct picture.',
  pet: ['Listen and choose the correct picture.', 'Listen and choose the correct word.', 'Read and choose the correct picture.'],
};
// 펫 퀴즈: 낱말 카드로 먼저 익힌 차시 단어 6개를 12문제로 (듣고 그림 · 듣고 낱말 · 읽고 그림)
const PET_WORDS = 6;
const PET_Q = 12;


/* ---------- 문제 만들기: { show, say, blank, options:[{key, pic|txt}], answer, after } ---------- */
function wordQs(U) {
  const ws = U.words(12, { pic: true });
  return ws.slice(0, Q).map((x, i) => {
    const others = pickN(ws.filter((y) => y.w !== x.w && y.e !== x.e), 2);
    const listen = i % 2 === 1;
    return {
      ask: ASK.word[listen ? 1 : 0], text: listen ? null : x.w, say: x.w, auto: listen,
      answer: x.w, options: shuffle([x, ...others]).map((y) => ({ key: y.w, pic: y.e })),
    };
  });
}

function phonicsQs(U) {
  const all = U.words(20, { pic: true, spell: true, maxLen: 5 });
  const ws = [...all.filter((x) => x.w.length <= 4), ...all.filter((x) => x.w.length > 4)];
  // 소리 · 첫소리 · 단어 가족 차시는 첫 글자, 짧은 모음 · 긴 모음 차시는 가운데 모음이 빈칸
  const vowelGap = U.vowels || U.kind === 'long';
  const focus = U.focus.map((L) => L.toLowerCase()).filter((c) => CONSONANTS.includes(c));
  return ws.slice(0, Q).map((x) => {
    const pos = vowelGap ? [...x.w].findIndex((c) => VOWELS.includes(c)) : 0;
    const ans = x.w[pos];
    const pool = VOWELS.includes(ans) ? VOWELS : [...focus, ...shuffle(CONSONANTS)];
    const others = [...new Set(pool.filter((c) => c !== ans))].slice(0, 6);
    return {
      ask: ASK.phonics, pic: x.e, say: x.w, auto: true, after: x.w,
      blank: [x.w.slice(0, pos), x.w.slice(pos + 1)],
      answer: ans, options: shuffle([ans, ...pickN(others, 2)]).map((c) => ({ key: c, txt: c })),
    };
  });
}

// 차시 문장이 없는 단계(B · C)는 이름 단어로 "I see a cat." · "I see two cats." 문장을 만든다
function listenLines(U) {
  if (U.sentenceUnit || U.kind === 'alpha') return U.sentences(12);
  return U.things(8).map((x, i) => (i % 2
    ? { e: `${x.e}${x.e}`, text: `I see ${grammarPhrase(x.w, 2)}.` }
    : { e: x.e, text: `I see ${grammarPhrase(x.w, 1)}.` }));
}

function listeningQs(U) {
  const seen = new Set();
  const ss = listenLines(U).filter((s) => s.e && !seen.has(s.e) && seen.add(s.e));
  // 문장 그림이 모자라면 차시 단어 그림으로 보기를 채운다
  const fill = U.words(8, { pic: true }).filter((x) => !seen.has(x.e)).map((x) => x.e);
  return ss.slice(0, Q).map((s) => {
    const others = [...pickN(ss.filter((t) => t !== s).map((t) => t.e), 2)];
    while (others.length < 2) others.push(fill[others.length]);
    return { ask: ASK.listening, say: s.text, auto: true, after: s.text, answer: s.e, options: shuffle([s.e, ...others]).map((e) => ({ key: e, pic: e })) };
  });
}

function grammarQs(U) {
  const { counts, sizes } = grammarForms(U.level);
  const nouns = U.things(Q * 2);
  const key = (x, n, size) => `${x.w}|${n}|${size}`;
  const card = (x, n, size) => ({ key: key(x, n, size), pic: Array(n).fill(x.e).join(''), size });
  return nouns.slice(0, Q).map((x, i) => {
    const n = counts[i % counts.length];
    const size = sizes[Math.floor(i / 2) % sizes.length];
    const other = nouns[(i + Q) % nouns.length];
    // 함정: 수만 다른 그림, 크기만 다른 그림, 같은 수의 다른 그림
    // (크기 말이 없는 "a rocket"에는 크기 함정을 넣지 않는다 — 큰 로켓도 a rocket이라서)
    const traps = shuffle([
      card(x, counts.find((c) => c !== n), size),
      ...(size ? [card(x, n, size === 'big' ? 'small' : 'big')] : []),
      card(other, n, size),
    ]);
    const phrase = grammarPhrase(x.w, n, size);
    return { ask: ASK.grammar, text: phrase, say: phrase, auto: true, answer: key(x, n, size), options: shuffle([card(x, n, size), ...traps.slice(0, 2)]) };
  });
}

function petQs(U, ws) {
  return Array.from({ length: PET_Q }, (_, i) => {
    const x = ws[i % ws.length];
    const type = i % 3;
    const others = pickN(ws.filter((y) => y.w !== x.w && y.e !== x.e), 2);
    const opts = shuffle([x, ...others]);
    return {
      ask: ASK.pet[type], say: x.w, auto: type !== 2, text: type === 2 ? x.w : null, answer: x.w,
      options: type === 1 ? opts.map((y) => ({ key: y.w, txt: y.w })) : opts.map((y) => ({ key: y.w, pic: y.e })),
    };
  });
}

const MAKE = { word: wordQs, phonics: phonicsQs, listening: listeningQs, grammar: grammarQs };

// 영어 챌린지(WordChallenge · PhonicsChallenge · ListeningChallenge · GrammarChallenge):
// 제목판을 보여 준 뒤, 그 차시 내용으로 5문제. 문제마다 한 번만 고르고(틀리면 ✕, 정답을 보여 주고 다음 문제로),
// 소리를 들려주는 동안에는 보기를 흐리게 둔다
export function mount(stage, ctx) {
  const kind = ctx.opts.kind || 'word';
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= ctx.level)));
  const petWords = kind === 'pet' ? U.words(PET_WORDS, { pic: true, maxLen: 10 }) : null;
  const qs = kind === 'pet' ? petQs(U, petWords) : MAKE[kind](U);
  const purple = kind === 'listening' || kind === 'grammar';
  const marks = qs.map(() => h('i'));
  const dog = h('div', { class: 'ech-dog', 'aria-hidden': 'true' }, h('span', { class: 'ech-face' }, '🐶'), h('span', { class: 'ech-podium' }, 'QUIZ'));
  const card = h('div', { class: 'ech-card' });
  const opts = h('div', { class: 'ech-opts' });
  const head = h('div', { class: 'ech-head' }, h('b', {}, `Level ${U.code}-${U.no}`), h('span', { class: 'ech-dots', 'aria-hidden': 'true' }, marks));
  const play = h('div', { class: 'ech-play' }, head, card, h('div', { class: 'ech-row' }, opts, dog));
  const title = h('div', { class: 'ech-title' }, h('span', { class: 'ech-flag', 'aria-hidden': 'true' }, purple ? '🚩' : '⛺'),
    h('b', {}, TITLES[kind]), h('small', {}, `Level ${U.code} · ${U.no}차시`));
  const root = h('div', { class: `ech ${kind === 'pet' ? 'teal' : purple ? 'purple' : 'wood'}` }, title, play);
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  const begin = () => {
    root.classList.add('titled');
    ctx.prompt(SAY_TITLE[kind], () => speak(SAY_TITLE[kind], 'en-US'));
    ctx.later(() => { root.classList.add('go'); round(); }, 1700);
  };
  if (kind === 'pet') cards(); else begin();

  // 펫 퀴즈 앞: 오늘 단어를 두 장씩 낱말 카드로 보며 듣는다 (→ 를 눌러 넘긴다)
  function cards() {
    const pages = [];
    for (let i = 0; i < petWords.length; i += 2) pages.push(petWords.slice(i, i + 2));
    let k = 0;
    const deck = h('div', { class: 'ech-deck' });
    root.prepend(deck);
    const show = () => {
      const ws = pages[k];
      const next = h('button', { class: 'ech-next', type: 'button', 'aria-label': '다음 카드' }, '➜');
      deck.replaceChildren(h('div', { class: 'ech-fcard' }, ws.map((x) => h('button', { class: 'ech-fword', type: 'button', onclick: () => speak(x.w, 'en-US') },
        h('span', { class: 'ech-pic big', 'aria-hidden': 'true' }, x.e), h('b', {}, x.w))), next));
      next.addEventListener('click', () => {
        sfx.tap();
        k++;
        if (k < pages.length) { show(); return; }
        deck.remove();
        begin();
      });
      speak(ws.map((x) => x.w), 'en-US');
    };
    ctx.prompt('펫 퀴즈 전에 오늘 낱말을 카드로 익혀요. 다 봤으면 ➜ 를 눌러요.', () => speak(pages[k].map((x) => x.w), 'en-US'));
    show();
  }

  function round() {
    const q = qs[n];
    marks.forEach((m, i) => m.classList.toggle('now', i === n));
    dog.className = 'ech-dog';
    const say = () => speak(q.say, 'en-US');
    const btn = h('button', { class: 'ech-say', type: 'button', 'aria-label': 'Listen again', onclick: () => { sfx.tap(); listen(); } }, '🔊');
    const word = q.blank
      ? h('p', { class: 'ech-word' }, q.blank[0], h('span', { class: 'ech-gap' }, '_'), q.blank[1])
      : q.text ? h('p', { class: 'ech-word' }, q.text) : null;
    card.replaceChildren(...[
      kind === 'listening' ? h('p', { class: 'ech-ask' }, q.ask) : null,
      q.pic ? h('span', { class: 'ech-pic big', 'aria-hidden': 'true' }, q.pic) : null,
      h('div', { class: 'ech-mid' }, q.text && kind === 'word' ? null : btn, word),
    ].filter(Boolean));
    card.classList.remove('enter');
    void card.offsetWidth;
    card.classList.add('enter');
    let locked = false;
    const buttons = q.options.map((o) => {
      const b = h('button', { class: `ech-opt${o.txt ? ' letter' : ''}`, type: 'button', 'aria-label': o.txt || o.key },
        o.txt ? h('span', { class: 'ech-txt' }, o.txt) : h('span', { class: `ech-pic ${o.size || ''}`, 'aria-hidden': 'true' }, o.pic));
      b.dataset.a = o.key === q.answer ? '1' : '0';
      b.addEventListener('click', () => choose(b, o));
      return b;
    });
    opts.className = `ech-opts${q.auto ? ' wait' : ''}`;
    opts.replaceChildren(...buttons);

    function listen() {
      btn.classList.add('on');
      let opened = false;
      const open = () => {
        if (opened || !ctx.alive) return;
        opened = true;
        btn.classList.remove('on');
        opts.classList.remove('wait');
      };
      say().then(open, open);
      ctx.later(open, 2400 + q.say.length * 90);
    }
    ctx.prompt(q.ask, q.auto ? listen : () => speak(q.ask, 'en-US'));

    function choose(b, o) {
      if (locked || opts.classList.contains('wait')) return;
      locked = true;
      const ok = o.key === q.answer;
      marks[n].classList.add(ok ? 'ok' : 'miss');
      dog.classList.add(ok ? 'happy' : 'sad');
      if (ok) {
        firstTry++;
        sfx.correct();
        b.classList.add('ok');
      } else {
        sfx.wrong();
        b.classList.add('miss');
        buttons.find((x) => x.dataset.a === '1').classList.add('show');
      }
      // 파닉스는 빈칸이 채워져 단어가 된다
      if (q.blank) card.querySelector('.ech-word').replaceChildren(q.after);
      if (q.after || q.text) speak(q.after || q.say, 'en-US');
      ctx.later(() => {
        n++;
        if (n < qs.length) round();
        else ctx.finish({ firstTry, total: qs.length });
      }, ok ? 1500 : 2100);
    }
  }
}
