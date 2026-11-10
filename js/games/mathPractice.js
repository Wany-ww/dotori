import { h, pick, randInt, shuffle, wiggle, pop, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { noteMiss, noteRight, topMisses } from './mathMiss.js';

const R = 10;
const OPS = { addsub: ['+', '−'], mul: ['×'], div: ['÷'] };
const WORD = { '+': '더하기', '−': '빼기', '×': '곱하기', '÷': '나누기' };

// 단계 안에서 쉬움(0) · 보통(1) · 어려움(2) 세 칸으로 문제를 만든다. [a, 기호, b, 답, 빈칸 자리(c는 답, a는 앞 수, b는 뒤 수)]
const MAKE = {
  addsub(L, s) {
    const top = [[5, 7, 10], [10, 12, 15], [15, 18, 20], [30, 60, 99], [99, 99, 99]][L - 1][s];
    if (L <= 3 || Math.random() < 0.5) {
      if (Math.random() < 0.5) { const a = randInt(1, top - 1); const b = randInt(1, top - a); return [a, '+', b, a + b]; }
      const a = randInt(2, top); const b = randInt(1, a - 1); return [a, '−', b, a - b];
    }
    // 4 · 5단계: 두 자리 수 ± 한 자리(4) · 두 자리(5)
    const small = L === 4 ? [1, 9] : [11, 49];
    if (Math.random() < 0.5) { const b = randInt(...small); const a = randInt(10, top - b); return [a, '+', b, a + b]; }
    const b = randInt(...small); const a = randInt(b + 1, top); return [a, '−', b, a - b];
  },
  mul(L, s) {
    const dans = [[2, 5], [2, 3, 4, 5], [2, 3, 4, 5, 6, 7], [2, 3, 4, 5, 6, 7, 8, 9], [3, 4, 6, 7, 8, 9]][L - 1];
    const a = pick(s === 0 ? dans.slice(0, Math.ceil(dans.length / 2)) : dans);
    const b = randInt(s === 0 ? 1 : 2, 9);
    return [a, '×', b, a * b, L === 5 && s === 2 ? 'b' : 'c'];
  },
  div(L, s) {
    const dans = [[2, 5], [2, 3, 4, 5], [2, 3, 4, 5, 6, 7], [2, 3, 4, 5, 6, 7, 8, 9], [3, 4, 6, 7, 8, 9]][L - 1];
    const b = pick(s === 0 ? dans.slice(0, Math.ceil(dans.length / 2)) : dans);
    const q = randInt(s === 0 ? 1 : 2, L === 1 ? 5 : 9);
    return [b * q, '÷', b, q, L === 5 && s === 2 ? 'a' : 'c'];
  },
};
// 틀린 셈 기록('7×8')을 문제로 되돌린다
function fromKey(k) {
  const m = k.match(/^(\d+)([+−×÷])(\d+)$/);
  if (!m) return null;
  const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
  const ans = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[op];
  return Number.isInteger(ans) && ans >= 0 ? [a, op, b, ans] : null;
}

// 셈 아래 동그라미 (덧셈은 두 무더기, 뺄셈은 빼는 만큼 빗금)
function aid(a, op, b) {
  const col = (n, cross = 0, cls = '') => h('span', { class: `mp-col ${cls}` }, Array.from({ length: n }, (_, i) => h('i', { class: i >= n - cross ? 'x' : '' })));
  return h('div', { class: 'mp-aid', 'aria-hidden': 'true' }, op === '+' ? [col(a, 0, 'a'), col(b, 0, 'b')] : [col(a, b, 'a')]);
}

// 맞춤 연습문제(AIPractice): 예전에 틀린 셈을 먼저 섞고, 맞히면 조금 어렵게 · 틀리면 쉽게 바꿔 가며 10문제.
// 왼쪽 모눈 연습장에 손가락으로 풀어 보고 오른쪽 숫자판으로 답한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const topic = ctx.opts.topic || 'addsub';
  const L = ctx.level;
  const hinter = makeHinter();
  const dots = h('div', { class: 'mp-dots', 'aria-hidden': 'true' });
  const eq = h('p', { class: 'mp-eq' });
  const help = h('div', { class: 'mp-help' });
  const canvas = h('canvas', { class: 'mp-canvas', 'aria-label': '연습장' });
  const wipe = h('button', { class: 'mp-wipe', type: 'button', 'aria-label': '연습장 지우기' }, '🧽');
  const shown = h('b', { class: 'mp-shown', 'aria-live': 'polite' });
  const keys = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0, 'ok'].map((k) => h('button', { class: `mp-key${k === 'x' ? ' del' : k === 'ok' ? ' ok' : ''}`, type: 'button', 'aria-label': k === 'x' ? '지우기' : k === 'ok' ? '확인' : String(k) }, k === 'x' ? '✕' : k === 'ok' ? '✓' : String(k)));
  const loading = h('div', { class: 'mp-loading' }, h('span', { class: 'mp-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), h('p', {}, '연습문제를 만들고 있어요...'));
  const body = h('div', { class: 'mp-body' },
    h('div', { class: 'mp-paper' }, canvas, h('span', { class: 'mp-hand', 'aria-hidden': 'true' }, '✍️'), wipe, eq, help),
    h('div', { class: 'mp-right' }, h('div', { class: 'mp-screen' }, shown), h('div', { class: 'mp-pad' }, keys)));
  const root = h('div', { class: 'math-practice' }, dots, loading, body);
  stage.append(root);

  /* ---------- 연습장 ---------- */
  const g = canvas.getContext('2d');
  const fit = () => { const r = canvas.getBoundingClientRect(); const d = window.devicePixelRatio || 1; if (!r.width) return; canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d); };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  ctx.onCleanup(() => ro.disconnect());
  let cur = null;
  const at = (e) => { const r = canvas.getBoundingClientRect(); const d = canvas.width / r.width; return [(e.clientX - r.left) * d, (e.clientY - r.top) * d]; };
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch {} cur = at(e); });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const q = at(e);
    g.strokeStyle = '#7A6A5A';
    g.lineWidth = 4 * (canvas.width / canvas.getBoundingClientRect().width);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(...cur);
    g.lineTo(...q);
    g.stroke();
    cur = q;
  });
  canvas.addEventListener('pointerup', () => { cur = null; });
  canvas.addEventListener('pointercancel', () => { cur = null; });
  const clearPaper = () => g.clearRect(0, 0, canvas.width, canvas.height);
  wipe.addEventListener('click', () => { sfx.tap(); clearPaper(); });

  /* ---------- 문제 ---------- */
  // 예전에 틀린 셈을 앞쪽에 섞어 넣는다 (최대 3개)
  const again = topMisses(OPS[topic], 3).map(fromKey).filter(Boolean);
  let step = 1;
  let streak = 0;
  let n = 0;
  let firstTry = 0;
  let entry = '';
  let q = null;
  let missed = false;
  let busy = true;
  const order = shuffle([...again.map((x) => ['again', x]), ...Array(R - again.length).fill(['new'])]);
  const keyOf = ([a, op, b]) => `${a}${op}${b}`;
  const used = new Set(again.map(keyOf));
  const paintDots = () => dots.replaceChildren(...Array.from({ length: R }, (_, i) => h('i', { class: i < n ? 'done' : i === n ? 'now' : '' })));

  function ask() {
    const [kind, x] = order[n];
    // 한 판 안에서는 같은 셈이 두 번 나오지 않게 다시 만든다
    for (let t = 0; t < 30; t++) {
      q = kind === 'again' ? [...x, 'c'] : MAKE[topic](L, step);
      if (kind === 'again' || !used.has(keyOf(q))) break;
    }
    used.add(keyOf(q));
    if (q.length === 4) q.push('c');
    const [a, op, b, ans, hole] = q;
    missed = false;
    entry = '';
    shown.textContent = '';
    clearPaper();
    const part = (v, isHole, cls) => (isHole ? h('em', { class: 'mp-hole' }, '?') : h('span', { class: cls }, String(v)));
    eq.replaceChildren(part(a, hole === 'a', 'mp-a'), h('span', { class: 'mp-op' }, op), part(b, hole === 'b', 'mp-b'), h('span', { class: 'mp-op' }, '='), part(ans, hole === 'c', 'mp-c'));
    help.replaceChildren(topic === 'addsub' && L <= 2 && hole === 'c' && a <= 10 ? aid(a, op, b) : '');
    paintDots();
    busy = false;
    speak(hole === 'c' ? [String(a), WORD[op], String(b), '는?'] : '빈칸에 들어갈 수는?');
  }
  const want = () => ({ a: q[0], b: q[2], c: q[3] })[q[4]];

  keys.forEach((k, i) => k.addEventListener('click', () => {
    if (busy) return;
    const v = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0, 'ok'][i];
    sfx.tap();
    if (v === 'x') { entry = ''; shown.textContent = ''; return; }
    if (v !== 'ok') { if (entry.length < 3) entry += v; shown.textContent = entry; return; }
    if (!entry) return;
    const key = keyOf(q);
    if (Number(entry) !== want()) {
      missed = true;
      streak = 0;
      step = Math.max(0, step - 1);
      noteMiss(key);
      wiggle(eq);
      hinter.miss(keys[[7, 8, 9, 4, 5, 6, 1, 2, 3].indexOf(Number(String(want())[0]))] || keys[10]);
      entry = '';
      shown.textContent = '';
      return;
    }
    busy = true;
    hinter.reset();
    if (!missed) {
      firstTry++;
      noteRight(key);
      // 두 번 연달아 첫 시도에 맞히면 한 칸 어렵게
      if (++streak >= 2) { step = Math.min(2, step + 1); streak = 0; }
    }
    const hole = eq.querySelector('.mp-hole');
    hole.textContent = String(want());
    hole.classList.add('ok');
    sfx.correct();
    pop(hole);
    burst(eq, ['🔵', '✨']);
    n++;
    ctx.progress(n, R);
    ctx.later(() => { if (n >= R) { paintDots(); ctx.finish({ firstTry, total: R }); } else ask(); }, 1200);
  }));

  ctx.prompt('왼쪽 연습장에 손가락으로 풀어 봐도 좋아요. 답을 숫자판으로 누르고 ✓!', () => speak('답을 숫자판으로 눌러요!'), { auto: false });
  ctx.progress(0, R);
  paintDots();
  // 문제를 만드는 동안 잠깐 기다린다
  ctx.later(() => { loading.remove(); root.classList.add('ready'); ask(); }, 1400);
}
