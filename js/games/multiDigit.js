import { h, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 5;
// 단계별 문제: 한 자리 + 한 자리(받아올림) → 두 자리 + 한 자리 → 두 자리 + 두 자리 → 두 자리 − 두 자리 → 세 자리 ±
const MAKE = [
  () => { const a = randInt(2, 9); return [a, '+', randInt(10 - a, 9)]; },
  () => { const b = randInt(2, 9); return [randInt(1, 8) * 10 + randInt(10 - b, 9), '+', b]; },
  () => [randInt(11, 59), '+', randInt(11, 39)],
  () => { const a = randInt(31, 98); return [a, '−', randInt(11, a - 10)]; },
  () => (pick(['+', '−']) === '+' ? [randInt(101, 599), '+', randInt(11, 399)] : (() => { const a = randInt(201, 999); return [a, '−', randInt(11, a - 100)]; })()),
];

// 여러 자리 수 연산(MultiDigitCalc, 명세 추가): 연습장에 세로셈이 적혀 있고, 연필로 자유롭게 풀어 본 뒤
// 오른쪽 숫자판으로 답을 넣고 ✓를 누른다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const sum = h('div', { class: 'md-sum', 'aria-live': 'polite' });
  const canvas = h('canvas', { class: 'md-canvas', 'aria-label': '연습장' });
  const pen = h('button', { class: 'md-tool on', type: 'button', 'aria-label': '연필' }, '✏️');
  const eraser = h('button', { class: 'md-tool', type: 'button', 'aria-label': '지우개' }, '🧽');
  const trash = h('button', { class: 'md-tool', type: 'button', 'aria-label': '모두 지우기' }, '🗑️');
  const paper = h('div', { class: 'md-paper' }, h('div', { class: 'md-tools' }, trash, h('span', { class: 'md-gap' }), pen, eraser), sum, canvas);
  const screen = h('div', { class: 'md-screen', 'aria-live': 'polite' });
  const keys = h('div', { class: 'md-keys' });
  stage.append(h('div', { class: 'multi-digit' }, paper, h('div', { class: 'md-side' }, screen, keys)));
  let n = 0;
  let firstTry = 0;
  let q = null;
  let entry = '';
  let missed = false;
  let locked = true;

  /* ---------- 숫자판 ---------- */
  const keyBtns = {};
  [7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0, 'ok'].forEach((k) => {
    const b = h('button', { class: `md-key${k === 'ok' ? ' ok' : k === 'x' ? ' del' : ''}`, type: 'button', 'aria-label': k === 'ok' ? '확인' : k === 'x' ? '지우기' : String(k) }, k === 'ok' ? '✓' : k === 'x' ? '⌫' : String(k));
    b.addEventListener('click', () => press(k));
    keyBtns[k] = b;
    keys.append(b);
  });
  function paintScreen() { screen.textContent = entry; }
  function press(k) {
    if (locked) return;
    sfx.tap();
    if (k === 'x') { entry = entry.slice(0, -1); paintScreen(); return; }
    if (k !== 'ok') { if (entry.length < 4) { entry += String(k); paintScreen(); pop(screen); } return; }
    if (!entry) { wiggle(keyBtns.ok); return; }
    if (Number(entry) === q.c) { win(); return; }
    missed = true;
    wiggle(screen);
    hinter.miss(keyBtns[Number(String(q.c)[0])]);
    speak('연습장에 다시 풀어 볼까요?');
    entry = '';
    ctx.later(paintScreen, 500);
  }

  /* ---------- 연습장: 연필로 쓰고 지우개로 지운다 ---------- */
  const g = canvas.getContext('2d');
  let tool = 'pen';
  let cur = null;
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    if (!r.width) return;
    const keep = canvas.width ? g.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = Math.round(r.width * d);
    canvas.height = Math.round(r.height * d);
    if (keep) g.putImageData(keep, 0, 0);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  ctx.onCleanup(() => ro.disconnect());
  const at = (e) => { const r = canvas.getBoundingClientRect(); const d = canvas.width / r.width; return [(e.clientX - r.left) * d, (e.clientY - r.top) * d]; };
  canvas.addEventListener('pointerdown', (e) => {
    if (locked) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    cur = at(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const p = at(e);
    const d = canvas.width / canvas.getBoundingClientRect().width;
    g.globalCompositeOperation = tool === 'pen' ? 'source-over' : 'destination-out';
    g.strokeStyle = '#1E2A3A';
    g.lineWidth = (tool === 'pen' ? 4 : 26) * d;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(...cur);
    g.lineTo(...p);
    g.stroke();
    cur = p;
  });
  const up = () => { cur = null; };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  const setTool = (t) => { tool = t; pen.classList.toggle('on', t === 'pen'); eraser.classList.toggle('on', t === 'eraser'); sfx.tap(); };
  pen.addEventListener('click', () => setTool('pen'));
  eraser.addEventListener('click', () => setTool('eraser'));
  trash.addEventListener('click', () => { g.clearRect(0, 0, canvas.width, canvas.height); sfx.tap(); });

  function win() {
    locked = true;
    if (!missed) firstTry++;
    hinter.reset();
    sfx.correct();
    screen.classList.add('ok');
    cheer(screen);
    burst(paper, ['⭐', '✨']);
    speak(q.c > 100 ? [String(Math.floor(q.c / 100) * 100), ...(q.c % 100 ? [String(q.c % 100)] : [])] : String(q.c));
    paper.classList.add('flip');
    ctx.later(() => { paper.classList.remove('flip'); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const [a, op, b] = MAKE[L - 1]();
    q = { a, op, b, c: op === '+' ? a + b : a - b };
    entry = '';
    missed = false;
    screen.classList.remove('ok');
    paintScreen();
    g.clearRect(0, 0, canvas.width, canvas.height);
    // 세로셈: 자리를 오른쪽으로 맞춘다
    sum.replaceChildren(h('b', {}, String(a)), h('b', {}, h('i', {}, op), String(b)), h('hr'));
    locked = false;
    ctx.prompt('연습장에 세로셈을 풀어 보고, 숫자판으로 답을 넣은 뒤 ✓를 눌러요!', () => speak('연습장에 풀어 보고 답을 넣어요!'));
  }

  round();
}
