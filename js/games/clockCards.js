import { h, shuffle, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 4;
const NS = 'http://www.w3.org/2000/svg';
// 단계별: 나오는 분, 시 카드 수, 분 카드
const CFG = [
  { mins: [0], hours: 2, minCards: () => ['00'] },
  { mins: [0], hours: 3, minCards: () => ['00', '30'] },
  { mins: [0, 30], hours: 3, minCards: () => ['00', '30'] },
  { mins: [0, 15, 30, 45], hours: 3, minCards: () => ['00', '15', '30', '45'] },
  { mins: [5, 10, 20, 25, 35, 40, 50, 55], hours: 3, minCards: (m) => shuffle([m, (m + 30) % 60, m >= 30 ? m - 5 : m + 5]).map((x) => String(x).padStart(2, '0')) },
];
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

// 시계 기차(TrainTime · 수학): 기관차의 시계를 읽고, 숫자 카드(시 · 분)를 끌어 기차 시각판에 끼우면 기차가 출발한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const face = svg('svg', { viewBox: '0 0 200 200', class: 'cc-clock', role: 'img' });
  face.append(svg('circle', { cx: 100, cy: 100, r: 94, class: 'cc-rim' }), svg('circle', { cx: 100, cy: 100, r: 84, class: 'cc-face' }));
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const t = svg('text', { x: 100 + 66 * Math.sin(a), y: 100 - 66 * Math.cos(a) + 7, class: 'cc-num' });
    t.textContent = i;
    face.append(t);
  }
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    if (i % 5) face.append(svg('circle', { cx: 100 + 80 * Math.sin(a), cy: 100 - 80 * Math.cos(a), r: 1.4, class: 'cc-tick' }));
  }
  const hourHand = svg('line', { x1: 100, y1: 100, x2: 100, y2: 58, class: 'cc-hour' });
  const minHand = svg('line', { x1: 100, y1: 100, x2: 100, y2: 32, class: 'cc-min' });
  face.append(hourHand, minHand, svg('circle', { cx: 100, cy: 100, r: 6, class: 'cc-pin' }));
  const hSlot = h('span', { class: 'cc-slot h', 'aria-label': '시 자리' });
  const mSlot = h('span', { class: 'cc-slot m', 'aria-label': '분 자리' });
  const train = h('div', { class: 'cc-train' },
    h('div', { class: 'cc-engine' }, h('span', { class: 'cc-chimney', 'aria-hidden': 'true' }), face, h('span', { class: 'cc-base', 'aria-hidden': 'true' })),
    h('div', { class: 'cc-car' }, h('div', { class: 'cc-panel' }, hSlot, h('i', { class: 'cc-colon', 'aria-hidden': 'true' }), mSlot), h('span', { class: 'cc-wheels', 'aria-hidden': 'true' })));
  const cards = h('div', { class: 'cc-cards' });
  stage.append(h('div', { class: 'clock-cards' }, train, h('span', { class: 'cc-rail', 'aria-hidden': 'true' }), cards));
  let n = 0;
  let firstTry = 0;
  let lastH = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let hh;
    do hh = randInt(1, 12); while (hh === lastH);
    lastH = hh;
    const mm = pick(cfg.mins);
    hourHand.setAttribute('transform', `rotate(${((hh % 12) + mm / 60) * 30} 100 100)`);
    minHand.setAttribute('transform', `rotate(${mm * 6} 100 100)`);
    face.setAttribute('aria-label', '시계');
    train.classList.remove('leave');
    [hSlot, mSlot].forEach((s) => { s.replaceChildren(); s.classList.remove('filled'); });
    // 시 카드 함정: 짧은바늘이 다음 시로 가까워지면 다음 시를 꼭 넣는다
    const near = mm >= 30 ? (hh % 12) + 1 : hh === 1 ? 12 : hh - 1;
    const hours = new Set([hh, near]);
    while (hours.size < cfg.hours) hours.add(randInt(1, 12));
    const hourCards = [...hours].map(String);
    const minStr = String(mm).padStart(2, '0');
    const minCards = cfg.minCards(mm);
    let missed = false;
    const want = { h: String(hh), m: minStr };
    const all = shuffle([...hourCards.map((v) => ({ v, k: 'h' })), ...minCards.map((v) => ({ v, k: 'm' }))]);
    const els = all.map((c) => {
      const b = h('button', { class: 'cc-card', type: 'button', 'aria-label': c.k === 'h' ? `${c.v}시` : `${c.v}분` }, c.v);
      draggable(b, {
        onDrop: (pt) => {
          const s = [hSlot, mSlot].find((x) => hits(x, pt, 14));
          if (s) put(c, b, s); else wiggle(b);
        },
      });
      // 누르면 자기 자리(시 · 분)로 가 본다
      b.addEventListener('click', () => put(c, b, c.k === 'h' ? hSlot : mSlot));
      return b;
    });
    cards.replaceChildren(...els);

    function put(c, b, s) {
      if (s.classList.contains('filled')) return;
      const kind = s === hSlot ? 'h' : 'm';
      if (c.k !== kind || c.v !== want[kind]) {
        missed = true;
        wiggle(b);
        hinter.miss(els[all.findIndex((x) => x.k === kind && x.v === want[kind])]);
        return;
      }
      hinter.reset();
      sfx.pop();
      b.remove();
      s.textContent = c.v;
      s.classList.add('filled');
      pop(s);
      if (!hSlot.classList.contains('filled') || !mSlot.classList.contains('filled')) return;
      if (!missed) firstTry++;
      sfx.correct();
      cheer(train);
      speak([mm ? `${hh}시 ${mm}분` : `${hh}시`, '기차 출발!']);
      ctx.later(() => train.classList.add('leave'), 1200);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 3000);
    }
    ctx.prompt('기관차의 시계를 읽고, 몇 시 몇 분인지 숫자 카드를 끌어 기차 시각판에 끼워요!', () => speak('시계를 보고 몇 시인지 맞혀요!'));
  }

  round();
}
