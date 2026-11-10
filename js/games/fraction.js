import { h, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); el.append(...kids); return el; };
const frac = (k, d) => h('span', { class: 'fr-frac', 'aria-label': `${d}분의 ${k}` }, h('b', {}, k), h('i'), h('b', {}, d));
const CUT_SAY = { 2: '피자를 똑같이 2조각으로 잘라요!', 3: '피자를 똑같이 3조각으로 잘라요!', 4: '피자를 똑같이 4조각으로 잘라요!', 6: '피자를 똑같이 6조각으로 잘라요!', 8: '피자를 똑같이 8조각으로 잘라요!' };

// 피자 조각 분수(FractionPizza · pizza): 피자를 손가락으로 그어 똑같이 자른 뒤, 분수만큼 조각을 쟁반에 담는다 (참고 영상 "피자 나누기" 기준)
// 음료수 분수(FractionDrinks · drink): 단추를 누르고 있는 동안 주스가 나오고, 컵 눈금의 분수만큼 채워 손님에게 낸다 (참고 영상 "분수 음료 가게" 기준)
export function mount(stage, ctx) {
  if (ctx.opts.mode === 'pizza') pizza(stage, ctx);
  else drink(stage, ctx);
}

/* ---------- 피자 나누기 ---------- */
// 판: [모양, 나눌 수, 담을 조각 수, (같은 크기 분수로 보여 줄 때) 분자, 분모]
const PIZZA = [
  () => ['round', 2, 1],
  () => ['round', 4, randInt(1, 3)],
  (i) => (i % 2 ? ['square', pick([2, 3, 4]), 0] : ['round', 4, 0]),
  (i) => (i % 2 ? ['square', 6, 0] : ['round', 8, 0]),
  (i) => (i % 2 ? (([k, sd]) => ['square', 6, (6 / sd) * k, k, sd])(pick([[1, 2], [1, 3], [2, 3]])) : (([k, sd]) => ['round', pick([4, 8]), 0, k, sd])(pick([[1, 2], [1, 4], [3, 4]]))),
];
const ROUND_CUTS = { 2: [[0]], 4: [[0, 2], [1, 3]], 8: [[0, 1, 2, 3]] }; // 지름 번호: 0 가로 · 1 대각 · 2 세로 · 3 반대 대각
const SQUARE_CUTS = { 2: { x: [1 / 2], y: [] }, 3: { x: [1 / 3, 2 / 3], y: [] }, 4: { x: [1 / 2], y: [1 / 2] }, 6: { x: [1 / 3, 2 / 3], y: [1 / 2] } };
let uid = 0;

