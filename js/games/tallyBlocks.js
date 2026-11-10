import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 5;
const COLORS = ['#F5C531', '#7CD957', '#F39A3B', '#F06C9B', '#9C7BEA', '#4CC3E0'];
// 탈리 하나 = 눈 달린 네모 블록. k개가 이어진 탈리(묶음)는 세로로 이어 붙인다
export function tallyUnit(k, color = COLORS[0], cls = '') {
  return h('span', { class: `tb-unit k${k}${cls ? ` ${cls}` : ''}`, style: { '--c': color }, 'aria-label': k === 1 ? '탈리 하나' : `탈리 ${k}개 묶음` },
    Array.from({ length: k }, () => h('i', {}, h('b'))));
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// 수 뒤 조사 (한자어로 읽은 끝소리): 3을 · 5를 · 10을
const eul = (n) => ([2, 4, 5, 9].includes(n % 10) ? '를' : '을');

// 탈리(Tallies · make): 줄 아래 탈리를 위로 올리고 내리며(모으기 · 가르기) 동그라미 속 수를 만든다.
// 탈리 연구실(TalliesLab · lab): 플라스크에 탈리 묶음을 넣어 목 위에 적힌 수를 만든다
export function mount(stage, ctx) {
  if (ctx.opts.mode === 'lab') lab(stage, ctx);
  else make(stage, ctx);
}

/* ---------- 탈리 ---------- */
// 단계별: 판에 있는 탈리(묶음 크기 × 개수), 목표 수 범위
const MAKE = [
  { units: [[1, 5]], range: [1, 5] },
  { units: [[1, 10]], range: [1, 10] },
  { units: [[5, 3], [1, 5]], range: [6, 20] },
  { units: [[10, 4], [1, 9]], range: [10, 49] },
  { units: [[10, 9], [1, 9]], range: [11, 99] },
];

function make(stage, ctx) {
  const cfg = MAKE[ctx.level - 1];
  const hinter = makeHinter();
  const goal = h('div', { class: 'tb-goal', 'aria-live': 'polite' });
  const field = h('div', { class: 'tb-field', 'aria-label': '줄 위 (센 탈리)' });
  const tray = h('div', { class: 'tb-tray', 'aria-label': '줄 아래 (남은 탈리)' });
  const upN = h('b');
  const downN = h('b');
  const meter = h('div', { class: 'tb-meter', 'aria-hidden': 'true' }, upN, downN);
  const line = h('div', { class: 'tb-line' }, meter);
  stage.append(h('div', { class: 'tally-blocks' }, goal, field, line, tray));
  let n = 0;
  let firstTry = 0;
  let target = 0;
  let misses = 0;
  let locked = true;

  // 탈리를 모두 만들어 아래에 둔다 (판이 바뀌어도 위에 올린 탈리는 그대로 남는다)
  const units = cfg.units.flatMap(([k, c]) => Array.from({ length: c }, () => {
    const u = tallyUnit(k, k === 1 ? COLORS[0] : k === 5 ? COLORS[1] : COLORS[5]);
    const b = h('button', { class: 'tb-btn', type: 'button' }, u);
    b.dataset.k = k;
    draggable(b, {
      can: () => !locked,
      onDrop: (pt) => {
        const up = b.parentElement === field;
        if (up && hits(tray, pt, 4)) move(b, false);
        else if (!up && hits(field, pt, 4)) move(b, true);
        else wiggle(b);
      },
    });
    b.addEventListener('click', () => { if (!locked) move(b, b.parentElement !== field); });
    return b;
  }));
  // 아래 줄은 큰 묶음부터 차례로
  units.forEach((b) => tray.append(b));
  const count = (el) => [...el.children].reduce((a, b) => a + Number(b.dataset.k), 0);
  const sorted = (el) => [...el.children].sort((a, b) => b.dataset.k - a.dataset.k).forEach((b) => el.append(b));

  function paint() {
    upN.textContent = count(field);
    downN.textContent = count(tray);
  }

  // 목표에서 멀어지는 쪽으로 옮기면 실수로 센다. 두 번째부터는 옮길 탈리를 반짝여 준다
  function move(b, up) {
    const before = count(field);
    (up ? field : tray).append(b);
    sorted(up ? field : tray);
    sfx.pop();
    pop(b);
    paint();
    const now = count(field);
    speak(String(now));
    if (now === target) { win(); return; }
    if (Math.abs(now - target) > Math.abs(before - target) && ++misses >= 2) hint();
  }

  function win() {
    locked = true;
    if (misses === 0) firstTry++;
    hinter.reset();
    sfx.correct();
    goal.classList.add('ok');
    cheer(goal);
    burst(field, ['⭐', '✨']);
    ctx.later(() => { goal.classList.remove('ok'); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1800);
  }

  // 목표 수: 지금 위에 있는 수와는 다르게 (모으기와 가르기가 섞이도록)
  const targets = [];
  function nextTarget() {
    const now = count(field);
    const pool = range(...cfg.range).filter((v) => v !== now && !targets.includes(v));
    const t = pick(pool.length ? pool : range(...cfg.range).filter((v) => v !== now));
    targets.push(t);
    return t;
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    target = nextTarget();
    misses = 0;
    goal.replaceChildren(h('b', {}, target));
    pop(goal);
    paint();
    locked = false;
    const now = count(field);
    const q = now < target ? '탈리를 줄 위로 올려서' : '줄 위의 탈리를 내려서';
    ctx.prompt(`${q} 동그라미 속 수 ${target}${eul(target)} 만들어요! 탈리를 누르거나 끌어요.`, () => speak([String(target), '만큼 줄 위에 올려요!']));
  }

  function hint() {
    const now = count(field);
    const from = now < target ? tray : field;
    const gap = Math.abs(target - now);
    const b = [...from.children].find((x) => Number(x.dataset.k) <= gap);
    if (b) hinter.miss(b);
  }

  paint();
  round();
}

/* ---------- 탈리 연구실 ---------- */
// 단계별: 목표 수 범위, 고를 묶음 수, 정답 묶음 수(1 = 하나만 넣으면 됨, 2 = 둘을 모아야 함), 묶음 크기 범위
const LAB = [
  { range: [2, 5], picks: 3, need: 1, sizes: [1, 3] },
  { range: [4, 10], picks: 3, need: 1, sizes: [1, 6] },
  { range: [5, 10], picks: 4, need: 2, sizes: [1, 6], empty: true },
  { range: [10, 20], picks: 4, need: 2, sizes: [1, 10], empty: true },
  { range: [20, 40], picks: 5, need: 2, sizes: [5, 25], tens: true, empty: true },
];

function lab(stage, ctx) {
  const cfg = LAB[ctx.level - 1];
  const hinter = makeHinter();
  const neck = h('b', { class: 'tl2-num' });
  const inside = h('div', { class: 'tl2-inside' });
  const flask = h('div', { class: 'tl2-flask', 'aria-label': '플라스크' }, h('div', { class: 'tl2-neck' }, neck), h('div', { class: 'tl2-bulb' }, inside), h('div', { class: 'tl2-stand', 'aria-hidden': 'true' }));
  const left = h('div', { class: 'tl2-shelf l' });
  const right = h('div', { class: 'tl2-shelf r' });
  stage.append(h('div', { class: 'tally-lab' }, left, flask, right));
  let n = 0;
  let firstTry = 0;

  // 묶음 하나(크기 k)를 그린다. 열 개 이상은 열 묶음 + 남는 낱개
  const group = (k, color) => {
    const parts = k >= 10 ? [...Array(Math.floor(k / 10)).fill(10), ...(k % 10 ? [k % 10] : [])] : [k];
    return h('span', { class: 'tl2-group' }, parts.map((p) => tallyUnit(p, color)));
  };

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const target = randInt(...cfg.range);
    const start = cfg.empty ? 0 : randInt(1, target - 1);
    let have = start;
    let missed = false;
    let locked = false;
    // 정답 묶음: need개를 모으면 target - start (열씩 묶는 단계는 열 묶음을 먼저 고른다)
    const gap = target - start;
    let answer;
    if (cfg.need === 1) answer = [gap];
    else {
      const cands = range(Math.max(cfg.sizes[0], gap - cfg.sizes[1]), Math.min(cfg.sizes[1], gap - cfg.sizes[0]));
      const tens = cands.filter((v) => v % 10 === 0);
      const a = pick(cfg.tens && tens.length ? tens : cands.length ? cands : [Math.ceil(gap / 2)]);
      answer = [a, gap - a];
    }
    // 다른 묶음: 정답과 다른 크기. 다른 묶음끼리 모아도 맞으면 그것도 정답으로 받는다
    const wrong = shuffle(range(cfg.sizes[0], cfg.sizes[1]).filter((v) => !answer.includes(v) && v !== gap)).slice(0, cfg.picks - answer.length);
    const colors = pickN(COLORS.slice(1), cfg.picks);
    const pieces = shuffle([...answer, ...wrong]).map((k, i) => {
      const b = h('button', { class: 'tl2-piece', type: 'button', style: { animationDelay: `${i * 0.1}s` }, 'aria-label': `탈리 ${k}개` }, group(k, colors[i % colors.length]));
      b.dataset.k = k;
      b.dataset.home = i % 2 ? 'r' : 'l';
      draggable(b, {
        can: () => !locked,
        onDrop: (pt) => {
          if (b.parentElement !== inside && hits(flask, pt, 10)) drop(b);
          else if (b.parentElement === inside && !hits(flask, pt, 0)) back(b);
          else wiggle(b);
        },
      });
      // 플라스크 안의 묶음을 누르면 다시 꺼낸다 (잘못 넣어도 막히지 않게)
      b.addEventListener('click', () => { if (locked) return; if (b.parentElement === inside) back(b); else drop(b); });
      return b;
    });
    left.replaceChildren(...pieces.filter((p) => p.dataset.home === 'l'));
    right.replaceChildren(...pieces.filter((p) => p.dataset.home === 'r'));
    neck.textContent = target;
    inside.replaceChildren(...(start ? [h('span', { class: 'tl2-start' }, group(start, COLORS[0]))] : []));
    flask.classList.remove('glow');

    function back(b) {
      have -= Number(b.dataset.k);
      (b.dataset.home === 'l' ? left : right).append(b);
      sfx.tap();
      speak(String(have));
    }

    function drop(b) {
      const k = Number(b.dataset.k);
      if (have + k > target) {
        missed = true;
        sfx.wrong();
        b.classList.add('oops');
        wiggle(b);
        ctx.later(() => b.classList.remove('oops'), 900);
        speak('너무 많아요!');
        const need = target - have;
        const fit = pieces.find((p) => p.parentElement !== inside && Number(p.dataset.k) <= need);
        if (fit) hinter.miss(fit);
        return;
      }
      have += k;
      inside.append(b);
      sfx.pop();
      pop(flask);
      speak(String(have));
      if (have < target) return;
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      flask.classList.add('glow');
      sfx.correct();
      cheer(flask);
      burst(flask, ['⭐', '✨', '💛']);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
    }

    const msg = start ? `플라스크에 탈리가 ${start}개 있어요. 묶음을 넣어 ${target}${eul(target)} 만들어요!` : `탈리 묶음을 플라스크에 넣어 ${target}${eul(target)} 만들어요!`;
    ctx.prompt(msg, () => speak([String(target), '만들어요!']));
  }

  round();
}
