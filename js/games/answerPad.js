import { h, wiggle, pop } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { readDigit } from '../handwriting.js';
import { draggable, hits } from './dragTap.js';

// 답 칸 공용 판 (수 세기 · 쿠키 · 블록 연산 · 빠른 연산): 0~9 숫자판을 누르거나 답 칸 · 쓰기 칸으로 끌어 넣고,
// 쓰기 칸에 손으로 쓰면 잠깐 멈춘 뒤 숫자를 알아본다. 답의 자릿수만큼 넣으면 onFull(답)을 부른다
export function answerPad(ctx, { onFull, trash = true }) {
  const keys = h('div', { class: 'cw-keys' });
  const trashBtn = trash ? h('button', { class: 'cw-trash', type: 'button', 'aria-label': '지우기' }, '🗑️') : null;
  const answer = h('div', { class: 'cw-answer', 'aria-live': 'polite' });
  const canvas = h('canvas', { class: 'cw-canvas', 'aria-label': '숫자를 손으로 쓰는 칸' });
  const hint = h('p', { class: 'cw-hint' }, '답을 쓰거나 숫자판을 여기에 넣으세요');
  const pad = h('div', { class: 'cw-pad' }, canvas, hint);
  const el = h('div', { class: 'cw-side' }, keys, h('div', { class: 'cw-row' }, trashBtn, answer), pad);
  let entry = '';
  let size = 1;
  let locked = true;

  const keyBtns = Array.from({ length: 10 }, (_, d) => {
    const k = h('button', { class: 'cw-key', type: 'button', 'aria-label': `숫자 ${d}` }, String(d));
    draggable(k, {
      can: () => !locked,
      onDrop: (pt) => { if (hits(answer, pt, 10) || hits(pad, pt, 0)) add(d); else wiggle(k); },
    });
    k.addEventListener('click', () => { if (!locked) add(d); });
    return k;
  });
  keys.replaceChildren(...keyBtns);
  trashBtn?.addEventListener('click', () => { if (locked) return; sfx.tap(); entry = ''; paint(); });

  function paint() {
    answer.classList.remove('ok', 'no');
    answer.replaceChildren(entry ? h('b', {}, entry) : h('span', { class: 'cw-wait' }, '•••'));
  }

  function add(d) {
    if (locked || entry.length >= 3) return;
    sfx.pop();
    entry += String(d);
    paint();
    pop(answer);
    if (entry.length >= size) onFull(Number(entry));
  }

  /* ---------- 손으로 쓰는 칸 ---------- */
  const g2 = canvas.getContext('2d');
  let strokes = [];
  let cur = null;
  let timer = 0;
  function fit() {
    const w = pad.clientWidth || 200;
    const hh = pad.clientHeight || 200;
    const d = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(hh * d);
    drawInk();
  }
  const ro = new ResizeObserver(fit);
  ro.observe(pad);
  ctx.onCleanup(() => { ro.disconnect(); clearTimeout(timer); });
  // 칸 가운데 정사각형(0~100)을 글씨 좌표로 쓴다
  const box = () => {
    const r = canvas.getBoundingClientRect();
    const s = Math.min(r.width, r.height);
    return { x: r.left + (r.width - s) / 2, y: r.top + (r.height - s) / 2, s };
  };
  const pos = (e) => { const b = box(); return [((e.clientX - b.x) / b.s) * 100, ((e.clientY - b.y) / b.s) * 100]; };
  function drawInk() {
    const d = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    const s = Math.min(r.width, r.height) * d;
    g2.setTransform(1, 0, 0, 1, 0, 0);
    g2.clearRect(0, 0, canvas.width, canvas.height);
    g2.setTransform(s / 100, 0, 0, s / 100, (canvas.width - s) / 2, (canvas.height - s) / 2);
    g2.lineCap = 'round';
    g2.lineJoin = 'round';
    g2.strokeStyle = '#fff';
    g2.lineWidth = 5;
    strokes.forEach((st) => {
      g2.beginPath();
      st.forEach(([x, y], i) => (i ? g2.lineTo(x, y) : g2.moveTo(x, y)));
      g2.stroke();
    });
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (locked) return;
    e.preventDefault();
    clearTimeout(timer);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    hint.hidden = true;
    cur = [pos(e)];
    strokes.push(cur);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const p = pos(e);
    const q = cur[cur.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.8) return;
    cur.push(p);
    drawInk();
  });
  const up = () => {
    if (!cur) return;
    if (cur.length === 1) cur.push([cur[0][0] + 0.5, cur[0][1] + 0.5]);
    cur = null;
    drawInk();
    timer = setTimeout(read, 800);
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  function read() {
    const d = readDigit(strokes);
    strokes = [];
    drawInk();
    if (d === null) {
      sfx.wrong();
      wiggle(pad);
      speak('잘 모르겠어요. 숫자판을 눌러도 돼요.');
      return;
    }
    add(d);
  }

  return {
    el,
    answer,
    keys: keyBtns,
    // 새 문제: 답의 자릿수를 알려 주고 칸을 비운다
    reset(n) {
      size = n;
      entry = '';
      strokes = [];
      hint.hidden = false;
      locked = false;
      paint();
      drawInk();
    },
    lock() { locked = true; },
    ok() {
      locked = true;
      answer.classList.add('ok');
      answer.append(h('span', { class: 'cw-check', 'aria-hidden': 'true' }, '✔'));
    },
    // 틀리면 칸이 흔들리고 잠깐 뒤 비워진다
    no(wait = 1100) {
      locked = true;
      answer.classList.add('no');
      wiggle(answer);
      ctx.later(() => { entry = ''; locked = false; paint(); }, wait);
    },
  };
}
