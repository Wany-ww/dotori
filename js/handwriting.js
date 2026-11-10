/* ---------- 손글씨: 아이가 쓴 획을 바른 획순·모양과 비교한다 ----------
   글자 본보기는 따라쓰기 획 데이터(TRACE_SETS.jamo · digits, 0~100 칸, 배열 순서 = 획순)를 쓴다.
   글자(음절)는 자음·모음·받침의 본보기를 글자 모양(ㅏ형 · ㅗ형 · ㅘ형, 받침 유무)에 맞는 자리에 줄여 넣어 만든다.
   판정: ① 획 수 ② 획마다 바른 순서 ③ 쓰는 방향 ④ 모양(본보기와의 평균 거리)
   아이마다 글씨 크기와 위치가 달라서, 쓴 글씨 전체를 본보기 크기·자리에 맞춘 뒤 비교한다. */
import { TRACE_SETS, CHO, JUNG, JONG, decompose } from './data.js';

export function catmull(pts) {
  if (pts.length < 3) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function resample(pts, step = 1.6) {
  const out = [[...pts[0]]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    let seg = Math.hypot(bx - ax, by - ay);
    while (acc + seg >= step) {
      const t = (step - acc) / seg;
      ax += (bx - ax) * t;
      ay += (by - ay) * t;
      out.push([ax, ay]);
      seg = Math.hypot(bx - ax, by - ay);
      acc = 0;
    }
    acc += seg;
  }
  const last = pts[pts.length - 1];
  const end = out[out.length - 1];
  if (Math.hypot(last[0] - end[0], last[1] - end[1]) > 0.4) out.push([...last]);
  return out;
}

export const normStroke = (st) => (Array.isArray(st) ? resample(st) : resample(st.s ? catmull(st.p) : st.p));

const JAMO = new Map([...TRACE_SETS.jamo.items, ...TRACE_SETS.digits.items].map((it) => [it.ch, it]));
const VERT = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ']);
const HORI = new Set(['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ']);
// 글자 모양별 자리 [x0, y0, x1, y1] — 초성 · 중성 · 종성
const BOXES = {
  V: [[4, 10, 60, 90], [42, 4, 98, 96]],
  H: [[16, 2, 84, 58], [2, 36, 98, 98]],
  C: [[6, 2, 54, 46], [2, 20, 98, 98]],
  VT: [[6, 4, 58, 58], [42, 0, 96, 62], [16, 58, 84, 98]],
  HT: [[18, 0, 82, 36], [4, 24, 96, 66], [16, 60, 84, 98]],
  CT: [[8, 0, 50, 34], [2, 12, 98, 66], [16, 60, 84, 98]],
};

const place = (strokes, [x0, y0, x1, y1]) => strokes.map((st) => normStroke(st).map(([x, y]) => [x0 + (x / 100) * (x1 - x0), y0 + (y / 100) * (y1 - y0)]));

// 쓸 수 있는 글자인지 (본보기가 있는 낱자로만 된 글자)
export function canWrite(ch) {
  if (JAMO.has(ch)) return true;
  const d = decompose(ch);
  if (!d) return false;
  return JAMO.has(CHO[d.c]) && JAMO.has(JUNG[d.j]) && (!d.t || JAMO.has(JONG[d.t]));
}

/* glyph(): 글자 하나의 본보기 획 (0~100 칸 좌표, 획순대로) */
export function glyph(ch) {
  if (JAMO.has(ch)) return { ch, strokes: JAMO.get(ch).strokes.map(normStroke), parts: [ch] };
  const d = decompose(ch);
  const c = CHO[d.c];
  const v = JUNG[d.j];
  const t = d.t ? JONG[d.t] : '';
  const shape = VERT.has(v) ? 'V' : HORI.has(v) ? 'H' : 'C';
  const box = BOXES[t ? `${shape}T` : shape];
  const strokes = [...place(JAMO.get(c).strokes, box[0]), ...place(JAMO.get(v).strokes, box[1])];
  if (t) strokes.push(...place(JAMO.get(t).strokes, box[2]));
  return { ch, strokes, parts: [c, v, t].filter(Boolean) };
}

/* ---------- 비교 ---------- */
const N = 32;
function even(pts, n = N) {
  if (pts.length === 1) return Array(n).fill(pts[0]);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1] || 1;
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const want = (k / (n - 1)) * total;
    while (j < len.length - 2 && len[j + 1] < want) j++;
    const seg = len[j + 1] - len[j] || 1;
    const t = Math.min(1, Math.max(0, (want - len[j]) / seg));
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
  }
  return out;
}
const lengthOf = (pts) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const meanDist = (a, b) => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length;
const closed = (pts) => Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 6;

