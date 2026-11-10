import { h, shuffle, pick, pickN, randInt, cheer, burst, makeHinter, choiceSet } from '../ui.js';
import { speak } from '../audio.js';

const R = 5;
const near = (ans, k = 3, lo = 0, hi = 999) => {
  const set = new Set([ans]);
  for (let d = 1; set.size < k && d < 50; d++) [ans + d, ans - d].forEach((v) => { if (set.size < k && v >= lo && v <= hi && Math.random() < 0.7) set.add(v); });
  for (let v = lo; set.size < k && v <= hi; v++) set.add(v);
  return shuffle([...set]);
};
// 수 뒤 조사 (한자어로 읽은 끝소리): 3을 · 5를 · 10을 · 0을
const eul = (n) => ([2, 4, 5, 9].includes(n % 10) ? '를' : '을');
const findSay = (n) => [String(n), eul(n) === '을' ? '을 찾으세요.' : '를 찾으세요.'];

/* ---------- 그림 도우미 ---------- */
const dotsEl = (n, cls = '') => h('div', { class: `mq-dots ${cls}` }, Array.from({ length: n }, () => h('i')));
function domino(a, b, hideB = false) {
  return h('div', { class: 'mq-domino' }, dotsEl(a, `pip p${a}`), h('span', { class: 'mq-bar' }), hideB ? h('div', { class: 'mq-dots pip hide' }, '?') : dotsEl(b, `pip p${b}`));
}

