import { h, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { numPad } from './numPad.js';

const R = 3;
const S = 46;
const PAIRS = [['#3FBF4A', '#D9E04A'], ['#3B4FD0', '#6FE6D8'], ['#E8574F', '#F2A23A'], ['#8A4CC8', '#F28AB8']];
// 단계별: 쌓기나무 수 범위, 바닥 크기, 가장 높이
const CFG = {
  1: [[3, 4], 3, 2], 2: [[4, 6], 3, 2], 3: [[5, 7], 3, 3], 4: [[6, 9], 3, 3], 5: [[8, 11], 4, 3],
};
const CFG2 = {
  1: [[7, 9], 3, 3], 2: [[8, 11], 4, 3], 3: [[10, 13], 4, 3], 4: [[12, 15], 4, 4], 5: [[14, 18], 4, 4],
};

// 바닥 칸에 쌓기나무를 하나씩 붙이거나 올려 쌓는다 (늘 서로 붙어 있고, 위 칸은 아래가 받친다)
function build(n, size, maxH) {
  const hgt = Array.from({ length: size }, () => Array(size).fill(0));
  const mid = Math.floor(size / 2);
  hgt[mid][mid] = 1;
  let count = 1;
  while (count < n) {
    const cells = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => hgt[x + dx]?.[y + dy] > 0);
        if (hgt[x][y] > 0 && hgt[x][y] < maxH) cells.push([x, y]);
        else if (!hgt[x][y] && near) cells.push([x, y], [x, y]);
      }
    }
    const [x, y] = pick(cells);
    hgt[x][y]++;
    count++;
  }
  return hgt;
}

function cubeEl(x, y, z, color, size) {
  const off = (size * S) / 2;
  const face = (t, shade) => h('i', { class: 'cb-face', style: { transform: t, background: `color-mix(in srgb, ${color} ${shade}%, #000)` } });
  return h('div', { class: 'cb-cube', style: { transform: `translate3d(${x * S - off}px, ${-z * S}px, ${y * S - off}px)` } },
    face(`translateZ(${S / 2}px)`, 88), face(`rotateY(180deg) translateZ(${S / 2}px)`, 80),
    face(`rotateY(90deg) translateZ(${S / 2}px)`, 72), face(`rotateY(-90deg) translateZ(${S / 2}px)`, 76),
    face(`rotateX(90deg) translateZ(${S / 2}px)`, 100), face(`rotateX(-90deg) translateZ(${S / 2}px)`, 60));
}

// 쌓기나무 세기(CubeCount · CubeCountRemake): 쌓인 쌓기나무를 슬라이더로 돌려 보며 숨은 것까지 세고,
// "큐브의 개수는?"에 숫자판으로 답한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const [range, size, maxH] = (ctx.opts.big ? CFG2 : CFG)[ctx.level];
  const hinter = makeHinter();
  const obj = h('div', { class: 'cb-obj' });
  const yaw = h('input', { class: 'cb-yaw', type: 'range', min: -180, max: 180, value: 30, 'aria-label': '돌려 보기' });
  const back = h('button', { class: 'cb-reset', type: 'button', 'aria-label': '처음 방향으로' }, '↺');
  const answer = h('div', { class: 'cb-answer' });
  const dots = h('div', { class: 'cb-dots', 'aria-hidden': 'true' });
  stage.append(h('div', { class: 'cube-count' },
    h('div', { class: 'cb-left' }, dots, back, h('div', { class: 'cb-view' }, obj), yaw),
    h('div', { class: 'cb-right' }, h('p', { class: 'cb-ask' }, '큐브의 개수는?'), answer)));
  const turn = () => { obj.style.transform = `rotateX(-28deg) rotateY(${yaw.value}deg)`; };
  yaw.addEventListener('input', turn);
  back.addEventListener('click', () => { yaw.value = 30; turn(); sfx.tap(); });
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    dots.replaceChildren(...Array.from({ length: R }, (_, i) => h('i', { class: i < n ? 'done' : i === n ? 'now' : '' })));
    const want = randInt(...range);
    const hgt = build(want, size, maxH);
    const [c1, c2] = pick(PAIRS);
    const cubes = [];
    hgt.forEach((col, x) => col.forEach((k, y) => { for (let z = 0; z < k; z++) cubes.push(cubeEl(x, y, z, (x + y + z) % 2 ? c1 : c2, size)); }));
    obj.replaceChildren(...cubes);
    yaw.value = 30;
    turn();
    let missed = false;
    const pad = numPad((v, clear) => {
      if (v !== want) { missed = true; wiggle(answer); hinter.miss(yaw); clear(); speak('돌려 보면서 다시 세어 봐요!'); return; }
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      pop(pad.screen);
      cheer(obj);
      speak(String(want));
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
    }, { cls: 'cb' });
    answer.replaceChildren(pad.screen, pad.el);
    speak('큐브의 개수는 몇 개일까요?');
  }

  ctx.prompt('슬라이더로 쌓기나무를 이리저리 돌려 보며, 뒤에 숨은 것까지 모두 세어 숫자판으로 넣어요!', () => speak('큐브의 개수는 몇 개일까요?'));
  round();
}
