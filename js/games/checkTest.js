import { h, shuffle, pickN } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { JAMO_NAME } from '../data.js';
import { lessonOf } from '../lesson.js';

const Q = 10;

// 차시 종류마다 내는 문제 (차시 하나에 두 문제씩, 모자라면 돌아가며 더)
const TYPES = {
  vocab: ['listenPic', 'listenPic'],
  jamoShape: ['listenJamo', 'listenJamo'],
  theme: ['picWord', 'listenWord'],
  rule: ['listenBlank', 'picSentence'],
  ruleWords: ['picWord', 'listenWord'],
  letters: ['listenSyl', 'picWord'],
};

// 헷갈리는 낱말: 규칙 차시는 같은 소리로 들리는 철자(숲/숩), 글자 차시는 배우는 자리를 바꾼 낱말(노랗다/노랃다)
function nearWords(L, word, n) {
  if (L.kind === 'rule') {
    const out = L.respell(word, n);
    if (out.length >= n) return out;
  }
  const syls = [...word];
  const order = shuffle(syls.map((_, i) => i)).sort((a, b) => Number(L.hasFocus(syls[b])) - Number(L.hasFocus(syls[a])));
  const out = new Set(L.kind === 'rule' ? L.respell(word, n) : []);
  for (const i of order) {
    L.alike(syls[i], 6).forEach((s) => out.add([...syls.slice(0, i), s, ...syls.slice(i + 1)].join('')));
    if (out.size >= n * 2) break;
  }
  out.delete(word);
  return pickN([...out], n);
}

// 차시 하나의 문제 k개
function questionsFor(L, k, used) {
  const sents = L.kind === 'rule' ? L.sentences(8).filter((s) => s.blank && !used.has(s.text)) : [];
  const picWords = L.words(12, { pic: true, maxLen: 4 }).filter((w) => w.emoji && !used.has(w.word));
  const anyWords = L.words(12, { maxLen: 4 }).filter((w) => !used.has(w.word));
  const types = L.kind === 'rule' ? TYPES[sents.length ? 'rule' : 'ruleWords']
    : TYPES[L.kind] || TYPES.letters;
  const out = [];
  for (let i = 0; out.length < k && i < k * 3; i++) {
    const q = make(types[i % types.length]);
    if (q) { q.step = L.index; out.push(q); }
  }
  return out;

  function take(list) {
    const w = list.find((x) => !used.has(x.word || x.text));
    if (w) used.add(w.word || w.text);
    return w;
  }
  function make(type) {
    if (type === 'listenPic') {
      const w = take(picWords);
      if (!w) return make('listenWord');
      const others = pickN(picWords.filter((x) => x.word !== w.word && x.emoji !== w.emoji), 2);
      if (others.length < 2) return null;
      return { type, say: w.word, answer: w.emoji, options: shuffle([w.emoji, ...others.map((x) => x.emoji)]), look: 'pic' };
    }
    if (type === 'listenJamo') {
      const pool = L.jamo(8).filter((j) => JAMO_NAME[j] && !used.has(j));
      const j = pool[0];
      if (!j) return null;
      used.add(j);
      return { type, say: JAMO_NAME[j], answer: j, options: shuffle([j, ...pickN(pool.slice(1), 2)]), look: 'glyph' };
    }
    if (type === 'listenSyl') {
      const s = L.syllables(12).find((x) => !used.has(x));
      if (!s) return make('listenWord');
      used.add(s);
      const near = L.alike(s, 2);
      if (near.length < 2) return null;
      return { type, say: s, answer: s, options: shuffle([s, ...near]), look: 'glyph' };
    }
    if (type === 'picWord' || type === 'listenWord') {
      const pic = type === 'picWord' && picWords.length;
      const w = take(pic ? picWords : anyWords);
      if (!w) return type === 'picWord' ? make('listenWord') : null;
      // 통글자 단계는 다른 낱말이, 그 뒤로는 글자 하나가 다른 낱말이 함정
      const near = L.kind === 'theme' || L.kind === 'vocab' ? [] : nearWords(L, w.word, 2);
      const fill = pickN(anyWords.filter((x) => x.word !== w.word && !near.includes(x.word)), 2 - near.length).map((x) => x.word);
      const options = [w.word, ...near, ...fill].slice(0, 3);
      if (options.length < 3) return null;
      return pic
        ? { type: 'picWord', pic: w.emoji, answer: w.word, options: shuffle(options), look: 'word', after: w.word }
        : { type: 'listenWord', say: w.word, answer: w.word, options: shuffle(options), look: 'word' };
    }
    if (type === 'listenBlank' || type === 'picSentence') {
      const s = take(sents);
      if (!s) return null;
      const { before, after, answer, wrong } = s.blank;
      if (type === 'listenBlank') {
        return { type, say: s.text, before, after, size: [...answer].length, answer, options: shuffle([answer, ...wrong.slice(0, 2)]), look: 'word' };
      }
      const line = (x) => `${before}${x}${after}`;
      return { type, pic: s.e, answer: s.text, options: shuffle([s.text, ...wrong.slice(0, 2).map(line)]), look: 'sentence', after: s.text };
    }
    return null;
  }
}