/* ---------- 문제 만들기: kind별로 { visual, q, say, answer, options, render?, after? } ---------- */
const KINDS = {
  // 도미노 산수(FindNMake): 1~2단계는 참고 영상처럼 "N을 찾으세요" — 점 N개인 면(1단계) · 도미노(2단계)를 찾아
  // 빈 자리에 넣는다. 3단계부터 도미노를 덧셈으로 (모두 몇 개 → 맞는 덧셈식 → 가려진 쪽)
  domino(L) {
    if (L <= 2) {
      const N = L === 1 ? randInt(1, 6) : randInt(2, 10);
      const slot = h('div', { class: 'mq-slot' });
      let options;
      let render;
      if (L === 1) {
        options = [N, ...pickN([1, 2, 3, 4, 5, 6].filter((v) => v !== N), 2)];
        render = (v) => h('div', { class: 'mq-die' }, dotsEl(v, `pip p${v}`));
      } else {
        // 도미노 한 장 = 'a+b'. 정답은 합이 N, 나머지는 합이 다른 것
        const half = (sum) => { const a = randInt(Math.max(0, sum - 6), Math.min(6, sum)); return `${a}+${sum - a}`; };
        const others = pickN([2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((v) => v !== N && Math.abs(v - N) <= 3), 2);
        options = [half(N), ...others.map(half)];
        render = (k) => { const [a, b] = k.split('+').map(Number); return domino(a, b); };
      }
      const answer = options[0];
      return {
        visual: h('div', { class: 'mq-find' }, h('p', { class: 'mq-find-q' }, `${N}${eul(N)} 찾으세요.`), slot),
        q: L === 1 ? `점이 ${N}개인 면을 찾아 빈 자리에 넣어요!` : `점이 모두 ${N}개인 도미노를 찾아 빈 자리에 넣어요!`,
        say: findSay(N),
        answer,
        options: shuffle(options),
        render,
        label: (o) => (L === 1 ? `점 ${o}개` : `점 ${o.replace('+', '개와 ')}개`),
        after: () => slot.replaceChildren(render(answer)),
      };
    }
    const a = randInt(1, 6);
    const b = randInt(0, 6);
    if (L === 5) {
      const sum = a + b;
      return { visual: h('div', {}, domino(a, b, true), h('p', { class: 'mq-eq' }, `${a} + ? = ${sum}`)), q: `도미노 점이 모두 ${sum}개예요. 가려진 쪽은 몇 개일까요?`, say: [String(a), '더하기 몇은', String(sum)], answer: b, options: near(b, 3, 0, 6) };
    }
    if (L === 4) {
      const opts = shuffle([`${a} + ${b}`, `${a} + ${b + 1}`, `${Math.max(0, a - 1)} + ${b}`]);
      return { visual: domino(a, b), q: '도미노에 맞는 덧셈식을 골라요!', say: '어떤 덧셈식일까요?', answer: `${a} + ${b}`, options: opts };
    }
    return { visual: domino(a, b), q: '도미노 양쪽 점을 세어 모두 몇 개인지 골라요!', say: '모두 몇 개일까요?', answer: a + b, options: near(a + b, 3, 1, 12) };
  },
  // 수학 축구(MathKicker): 참고 영상(연산 축구)처럼 1단계부터 20까지 (5 + 15, 17 + 3)
  kick(L) {
    let a; let b; let op;
    if (L === 1) { op = '+'; a = randInt(11, 17); b = randInt(1, 20 - a); if (Math.random() < 0.5) [a, b] = [b, a]; }
    else if (L === 2) { op = '+'; a = randInt(5, 9); b = randInt(11 - a, 9); }
    else if (L === 3) { op = '-'; a = randInt(11, 20); b = randInt(1, 9); }
    else if (L === 4) { op = pick(['+', '-']); a = randInt(20, 89); b = randInt(1, 9); }
    else { op = pick(['+', '-']); a = randInt(30, 89); b = randInt(11, op === '-' ? a - 10 : 99 - a); }
    const ans = op === '+' ? a + b : a - b;
    return { visual: h('div', { class: 'mq-pitch' }, h('b', { class: 'mq-big' }, `${a} ${op === '+' ? '+' : '−'} ${b} = ?`), h('span', { class: 'mq-goal', 'aria-hidden': 'true' }, '🥅')), q: '정답 공을 골라 골대에 슛!', say: [String(a), op === '+' ? '더하기' : '빼기', String(b)], answer: ans, options: near(ans, 4, 0, 200), ball: true };
  },
  // 양팔 저울 수식(BalancingEquations): 참고 영상(양팔 저울)처럼 1단계부터 양쪽 식 (3 + ? = 4 + 5)
  balance(L) {
    let left; let right; let ans;
    if (L === 1) { const b = randInt(1, 5); const c = randInt(1, 5); const a = randInt(1, b + c - 1); ans = b + c - a; left = `${a} + ?`; right = `${b} + ${c}`; }
    else if (L === 2) { const a = randInt(2, 8); const b = randInt(1, 7); const c = randInt(1, a + b - 1); ans = a + b - c; left = `${a} + ${b}`; right = `${c} + ?`; }
    else if (L === 3) { const a = randInt(5, 12); ans = randInt(1, a - 1); left = `${a} − ?`; right = `${a - ans}`; }
    else if (L === 4) { const b = randInt(3, 9); const c = randInt(3, 9); const a = randInt(2, b + c - 1); ans = b + c - a; left = `${a} + ?`; right = `${b} + ${c}`; }
    else { const a = randInt(10, 18); const b = randInt(1, 8); const c = randInt(a - b + 1, 20); ans = c - (a - b); left = `${a} − ${b}`; right = `${c} − ?`; }
    const scale = h('div', { class: 'mq-scale tilt' }, h('span', { class: 'mq-beam' }), h('b', { class: 'pan l' }, left), h('b', { class: 'pan r' }, right), h('i', { class: 'mq-stand' }));
    return { visual: scale, q: '저울이 평평해지려면 ?에 어떤 수 추를 올려야 할까요?', say: '어떤 추를 올려야 할까요?', answer: ans, options: near(ans, 4, 1, 20), after: () => scale.classList.remove('tilt') };
  },
};

const TITLES = { domino: '도미노', kick: '수학 축구', balance: '양팔 저울' };

// 수학 보기 고르기 놀이 모음 (opts.kind): 그림을 보고 알맞은 답을 고른다
export function mount(stage, ctx) {
  const kind = ctx.opts.kind;
  const make = KINDS[kind];
  const L = ctx.level;
  const hinter = makeHinter();
  const visual = h('div', { class: `mq-visual kind-${kind}` });
  const ask = h('p', { class: 'mq-ask' });
  const below = h('div', { class: 'mq-below' });
  stage.append(h('div', { class: `math-quiz kind-${kind}`, 'data-title': TITLES[kind] || '' }, visual, ask, below));
  const state = {};
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const q = make(L, n, state);
    visual.replaceChildren(q.visual);
    ask.textContent = q.q;
    below.replaceChildren(choiceSet(q.options, {
      answer: q.answer,
      hinter,
      cls: `choice mq-opt${q.ball ? ' ball' : ''}${q.render ? ' pic' : ''}`,
      render: q.render || ((o) => String(o)),
      label: q.label,
      onCorrect: (b, miss) => {
        if (miss === 0) firstTry++;
        q.after?.();
        visual.classList.add('solved');
        if (q.ball) b.classList.add('shoot');
        cheer(b);
        burst(visual, ['⭐', '✨']);
        speak(typeof q.answer === 'object' || /[+−×=]/.test(String(q.answer)) ? '맞아요!' : String(q.answer));
        ctx.later(() => {
          visual.classList.remove('solved');
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 1700);
      },
    }));
    ctx.prompt(q.q, () => speak(q.say));
  }

  round();
}
