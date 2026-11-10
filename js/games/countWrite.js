import { h, shuffle, pick, randInt, wiggle, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { NATIVE_NUM } from '../data.js';
import { answerPad } from './answerPad.js';

const R = 5;
const FOODS = ['🍌', '🍒', '🍎', '🍓', '🥕', '🍇', '🍊', '🥦', '🍅', '🌽', '🍐', '🍑'];
// 단계별: 한 묶음의 수(하나씩 · 둘씩 · 다섯씩 · 열씩), 묶음 수 범위, 낱개 범위(열씩 셀 때 남는 것)
const CFG = [
  { size: 1, groups: [1, 5] },
  { size: 1, groups: [4, 10] },
  { size: 2, groups: [2, 10] },
  { size: 5, groups: [2, 8] },
  { size: 10, groups: [1, 5], ones: [0, 9] },
];
const BY = { 1: '하나씩', 2: '둘씩', 5: '다섯씩', 10: '열씩' };
// 세는 소리: 스물까지는 하나 · 둘 · 넷, 그 위나 다섯씩 · 열씩은 오 · 십 · 십오처럼
const countWord = (n, size) => (n <= 20 && size <= 2 ? NATIVE_NUM[n - 1] : String(n));

// 수 세기(Counting): 과일 · 채소를 하나씩 · 둘씩 · 다섯씩 · 열씩 눌러 세고,
// 숫자 판을 눌러(끌어) 넣거나 칸에 손으로 써서 모두 몇 개인지 답한다
export function mount(stage, ctx) {
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const things = h('div', { class: 'cw-things', 'aria-label': '세어 볼 과일과 채소' });
  const pad = answerPad(ctx, { onFull: check });
  stage.append(h('div', { class: 'count-write' }, things, pad.el));
  let n = 0;
  let firstTry = 0;
  let target = 0;
  let misses = 0;

  function check(v) {
    if (v === target) {
      pad.ok();
      if (misses === 0) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(pad.answer);
      burst(things, ['⭐', '✨']);
      speak(['모두', countWord(target, 1)]);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
      return;
    }
    misses++;
    sfx.wrong();
    pad.no();
    speak(v < target ? '더 많아요. 다시 세어 볼까요?' : '그보다 적어요. 다시 세어 볼까요?');
    // 두 번째부터는 첫 자리 숫자판을 반짝여 준다
    if (misses >= 2) hinter.miss(pad.keys[Number(String(target)[0])]);
  }

  /* ---------- 한 문제 ---------- */
  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const food = pick(FOODS);
    const groups = randInt(...cfg.groups);
    const ones = cfg.ones ? randInt(...cfg.ones) : 0;
    target = groups * cfg.size + ones;
    misses = 0;
    pad.reset(String(target).length);
    let counted = 0;
    // 묶음(같은 크기)과 낱개를 섞어 늘어놓는다. 열씩 셀 때는 열 묶음을 먼저
    const sizes = [...Array(groups).fill(cfg.size), ...Array(ones).fill(1)];
    const order = cfg.size === 10 ? sizes : shuffle(sizes);
    things.className = `cw-things size-${cfg.size}${target > 12 && cfg.size === 1 ? ' dense' : ''}`;
    things.replaceChildren(...order.map((k, i) => {
      const b = h('button', { class: `cw-bunch k${k}`, type: 'button', style: { animationDelay: `${i * 0.05}s` }, 'aria-label': k === 1 ? '하나 세기' : `${k}개 묶음 세기` },
        Array.from({ length: k }, () => h('span', {}, food)));
      b.addEventListener('click', () => {
        if (b.dataset.n) { wiggle(b); return; }
        counted += k;
        b.dataset.n = counted;
        b.classList.add('counted');
        b.append(h('span', { class: 'cw-badge' }, counted));
        sfx.pop();
        speak(countWord(counted, k));
      });
      return b;
    }));
    const by = ones ? '열씩 세고 남은 것은 하나씩' : BY[cfg.size];
    ctx.prompt(`${food} 모두 몇 개일까요? ${by} 눌러 세고, 숫자판을 넣거나 칸에 답을 써요!`, () => speak(['모두 몇 개일까요?', by, '세어 봐요!']));
  }

  round();
}
