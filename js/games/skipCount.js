import { h, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 5;
const EGGS = 4;
// 단계별: 몇씩 뛰는지, 시작 수 범위, 거꾸로 세기를 섞는지, 빈 알이 맨 끝에만 있는지 (가장 큰 수 top은 정하지 않으면 100)
const CFG = [
  { steps: [1], start: [1, 6], back: false, endOnly: true },
  { steps: [1], start: [5, 17], back: false, endOnly: true },
  { steps: [2, 5, 10], start: [0, 10], back: false, endOnly: true },
  { steps: [1, 10], start: [10, 60], back: true, endOnly: false },
  { steps: [2, 5, 10], start: [10, 60], back: true, endOnly: false },
];
const STEP_SAY = {
  1: '1씩 뛰어 세어요!', 2: '2씩 뛰어 세어요!', 5: '5씩 뛰어 세어요!', 10: '10씩 뛰어 세어요!', 100: '100씩 뛰어 세어요!',
  '-1': '1씩 거꾸로 뛰어 세어요!', '-2': '2씩 거꾸로 뛰어 세어요!', '-5': '5씩 거꾸로 뛰어 세어요!', '-10': '10씩 거꾸로 뛰어 세어요!', '-100': '100씩 거꾸로 뛰어 세어요!',
};

// 빠진 숫자 찾기(MissingNumber): 둥지의 알에 뛰어 세는 수가 적혀 있고, 빈 알(??)에 들어갈 수를 숫자판으로 붙인다 (참고 영상 "뛰어 세기" 기준)
export function mount(stage, ctx) {
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const nests = h('div', { class: 'sk-nests' });
  const pad = h('div', { class: 'sk-pad' });
  const rule = h('button', { class: 'sk-rule', type: 'button' });
  stage.append(h('div', { class: 'skip-count' }, rule, nests, pad));
  let n = 0;
  let firstTry = 0;
  let answer = '';
  let typed = '';
  let boxes = [];
  let egg = null;
  let missed = false;
  let locked = true;
  let misses = 0;

  const keys = Array.from({ length: 10 }, (_, d) => {
    const k = h('button', { class: 'sk-key', type: 'button' }, String(d));
    k.addEventListener('click', () => press(String(d), k));
    return k;
  });
  pad.append(...keys);

  function press(d, k) {
    if (locked) return;
    sfx.tap();
    pop(k);
    typed += d;
    boxes[typed.length - 1].textContent = d;
    boxes[typed.length - 1].classList.add('on');
    if (typed.length < answer.length) return;
    if (typed === answer) { win(); return; }
    // 틀리면 흔들고 비운다. 두 번째부터는 다음에 누를 숫자를 반짝여 준다
    missed = true;
    misses++;
    locked = true;
    wiggle(egg);
    hinter.miss(misses >= 2 ? keys[Number(answer[0])] : null);
    ctx.later(() => { typed = ''; boxes.forEach((b) => { b.textContent = '?'; b.classList.remove('on'); }); locked = false; }, 650);
  }

  function win() {
    locked = true;
    if (!missed) firstTry++;
    hinter.reset();
    sfx.correct();
    egg.classList.add('hatch');
    egg.replaceChildren(h('b', {}, answer), h('span', { class: 'sk-chick', 'aria-hidden': 'true' }, '🐣'));
    cheer(egg);
    burst(egg, ['⭐', '✨', '🪶']);
    speak(answer);
    ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const size = pick(cfg.steps);
    const step = cfg.back && Math.random() < 0.4 ? -size : size;
    // 시작 수는 고른 칸 수만큼 뛰어도 0~top 안에 머물게 한다
    let a = randInt(...cfg.start);
    if (size > 1) a = Math.round(a / size) * size;
    if (step < 0) a += (EGGS - 1) * size;
    a = Math.min(a, (cfg.top || 100) - (step > 0 ? (EGGS - 1) * size : 0));
    const seq = Array.from({ length: EGGS }, (_, i) => a + i * step);
    const hole = cfg.endOnly ? EGGS - 1 : randInt(1, EGGS - 1);
    answer = String(seq[hole]);
    typed = '';
    missed = false;
    misses = 0;
    boxes = [...answer].map(() => h('span', { class: 'sk-box' }, '?'));
    nests.replaceChildren(...seq.map((v, i) => {
      const e = h('div', { class: `sk-egg${i === hole ? ' hole' : ''}`, style: { animationDelay: `${i * 0.12}s` } }, i === hole ? boxes : h('b', {}, String(v)));
      if (i === hole) egg = e;
      return h('div', { class: `sk-nest${i === hole ? ' lit' : ''}` }, e);
    }));
    rule.replaceChildren(h('i', { 'aria-hidden': 'true' }, '🔊'), STEP_SAY[step]);
    rule.onclick = () => speak(STEP_SAY[step]);
    locked = false;
    const shown = seq.filter((_, i) => i !== hole).map(String);
    ctx.prompt(`${STEP_SAY[step]} 빈 알에 들어갈 수를 숫자판에서 눌러 붙여요.`, () => speak([STEP_SAY[step], ...shown]));
  }

  round();
}
