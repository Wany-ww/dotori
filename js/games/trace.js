import { h, cheer, pickN } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { TRACE_SETS } from '../data.js';
import { normStroke } from '../handwriting.js';

export function mount(stage, ctx) {
  traceGame(stage, ctx, ctx.unit && ctx.opts.set === 'alpha' ? unitLetters(ctx) : TRACE_SETS[ctx.opts.set]);
}

// 영어 차시: 오늘 배우는 글자를 대문자 → 소문자 짝으로 쓴다 (A a B b …)
function unitLetters(ctx) {
  const latin = new Map(TRACE_SETS.latin.items.map((it) => [it.ch, it]));
  const k = [2, 2, 3, 3, 3][ctx.level - 1];
  const items = ctx.unit.letters(k, { review: false }).flatMap((U) => {
    const x = ctx.unit.wordFor(U);
    return [U, U.toLowerCase()].map((ch) => ({ ...latin.get(ch), say: `${U}. ${ctx.unit.sayFor(U)}`, label: `${x.w} ${x.e}` }));
  });
  return { lang: 'en-US', latin: true, lines: true, prompt: (it) => `${it.ch} — 초록 점에서 출발해 따라 써 봐요!`, pick: () => items };
}

// set: { lang, prompt(it), items } 또는 pick(L)로 낱자를 직접 고르는 묶음. side(it)가 있으면 판 옆에 그림 칸을 둔다
export function traceGame(stage, ctx, set) {
  const L = ctx.level;
  const count = [3, 4, 4, 5, 5][L - 1];
  // 한글은 차시에서 배우는 낱자부터 쓴다 (모자라면 쉬운 낱자로 채운다)
  const fromLesson = ctx.lesson && set.items
    ? [...new Set(ctx.lesson.jamo(count * 2))].map((c) => set.items.find((it) => it.ch === c)).filter(Boolean).slice(0, count)
    : [];
  const items = set.pick ? set.pick(L) : [...fromLesson, ...pickN(set.items.filter((it) => (it.min || 1) <= L && !fromLesson.includes(it)), count)].slice(0, count);
  const tolerance = 14 - L;

  const canvas = h('canvas', { class: 'trace-canvas', 'aria-label': '손가락으로 따라 쓰는 판' });
  const board = h('div', { class: 'trace-board' }, canvas);
  const caption = h('div', { class: 'trace-caption' });
  const side = set.side ? h('div', { class: 'trace-side', 'aria-hidden': 'true' }) : null;
  const wrap = h('div', { class: `trace-wrap${set.cls ? ` ${set.cls}` : ''}` }, side, board, caption);
  stage.append(wrap);
  const g = canvas.getContext('2d');
  // 판 색은 장면 · 놀이별 CSS 변수에서 (놀이 틀에 붙은 변수까지 읽도록 붙인 뒤에 읽는다)
  const css = getComputedStyle(wrap);
  const color = css.getPropertyValue('--sub').trim() || '#FF7A9C';
  const startColor = css.getPropertyValue('--trace-start').trim() || '#2DBF7F';
  const guideEdge = css.getPropertyValue('--trace-edge').trim() || '#EBD6B2';
  const guideFill = css.getPropertyValue('--trace-fill').trim() || '#FFFBF2';

  let n = 0;
  let firstTry = 0;
  let strokes = [];
  let si = 0;
  let prog = 0;
  let misses = 0;
  let drawing = false;
  let itemDone = false;
  let demo = null;
  let parts = [];
  let lastSpark = 0;
  let raf = 0;

  function fit() {
    const w = board.clientWidth;
    const d = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(w * d);
    g.setTransform((w * d) / 100, 0, 0, (w * d) / 100, 0, 0);
  }
  const ro = new ResizeObserver(fit);
  ro.observe(board);
  fit();

  function startItem() {
    const it = items[n];
    strokes = it.strokes.map(normStroke);
    si = 0;
    prog = 0;
    misses = 0;
    itemDone = false;
    caption.replaceChildren(
      h('span', { class: `trace-glyph${set.latin ? ' latin' : ''}` }, it.ch),
      h('span', {}, it.label),
    );
    side?.replaceChildren(set.side(it));
    ctx.progress(n, items.length);
    ctx.prompt(set.prompt(it), () => speak(it.say, set.lang));
    ctx.later(() => { demo = { t: 0 }; }, 900);
  }

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };

  function advance(p) {
    const pts = strokes[si];
    let best = -1;
    let bd = tolerance;
    for (let j = prog; j < Math.min(prog + 14, pts.length); j++) {
      const d = Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1]);
      if (d < bd) { bd = d; best = j; }
    }
    if (best > prog) prog = best;
    if (prog >= pts.length - 2) strokeDone();
  }

  function strokeDone() {
    drawing = false;
    sfx.pop();
    si++;
    prog = 0;
    if (si < strokes.length) return;
    itemDone = true;
    if (misses === 0) firstTry++;
    sfx.correct();
    cheer(board, ctx.lang);
    speak(items[n].say, set.lang);
    ctx.later(() => {
      n++;
      if (n >= items.length) ctx.finish({ firstTry, total: items.length });
      else startItem();
    }, 1900);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (itemDone || si >= strokes.length) return;
    e.preventDefault();
    const p = pos(e);
    const start = strokes[si][prog];
    if (Math.hypot(p[0] - start[0], p[1] - start[1]) < 13) {
      drawing = true;
      demo = null;
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      advance(p);
    } else {
      sfx.tap();
      demo = { t: 0 };
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    const now = performance.now();
    parts.push({ x: p[0], y: p[1], vx: (Math.random() - 0.5) * 0.8, vy: -Math.random() * 0.8, life: 1, c: Math.random() < 0.5 ? '#FFC83A' : '#fff' });
    if (now - lastSpark > 90) { sfx.sparkle(); lastSpark = now; }
    advance(p);
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    if (itemDone) return;
    misses++;
    if (misses >= 2) demo = { t: 0 };
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const path = (pts, upto) => {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let j = 1; j <= upto; j++) g.lineTo(pts[j][0], pts[j][1]);
  };
  const dot = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };

  function draw(now) {
    raf = requestAnimationFrame(draw);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.restore();
    g.lineCap = 'round';
    g.lineJoin = 'round';

    // 공책 줄(맨 위 · 가운데 점선 · 맨 아래) 또는 십자 안내선
    g.strokeStyle = set.lines ? 'rgba(10, 40, 80, .35)' : 'rgba(176, 106, 44, .2)';
    g.lineWidth = 0.6;
    g.beginPath();
    if (set.lines) {
      g.moveTo(4, 10); g.lineTo(96, 10); g.moveTo(4, 90); g.lineTo(96, 90); g.stroke();
      g.beginPath(); g.setLineDash([2, 2]); g.moveTo(4, 50); g.lineTo(96, 50);
    } else {
      g.setLineDash([2, 2]);
      g.moveTo(50, 4); g.lineTo(50, 96); g.moveTo(4, 50); g.lineTo(96, 50);
    }
    g.stroke();
    g.setLineDash([]);

    strokes.forEach((pts) => { path(pts, pts.length - 1); g.strokeStyle = guideEdge; g.lineWidth = 14; g.stroke(); });
    strokes.forEach((pts) => { path(pts, pts.length - 1); g.strokeStyle = guideFill; g.lineWidth = 9; g.stroke(); });
    strokes.forEach((pts, k) => { if (k < si) { path(pts, pts.length - 1); g.strokeStyle = color; g.lineWidth = 10; g.stroke(); } });

    if (si < strokes.length) {
      const pts = strokes[si];
      g.fillStyle = 'rgba(122, 69, 24, .35)';
      for (let j = prog + 6; j < pts.length - 2; j += 6) dot(pts[j][0], pts[j][1], 1);
      if (prog > 0) { path(pts, prog); g.strokeStyle = color; g.lineWidth = 10; g.stroke(); }

      const ep = pts[pts.length - 1];
      g.fillStyle = '#FFC83A';
      dot(ep[0], ep[1], 2.6);

      const sp = pts[prog];
      const pulse = drawing ? 1 : 1 + 0.15 * Math.sin(now / 170);
      g.fillStyle = startColor;
      dot(sp[0], sp[1], 5.4 * pulse);
      if (prog === 0) {
        g.fillStyle = '#fff';
        g.font = '6px Jua, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(String(si + 1), sp[0], sp[1] + 0.4);
      }

      if (demo) {
        demo.t += 1.2;
        const j = Math.min(pts.length - 1, Math.floor(demo.t));
        const q = pts[j];
        g.fillStyle = 'rgba(255, 200, 58, .95)';
        dot(q[0], q[1], 3.2);
        g.font = '13px serif';
        g.textAlign = 'left';
        g.textBaseline = 'top';
        g.fillText('👆', q[0] - 4.5, q[1] + 0.5);
        if (j >= pts.length - 1) demo = null;
      }
    }

    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 0.035;
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = p.c;
      dot(p.x, p.y, 1.3);
    }
    g.globalAlpha = 1;
  }
  raf = requestAnimationFrame(draw);

  ctx.onCleanup(() => { cancelAnimationFrame(raf); ro.disconnect(); });
  startItem();
}