// 확인 퀴즈에 낼 문제: 최근 차시마다 고루 (예전 차시부터)
export function buildCheck(steps) {
  const list = [...new Set(steps)];
  const used = new Set();
  const per = list.map((_, i) => Math.floor(Q / list.length) + (i < Q % list.length ? 1 : 0));
  let qs = list.flatMap((s, i) => questionsFor(lessonOf(s), per[i], used));
  // 문제가 모자라면 다른 차시에서 채운다
  for (let i = 0; qs.length < Q && i < list.length * 2; i++) qs = [...qs, ...questionsFor(lessonOf(list[i % list.length]), 1, used)];
  return qs.slice(0, Q);
}

const PROMPT = {
  listenPic: '소리를 듣고 알맞은 그림을 골라요.',
  listenJamo: '이름을 듣고 알맞은 글자를 골라요.',
  listenSyl: '소리를 듣고 알맞은 글자를 골라요.',
  listenWord: '소리를 듣고 알맞은 낱말을 골라요.',
  picWord: '그림에 알맞은 낱말을 골라요.',
  listenBlank: '문장을 듣고 빈칸에 알맞은 낱말을 골라요.',
  picSentence: '그림에 알맞은 문장을 골라요.',
};

// 확인 퀴즈(PlacementTest): 오늘의 할 일을 5번 하면 최근 차시들을 10문제로 확인한다.
// 문제마다 한 번만 고른다. 틀리면 정답을 보여 주고 다음 문제로 (힌트 없음)
export function mount(stage, ctx) {
  const steps = ctx.checkSteps?.length ? ctx.checkSteps : [ctx.lesson?.index ?? 0];
  const qs = buildCheck(steps);
  const marks = qs.map(() => h('i', {}));
  const card = h('div', { class: 'ck-card' });
  const opts = h('div', { class: 'ck-opts' });
  stage.append(h('div', { class: 'ck' }, h('div', { class: 'ck-dots', 'aria-hidden': 'true' }, marks), card, opts));
  const results = [];
  let n = 0;

  function round() {
    const q = qs[n];
    marks.forEach((m, i) => m.classList.toggle('now', i === n));
    const say = () => (q.say ? speak(q.say) : Promise.resolve());
    const speaker = q.say ? h('button', { class: 'ck-say', type: 'button', 'aria-label': '다시 듣기', onclick: () => { sfx.tap(); listen(); } }, '🔊') : null;
    let body;
    if (q.type === 'listenBlank') {
      body = h('p', { class: 'ck-line' }, q.before, h('span', { class: 'ck-blank', 'aria-label': '빈칸' }, Array.from({ length: q.size }, () => h('i'))), q.after);
    } else if (q.pic) {
      body = h('span', { class: 'ck-pic', 'aria-hidden': 'true' }, q.pic);
    } else {
      body = h('p', { class: 'ck-ask' }, '잘 들어 보세요');
    }
    card.replaceChildren(...[speaker, body].filter(Boolean));
    card.classList.toggle('pic', Boolean(q.pic));
    card.classList.remove('enter');
    void card.offsetWidth;
    card.classList.add('enter');
    let locked = false;
    const buttons = q.options.map((o) => {
      const b = h('button', { class: `ck-opt is-${q.look}`, type: 'button' }, h('span', { class: 'ck-txt' }, o));
      b.dataset.a = o === q.answer ? '1' : '0';
      b.addEventListener('click', () => choose(b, o));
      return b;
    });
    opts.className = `ck-opts is-${q.look}${q.say ? ' wait' : ''}`;
    opts.replaceChildren(...buttons);

    // 문제를 읽어 주는 동안에는 보기를 흐리게 두었다가, 다 읽으면 고를 수 있다
    function listen() {
      speaker?.classList.add('on');
      let opened = false;
      const open = () => {
        if (opened || !ctx.alive) return;
        opened = true;
        speaker?.classList.remove('on');
        opts.classList.remove('wait');
      };
      say().then(open, open);
      ctx.later(open, 2600 + (q.say || '').length * 120);
    }
    if (q.say) ctx.prompt(PROMPT[q.type], listen);
    else ctx.prompt(PROMPT[q.type], () => speak(PROMPT[q.type]));

    function choose(b, o) {
      if (locked || opts.classList.contains('wait')) return;
      locked = true;
      const ok = o === q.answer;
      results.push({ step: q.step, ok });
      marks[n].classList.add(ok ? 'ok' : 'miss');
      if (ok) {
        sfx.correct();
        b.classList.add('ok');
      } else {
        sfx.wrong();
        b.classList.add('miss');
        buttons.find((x) => x.dataset.a === '1').classList.add('ok', 'show');
      }
      if (q.after) speak(q.after);
      ctx.later(() => {
        n++;
        if (n < qs.length) { round(); return; }
        const score = results.filter((r) => r.ok).length;
        ctx.finish({ firstTry: score, total: qs.length, check: { score, total: qs.length, results, steps: [...new Set(steps)] } });
      }, ok ? 1300 : 1900);
    }
  }

  round();
}
