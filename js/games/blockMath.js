import { h, pick, randInt, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { answerPad } from './answerPad.js';

const Q = 8;
const SHOW = 3;
const COLORS = ['#58C25C', '#F2C230', '#4AA8E8', '#E86AB8', '#F0883A', '#9C7BEA'];
// 단계별: 쓰는 셈(+, −), 가장 큰 수(10칸 판 수)
const CFG = [
  { ops: ['+', '-'], top: 5 },
  { ops: ['+'], top: 10 },
  { ops: ['+', '-'], top: 10 },
  { ops: ['+'], top: 20, cross: true },
  { ops: ['+', '-'], top: 20, cross: true },
];
function make(cfg) {
  const op = pick(cfg.ops);
  if (op === '+') {
    // 20까지 단계는 10을 넘어가는 덧셈(8+5)을 주로 낸다
    const a = cfg.cross ? randInt(4, 9) : randInt(1, cfg.top - 1);
    const b = cfg.cross ? randInt(11 - a, Math.min(9, cfg.top - a)) : randInt(1, cfg.top - a);
    return { a, op, b, c: a + b };
  }
  const a = cfg.cross ? randInt(11, 18) : randInt(2, cfg.top);
  const b = cfg.cross ? randInt(a - 9, 9) : randInt(1, a - 1);
  return { a, op, b, c: a - b };
}

// 블록 연산(FallingBlocks): 세 줄로 쌓여 내려오는 블록(수 · 기호 · 수)의 맨 아래 식을 10칸 판으로 보고
// 답을 넣으면 블록이 떨어지고 다음 식이 내려온다 (참고 영상 기준, 20까지 덧셈 · 뺄셈)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const cols = [0, 1, 2].map((i) => h('div', { class: `bm-col c${i}` }));
  const frame = h('div', { class: 'bm-frames', 'aria-hidden': 'true' });
  const board = h('div', { class: 'bm-board' }, h('div', { class: 'bm-cols' }, cols), frame);
  const pad = answerPad(ctx, { onFull: check });
  stage.append(h('div', { class: 'block-math count-write' }, board, pad.el));
  const probs = Array.from({ length: Q }, (_, i) => ({ ...make(cfg), color: COLORS[i % COLORS.length] }));
  let at = 0;
  let firstTry = 0;
  let misses = 0;

  // 위에서부터: 기다리는 식(흐리게) … 맨 아래가 지금 풀 식
  function paint() {
    const list = probs.slice(at, at + SHOW).reverse();
    cols.forEach((col, k) => col.replaceChildren(...list.map((p, i) => {
      const cur = i === list.length - 1;
      const text = [String(p.a), p.op === '+' ? '+' : '−', String(p.b)][k];
      return h('span', { class: `bm-block${cur ? ' cur' : ''}`, style: { '--c': p.color } }, text);
    })));
    // 10칸 판: 앞 수는 색 점, 더하는 수는 다른 색 점, 빼는 수는 점선 동그라미
    const p = probs[at];
    const cells = [];
    const first = p.op === '+' ? p.a : p.c;
    for (let i = 0; i < first; i++) cells.push('a');
    for (let i = 0; i < p.b; i++) cells.push(p.op === '+' ? 'b' : 'x');
    const frames = Math.max(1, Math.ceil(Math.max(cells.length, 1) / 10));
    frame.replaceChildren(...Array.from({ length: frames }, (_, f) => h('div', { class: 'bm-frame' },
      Array.from({ length: 10 }, (_, j) => h('i', { class: cells[f * 10 + j] || '' })))));
    frame.style.setProperty('--c', p.color);
  }

  function ask() {
    hinter.reset();
    misses = 0;
    ctx.progress(at, Q);
    paint();
    const p = probs[at];
    pad.reset(String(p.c).length);
    speak([String(p.a), p.op === '+' ? '더하기' : '빼기', String(p.b)]);
  }

  function check(v) {
    const p = probs[at];
    if (v === p.c) {
      pad.ok();
      if (misses === 0) firstTry++;
      sfx.correct();
      cheer(pad.answer);
      speak(String(v));
      // 맞힌 줄은 아래로 떨어진다
      cols.forEach((c) => c.lastElementChild?.classList.add('drop'));
      ctx.later(() => {
        at++;
        if (at >= Q) { ctx.finish({ firstTry, total: Q }); return; }
        ask();
        cols.forEach((c) => pop(c.lastElementChild));
      }, 900);
      return;
    }
    misses++;
    sfx.wrong();
    pad.no(800);
    speak('10칸 판의 점을 세어 볼까요?');
    if (misses >= 2) hinter.miss(pad.keys[Number(String(p.c)[0])]);
  }

  ctx.prompt('맨 아래 블록의 식을 풀어요! 10칸 판의 점을 보고, 답을 숫자판으로 넣거나 칸에 써요.', () => { const p = probs[at]; speak([String(p.a), p.op === '+' ? '더하기' : '빼기', String(p.b)]); });
  ask();
}
