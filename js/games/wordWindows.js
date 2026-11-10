import { h, shuffle, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WINDOW_ITEMS, windowLines } from '../data.js';

const R = 5;
// 단계별: 문제 종류, 수 범위
const CFG = [
  { kinds: ['add1'], top: 5 },
  { kinds: ['add1', 'add'], top: 10 },
  { kinds: ['sub'], top: 10 },
  { kinds: ['cmp', 'add', 'sub'], top: 10 },
  { kinds: ['add', 'sub', 'cmp'], top: 19 },
];

// 몇 개일까요(WordWindows · 창문 너머 연산): 커튼 창문 두 개에 적힌 문장을 읽고(눌러서 듣고)
// "모두 몇 개일까요?"에 알맞은 수 카드를 고른다. 맞히면 커튼이 열려 물건이 보인다 (참고 영상 기준)
export function mount(stage, ctx) {
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const ask = h('button', { class: 'ww-ask', type: 'button' });
  const wins = h('div', { class: 'ww-windows' });
  const opts = h('div', { class: 'ww-opts' });
  stage.append(h('div', { class: 'word-windows' }, ask, wins, opts));
  let n = 0;
  let firstTry = 0;
  const used = new Set();

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const kind = pick(cfg.kinds);
    const [w, e] = pick(WINDOW_ITEMS);
    let a; let b; let ans;
    do {
      if (kind === 'sub') { a = randInt(3, cfg.top); b = randInt(1, Math.min(9, a - 1)); ans = a - b; }
      else if (kind === 'cmp') { a = randInt(1, Math.min(9, cfg.top - 1)); b = randInt(a + 1, Math.min(10, cfg.top)); ans = b - a; }
      else { a = randInt(1, cfg.top - 1); b = randInt(1, Math.min(9, cfg.top - a)); ans = a + b; }
    } while (used.has(`${kind}${a}${b}`));
    used.add(`${kind}${a}${b}`);
    const lines = windowLines(kind, w, a, b);
    let missed = false;
    let locked = false;
    ask.replaceChildren(h('i', { 'aria-hidden': 'true' }, '🔊'), lines[2]);
    ask.onclick = () => speak(lines[2]);
    // 창문: 문장 카드(커튼) 뒤에 물건 그림
    const goods = [a, b];
    const panes = lines.slice(0, 2).map((t, i) => {
      const pane = h('button', { class: 'ww-pane', type: 'button', 'aria-label': t },
        h('span', { class: 'ww-goods', 'aria-hidden': 'true' }, Array.from({ length: goods[i] }, (_, k) => h('i', { class: kind === 'sub' && i === 1 ? 'sold' : '', style: { animationDelay: `${k * 0.04}s` } }, e))),
        h('span', { class: 'ww-curtain' }, h('b', {}, t)));
      pane.addEventListener('click', () => { sfx.tap(); speak(t); pop(pane); });
      return pane;
    });
    wins.className = `ww-windows kind-${kind}`;
    wins.replaceChildren(...panes);
    // 보기 4개: 정답, 두 수, 가까운 수
    const pool = new Set([ans]);
    [a, b, ans + 1, ans - 1, ans + 2, kind === 'sub' ? a + b : Math.abs(a - b)].forEach((v) => { if (pool.size < 4 && v > 0 && v !== ans) pool.add(v); });
    while (pool.size < 4) pool.add(ans + pool.size + 2);
    const btns = shuffle([...pool]).map((v) => {
      const o = h('button', { class: 'ww-opt', type: 'button' }, h('b', {}, String(v)), h('small', {}, w));
      o.addEventListener('click', () => {
        if (locked) return;
        if (v !== ans) {
          missed = true;
          wiggle(o);
          o.classList.add('flip');
          hinter.miss(btns.find((x) => x.querySelector('b').textContent === String(ans)));
          speak(lines);
          return;
        }
        locked = true;
        if (!missed) firstTry++;
        hinter.reset();
        o.classList.add('ok');
        btns.forEach((x) => { if (x !== o) x.classList.add('flip'); });
        panes.forEach((p) => p.classList.add('open'));
        sfx.correct();
        cheer(o);
        burst(wins, ['⭐', '✨']);
        speak(`${ans}개!`);
        ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2600);
      });
      return o;
    });
    opts.replaceChildren(...btns);
    ctx.prompt('창문의 글을 읽고(누르면 읽어 줘요) 알맞은 수를 골라요!', () => speak(lines));
    speak(lines);
  }

  round();
}
