import { h, randInt, pick, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const NS = 'http://www.w3.org/2000/svg';
// 방향: 0 위 · 1 오른쪽 · 2 아래 · 3 왼쪽. 조각이 잇는 두 방향 (돌리기 0일 때)
const BASE = { straight: [3, 1], curve: [3, 0] };
const ends = (type, rot) => BASE[type].map((d) => (d + rot) % 4);
const STEP = [[-1, 0], [0, 1], [1, 0], [0, -1]];
// 단계별: 판 크기(줄 × 칸), 판 수, 돋보기(도움) 수
const CFG = [
  { rows: 2, cols: 5, boards: 3 },
  { rows: 3, cols: 5, boards: 3 },
  { rows: 3, cols: 6, boards: 2 },
  { rows: 4, cols: 6, boards: 2 },
  { rows: 5, cols: 7, boards: 2 },
];

function tileSvg(type) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('aria-hidden', 'true');
  const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); s.append(e); };
  // 침목과 선로 (돌리기 0: 곧은 길은 왼쪽 ↔ 오른쪽, 굽은 길은 왼쪽 ↔ 위)
  if (type === 'straight') {
    for (let x = 6; x < 100; x += 22) add('rect', { x, y: 30, width: 9, height: 40, rx: 2, class: 'tp-tie' });
    add('rect', { x: 0, y: 36, width: 100, height: 6, class: 'tp-rail' });
    add('rect', { x: 0, y: 58, width: 100, height: 6, class: 'tp-rail' });
    return s;
  }
  // 굽은 길: 왼쪽 위 모서리(0,0)를 중심으로 도는 사분원
  for (let k = 0; k < 4; k++) {
    const t = ((k + 0.5) / 4) * 90;
    const r = (t * Math.PI) / 180;
    const cx = 50 * Math.sin(r);
    const cy = 50 * Math.cos(r);
    add('rect', { x: cx - 4.5, y: cy - 20, width: 9, height: 40, rx: 2, class: 'tp-tie', transform: `rotate(${-t} ${cx} ${cy})` });
  }
  add('path', { d: 'M0 39A39 39 0 0 0 39 0', class: 'tp-rail-c' });
  add('path', { d: 'M0 61A61 61 0 0 0 61 0', class: 'tp-rail-c' });
  return s;
}