function pizza(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const tag = h('div', { class: 'pz-tag' });
  const count = h('div', { class: 'pz-count' });
  const traySvg = sv('svg', { viewBox: '-60 -60 120 120', class: 'pz-tray-svg' });
  const ok = h('button', { class: 'pz-ok', type: 'button', 'aria-label': '다 담았어요' }, '✓');
  const tray = h('div', { class: 'pz-tray' }, tag, count, traySvg, ok);
  const board = sv('svg', { viewBox: '-60 -60 120 120', class: 'pz-board' });
  const redo = h('button', { class: 'pz-redo', type: 'button', 'aria-label': '다시 자르기' }, '↻');
  const paddle = h('div', { class: 'pz-paddle' }, board, redo);
  stage.append(h('div', { class: 'pizza-cut' }, tray, paddle));
  let n = 0;
  let firstTry = 0;

  function next() {
    hinter.reset();
    ctx.progress(n, R);
    let [shape, d, want, shownK, shownD] = PIZZA[L - 1](n);
    if (!want) want = randInt(1, d - 1);
    if (shownD) want = (d / shownD) * shownK;
    const k = shownK ?? want;
    const kd = shownD ?? d;
    const isRound = shape === 'round';
    const id = ++uid;
    let cuts = isRound ? [] : { x: [], y: [] };
    let pieces = [];
    let cutDone = false;
    let missed = false;
    let locked = false;
    tray.classList.remove('done', 'ready');
    ok.classList.remove('on');
    // 토핑은 판마다 한 번 정해 두고, 조각마다 잘라서(clipPath) 보여 준다
    const tops = Array.from({ length: isRound ? 16 : 18 }, () => {
      const [x, y] = isRound ? (() => { const a = Math.random() * 2 * Math.PI; const r = Math.sqrt(Math.random()) * 38; return [r * Math.cos(a), r * Math.sin(a)]; })() : [randInt(-38, 38), randInt(-38, 38)];
      return [x, y, pick(['pep', 'pep', 'leaf'])];
    });
    const base = () => (isRound ? sv('circle', { cx: 0, cy: 0, r: 48, class: 'crust' }) : sv('rect', { x: -48, y: -48, width: 96, height: 96, rx: 8, class: 'crust' }));
    const cheese = () => (isRound ? sv('circle', { cx: 0, cy: 0, r: 42, class: 'cheese' }) : sv('rect', { x: -42, y: -42, width: 84, height: 84, rx: 4, class: 'cheese' }));
    const outline = isRound ? sv('circle', { cx: 0, cy: 0, r: 48, class: 'pz-spot' }) : sv('rect', { x: -48, y: -48, width: 96, height: 96, rx: 8, class: 'pz-spot' });
    traySvg.replaceChildren(outline);
    const lines = sv('g', { class: 'pz-lines' });
    const guides = sv('g', { class: 'pz-guides' });
    const trail = sv('line', { class: 'pz-trail', x1: 0, y1: 0, x2: 0, y2: 0 });
    const pieceLayer = sv('g', {});
    const defs = sv('defs');
    board.replaceChildren(defs, pieceLayer, lines, guides, trail);
    tag.replaceChildren(frac(k, kd));
    count.replaceChildren();

    // 안내: 둥근 피자는 지름 끝마다 화살표(1단계는 자를 선도 점선으로), 네모 피자는 자를 선을 점선으로
    if (isRound) {
      const show = L === 1 ? ROUND_CUTS[d][0] : [0, 1, 2, 3];
      show.forEach((c) => {
        const a = (c * Math.PI) / 4;
        if (L === 1) guides.append(sv('line', { x1: -54 * Math.cos(a), y1: -54 * Math.sin(a), x2: 54 * Math.cos(a), y2: 54 * Math.sin(a), class: 'pz-guide' }));
        [0, Math.PI].forEach((o) => guides.append(sv('text', { x: 55 * Math.cos(a + o), y: 55 * Math.sin(a + o) + 2.5, class: 'pz-arrow', transform: `rotate(${((a + o) * 180) / Math.PI + 180} ${55 * Math.cos(a + o)} ${55 * Math.sin(a + o)})` }, '➜')));
      });
    } else {
      SQUARE_CUTS[d].x.forEach((f) => guides.append(sv('line', { x1: -48 + 96 * f, y1: -56, x2: -48 + 96 * f, y2: 56, class: 'pz-guide' })));
      SQUARE_CUTS[d].y.forEach((f) => guides.append(sv('line', { x1: -56, y1: -48 + 96 * f, x2: 56, y2: -48 + 96 * f, class: 'pz-guide' })));
    }

    // 지금 자른 선으로 생기는 조각들 (둥근 피자: 부채꼴, 네모 피자: 칸)
    function shapes() {
      if (isRound) {
        if (!cuts.length) return [{ d: 'M-48 0 A48 48 0 1 1 48 0 A48 48 0 1 1 -48 0 Z', mid: 0, size: 1, whole: true }];
        const rays = [...cuts.flatMap((c) => [c * 45, c * 45 + 180])].sort((a, b) => a - b);
        return rays.map((a0, i) => {
          const a1 = i + 1 < rays.length ? rays[i + 1] : rays[0] + 360;
          const r0 = (a0 * Math.PI) / 180;
          const r1 = (a1 * Math.PI) / 180;
          return { d: `M0 0 L${48 * Math.cos(r0)} ${48 * Math.sin(r0)} A48 48 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${48 * Math.cos(r1)} ${48 * Math.sin(r1)} Z`, mid: (r0 + r1) / 2, size: (a1 - a0) / 360 };
        });
      }
      const xs = [0, ...[...cuts.x].sort((p, q) => p - q), 1];
      const ys = [0, ...[...cuts.y].sort((p, q) => p - q), 1];
      const out = [];
      for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
        const x = -48 + 96 * xs[i]; const w = 96 * (xs[i + 1] - xs[i]);
        const y = -48 + 96 * ys[j]; const hh = 96 * (ys[j + 1] - ys[j]);
        out.push({ d: `M${x} ${y} h${w} v${hh} h${-w} Z`, cx: x + w / 2, cy: y + hh / 2, size: (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j]) });
      }
      return out;
    }

    function draw() {
      const list = shapes();
      defs.replaceChildren();
      pieces = list.map((p, i) => {
        const cid = `pz${id}-${i}-${list.length}`;
        defs.append(sv('clipPath', { id: cid }, sv('path', { d: p.d })));
        const g = sv('g', { class: 'pz-piece', 'clip-path': `url(#${cid})` }, base(), cheese(),
          ...tops.map(([x, y, t]) => (t === 'pep' ? sv('circle', { cx: x, cy: y, r: 5.5, class: 'pep' }) : sv('ellipse', { cx: x, cy: y, rx: 3.4, ry: 1.8, class: 'leaf' }))));
        const wrap = sv('g', { class: 'pz-wrap', role: 'button', 'aria-label': `${i + 1}번째 조각` }, g, sv('path', { d: p.d, class: 'pz-edge' }));
        wrap.dataset.i = i;
        wrap.shape = p;
        return wrap;
      });
      pieceLayer.replaceChildren(...pieces);
    }

    // 다 자르면 조각이 살짝 벌어지고 조각마다 1/d가 붙는다. 쟁반에도 칸 선이 생긴다
    function finishCut() {
      cutDone = true;
      guides.replaceChildren();
      lines.replaceChildren();
      speak(`${d}분의 1!`);
      sfx.sparkle();
      pieces.forEach((w) => {
        const p = w.shape;
        const [ox, oy] = isRound ? [3 * Math.cos(p.mid), 3 * Math.sin(p.mid)] : [p.cx * 0.05, p.cy * 0.05];
        w.setAttribute('transform', `translate(${ox} ${oy})`);
        const [lx, ly] = isRound ? [30 * Math.cos(p.mid), 30 * Math.sin(p.mid)] : [p.cx, p.cy];
        w.append(sv('g', { class: 'pz-lab', transform: `translate(${lx} ${ly})` }, sv('rect', { x: -6, y: -9, width: 12, height: 18, rx: 3 }),
          sv('text', { x: 0, y: -1.5 }, '1'), sv('line', { x1: -3.5, y1: 0, x2: 3.5, y2: 0 }), sv('text', { x: 0, y: 7.5 }, String(d))));
        w.addEventListener('click', () => serve(w));
        traySvg.append(sv('path', { d: p.d, class: 'pz-slot' }));
      });
      tray.classList.add('ready');
      paint();
      ctx.prompt(`똑같이 ${d}조각이 되었어요! 조각을 눌러 쟁반에 ${kd}분의 ${k}만큼 담고 ✓를 눌러요.`, () => speak(`${kd}분의 ${k}만큼 주세요!`));
    }

    function paint() {
      const inTray = pieces.filter((w) => w.parentNode === traySvg).length;
      count.replaceChildren(frac(inTray, d));
      ok.classList.toggle('on', inTray > 0);
      return inTray;
    }

    function serve(w) {
      if (locked) return;
      if (w.parentNode === traySvg) pieceLayer.append(w); else traySvg.append(w);
      sfx.pop();
      const inTray = paint();
      if (inTray) speak(`${d}분의 ${inTray}!`);
    }

    ok.onclick = () => {
      if (locked || !cutDone) return;
      const inTray = paint();
      if (inTray !== want) {
        missed = true;
        wiggle(tray);
        speak(inTray > want ? '조각이 너무 많아요!' : '조각이 모자라요!');
        hinter.miss(pieces.find((w) => (inTray > want ? w.parentNode === traySvg : w.parentNode !== traySvg)));
        return;
      }
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      tray.classList.add('done');
      sfx.correct();
      cheer(tray);
      speak(shownD ? [`${d}분의 ${want}!`, `${kd}분의 ${k}!`] : `${d}분의 ${want}!`);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else next(); }, 2200);
    };

    function reset(say) {
      cuts = isRound ? [] : { x: [], y: [] };
      lines.replaceChildren();
      draw();
      if (say) speak(say);
    }
    redo.onclick = () => { if (!locked && !cutDone) { sfx.tap(); reset(); } };

    // 손가락으로 긋기: 끝까지 그은 선이 지름(또는 점선)과 비슷하면 그 선으로 자른다
    let p0 = null;
    const at = (e) => { const m = board.getScreenCTM().inverse(); const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return [p.x, p.y]; };
    board.onpointerdown = (e) => {
      if (locked || cutDone) return;
      try { board.setPointerCapture(e.pointerId); } catch {}
      p0 = at(e);
      trail.setAttribute('x1', p0[0]); trail.setAttribute('y1', p0[1]); trail.setAttribute('x2', p0[0]); trail.setAttribute('y2', p0[1]);
      trail.classList.add('on');
    };
    board.onpointermove = (e) => { if (!p0) return; const p = at(e); trail.setAttribute('x2', p[0]); trail.setAttribute('y2', p[1]); };
    board.onpointerup = board.onpointercancel = (e) => {
      if (!p0) return;
      const p1 = at(e);
      const a = p0;
      p0 = null;
      trail.classList.remove('on');
      cut(a, p1);
    };

    function cut([x0, y0], [x1, y1]) {
      const dx = x1 - x0; const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      if (len < 55) return;
      const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 180) % 180;
      if (isRound) {
        // 가운데를 지나야 한다 (선과 중심 사이 거리)
        if (Math.abs(dx * y0 - dy * x0) / len > 14) { wiggle(paddle); return; }
        const c = Math.round(ang / 45) % 4;
        if (Math.abs(((ang - c * 45 + 90) % 180) - 90) > 20 || cuts.includes(c)) return;
        cuts.push(c);
        lines.append(sv('line', { x1: -48 * Math.cos((c * Math.PI) / 4), y1: -48 * Math.sin((c * Math.PI) / 4), x2: 48 * Math.cos((c * Math.PI) / 4), y2: 48 * Math.sin((c * Math.PI) / 4), class: 'pz-cut' }));
      } else {
        const vertical = Math.abs(ang - 90) < 25;
        const horizontal = ang < 25 || ang > 155;
        if (!vertical && !horizontal) return;
        const f = vertical ? ((x0 + x1) / 2 + 48) / 96 : ((y0 + y1) / 2 + 48) / 96;
        const axis = vertical ? 'x' : 'y';
        const near = SQUARE_CUTS[d][axis].find((g) => Math.abs(g - f) < 0.1);
        if (near === undefined || cuts[axis].includes(near)) { wiggle(paddle); return; }
        cuts[axis].push(near);
        lines.append(vertical ? sv('line', { x1: -48 + 96 * near, y1: -48, x2: -48 + 96 * near, y2: 48, class: 'pz-cut' }) : sv('line', { x1: -48, y1: -48 + 96 * near, x2: 48, y2: -48 + 96 * near, class: 'pz-cut' }));
      }
      sfx.tap();
      draw();
      const list = pieces.map((w) => w.shape.size);
      const equal = list.every((s) => Math.abs(s - list[0]) < 1e-6);
      if (list.length > d) { missed = true; hinter.miss(); locked = true; ctx.later(() => { locked = false; reset('너무 많이 잘랐어요! 다시 잘라 볼까요?'); }, 700); return; }
      if (list.length === d && !equal) { missed = true; hinter.miss(); locked = true; ctx.later(() => { locked = false; reset('조각의 크기가 달라요! 다시 잘라 볼까요?'); }, 700); return; }
      if (list.length === d) finishCut();
    }

    draw();
    ctx.prompt(`${CUT_SAY[d]} 화살표나 점선을 따라 피자 위를 손가락으로 쭉 그어요.`, () => speak(CUT_SAY[d]));
  }

  next();
}