// 동그라미(ㅇ)는 어디서 시작해 어느 쪽으로 돌아도 모양만 맞으면 된다
function loopDist(a, b) {
  let best = Infinity;
  const ring = b.slice(0, -1);
  for (const dir of [ring, [...ring].reverse()]) {
    for (let s = 0; s < ring.length; s += 2) {
      const rot = [...dir.slice(s), ...dir.slice(0, s)];
      best = Math.min(best, meanDist(a, even([...rot, rot[0]])));
    }
  }
  return best;
}

function bbox(strokes) {
  const xs = strokes.flat().map((p) => p[0]);
  const ys = strokes.flat().map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

// 쓴 글씨 전체를 본보기 글씨의 크기·자리에 맞춘다 (가로세로 비율은 너무 달라지지 않게)
function fitTo(strokes, tmpl) {
  const a = bbox(strokes);
  const b = bbox(tmpl);
  const aw = Math.max(a.x1 - a.x0, 1);
  const ah = Math.max(a.y1 - a.y0, 1);
  const bw = Math.max(b.x1 - b.x0, 1);
  const bh = Math.max(b.y1 - b.y0, 1);
  // 한쪽으로 가는 글씨(ㅡ, ㅣ)는 긴 쪽 길이로만 맞춘다
  let sx = bw / aw;
  let sy = bh / ah;
  if (bw < 8 || aw < 8) sx = sy;
  if (bh < 8 || ah < 8) sy = sx;
  const k = Math.sqrt(sx * sy);
  sx = Math.min(k * 1.35, Math.max(k / 1.35, sx));
  sy = Math.min(k * 1.35, Math.max(k / 1.35, sy));
  const acx = (a.x0 + a.x1) / 2;
  const acy = (a.y0 + a.y1) / 2;
  const bcx = (b.x0 + b.x1) / 2;
  const bcy = (b.y0 + b.y1) / 2;
  return strokes.map((st) => st.map(([x, y]) => [bcx + (x - acx) * sx, bcy + (y - acy) * sy]));
}

// 손을 떼었다가 바로 이어 쓴 조각(끝과 시작이 아주 가까운 것)은 한 획으로 합쳐 본다
function mergeBroken(strokes, want) {
  const out = strokes.map((s) => [...s]);
  while (out.length > want) {
    let bi = -1;
    let bd = 7;
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i][out[i].length - 1];
      const b = out[i + 1][0];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (d < bd) { bd = d; bi = i; }
    }
    if (bi < 0) break;
    out.splice(bi, 2, [...out[bi], ...out[bi + 1]]);
  }
  return out;
}

// 단계별 모양 허용 거리 (0~100 칸 기준). 글자(음절)는 낱자가 작게 들어가서 조금 더 엄격해진다
const TOL = [17, 15, 14, 13, 12];

/* judge(): 아이가 쓴 획(0~100 칸 좌표의 점 배열들)을 본보기와 비교한다.
   결과 { ok, problem: 'count-few' | 'count-many' | 'order' | 'direction' | 'shape' | null, stroke: 문제가 된 본보기 획 번호, want: 그 자리에 써야 할 획 번호, scores } */