// 경로 완성하기(TrackPath): 끊어진 기찻길 조각을 눌러 방향을 돌려, 왼쪽 기차부터 오른쪽 역까지 길을 잇는다.
// 길이 이어지면 기차가 달려가 역에 닿는다. 돋보기를 누르면 아직 틀린 조각 하나를 알려 준다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const lens = h('button', { class: 'tp-lens', type: 'button', 'aria-label': '도움 보기' }, '🔍', h('b', {}, 5));
  const grid = h('div', { class: 'tp-grid', style: { '--cols': cfg.cols, '--rows': cfg.rows } });
  const train = h('span', { class: 'tp-train', 'aria-hidden': 'true' }, '🚂');
  const station = h('span', { class: 'tp-station', 'aria-hidden': 'true' }, '🚉');
  const field = h('div', { class: 'tp-field' }, train, grid, station);
  stage.append(h('div', { class: 'track-path' }, lens, field));
  let b = 0;
  let firstTry = 0;
  let helps = 5;

  function round() {
    hinter.reset();
    ctx.progress(b, cfg.boards);
    // 길 만들기: 칸마다 들어오는 줄(r)에서 위아래로 움직인 뒤 오른쪽으로 나간다
    const rows = Array.from({ length: cfg.cols + 1 }, () => randInt(0, cfg.rows - 1));
    const want = new Map();
    for (let c = 0; c < cfg.cols; c++) {
      const r0 = rows[c];
      const r1 = rows[c + 1];
      if (r0 === r1) { want.set(`${r0},${c}`, { type: 'straight', dirs: [3, 1] }); continue; }
      const down = r1 > r0;
      want.set(`${r0},${c}`, { type: 'curve', dirs: [3, down ? 2 : 0] });
      for (let r = Math.min(r0, r1) + 1; r < Math.max(r0, r1); r++) want.set(`${r},${c}`, { type: 'straight', dirs: [0, 2] });
      want.set(`${r1},${c}`, { type: 'curve', dirs: [down ? 0 : 2, 1] });
    }
    const start = rows[0];
    const end = rows[cfg.cols];
    train.style.setProperty('--r', start);
    station.style.setProperty('--r', end);
    train.classList.remove('go');
    // 판: 길 조각은 노란 칸, 나머지 칸도 흩어진 조각(길에 쓰이지 않음)이 있을 수 있다
    const tiles = [];
    const cells = [];
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const w = want.get(`${r},${c}`);
        const type = w ? w.type : Math.random() < 0.35 ? pick(['straight', 'curve']) : null;
        if (!type) { cells.push(h('span', { class: 'tp-cell empty' })); continue; }
        const t = { r, c, type, rot: randInt(0, 3), need: w, el: null };
        // 처음부터 맞는 방향이면 한 번 돌려 둔다
        if (w && sameEnds(t)) t.rot = (t.rot + 1) % 4;
        // 돌린 각도는 계속 더해 간다 (270° → 360°로 돌아가지 않고 앞으로 돈다)
        t.ang = t.rot * 90;
        t.el = h('button', { class: 'tp-cell tile', type: 'button', 'aria-label': '기찻길 조각', style: { '--rot': `${t.ang}deg` } }, tileSvg(type));
        t.el.addEventListener('click', () => turn(t));
        tiles.push(t);
        cells.push(t.el);
      }
    }
    grid.replaceChildren(...cells);
    let done = false;
    let missed = false;
    let turns = 0;
    const minTurns = tiles.filter((t) => t.need).reduce((s, t) => s + minRot(t), 0);

    function sameEnds(t) {
      const e = ends(t.type, t.rot).sort().join();
      return e === [...t.need.dirs].sort().join();
    }
    function minRot(t) {
      for (let k = 0; k < 4; k++) if (ends(t.type, (t.rot + k) % 4).sort().join() === [...t.need.dirs].sort().join()) return k;
      return 0;
    }
    // 왼쪽 기차 칸에서 출발해 조각을 따라가 본다
    function connected() {
      let r = start;
      let c = 0;
      let from = 3;
      for (let guard = 0; guard < cfg.rows * cfg.cols + 2; guard++) {
        const t = tiles.find((x) => x.r === r && x.c === c);
        if (!t) return false;
        const e = ends(t.type, t.rot);
        if (!e.includes(from)) return false;
        const out = e[0] === from ? e[1] : e[0];
        if (c === cfg.cols - 1 && out === 1) return r === end;
        const [dr, dc] = STEP[out];
        r += dr;
        c += dc;
        if (r < 0 || r >= cfg.rows || c < 0 || c >= cfg.cols) return false;
        from = (out + 2) % 4;
      }
      return false;
    }
    function turn(t) {
      if (done) return;
      t.rot = (t.rot + 1) % 4;
      turns++;
      t.ang += 90;
      t.el.style.setProperty('--rot', `${t.ang}deg`);
      sfx.tap();
      hinter.reset();
      tiles.forEach((x) => x.el.classList.remove('hint'));
      if (turns > minTurns + 8) missed = true;
      if (!connected()) return;
      done = true;
      if (!missed) firstTry++;
      tiles.forEach((x) => x.el.classList.toggle('on', Boolean(x.need)));
      sfx.correct();
      train.classList.add('go');
      cheer(field);
      speak('칙칙폭폭! 기차가 역에 도착했어요!');
      ctx.later(() => { b++; if (b >= cfg.boards) ctx.finish({ firstTry, total: cfg.boards }); else round(); }, 2600);
    }
    // 돋보기: 아직 방향이 틀린 길 조각 하나를 반짝여 준다
    lens.onclick = () => {
      if (done || !helps) { pop(lens); return; }
      const bad = tiles.find((t) => t.need && !sameEnds(t));
      if (!bad) return;
      helps--;
      missed = true;
      lens.querySelector('b').textContent = helps;
      bad.el.classList.add('hint');
      sfx.tap();
    };
    ctx.prompt('기찻길 조각을 눌러 방향을 돌려요. 왼쪽 기차부터 오른쪽 역까지 길이 이어지게 만들어요!', () => speak('기찻길을 돌려 길을 이어요!'));
  }

  round();
}
