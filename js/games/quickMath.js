import { h, shuffle, pick, randInt, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { answerPad } from './answerPad.js';

const ROWS = 6;
const SHEETS = 2;
const SAY = { '+': '더하기', '-': '빼기', '*': '곱하기', '/': '나누기' };
const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// 한 줄: { a, op, b, c } 와 가릴 칸 hide (c는 답, b는 빠진 수)
const row = (a, op, b, hide = 'c') => ({ a, op, b, c: op === '+' ? a + b : op === '-' ? a - b : op === '/' ? a / b : a * b, hide });

// 차례로 이어지는 줄 다섯 개(1+2, 2+2, 3+2 …) 뒤에 하나를 섞어 6줄 한 장 (참고 영상처럼)
function sheet(mode, L, no = 0) {
  if (mode === 'add') {
    if (L <= 2) { const b = L === 1 ? 1 : randInt(2, 4); const top = L === 1 ? 6 : 10; return [...range(1, 5).map((x) => row(x, '+', b)), (() => { const x = randInt(1, top - 1); return row(x, '+', randInt(1, top - x)); })()]; }
    if (L === 3) return Array.from({ length: ROWS }, () => { const x = randInt(1, 9); return row(x, '+', randInt(1, 10 - x)); });
    if (L === 4) { const b = randInt(3, 9); const a = randInt(11 - b, 14 - b); return [...range(a, a + 4).map((x) => row(x, '+', b)), row(randInt(5, 9), '+', randInt(5, 9))]; }
    return Array.from({ length: ROWS }, () => row(randInt(2, 9), '+', randInt(2, 9)));
  }
  if (mode === 'sub') {
    if (L <= 2) { const top = L === 1 ? 5 : 10; const b = L === 1 ? 1 : randInt(1, 3); const a = L === 1 ? 5 : randInt(b + 4, top); return [...range(a - 4, a).reverse().map((x) => row(x, '-', b)), (() => { const x = randInt(2, top); return row(x, '-', randInt(0, x)); })()]; }
    if (L === 3) return Array.from({ length: ROWS }, () => { const x = randInt(2, 10); return row(x, '-', randInt(0, x)); });
    if (L === 4) { const b = randInt(2, 9); const a = randInt(14, 18); return [...range(a - 4, a).reverse().map((x) => row(x, '-', b)), row(randInt(11, 18), '-', randInt(2, 9))]; }
    return Array.from({ length: ROWS }, () => { const b = randInt(2, 9); return row(randInt(b + 3, 18), '-', b); });
  }
  if (mode === 'facts') {
    // 빠른 연산: 같은 수에서 더하고 빼기(5+1, 5−1, 5+2, 5−2 …), 높은 단계는 10 만들기(7+?=10)도 섞는다
    const fam = (a, top) => [1, 2, 3].flatMap((k) => [row(a, '+', k), row(a, '-', k)]).filter((r) => r.c <= top && r.c >= 0);
    if (L === 1) return fam(randInt(3, 5), 10).slice(0, ROWS);
    if (L === 2) return fam(randInt(4, 7), 10).slice(0, ROWS);
    if (L === 3) return shuffle(range(1, 9)).slice(0, ROWS).map((a) => row(a, '+', 10 - a, 'b'));
    if (L === 4) return fam(randInt(11, 16), 20).slice(0, ROWS);
    return shuffle([...fam(randInt(12, 16), 20).slice(0, 3), ...shuffle(range(2, 9)).slice(0, 3).map((a) => row(a, '+', 10 - a, 'b'))]);
  }
  // 몇십 더하기 · 빼기(30 + 20, 70 − 40): 3단계까지는 더하기만, 그 위는 빼기도 섞는다
  if (mode === 'tens') {
    return Array.from({ length: ROWS }, () => {
      const a = randInt(1, 8);
      const b = randInt(1, 9 - a);
      return L <= 3 || Math.random() < 0.5 ? row(a * 10, '+', b * 10) : row((a + b) * 10, '-', b * 10);
    });
  }
  // 나눗셈: 참고 영상(빠른 나눗셈)처럼 같은 수로 나누는 줄을 차례로 (2 ÷ 2, 4 ÷ 2, 6 ÷ 2 …)
  if (mode === 'div') {
    if (L === 3 || L === 5) return Array.from({ length: ROWS }, () => { const d = L === 3 ? randInt(2, 5) : randInt(2, 9); return row(d * randInt(1, 9), '/', d); });
    const d = [2, pick([3, 5]), 0, pick([6, 7, 8, 9])][L - 1];
    return (no ? range(5, 10) : range(1, 6)).map((k) => row(d * k, '/', d));
  }
  // 곱셈: 한 단을 차례로
  // 참고 영상(빠른 곱셈)처럼 1단계는 1단을 1 × 1부터 차례로
  const dan = [1, 2, pick([5, 10]), pick([3, 4]), pick([6, 7, 8, 9])][L - 1];
  if (L <= 2) return no ? range(5, 10).map((x) => row(dan, '*', x)) : range(1, 6).map((x) => row(dan, '*', x));
  const a = randInt(1, 4);
  return [...range(a, a + 4).map((x) => row(dan, '*', x)), row(dan, '*', randInt(1, 9))];
}

// 빠른 덧셈(QuickAdd · add) · 빠른 뺄셈(QuickSub · sub) · 빠른 연산(QuickFacts · facts) · 스피드 곱셈(QuickMul · mul) · 빠른 나눗셈(QuickDiv · div)
// · 몇십 더하기와 빼기(수학 E-2, tens):
// 6줄짜리 셈 판의 위에서부터 차례로 답을 숫자판(또는 손글씨)으로 넣는다 (참고 영상 기준)
export function mount(stage, ctx) {
  const mode = ctx.opts.mode || 'add';
  const L = ctx.level;
  const hinter = makeHinter();
  const list = h('ol', { class: 'qd-list' });
  const pad = answerPad(ctx, { onFull: check, trash: false });
  const dots = h('div', { class: 'qd-dots', 'aria-hidden': 'true' });
  stage.append(h('div', { class: 'quick-drill count-write' }, h('div', { class: 'qd-left' }, list, dots), pad.el));
  const total = ROWS * SHEETS;
  let done = 0;
  let firstTry = 0;
  let rows = [];
  let at = 0;
  let misses = 0;

  const want = (r) => (r.hide === 'b' ? r.b : r.c);
  function line(r, i) {
    const cur = i === at;
    const shown = i < at;
    // 가린 칸: 지금 문제는 ?, 푼 문제는 답, 아직 안 온 문제는 빈칸
    const slot = (v) => (shown ? h('b', {}, String(v)) : cur ? h('b', { class: 'qd-q' }, '?') : h('b', {}, ''));
    return h('li', { class: `qd-row${cur ? ' cur' : ''}${shown ? ' done' : ''}` },
      h('i', { class: 'qd-box', 'aria-hidden': 'true' }, shown ? '✓' : ''),
      h('span', {}, String(r.a)), h('span', {}, SYM[r.op]),
      r.hide === 'b' ? slot(r.b) : h('span', {}, String(r.b)), h('span', {}, '='),
      r.hide === 'c' ? slot(r.c) : h('span', {}, String(r.c)));
  }
  function paint() { list.replaceChildren(...rows.map(line)); }

  function ask() {
    hinter.reset();
    misses = 0;
    dots.replaceChildren();
    const r = rows[at];
    paint();
    pad.reset(String(want(r)).length);
    speak(r.hide === 'b' ? [String(r.a), SAY[r.op], '몇은', String(r.c)] : [String(r.a), SAY[r.op], String(r.b)]);
  }

  function check(v) {
    const r = rows[at];
    if (v === want(r)) {
      pad.ok();
      if (misses === 0) firstTry++;
      sfx.correct();
      cheer(pad.answer);
      speak(String(v));
      done++;
      ctx.progress(done, total);
      ctx.later(() => {
        at++;
        if (done >= total) { paint(); ctx.finish({ firstTry, total }); return; }
        if (at >= rows.length) { rows = sheet(mode, L, 1); at = 0; }
        ask();
      }, 900);
      return;
    }
    misses++;
    sfx.wrong();
    pad.no(700);
    if (misses >= 2) {
      // 두 번 틀리면 점으로 보여 주고 첫 자리 숫자판을 반짝인다 (몇십은 점 하나가 10)
      hinter.miss(pad.keys[Number(String(want(r))[0])]);
      const a = r.op === '*' ? r.a * r.b : r.a;
      const u = mode === 'tens' ? 10 : 1;
      const ten = u > 1 ? h('small', {}, '● = 10') : '';
      if (r.op === '+') dots.replaceChildren(h('span', { class: 'qd-a' }, '●'.repeat(r.a / u)), h('span', { class: 'qd-b' }, '●'.repeat(r.hide === 'b' ? 0 : r.b / u)), ten);
      else if (r.op === '-') dots.replaceChildren(h('span', { class: 'qd-a' }, '●'.repeat((r.a - r.b) / u)), h('span', { class: 'qd-x' }, '●'.repeat(r.b / u)), ten);
      else if (r.op === '/') dots.replaceChildren(...Array.from({ length: r.c }, () => h('span', { class: 'qd-a' }, '●'.repeat(r.b))));
      else dots.replaceChildren(...Array.from({ length: r.b }, () => h('span', { class: 'qd-a' }, '●'.repeat(r.a))), h('small', {}, String(a)));
    }
  }

  rows = sheet(mode, L);
  ctx.progress(0, total);
  ctx.prompt('위에서부터 차례로 답을 구해요! 숫자판을 누르거나 끌어 넣고, 칸에 손으로 써도 돼요.', () => { const r = rows[at]; speak([String(r.a), SAY[r.op], String(r.b)]); });
  ask();
}
