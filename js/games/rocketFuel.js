import { h, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
// 단계별: 목표 수 범위, 10 묶음 카드를 주는지, 탱크 옆에 센 수를 보여 주는지
const CFG = [
  { range: [2, 9], tens: false, labels: true },
  { range: [10, 20], tens: true, labels: true },
  { range: [21, 50], tens: true, labels: true },
  { range: [51, 99], tens: true, labels: true },
  { range: [11, 99], tens: true, labels: false },
];
const bar = () => h('span', { class: 'rf-bar', 'aria-hidden': 'true' }, Array.from({ length: 10 }, () => h('i')));
const lastPiece = (col) => [...col.querySelectorAll('.rf-piece')].pop() || col;
const cell = () => h('span', { class: 'rf-cell', 'aria-hidden': 'true' }, h('i'));

// 로켓 발사(RocketLaunch): 로켓 연료 탱크에 10 묶음과 낱개 연료를 넣어 번개 수만큼 채우고 발사한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const goal = h('b', { class: 'rf-goal' });
  const tensCol = h('div', { class: 'rf-tens' });
  const onesCol = h('div', { class: 'rf-ones' });
  const tensN = h('b', { class: 'rf-n t' });
  const onesN = h('b', { class: 'rf-n o' });
  const go = h('button', { class: 'rf-go', type: 'button', 'aria-label': '다 넣었어요' }, '✓');
  const tank = h('div', { class: `rf-tank${cfg.labels ? '' : ' bare'}${cfg.tens ? '' : ' solo'}` }, tensCol, onesCol);
  const ship = h('div', { class: 'rf-ship' }, h('div', { class: 'rf-nose', 'aria-hidden': 'true' }), goal, tank, go, h('div', { class: 'rf-flame', 'aria-hidden': 'true' }));
  const addTen = h('button', { class: 'rf-card ten', type: 'button', 'aria-label': '10 묶음 넣기' }, bar());
  const addOne = h('button', { class: 'rf-card one', type: 'button', 'aria-label': '낱개 넣기' }, cell());
  const supply = h('div', { class: 'rf-supply' }, cfg.tens ? addTen : null, addOne);
  stage.append(h('div', { class: 'rocket-fuel' }, ship, supply));
  let n = 0;
  let firstTry = 0;
  let target = 0;
  let tens = 0;
  let ones = 0;
  let missed = false;
  let locked = true;
  const used = [];

  function render() {
    tensCol.replaceChildren(...Array.from({ length: tens }, () => {
      const b = h('button', { class: 'rf-piece ten', type: 'button', 'aria-label': '10 묶음 빼기' }, bar());
      b.addEventListener('click', () => change(-1, 0));
      return b;
    }));
    onesCol.replaceChildren(...Array.from({ length: ones }, () => {
      const b = h('button', { class: 'rf-piece one', type: 'button', 'aria-label': '낱개 빼기' }, cell());
      b.addEventListener('click', () => change(0, -1));
      return b;
    }));
    // 센 수는 쌓인 연료 맨 위에 붙는다
    tensN.textContent = tens ? tens * 10 : '';
    onesN.textContent = ones || '';
    tensCol.append(tensN);
    onesCol.append(onesN);
    go.classList.toggle('on', tens + ones > 0);
  }

  function change(dt, d1) {
    if (locked) return;
    if (dt > 0 && tens * 10 + ones + 10 > 100) { wiggle(addTen); return; }
    if (d1 > 0 && !cfg.tens && ones >= 10) { wiggle(addOne); return; }
    tens = Math.max(0, tens + dt);
    ones = Math.max(0, ones + d1);
    sfx.pop();
    // 낱개가 열이 되면 10 묶음 하나로 바뀐다
    if (ones === 10 && cfg.tens) {
      render();
      locked = true;
      onesCol.classList.add('merging');
      speak('낱개 열 개가 모이면 10 묶음 한 개가 돼요!');
      ctx.later(() => { onesCol.classList.remove('merging'); ones = 0; tens++; locked = false; render(); pop(lastPiece(tensCol)); speak(String(tens * 10)); }, 900);
      return;
    }
    render();
    pop(dt ? (dt > 0 ? lastPiece(tensCol) : tensCol) : (d1 > 0 ? lastPiece(onesCol) : onesCol));
    speak(String(tens * 10 + ones));
  }

  function check() {
    if (locked) return;
    const now = tens * 10 + ones;
    if (now !== target) {
      missed = true;
      wiggle(tank);
      speak(now > target ? '연료가 너무 많아요!' : '연료가 모자라요!');
      // 두 번째부터는 눌러야 할 것을 반짝여 준다
      const t0 = Math.floor(target / 10);
      const ten0 = cfg.tens ? t0 : 0;
      hinter.miss(tens > ten0 ? lastPiece(tensCol) : tens < ten0 ? addTen : ones > target - ten0 * 10 ? lastPiece(onesCol) : addOne);
      return;
    }
    locked = true;
    if (!missed) firstTry++;
    hinter.reset();
    sfx.correct();
    cheer(goal);
    burst(tank, ['⚡', '⭐', '✨']);
    speak([String(target), '발사!']);
    ctx.later(() => ship.classList.add('go'), 700);
    ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2600);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    do target = randInt(...cfg.range); while (used.includes(target));
    used.push(target);
    tens = 0;
    ones = 0;
    missed = false;
    ship.classList.remove('go');
    goal.replaceChildren(h('i', { 'aria-hidden': 'true' }, '⚡'), String(target));
    render();
    pop(goal);
    locked = false;
    ctx.prompt(cfg.tens ? `연료를 ${target}만큼 넣고 ✓를 눌러 로켓을 발사해요! 10 묶음과 낱개를 눌러 넣고, 탱크 속 연료를 누르면 빠져요.` : `연료를 ${target}만큼 넣고 ✓를 눌러 로켓을 발사해요!`,
      () => speak([String(target), '만큼 연료를 넣어요!']));
  }

  addTen.addEventListener('click', () => change(1, 0));
  addOne.addEventListener('click', () => change(0, 1));
  go.addEventListener('click', check);
  round();
}
