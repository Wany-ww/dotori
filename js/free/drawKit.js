import { h } from '../ui.js';

export const PALETTE = ['#2B2B2B', '#E8484F', '#F28C28', '#F2C230', '#5DBB63', '#2E9BEA', '#8B5CF6', '#E2689F', '#8A5A3C', '#FFFFFF'];
export const SIZES = [[0.012, '가는'], [0.024, '보통'], [0.045, '굵은']];

// 획 기록: { c(색), w(굵기: 판 너비 비율), e(지우개), p: [[x, y] …] (0~1 비율 좌표) }
export function drawStroke(g, s, W, H) {
  // 스탬프: { t(그림 글자), w(크기), p: [[x, y]] }
  if (s.t) {
    g.save();
    g.font = `${s.w * W}px serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s.t, s.p[0][0] * W, s.p[0][1] * H);
    g.restore();
    return;
  }
  g.save();
  g.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
  g.strokeStyle = s.c;
  g.fillStyle = s.c;
  g.lineWidth = s.w * W;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (s.p.length === 1) {
    g.beginPath();
    g.arc(s.p[0][0] * W, s.p[0][1] * H, (s.w * W) / 2, 0, Math.PI * 2);
    g.fill();
  } else {
    g.beginPath();
    g.moveTo(s.p[0][0] * W, s.p[0][1] * H);
    s.p.slice(1).forEach(([x, y]) => g.lineTo(x * W, y * H));
    g.stroke();
  }
  g.restore();
}

// 그림판: 배경(안내선 · 밑그림)은 아래 판에, 아이가 그린 획은 위 판에. mask(g, W, H)가 있으면 그 모양 안에만 칠해진다
export function makePad({ ratio = 0.75, background, mask, label = '그림판' } = {}) {
  const bg = h('canvas', { class: 'dk-bg', 'aria-hidden': 'true' });
  const ink = h('canvas', { class: 'dk-ink', 'aria-label': label });
  const el = h('div', { class: 'dk-pad', style: { aspectRatio: `${1 / ratio}` } }, bg, ink);
  const g = ink.getContext('2d');
  const gb = bg.getContext('2d');
  const strokes = [];
  let maskCanvas = null;
  let color = PALETTE[1];
  let size = SIZES[1][0];
  let eraser = false;
  let stamp = null;
  let cur = null;
  let W = 0;
  let H = 0;
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);

  function fit() {
    const w = el.clientWidth;
    if (!w) return;
    W = Math.round(w * dpr());
    H = Math.round(W * ratio);
    [bg, ink].forEach((c) => { c.width = W; c.height = H; });
    if (mask) {
      maskCanvas = document.createElement('canvas');
      maskCanvas.width = W;
      maskCanvas.height = H;
      mask(maskCanvas.getContext('2d'), W, H);
    }
    gb.clearRect(0, 0, W, H);
    background?.(gb, W, H);
    redraw();
  }
  function applyMask() {
    if (!maskCanvas) return;
    g.save();
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(maskCanvas, 0, 0);
    g.restore();
  }
  function redraw() {
    g.clearRect(0, 0, W, H);
    strokes.forEach((s) => drawStroke(g, s, W, H));
    applyMask();
  }
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  // 크기 알림이 늦거나 오지 않을 때(백그라운드 탭 등)를 위해 쓰기 전에 크기를 맞춘다
  const ensure = () => { if (!W || W !== Math.round(el.clientWidth * dpr())) fit(); };
  requestAnimationFrame(ensure);

  const pos = (e) => {
    const r = ink.getBoundingClientRect();
    return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
  };
  ink.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensure();
    try { ink.setPointerCapture(e.pointerId); } catch {}
    if (stamp) {
      const st = { t: stamp, w: 0.12, p: [pos(e)] };
      strokes.push(st);
      drawStroke(g, st, W, H);
      applyMask();
      api.onChange?.();
      return;
    }
    cur = { c: color, w: size, e: eraser, p: [pos(e)] };
    strokes.push(cur);
    drawStroke(g, cur, W, H);
    applyMask();
  });
  ink.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const p = pos(e);
    const last = cur.p[cur.p.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.003) return;
    cur.p.push(p);
    drawStroke(g, { ...cur, p: [last, p] }, W, H);
    applyMask();
  });
  const end = () => { cur = null; api.onChange?.(); };
  ink.addEventListener('pointerup', end);
  ink.addEventListener('pointercancel', end);

  const api = {
    el,
    strokes,
    onChange: null,
    get empty() { return !strokes.length; },
    setColor(c) { color = c; eraser = false; stamp = null; },
    setStamp(t) { stamp = t; eraser = false; },
    setSize(s) { size = s; },
    setEraser(on) { eraser = on; stamp = null; },
    undo() { strokes.pop(); redraw(); api.onChange?.(); },
    clear() { strokes.length = 0; redraw(); api.onChange?.(); },
    refit: fit,
    // 배경 + 그림을 한 장의 PNG로
    toBlob(extra) {
      ensure();
      const out = document.createElement('canvas');
      out.width = W;
      out.height = H;
      const o = out.getContext('2d');
      o.fillStyle = '#FFFFFF';
      o.fillRect(0, 0, W, H);
      o.drawImage(bg, 0, 0);
      o.drawImage(ink, 0, 0);
      extra?.(o, W, H);
      return new Promise((res) => out.toBlob((b) => res(b), 'image/png'));
    },
    // 다시보기용: 배경 판과 모양(mask) 판
    layerBlob(which) {
      ensure();
      const c = which === 'mask' ? maskCanvas : bg;
      if (!c) return Promise.resolve(null);
      return new Promise((res) => c.toBlob((x) => res(x), 'image/png'));
    },
    get ratio() { return ratio; },
    destroy() { ro.disconnect(); },
  };
  return api;
}

// 도구 막대: 색 · 굵기 · 지우개 · 되돌리기 · 다 지우기
export function toolbar(pad, { colors = PALETTE, sizes = true, eraser = true, stamps = [] } = {}) {
  const sw = colors.map((c, i) => {
    const b = h('button', { class: `dk-color${i === 1 ? ' on' : ''}`, type: 'button', style: { background: c }, 'aria-label': `${i + 1}번 색` });
    b.addEventListener('click', () => { pad.setColor(c); sel(b); });
    return b;
  });
  const er = eraser ? h('button', { class: 'dk-tool', type: 'button', 'aria-label': '지우개' }, '🧽') : null;
  er?.addEventListener('click', () => { pad.setEraser(true); sel(er); });
  const st = stamps.map((t) => {
    const b = h('button', { class: 'dk-stamp', type: 'button', 'aria-label': `${t} 스탬프` }, t);
    b.addEventListener('click', () => { pad.setStamp(t); sel(b); });
    return b;
  });
  const sel = (b) => [...sw, er, ...st].forEach((x) => x?.classList.toggle('on', x === b));
  const sz = sizes ? SIZES.map(([s, name], i) => {
    const b = h('button', { class: `dk-size${i === 1 ? ' on' : ''}`, type: 'button', 'aria-label': `${name} 붓` }, h('i', { style: { width: `${6 + i * 6}px`, height: `${6 + i * 6}px` } }));
    b.addEventListener('click', () => { pad.setSize(s); b.parentElement.querySelectorAll('.dk-size').forEach((x) => x.classList.toggle('on', x === b)); });
    return b;
  }) : [];
  const undo = h('button', { class: 'dk-tool', type: 'button', 'aria-label': '한 번 되돌리기' }, '↩');
  undo.addEventListener('click', () => pad.undo());
  const wipe = h('button', { class: 'dk-tool', type: 'button', 'aria-label': '모두 지우기' }, '🗑️');
  wipe.addEventListener('click', () => { if (!pad.empty && confirm('그린 것을 모두 지울까요?')) pad.clear(); });
  if (colors.length) pad.setColor(colors[Math.min(1, colors.length - 1)]);
  return h('div', { class: 'dk-tools' }, h('div', { class: 'dk-colors' }, ...sw, er), h('div', { class: 'dk-sizes' }, ...sz, undo, wipe), st.length ? h('div', { class: 'dk-stamps' }, ...st) : null);
}

// 다시보기: 획 기록을 처음부터 천천히 다시 그린다 (background는 미리 그려 둔다)
export function replayOn(canvas, replay, { onDone, mask } = {}) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const strokes = replay.strokes || [];
  const total = strokes.reduce((a, s) => a + s.p.length, 0) || 1;
  const perFrame = Math.max(1, Math.ceil(total / 180));
  let si = 0;
  let pi = 0;
  let raf = 0;
  g.clearRect(0, 0, W, H);
  const step = () => {
    for (let k = 0; k < perFrame && si < strokes.length; k++) {
      const s = strokes[si];
      drawStroke(g, { ...s, p: s.p.slice(Math.max(0, pi - 1), pi + 1) }, W, H);
      pi++;
      if (pi >= s.p.length) { si++; pi = 0; }
    }
    if (mask) {
      g.save();
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(mask, 0, 0, W, H);
      g.restore();
    }
    if (si < strokes.length) raf = requestAnimationFrame(step);
    else onDone?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