/* ---------- 분수 음료 가게 ---------- */
// 판: [컵 눈금 수, 채울 눈금 수, (같은 크기 분수) 주문 분자, 주문 분모], 눈금 숫자를 보여 주는지
const DRINK = [
  { make: () => { const d = pick([2, 3]); return [d, randInt(1, d - 1)]; }, nums: true },
  { make: () => { const d = randInt(4, 7); return [d, randInt(1, d - 1)]; }, nums: true },
  { make: () => { const d = randInt(3, 8); return [d, randInt(1, d - 1)]; }, nums: false },
  { make: () => eqv(), nums: true },
  { make: () => eqv(), nums: false },
];
function eqv() {
  const [k, sd, d] = pick([[1, 2, 4], [1, 2, 6], [1, 2, 8], [1, 3, 6], [2, 3, 6], [1, 4, 8], [3, 4, 8]]);
  return [d, (d / sd) * k, k, sd];
}
const FRIENDS = ['🐻', '🐰', '🦊', '🐯', '🐼'];

function drink(stage, ctx) {
  const cfg = DRINK[ctx.level - 1];
  const hinter = makeHinter();
  const guest = h('div', { class: 'dk-guest' });
  const pourBtn = h('button', { class: 'dk-pour', type: 'button', 'aria-label': '누르고 있으면 주스가 나와요' }, '⬇');
  const stream = h('i', { class: 'dk-stream' });
  const nozzle = h('div', { class: 'dk-nozzle' }, stream);
  const juice = h('div', { class: 'dk-juice' });
  const ticks = h('div', { class: 'dk-ticks' });
  const cup = h('div', { class: 'dk-cup' }, juice, ticks, h('span', { class: 'dk-fruit', 'aria-hidden': 'true' }, '🍊'));
  const empty = h('button', { class: 'dk-btn', type: 'button', 'aria-label': '비우기' }, '↻');
  const ok = h('button', { class: 'dk-btn ok', type: 'button', 'aria-label': '다 채웠어요' }, '✓');
  stage.append(h('div', { class: 'drink-shop' }, guest, h('div', { class: 'dk-counter' }, pourBtn, nozzle), h('div', { class: 'dk-table' }, cup), h('div', { class: 'dk-bar' }, empty, ok)));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const [d, k, sk, sd] = cfg.make();
    let level = 0;
    let missed = false;
    let locked = false;
    let timer = 0;
    cup.classList.remove('serve');
    cup.style.setProperty('--d', d);
    guest.replaceChildren(h('span', { class: 'dk-order' }, frac(sk ?? k, sd ?? d)), h('span', { class: 'dk-face', 'aria-hidden': 'true' }, FRIENDS[n % FRIENDS.length]));
    guest.classList.remove('happy');
    ticks.replaceChildren(...Array.from({ length: d }, (_, i) => h('span', { class: 'dk-tick', style: { bottom: `${((i + 1) / d) * 100}%` } }, cfg.nums ? String(i + 1) : '')));
    const paint = () => {
      juice.style.height = `${(level / d) * 100}%`;
      [...ticks.children].forEach((t, i) => t.classList.toggle('on', Math.abs(level - (i + 1)) < 0.05));
    };
    paint();

    // 누르고 있는 동안 1초에 컵의 1/5씩 차오른다. 손을 떼면 가까운 눈금에 맞춰 준다
    const rate = d / 5;
    let last = 0;
    const tick = () => {
      const t = performance.now();
      level = Math.min(d, level + ((t - last) / 1000) * rate);
      last = t;
      paint();
      if (level >= d) stop();
    };
    function start(e) {
      if (locked || timer) return;
      e?.preventDefault();
      last = performance.now();
      nozzle.classList.add('on');
      pourBtn.classList.add('down');
      timer = setInterval(tick, 40);
    }
    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = 0;
      tick();
      nozzle.classList.remove('on');
      pourBtn.classList.remove('down');
      const near = Math.round(level);
      if (Math.abs(level - near) < 0.3) level = near;
      paint();
      if (Number.isInteger(level) && level > 0) speak(cfg.nums ? `${d}분의 ${level}!` : String(level));
    }
    pourBtn.onpointerdown = start;
    pourBtn.onpointerup = pourBtn.onpointerleave = pourBtn.onpointercancel = stop;
    pourBtn.onkeydown = (e) => { if (e.key === ' ' || e.key === 'Enter') start(e); };
    pourBtn.onkeyup = stop;
    empty.onclick = () => { if (locked) return; stop(); level = 0; sfx.tap(); paint(); };
    ok.onclick = () => {
      if (locked) return;
      stop();
      if (level !== k) {
        missed = true;
        wiggle(cup);
        speak(level < k ? '조금 더 채워요!' : '너무 많아요! 비우고 다시 따라 볼까요?');
        hinter.miss(level < k ? pourBtn : empty);
        return;
      }
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cup.classList.add('serve');
      guest.classList.add('happy');
      burst(guest, ['💛', '⭐', '✨']);
      cheer(guest);
      speak(sd ? [`${d}분의 ${k}만큼 채웠어요!`, `${sd}분의 ${sk}!`] : `${d}분의 ${k}만큼 채웠어요!`);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2300);
    };
    pop(guest);
    ctx.prompt(sd ? `컵 눈금은 ${d}칸이에요. ⬇ 단추를 누르고 있으면 주스가 나와요. ${sd}분의 ${sk}만큼 채우고 ✓를 눌러요!`
      : `⬇ 단추를 누르고 있으면 주스가 나와요. 컵의 ${d}분의 ${k}만큼 채우고 ✓를 눌러요!`, () => speak(`${sd ?? d}분의 ${sk ?? k}만큼 채워요!`));
  }

  round();
}
