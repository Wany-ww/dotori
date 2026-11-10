// 학습 리포트: 아이 한 명의 오늘 학습과 누적 학습.
// 보호자는 #/report(지금 아이), 관리자는 #/admin/u/<계정>/r/<아이>로 같은 화면을 본다.
// 하루 기록(p.log)은 놀이를 마칠 때마다 store.recordPlay가 쌓는다.
import { h } from './ui.js';
import { GAMES, FREE_ACTS } from './data.js';
import { HANGUL_STAGES, HANGUL_STEPS } from './curriculum.js';
import { EN_UNITS, EN_LEVELS } from './enCurriculum.js';
import { MATH_UNITS, MATH_LEVELS } from './mathCurriculum.js';
import { CHALLENGES, STAGES } from './challengeMap.js';

const SUBJ = ['hangul', 'math', 'english'];
// 과목 색 (차트 표식에만. 글자는 글자색). 색약 검사를 통과한 분홍 · 청록 · 보라
const COLOR = { hangul: '#e87ba4', math: '#1baf7a', english: '#6250d6' };
const NAME = { hangul: '한글', math: '수학', english: '영어' };
const day = (d) => d.toLocaleDateString('sv');
const todayStr = () => day(new Date());
const minutes = (ms) => Math.round((ms || 0) / 60000);
const pct = (c, n) => (n ? Math.round((c / n) * 100) : null);
const timeText = (ms) => {
  const m = minutes(ms);
  if (ms > 0 && m === 0) return '1분 미만';
  return m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`;
};
const sum = (list, f) => list.reduce((a, x) => a + (f(x) || 0), 0);

// 연속 학습일: 오늘(또는 어제)부터 거꾸로 이어진 날 수
function streak(days) {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(day(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(day(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

const tile = (label, value, sub) => h('div', { class: 'rp-tile' }, h('b', {}, value), h('span', {}, label), sub ? h('small', {}, sub) : null);
const section = (title, ...kids) => h('section', { class: 'panel rp-section' }, h('h2', {}, title), ...kids);

/* ---------- 오늘 ---------- */
function todayPart(p, works) {
  const t = todayStr();
  const log = p.log?.[t] || { plays: [], courses: [] };
  const plays = log.plays;
  const c = sum(plays, (x) => x.c);
  const n = sum(plays, (x) => x.n);
  const ms = sum(plays, (x) => x.ms);
  const stars = sum(plays, (x) => x.st);
  const todayWorks = works.filter((w) => day(new Date(w.createdAt)) === t);

  // 과목별 오늘의 할 일과 배운 차시
  const subjects = SUBJ.map((s) => {
    const course = p.day === t ? p.courses?.[s] : null;
    const done = Math.min(course ? p.progress?.[s] || 0 : 0, course?.length || 0);
    const ps = plays.filter((x) => x.s === s);
    const what = s === 'hangul' ? `${HANGUL_STEPS[p.hangulStep].id}차시 · ${HANGUL_STEPS[p.hangulStep].goal}`
      : s === 'english' ? `Level ${EN_UNITS[p.englishUnit].code} ${EN_UNITS[p.englishUnit].no}차시 · ${EN_UNITS[p.englishUnit].goal}`
        : `${MATH_UNITS[p.mathUnit].id} ${MATH_UNITS[p.mathUnit].title} (${(p.mathDay || 0) + 1}/${MATH_UNITS[p.mathUnit].days}일) · ${MATH_UNITS[p.mathUnit].goal}`;
    return h('div', { class: 'rp-subj' },
      h('div', { class: 'rp-subj-head' }, h('i', { class: 'rp-key', style: { background: COLOR[s] } }), h('b', {}, NAME[s]),
        h('span', { class: `rp-badge${log.courses.includes(s) ? ' done' : ''}` },
          log.courses.includes(s) ? '오늘의 할 일 완료 ✓' : course ? `오늘의 할 일 ${done}/${course.length}` : '오늘의 할 일 시작 전')),
      h('p', {}, what),
      ps.length ? h('small', {}, `놀이 ${ps.length}개 · 한 번에 맞힘 ${pct(sum(ps, (x) => x.c), sum(ps, (x) => x.n)) ?? '-'}% · ${timeText(sum(ps, (x) => x.ms))}`) : null);
  });

  // 한 줄 평: 많이 한 과목, 잘한 과목, 더 연습할 놀이
  const notes = [];
  if (plays.length) {
    const by = SUBJ.map((s) => ({ s, ps: plays.filter((x) => x.s === s) })).filter((x) => x.ps.length);
    const best = [...by].sort((a, b) => (pct(sum(b.ps, (x) => x.c), sum(b.ps, (x) => x.n)) || 0) - (pct(sum(a.ps, (x) => x.c), sum(a.ps, (x) => x.n)) || 0))[0];
    notes.push(`오늘 ${timeText(ms)} 동안 놀이 ${plays.length}개를 하고 별 ${stars}개를 받았어요.`);
    if (best) notes.push(`${NAME[best.s]}에서 ${pct(sum(best.ps, (x) => x.c), sum(best.ps, (x) => x.n))}%를 한 번에 맞혔어요.`);
    const weak = plays.filter((x) => x.n && x.c / x.n < 0.6);
    if (weak.length) notes.push(`${[...new Set(weak.map((x) => GAMES[x.g]?.title || x.g))].slice(0, 2).join(', ')}은(는) 조금 더 연습하면 좋아요.`);
    if (log.courses.length) notes.push(`${log.courses.map((s) => NAME[s]).join(' · ')} 오늘의 할 일을 끝까지 마쳤어요. 🎉`);
  }

  return section(`📅 오늘의 학습 (${t})`,
    plays.length
      ? h('div', { class: 'rp-tiles' }, tile('공부 시간', timeText(ms)), tile('한 놀이', `${plays.length}개`), tile('받은 별', `⭐ ${stars}`), tile('한 번에 맞힘', pct(c, n) == null ? '-' : `${pct(c, n)}%`, n ? `${n}문제 중 ${c}개` : ''))
      : h('p', { class: 'muted' }, '오늘은 아직 놀이를 하지 않았어요.'),
    notes.length ? h('ul', { class: 'rp-notes' }, notes.map((t2) => h('li', {}, t2))) : null,
    h('div', { class: 'rp-subjs' }, subjects),
    plays.length
      ? h('details', { class: 'rp-details', open: true },
        h('summary', {}, `오늘 한 놀이 ${plays.length}개`),
        h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
          h('thead', {}, h('tr', {}, ['시각', '과목', '놀이', '차시', '별', '맞힘', '시간'].map((x) => h('th', { scope: 'col' }, x)))),
          h('tbody', {}, [...plays].reverse().map((x) => h('tr', {},
            h('td', {}, x.t), h('td', {}, NAME[x.s] || x.s), h('td', {}, GAMES[x.g]?.title || x.g), h('td', {}, x.u),
            h('td', {}, '⭐'.repeat(x.st || 0)), h('td', { class: 'num' }, x.n ? `${x.c}/${x.n}` : '-'), h('td', { class: 'num' }, timeText(x.ms))))))))
      : null,
    todayWorks.length ? h('div', {}, h('h3', {}, `오늘 만든 작품 ${todayWorks.length}점`), worksGrid(todayWorks)) : null);
}

/* ---------- 누적 ---------- */
function totalPart(p, works) {
  const days = p.stats?.days || [];
  const subj = p.stats?.subj || {};
  const allC = sum(SUBJ, (s) => subj[s]?.c);
  const allN = sum(SUBJ, (s) => subj[s]?.n);
  const hStep = p.hangulStep;
  const eUnit = p.englishUnit;
  const progress = [
    { s: 'hangul', label: `${HANGUL_STEPS[hStep].stage}단계 ${HANGUL_STEPS[hStep].no}차시`, sub: `14단계 중 ${HANGUL_STEPS[hStep].stage}단계 · ${HANGUL_STAGES[HANGUL_STEPS[hStep].stage - 1].title}`, done: hStep, all: HANGUL_STEPS.length },
    { s: 'english', label: `Level ${EN_UNITS[eUnit].code} ${EN_UNITS[eUnit].no}차시`, sub: `24단계 중 ${EN_UNITS[eUnit].levelIndex + 1}번째 · ${EN_LEVELS[EN_UNITS[eUnit].levelIndex].title}`, done: eUnit, all: EN_UNITS.length },
    { s: 'math', label: `Level ${MATH_UNITS[p.mathUnit].code} ${MATH_UNITS[p.mathUnit].id}`, sub: `8단계 중 ${MATH_UNITS[p.mathUnit].levelIndex + 1}번째 · ${MATH_LEVELS[MATH_UNITS[p.mathUnit].levelIndex].title}`, done: p.mathUnit, all: MATH_UNITS.length },
  ];
  const top = Object.entries(p.played || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const checks = (p.checks || []).slice(-5).reverse();
  const ch = Object.entries(p.challenges || {});

  return section('📈 누적 학습',
    h('div', { class: 'rp-tiles' },
      tile('시작한 날', p.createdAt || '-'), tile('공부한 날', `${days.length}일`), tile('연속 학습', `${streak(days)}일`),
      tile('총 공부 시간', timeText(p.stats?.ms), p.stats?.ms ? '' : '시간은 기록을 시작한 뒤부터'), tile('총 놀이', `${p.stats?.games || 0}개`),
      tile('한 번에 맞힘', pct(allC, allN) == null ? '-' : `${pct(allC, allN)}%`), tile('별 · 도토리', `⭐ ${p.stats?.stars || 0} · 🌰 ${p.acorns || 0}`),
      tile('오늘의 할 일 완료', `${p.stats?.courses || 0}번`), tile('스티커 · 작품', `${p.stickers?.length || 0}개 · ${works.length}점`)),
    h('h3', {}, '과목별 진도'),
    h('div', { class: 'rp-progress' }, progress.map((x) => h('div', { class: 'rp-prog' },
      h('div', { class: 'rp-prog-head' }, h('i', { class: 'rp-key', style: { background: COLOR[x.s] } }), h('b', {}, NAME[x.s]), h('span', {}, x.label)),
      h('div', { class: 'rp-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': x.all, 'aria-valuenow': x.done, 'aria-label': `${NAME[x.s]} 진도` },
        h('i', { style: { width: `${Math.max(2, (x.done / x.all) * 100)}%`, background: COLOR[x.s] } })),
      h('small', {}, `${x.sub} · ${Math.round((x.done / x.all) * 100)}%`)))),
    h('h3', {}, '과목별 기록'),
    h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
      h('thead', {}, h('tr', {}, ['과목', '놀이', '공부 시간', '한 번에 맞힘'].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, SUBJ.map((s) => h('tr', {},
        h('td', {}, h('i', { class: 'rp-key', style: { background: COLOR[s] } }), ` ${NAME[s]}`),
        h('td', { class: 'num' }, `${subj[s]?.plays || 0}개`), h('td', { class: 'num' }, timeText(subj[s]?.ms)),
        h('td', { class: 'num' }, pct(subj[s]?.c, subj[s]?.n) == null ? '-' : `${pct(subj[s].c, subj[s].n)}%`)))))),
    h('h3', {}, '최근 14일 공부 시간'),
    chart14(p),
    h('div', { class: 'rp-cols' },
      h('div', {}, h('h3', {}, '많이 한 놀이'),
        top.length ? h('ol', { class: 'rp-list' }, top.map(([k, c]) => h('li', {}, `${GAMES[k]?.icon || ''} ${GAMES[k]?.title || k}`, h('span', {}, `${c}번`)))) : h('p', { class: 'muted' }, '-')),
      h('div', {}, h('h3', {}, '한글 확인 퀴즈'),
        checks.length ? h('ol', { class: 'rp-list' }, checks.map((c) => h('li', {}, `${c.date} · ${c.score}/${c.total}`, h('span', {}, c.pass ? '통과' : `${HANGUL_STEPS[c.review]?.id}차시 복습`)))) : h('p', { class: 'muted' }, '아직 없어요.')),
      h('div', {}, h('h3', {}, '영어 챌린지 지도'),
        ch.length ? h('ol', { class: 'rp-list' }, ch.map(([k, c]) => h('li', {}, CHALLENGES[k]?.name || k, h('span', {}, `${Math.min(c.stage, STAGES)} / ${STAGES}단계 · ⭐ ${Object.values(c.stars).reduce((a, b) => a + b, 0)}`)))) : h('p', { class: 'muted' }, '아직 없어요.'))));
}

/* ---------- 최근 14일 차트: 날짜별 과목 쌓은 막대 (분) ---------- */
function chart14(p) {
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return day(d); });
  const rows = days.map((d) => {
    const plays = p.log?.[d]?.plays || [];
    return { d, ...Object.fromEntries(SUBJ.map((s) => [s, minutes(sum(plays.filter((x) => x.s === s), (x) => x.ms))])), plays: plays.length };
  });
  const max = Math.max(10, ...rows.map((r) => sum(SUBJ, (s) => r[s])));
  const step = max <= 20 ? 5 : max <= 60 ? 15 : 30;
  const top = Math.ceil(max / step) * step;
  const W = 640;
  const H = 210;
  const L = 34;
  const B = 24;
  const T = 8;
  const plotH = H - B - T;
  const slot = (W - L - 6) / 14;
  const bw = Math.min(24, slot * 0.6);
  const y = (v) => T + plotH - (v / top) * plotH;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text != null) e.textContent = text; return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rp-chart', role: 'img', 'aria-label': '최근 14일 과목별 공부 시간' });
  for (let v = 0; v <= top; v += step) {
    svg.append(el('line', { x1: L, x2: W - 4, y1: y(v), y2: y(v), class: 'rp-grid' }), el('text', { x: L - 6, y: y(v) + 4, class: 'rp-tick', 'text-anchor': 'end' }, v));
  }
  const tip = h('div', { class: 'rp-tip', hidden: true });
  rows.forEach((r, i) => {
    const x = L + slot * i + (slot - bw) / 2;
    let base = 0;
    const segs = SUBJ.filter((s) => r[s] > 0);
    segs.forEach((s, k) => {
      const y1 = y(base + r[s]);
      const y0 = y(base);
      const hgt = Math.max(1, y0 - y1 - (k ? 2 : 0));
      const top1 = k === segs.length - 1;
      // 맨 위 조각만 위쪽 모서리를 둥글게, 조각 사이는 2px 띄운다
      const r4 = top1 ? Math.min(4, hgt) : 0;
      const yy = y0 - (k ? 2 : 0) - hgt;
      svg.append(el('path', {
        d: `M${x},${yy + hgt} V${yy + r4} Q${x},${yy} ${x + r4},${yy} H${x + bw - r4} Q${x + bw},${yy} ${x + bw},${yy + r4} V${yy + hgt} Z`,
        fill: COLOR[s],
      }));
      base += r[s];
    });
    if (!segs.length && r.plays) svg.append(el('rect', { x, y: y(0) - 2, width: bw, height: 2, fill: '#c9c4bd' }));
    if (i % 2 === 1 || i === 13) svg.append(el('text', { x: x + bw / 2, y: H - 6, class: 'rp-tick', 'text-anchor': 'middle' }, i === 13 ? '오늘' : r.d.slice(5).replace('-', '/')));
    // 마우스 · 손가락이 닿는 넓은 칸
    const hit = el('rect', { x: L + slot * i, y: T, width: slot, height: plotH, fill: 'transparent', class: 'rp-hit' });
    const show = () => {
      tip.hidden = false;
      tip.replaceChildren(h('b', {}, r.d), ...SUBJ.map((s) => h('span', {}, h('i', { class: 'rp-key', style: { background: COLOR[s] } }), ` ${NAME[s]} ${r[s]}분`)), h('span', {}, `놀이 ${r.plays}개`));
      tip.style.left = `${((L + slot * i + slot / 2) / W) * 100}%`;
    };
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('click', show);
    hit.addEventListener('mouseleave', () => { tip.hidden = true; });
    svg.append(hit);
  });
  const legend = h('div', { class: 'rp-legend' }, SUBJ.map((s) => h('span', {}, h('i', { class: 'rp-key', style: { background: COLOR[s] } }), NAME[s])), h('span', { class: 'muted' }, '단위: 분'));
  const table = h('details', { class: 'rp-details' }, h('summary', {}, '표로 보기'),
    h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
      h('thead', {}, h('tr', {}, ['날짜', ...SUBJ.map((s) => `${NAME[s]}(분)`), '놀이'].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, h('td', {}, r.d), ...SUBJ.map((s) => h('td', { class: 'num' }, r[s])), h('td', { class: 'num' }, r.plays)))))));
  return h('div', { class: 'rp-chart-box' }, legend, h('div', { class: 'rp-chart-wrap' }, svg, tip), table);
}

function worksGrid(works) {
  return h('div', { class: 'adm-works' }, works.map((w) => h('figure', {},
    h('img', { src: w.url, alt: w.title || '작품', loading: 'lazy' }),
    h('figcaption', {}, h('b', {}, w.title || FREE_ACTS[w.act]?.title || '작품'), h('span', {}, new Date(w.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }))))));
}

// p: 아이 프로필 · works: () => Promise<[{ title, act, createdAt, url }]> · back: 돌아갈 주소
export function viewReport(p, { works = async () => [], back = '#/', who = '' } = {}) {
  const body = h('div', { class: 'rp-body' }, h('p', { class: 'muted' }, '리포트를 만드는 중…'));
  const view = h('main', { class: 'page rp' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn no-print', href: back, 'aria-label': '돌아가기' }, '←'),
      h('div', {}, h('h1', {}, `📊 ${p.avatar} ${p.name}의 학습 리포트`),
        h('p', { class: 'muted' }, `${who}${p.age}살 · ${new Date().toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' })} 기준`)),
      h('button', { class: 'btn btn-ghost small no-print rp-print', type: 'button', onclick: () => print() }, '🖨️ 인쇄 · PDF')),
    body);
  view.mount = async () => {
    let list = [];
    try { list = await works(); } catch {}
    body.replaceChildren(...[todayPart(p, list), totalPart(p, list),
      list.length ? section(`🎨 작품 모음 (${list.length}점)`, worksGrid(list.slice(0, 24))) : null].filter(Boolean));
  };
  return view;
}
