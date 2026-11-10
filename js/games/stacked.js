import { h, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
// 단계별 자릿수: [윗수, 아랫수]
const DIGITS = [[2, 1], [2, 2], [2, 2], [3, 2], [3, 3]];
const digitsOf = (v, n) => String(v).padStart(n, ' ').split('').map((c) => (c === ' ' ? null : Number(c)));

// 문제 만들기: 받아올림/받아내림이 있어야 하는지(need)에 맞게 다시 뽑는다
function make(mode, L) {
  const [da, db] = DIGITS[L - 1];
  const rnd = (d) => randInt(10 ** (d - 1), 10 ** d - 1);
  for (let t = 0; t < 400; t++) {
    let a = rnd(da);
    let b = rnd(db);
    const add = mode.startsWith('add');
    if (!add && b > a) [a, b] = [b, a];
    if (!add && a === b) continue;
    const n = Math.max(String(a).length, String(b).length);
    const A = digitsOf(a, n).map((x) => x || 0);
    const B = digitsOf(b, n).map((x) => x || 0);
    let carry = false;
    let ok = true;
    for (let i = n - 1; i >= 0; i--) {
      if (add) { if (A[i] + B[i] >= 10) carry = true; }
      else if (A[i] < B[i]) carry = true;
    }
    const want = mode.endsWith('2');
    if (want !== carry) ok = false;
    // 받아내림은 일의 자리에서 일어나게 (십의 자리가 0이 아닌 것)
    if (ok && !add && want && (A[n - 1] >= B[n - 1] || A[n - 2] === 0)) ok = false;
    if (ok && add && want && A[n - 1] + B[n - 1] < 10) ok = false;
    if (ok) return { a, b, add, ans: add ? a + b : a - b };
  }
  return { a: 34, b: 12, add: true, ans: 46 };
}

// 세로셈(StackedAddition1·2 · StackedSubtraction1·2, opts.mode = add1 · add2 · sub1 · sub2):
// 일의 자리부터 계산해서 답 칸을 숫자 판으로 채운다. 받아올림은 위 칸에 1을, 받아내림은 십의 자리를 눌러 빌려 온다
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const hinter = makeHinter();
  const sheet = h('div', { class: 'st-sheet' });
  const tip = h('p', { class: 'st-tip', 'aria-live': 'polite' });
  const pad = h('div', { class: 'st-pad' });
  stage.append(h('div', { class: 'stacked' }, sheet, tip, pad));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const q = make(mode, L);
    const cols = Math.max(String(q.a).length, String(q.b).length, String(q.ans).length);
    const A = digitsOf(q.a, cols);
    const B = digitsOf(q.b, cols);
    const ANS = digitsOf(q.ans, cols);
    const cell = (v, cls = '') => h('span', { class: `st-cell ${cls}` }, v ?? '');
    const carry = Array.from({ length: cols }, () => cell('', 'carry'));
    const top = A.map((v) => cell(v, 'top'));
    const cur = A.map((v) => v || 0);
    const ans = ANS.map(() => cell('', 'ans'));
    sheet.replaceChildren(
      h('div', { class: 'st-row' }, cell(''), ...carry),
      h('div', { class: 'st-row' }, cell(''), ...top),
      h('div', { class: 'st-row' }, cell(q.add ? '+' : '−', 'op'), ...B.map((v) => cell(v))),
      h('div', { class: 'st-line' }),
      h('div', { class: 'st-row' }, cell(''), ...ans),
    );
    // 할 일 차례: 오른쪽(일의 자리)부터. 받아올림 칸 · 빌려 오기도 한 단계
    const steps = [];
    let c = 0;
    const work = A.map((x) => x || 0);
    for (let i = cols - 1; i >= 0; i--) {
      const x = work[i];
      const y = B[i] || 0;
      if (q.add) {
        const s = x + y + c;
        if (ANS[i] === null) continue;
        steps.push({ kind: 'digit', i, v: s % 10 });
        c = s >= 10 ? 1 : 0;
        if (c && i > 0) steps.push({ kind: 'carry', i: i - 1, v: 1 });
      } else {
        let top2 = x;
        if (x < y) {
          steps.push({ kind: 'borrow', i });
          work[i - 1] -= 1;
          top2 = x + 10;
        }
        if (ANS[i] === null && i === 0) continue;
        steps.push({ kind: 'digit', i, v: top2 - y });
      }
    }
    // 맨 앞의 0은 쓰지 않는다
    const realSteps = steps.filter((s) => !(s.kind === 'digit' && ANS[s.i] === null));
    let at = 0;
    let missed = false;
    const focus = () => {
      [...carry, ...ans, ...top].forEach((x) => x.classList.remove('focus'));
      const s = realSteps[at];
      pad.dataset.next = s ? (s.kind === 'borrow' ? `b${s.i - 1}` : s.v) : '';
      if (!s) return;
      if (s.kind === 'digit') { ans[s.i].classList.add('focus'); tip.textContent = s.i === cols - 1 ? '일의 자리부터 계산해요!' : `${cols - s.i === 2 ? '십' : '백'}의 자리를 계산해요.`; }
      if (s.kind === 'carry') { carry[s.i].classList.add('focus'); tip.textContent = '10이 넘었어요! 윗자리로 1을 올려요.'; }
      if (s.kind === 'borrow') { top[s.i - 1].classList.add('focus'); tip.textContent = '뺄 수 없어요! 윗자리 숫자를 눌러 10을 빌려 와요.'; }
    };
    const advance = () => {
      at++;
      if (at < realSteps.length) { focus(); return; }
      if (!missed) firstTry++;
      tip.textContent = '';
      sfx.correct();
      cheer(sheet);
      speak([String(q.a), q.add ? '더하기' : '빼기', String(q.b), String(q.ans)]);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2200);
    };
    // 빌려 오기: 윗자리 숫자를 누른다
    top.forEach((t, i) => t.addEventListener('click', () => {
      const s = realSteps[at];
      if (!s || s.kind !== 'borrow') return;
      if (i !== s.i - 1) { missed = true; wiggle(t); return; }
      sfx.pop();
      // 빌려 준 자리는 1 작아지고, 빌려 온 자리에는 +10 표시
      cur[i] -= 1;
      t.replaceChildren(h('s', {}, cur[i] + 1), h('small', {}, cur[i]));
      top[s.i].append(h('small', { class: 'ten' }, '+10'));
      pop(t);
      advance();
    }));
    pad.replaceChildren(...Array.from({ length: 10 }, (_, d) => {
      const b = h('button', { class: 'st-key', type: 'button' }, d);
      b.addEventListener('click', () => {
        const s = realSteps[at];
        if (!s || s.kind === 'borrow') { if (s) { missed = true; wiggle(b); hinter.miss(top[s.i - 1]); } return; }
        if (d !== s.v) {
          missed = true;
          wiggle(b);
          hinter.miss(pad.children[s.v]);
          return;
        }
        hinter.reset();
        sfx.pop();
        const target = s.kind === 'carry' ? carry[s.i] : ans[s.i];
        target.textContent = d;
        target.classList.add('done');
        pop(target);
        advance();
      });
      return b;
    }));
    focus();
    ctx.prompt(q.add ? '세로셈 덧셈! 일의 자리부터 더해서 답 칸을 채워요.' : '세로셈 뺄셈! 일의 자리부터 빼서 답 칸을 채워요.', () => speak([String(q.a), q.add ? '더하기' : '빼기', String(q.b)]));
  }

  round();
}