export function judge(drawn, g, level = 3) {
  const tmpl = g.strokes;
  let strokes = drawn.filter((s) => s.length > 1 && lengthOf(s) > 2.5);
  if (!strokes.length) return { ok: false, problem: 'count-few', stroke: 0, want: 0, scores: [] };
  if (strokes.length > tmpl.length) strokes = mergeBroken(strokes, tmpl.length);
  if (strokes.length < tmpl.length) return { ok: false, problem: 'count-few', stroke: strokes.length, want: strokes.length, scores: [] };
  if (strokes.length > tmpl.length) return { ok: false, problem: 'count-many', stroke: tmpl.length, want: tmpl.length, scores: [] };

  const fit = fitTo(strokes, tmpl);
  const T = tmpl.map((s) => even(s));
  const C = fit.map((s) => even(s));
  const small = g.parts.length > 1 ? 0.85 : 1;
  const tol = TOL[level - 1] * small;
  const dist = (ci, ti) => (closed(tmpl[ti]) ? loopDist(C[ci], T[ti]) : meanDist(C[ci], T[ti]));
  const scores = [];
  // 시작점과 끝점이 서로 바뀌었는지 (짧은 획은 평균 거리만으로는 잘 안 보여서 따로 본다)
  const flipped = (i) => {
    if (closed(tmpl[i])) return false;
    const [cs, ce] = [C[i][0], C[i][N - 1]];
    const [ts, te] = [T[i][0], T[i][N - 1]];
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    return d(ts, te) > 5 && d(cs, te) + d(ce, ts) < d(cs, ts) + d(ce, te) - 4;
  };
  for (let i = 0; i < T.length; i++) {
    const fwd = dist(i, i);
    scores.push(fwd);
    if (fwd <= tol && flipped(i)) return { ok: false, problem: 'direction', stroke: i, want: i, scores };
    if (fwd <= tol) continue;
    // 방향만 거꾸로인지: 거꾸로 놓고 보면 맞는다
    if (!closed(tmpl[i])) {
      const rev = meanDist([...C[i]].reverse(), T[i]);
      if (rev <= tol) return { ok: false, problem: 'direction', stroke: i, want: i, scores };
    }
    // 다른 획의 자리에 맞는다면 순서가 바뀐 것
    for (let j = 0; j < T.length; j++) {
      if (j === i) continue;
      const other = Math.min(dist(i, j), closed(tmpl[j]) ? Infinity : meanDist([...C[i]].reverse(), T[j]));
      if (other <= tol) return { ok: false, problem: 'order', stroke: i, want: i, scores };
    }
    return { ok: false, problem: 'shape', stroke: i, want: i, scores };
  }
  return { ok: true, problem: null, stroke: -1, want: -1, scores };
}

/* readDigit(): 아이가 쓴 숫자 하나를 0~9 중에서 알아본다. 모르겠으면 null.
   모양이 맞으면 획 방향 · 순서가 달라도 그 숫자로 본다 (답을 고르는 놀이라서 쓰는 법은 따지지 않는다) */
export function readDigit(drawn) {
  let best = null;
  let bestScore = Infinity;
  for (let d = 0; d <= 9; d++) {
    const r = judge(drawn, glyph(String(d)), 1);
    const loose = r.problem === 'direction' || r.problem === 'order';
    if (!r.ok && !loose) continue;
    const score = (r.scores.length ? r.scores.reduce((a, s) => a + s, 0) / r.scores.length : TOL[0]) + (loose ? 4 : 0);
    if (score < bestScore) { bestScore = score; best = d; }
  }
  return best;
}

// 아이에게 들려줄 말
export function advice(r) {
  const k = r.want + 1;
  return {
    'count-few': '획이 모자라요. 빠진 획을 더 써 볼까요?',
    'count-many': '획이 너무 많아요. 한 획은 한 번에 이어서 써요.',
    order: `획 순서가 달라요. ${k}번째에는 반짝이는 획을 써요.`,
    direction: `${k}번째 획은 반대쪽에서 시작해요. 초록 점에서 출발해요.`,
    shape: `${k}번째 획 모양을 본보기처럼 써 볼까요?`,
  }[r.problem] || '';
}
