import { h, shuffle, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { tallyUnit } from './tallyBlocks.js';

const R = 5;
// 단계별: 수직선 끝 수, 눈금 간격(0이면 눈금 없음), 숫자를 적어 둘 눈금, 겨냥이 눈금에 붙는 간격, 잡았다고 보는 거리
const CFG = [
  { max: 5, tick: 1, labels: [0, 5], snap: 1, tol: 0 },
  { max: 10, tick: 1, labels: [0, 5, 10], snap: 1, tol: 0 },
  { max: 20, tick: 1, labels: [0, 10, 20], snap: 1, tol: 0 },
  { max: 100, tick: 10, labels: [0, 50, 100], snap: 1, tol: 3 },
  { max: 100, tick: 0, labels: [0, 100], snap: 1, tol: 5 },
];
const PAD = 8; // 수직선 양 끝 여백 (%)

// 탈리를 잡아라(TallyCatch): 수직선 어딘가에 숨은 탈리. "탈리가 4에 숨어 있어요"를 듣고
// 겨냥 표시를 그 자리로 옮긴 뒤 다람쥐 새총으로 도토리를 쏘아 잡는다 (수직선 위 수의 자리 어림하기)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const banner = h('p', { class: 'tc-banner', 'aria-live': 'polite' });
  const track = h('div', { class: 'tc-track', 'aria-label': '수직선 (눌러서 겨냥하기)' });
  const aim = h('div', { class: 'tc-aim', 'aria-hidden': 'true' });
  const tally = h('div', { class: 'tc-tally', 'aria-hidden': 'true' }, tallyUnit(1, '#7CD957'));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tc-dots');
  const dotLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  svg.append(dotLine);
  const sling = h('div', { class: 'tc-sling', 'aria-hidden': 'true' }, h('span', { class: 'tc-arm' }, h('i', { class: 'tc-acorn' }, '🌰')), h('span', { class: 'tc-squirrel' }, '🐿️'));
  const nudgeL = h('button', { class: 'tc-nudge', type: 'button', 'aria-label': '왼쪽으로 한 칸' }, '◀');
  const nudgeR = h('button', { class: 'tc-nudge', type: 'button', 'aria-label': '오른쪽으로 한 칸' }, '▶');
  const fire = h('button', { class: 'btn btn-primary tc-fire', type: 'button' }, '쏘기!');
  const board = h('div', { class: 'tc-board' }, banner, h('div', { class: 'tc-lane' }, track, aim, tally), svg, sling);
  stage.append(h('div', { class: 'tally-catch' }, board, h('div', { class: 'tc-controls' }, nudgeL, fire, nudgeR)));
  let n = 0;
  let firstTry = 0;
  let at = 0;
  let target = 0;
  let misses = 0;
  let locked = true;

  const pct = (v) => PAD + (v / cfg.max) * (100 - PAD * 2);
  // 눈금과 숫자
  const marks = [];
  if (cfg.tick) for (let v = 0; v <= cfg.max; v += cfg.tick) marks.push(v);
  else marks.push(0, cfg.max);
  track.replaceChildren(h('i', { class: 'tc-rail' }), ...marks.map((v) => h('span', { class: `tc-tick${cfg.labels.includes(v) ? ' big' : ''}`, style: { left: `${pct(v)}%` } },
    cfg.labels.includes(v) ? h('b', {}, v) : h('b', { class: 'tc-hidden' }, v))));

  // 겨냥: 수직선을 누르거나 끌면 그 자리(눈금)로, ◀ ▶는 한 칸씩
  const setAt = (v) => {
    at = Math.max(0, Math.min(cfg.max, Math.round(v / cfg.snap) * cfg.snap));
    aim.style.left = `${pct(at)}%`;
    drawAim();
  };
  const fromPointer = (e) => {
    const r = track.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    return ((x - PAD) / (100 - PAD * 2)) * cfg.max;
  };
  let dragging = false;
  track.addEventListener('pointerdown', (e) => {
    if (locked) return;
    dragging = true;
    try { track.setPointerCapture(e.pointerId); } catch {}
    setAt(fromPointer(e));
    sfx.tap();
  });
  track.addEventListener('pointermove', (e) => { if (dragging) setAt(fromPointer(e)); });
  track.addEventListener('pointerup', () => { dragging = false; });
  track.addEventListener('pointercancel', () => { dragging = false; });
  const step = cfg.tick || 1;
  nudgeL.addEventListener('click', () => { if (!locked) { sfx.tap(); setAt(at - (cfg.max > 20 ? 1 : step)); } });
  nudgeR.addEventListener('click', () => { if (!locked) { sfx.tap(); setAt(at + (cfg.max > 20 ? 1 : step)); } });

  // 새총은 겨냥 표시를 바라보고, 점선이 그 사이를 잇는다
  // 겨냥 표시는 미끄러지며 옮겨 가므로, 요소 대신 수직선 위 자리(at)로 계산한다
  const aimPoint = () => {
    const b = board.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    return { x: t.left - b.left + (pct(at) / 100) * t.width, y: t.top - b.top + 20 };
  };
  function drawAim() {
    const b = board.getBoundingClientRect();
    const s = sling.getBoundingClientRect();
    const x1 = s.left + s.width / 2 - b.left;
    const y1 = s.top + s.height * 0.35 - b.top;
    const { x: x2, y: y2 } = aimPoint();
    svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
    dotLine.setAttribute('x1', x1); dotLine.setAttribute('y1', y1);
    dotLine.setAttribute('x2', x2); dotLine.setAttribute('y2', y2);
    sling.style.setProperty('--turn', `${(Math.atan2(x2 - x1, y1 - y2) * 180) / Math.PI}deg`);
  }
  const ro = new ResizeObserver(drawAim);
  ro.observe(board);
  ctx.onCleanup(() => ro.disconnect());

  fire.addEventListener('click', () => {
    if (locked) return;
    locked = true;
    sfx.sparkle();
    // 도토리가 겨냥한 자리로 날아간다
    const b = board.getBoundingClientRect();
    const acorn = h('i', { class: 'tc-shot' }, '🌰');
    const s = sling.getBoundingClientRect();
    acorn.style.left = `${s.left + s.width / 2 - b.left}px`;
    acorn.style.top = `${s.top + s.height * 0.3 - b.top}px`;
    board.append(acorn);
    const to = aimPoint();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      acorn.style.left = `${to.x}px`;
      acorn.style.top = `${to.y}px`;
    }));
    ctx.later(() => { acorn.remove(); land(); }, 650);
  });

  function land() {
    tally.style.left = `${pct(target)}%`;
    tally.classList.add('show');
    if (Math.abs(at - target) <= cfg.tol) {
      if (misses === 0) firstTry++;
      hinter.reset();
      tally.classList.add('caught');
      banner.textContent = '탈리를 찾았어요!';
      sfx.correct();
      cheer(tally);
      burst(tally, ['⭐', '✨']);
      speak('탈리를 찾았어요!');
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
      return;
    }
    // 빗나가면 탈리가 진짜 자리에서 잠깐 보였다가 도망가고, 다시 겨냥한다
    misses++;
    tally.classList.add('flee');
    banner.textContent = '안돼! 탈리가 도망갔어요!';
    sfx.wrong();
    wiggle(aim);
    speak('안돼! 탈리가 도망갔어요!');
    ctx.later(() => {
      tally.classList.remove('show', 'flee');
      // 두 번 빗나가면 눈금 숫자를 모두 보여 준다
      if (misses >= 2) { track.classList.add('reveal'); hinter.miss(track); }
      ask();
      locked = false;
    }, 1800);
  }

  function ask() {
    banner.replaceChildren('탈리가 ', h('b', {}, target), '에 숨어 있어요.');
    ctx.prompt(`탈리가 ${target}에 숨어 있어요. 수직선에서 ${target}의 자리를 겨냥하고 쏘기!를 눌러요.`, () => speak(['탈리가', String(target), '에 숨어 있어요.']));
  }

  // 같은 수가 이어지지 않게 미리 고른다 (0과 끝 수는 빼고)
  const pool = shuffle(Array.from({ length: cfg.max - 1 }, (_, i) => i + 1).filter((v) => cfg.max <= 20 || v % (ctx.level === 4 ? 5 : 1) === 0));
  function round() {
    hinter.reset();
    ctx.progress(n, R);
    target = pool[n % pool.length];
    misses = 0;
    tally.classList.remove('show', 'caught', 'flee');
    track.classList.remove('reveal');
    // 처음 판에서만 탈리가 "날 잡아 봐!" 하며 숨는 모습을 보여 준다
    setAt(Math.round(cfg.max / 2 / cfg.snap) * cfg.snap);
    if (n === 0) {
      banner.textContent = '날 잡아 봐!';
      tally.style.left = '50%';
      tally.classList.add('show', 'hide');
      ctx.later(() => { tally.classList.remove('show', 'hide'); ask(); locked = false; pop(banner); }, 1500);
    } else {
      ask();
      locked = false;
    }
  }

  round();
}
