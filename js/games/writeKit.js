import { h, wiggle } from '../ui.js';
import { sfx } from '../audio.js';
import { glyph, judge } from '../handwriting.js';

const NS = 'http://www.w3.org/2000/svg';

// 아이가 쓴 획을 작은 그림(SVG)으로 (옷에 찍거나 낱말 카드에 붙일 때)
export function strokesSvg(strokes, color = '#3B2A1A', width = 7) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  strokes.forEach((st) => {
    const pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', st.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '));
    pl.setAttribute('fill', 'none');
    pl.setAttribute('stroke', color);
    pl.setAttribute('stroke-width', width);
    pl.setAttribute('stroke-linecap', 'round');
    pl.setAttribute('stroke-linejoin', 'round');
    svg.append(pl);
  });
  return svg;
}

/* 쓰기 칸 하나. 획을 다 쓰면(본보기 획 수만큼) 잠깐 기다렸다가 스스로 판정한다.
   model: 'faint'(흐린 본보기와 획순 번호) · 'ghost'(흐린 본보기만) · 'none'
   onJudge(result): 판정할 때마다. result.ok면 칸이 잠긴다 */
export function makePad(ctx, { ch, model = 'none', level = 3, onJudge, auto = true }) {
  const g = glyph(ch);
  const canvas = h('canvas', { class: 'wp-canvas', 'aria-label': `${ch} 글자를 쓰는 칸` });
  const el = h('div', { class: 'wp-pad' }, canvas);
  const c2 = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--wp-ink').trim() || '#3B2A1A';
  let strokes = [];
  let cur = null;
  let shown = model;
  let locked = false;
  let bad = -1;
  let demo = null;
  let timer = 0;
  let dirty = true;
  let raf = 0;
  let fails = 0;

  function fit() {
    const w = el.clientWidth || 160;
    const d = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(w * d);
    c2.setTransform((w * d) / 100, 0, 0, (w * d) / 100, 0, 0);
    dirty = true;
  }
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  ctx.onCleanup(() => { ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); });

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (locked) return;
    e.preventDefault();
    clearTimeout(timer);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    bad = -1;
    demo = null;
    cur = [pos(e)];
    strokes.push(cur);
    el.classList.add('writing');
    dirty = true;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const p = pos(e);
    const q = cur[cur.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.8) return;
    cur.push(p);
    dirty = true;
  });
  const up = () => {
    if (!cur) return;
    if (cur.length === 1) cur.push([cur[0][0] + 0.5, cur[0][1] + 0.5]);
    cur = null;
    el.classList.remove('writing');
    sfx.tap();
    dirty = true;
    if (auto && strokes.length >= g.strokes.length) timer = setTimeout(() => check(), 700);
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  function line(pts, color, width, upto = pts.length - 1) {
    if (!pts.length) return;
    c2.beginPath();
    c2.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= upto; i++) c2.lineTo(pts[i][0], pts[i][1]);
    c2.strokeStyle = color;
    c2.lineWidth = width;
    c2.stroke();
  }
  const dot = (x, y, r, color) => { c2.beginPath(); c2.arc(x, y, r, 0, Math.PI * 2); c2.fillStyle = color; c2.fill(); };

  function draw(now) {
    raf = requestAnimationFrame(draw);
    if (!dirty && !demo) return;
    dirty = false;
    c2.save();
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.clearRect(0, 0, canvas.width, canvas.height);
    c2.restore();
    c2.lineCap = 'round';
    c2.lineJoin = 'round';
    // 십자 안내선
    c2.setLineDash([2.5, 2.5]);
    line([[50, 3], [50, 97]], 'rgba(150, 110, 70, .22)', 0.6);
    line([[3, 50], [97, 50]], 'rgba(150, 110, 70, .22)', 0.6);
    c2.setLineDash([]);
    // 흐린 본보기
    if (shown !== 'none') {
      g.strokes.forEach((s) => line(s, 'rgba(150, 120, 90, .16)', 9));
      if (shown === 'faint') {
        g.strokes.forEach((s, i) => {
          dot(s[0][0], s[0][1], 3.2, 'rgba(45, 191, 127, .55)');
          c2.fillStyle = '#fff';
          c2.font = '4.4px Jua, sans-serif';
          c2.textAlign = 'center';
          c2.textBaseline = 'middle';
          c2.fillText(String(i + 1), s[0][0], s[0][1] + 0.3);
        });
      }
    }
    // 아이가 쓴 획 (틀린 획은 빨갛게)
    strokes.forEach((s, i) => line(s, i === bad ? '#E8484F' : ink, 5.2));
    // 바르게 쓰는 모습 보여 주기: 획을 하나씩 순서대로 그린다
    if (demo) {
      demo.t += 0.9;
      let left = demo.t;
      for (let i = 0; i < g.strokes.length; i++) {
        const s = g.strokes[i];
        if (left <= 0) break;
        const upto = Math.min(s.length - 1, Math.floor(left));
        line(s, i === demo.focus ? 'rgba(255, 176, 32, .95)' : 'rgba(255, 176, 32, .55)', 6, upto);
        if (upto < s.length - 1) {
          dot(s[upto][0], s[upto][1], 2.6, '#FFB020');
          break;
        }
        left -= s.length + 6;
      }
      if (left > 0 && demo.t > demo.end) demo = null;
      dirty = true;
    }
  }
  raf = requestAnimationFrame(draw);

  function check() {
    clearTimeout(timer);
    if (locked) return null;
    const r = judge(strokes, g, level);
    if (r.ok) {
      locked = true;
      el.classList.add('ok');
      bad = -1;
      dirty = true;
    } else {
      fails++;
      bad = Math.min(r.stroke, strokes.length - 1);
      wiggle(el);
      dirty = true;
      // 틀린 획을 잠깐 보여 준 다음, 지우고 바른 획순을 보여 준다. 두 번째부터는 흐린 본보기를 깔아 준다
      setTimeout(() => {
        if (locked) return;
        strokes = [];
        bad = -1;
        if (fails >= 2 && shown === 'none') shown = 'ghost';
        showDemo(r.want);
      }, 900);
    }
    onJudge?.(r, api);
    return r;
  }

  function showDemo(focus = -1) {
    const total = g.strokes.reduce((a, s) => a + s.length + 6, 0);
    demo = { t: 0, focus, end: total + 20 };
    dirty = true;
  }

  const api = {
    el,
    glyph: g,
    get strokes() { return strokes; },
    get ok() { return locked; },
    get fails() { return fails; },
    get empty() { return strokes.length === 0; },
    check,
    showDemo,
    showModel(m = 'ghost') { shown = m; dirty = true; },
    undo() { if (!locked && strokes.length) { strokes.pop(); bad = -1; dirty = true; } },
    clear() { if (!locked) { strokes = []; bad = -1; dirty = true; } },
    // 다음으로 넘어갈 때: 본보기대로 써 둔 것으로 하고 잠근다
    give() { locked = true; strokes = g.strokes.map((s) => s.map((p) => [...p])); el.classList.add('ok', 'given'); dirty = true; },
  };
  return api;
}
