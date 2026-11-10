import { h, randInt, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { answerPad } from './answerPad.js';

const R = 5;
// 단계별: 앞 수 범위, 뒤 수 범위, 합(또는 처음 수)의 최댓값, 빼기인지
const CFG = [
  { a: [1, 4], b: [1, 1], top: 5 },
  { a: [2, 5], b: [1, 2], top: 7 },
  { a: [3, 8], b: [1, 2], top: 10 },
  { a: [2, 8], b: [1, 5], top: 10 },
  { a: [5, 10], b: [1, 4], top: 10, sub: true },
];

// 쿠키(Cookies): 고양이 발이 노란 쿠키 a개와 초콜릿 쿠키 b개를 놓아 주면(높은 단계는 b개를 가져가면)
// 모두 몇 개인지 숫자판이나 손글씨로 답한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const head = h('div', { class: 'ck-head' });
  const tray = h('div', { class: 'ck-tray', 'aria-label': '쿠키' });
  const paw = h('span', { class: 'ck-paw', 'aria-hidden': 'true' });
  const board = h('div', { class: 'ck-board' }, head, tray, paw);
  const pad = answerPad(ctx, { onFull: check });
  stage.append(h('div', { class: 'cookies count-write' }, board, pad.el));
  let n = 0;
  let firstTry = 0;
  let q = null;
  let misses = 0;
  let last = -1;

  const header = (done) => [h('i', { class: 'ck-box', 'aria-hidden': 'true' }, done ? '✓' : ''), `${q.a} ${q.sub ? '−' : '+'} ${q.b}`, ...(done ? [h('b', {}, ` = ${q.c}`)] : [])];

  // 발이 쿠키 자리로 가서 쿠키를 놓거나(가져간다)
  function reach(el, then) {
    const r = el.getBoundingClientRect();
    const b = board.getBoundingClientRect();
    paw.style.left = `${r.left - b.left + r.width / 2}px`;
    paw.style.top = `${r.top - b.top + r.height / 2}px`;
    paw.classList.add('on');
    ctx.later(then, 260);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let a; let b;
    do { a = randInt(...cfg.a); b = randInt(...cfg.b); } while ((cfg.sub ? a - b < 0 || a > cfg.top : a + b > cfg.top) || a * 100 + b === last);
    last = a * 100 + b;
    q = { a, b, sub: !!cfg.sub, c: cfg.sub ? a - b : a + b };
    misses = 0;
    pad.lock();
    head.replaceChildren(...header(false));
    const cookies = Array.from({ length: cfg.sub ? a : a + b }, (_, i) => h('span', { class: `ck-cookie${!cfg.sub && i >= a ? ' choc' : ''}` }));
    tray.replaceChildren(...cookies);
    // 쿠키를 하나씩: 노란 쿠키 → 초콜릿 쿠키 (빼기는 노란 쿠키를 놓은 뒤 뒤에서부터 b개를 가져간다)
    const steps = [...cookies.map((c) => () => reach(c, () => { c.classList.add('in'); sfx.pop(); })),
      ...(cfg.sub ? cookies.slice(-b).reverse().map((c) => () => reach(c, () => { c.classList.add('gone'); sfx.tap(); })) : [])];
    steps.forEach((f, i) => ctx.later(f, 400 + i * 380));
    ctx.later(() => { paw.classList.remove('on'); pad.reset(String(q.c).length); }, 500 + steps.length * 380);
    ctx.prompt(cfg.sub ? '고양이가 쿠키를 가져갔어요. 남은 쿠키는 몇 개일까요? 숫자판을 넣거나 칸에 답을 써요!' : '쿠키는 모두 몇 개일까요? 숫자판을 넣거나 칸에 답을 써요!',
      () => speak([String(a), cfg.sub ? '빼기' : '더하기', String(b)]));
  }

  function check(v) {
    if (v === q.c) {
      pad.ok();
      if (misses === 0) firstTry++;
      hinter.reset();
      head.replaceChildren(...header(true));
      sfx.correct();
      cheer(pad.answer);
      burst(tray, ['⭐', '✨', '🍪']);
      speak(String(q.c));
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
      return;
    }
    misses++;
    sfx.wrong();
    pad.no();
    speak('쿠키를 하나씩 세어 볼까요?');
    if (misses >= 2) hinter.miss(pad.keys[Number(String(q.c)[0])]);
  }

  round();
}
