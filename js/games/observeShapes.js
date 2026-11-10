import { h, pick, shuffle, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 4;
const NAMES = { box: '상자 모양', tube: '둥근 기둥 모양', ball: '공 모양' };
// 물건: 모양 갈래, 크기(px), 면 색
const THINGS = [
  { kind: 'box', w: 130, h: 120, d: 120, faces: ['#D9A86C', '#C8955A', '#E6BC86'] },
  { kind: 'box', w: 90, h: 90, d: 90, cube: true },
  { kind: 'box', w: 150, h: 70, d: 90, faces: ['#7FC6E8', '#5AAED6', '#A8DDF2'] },
  { kind: 'box', w: 120, h: 40, d: 160, faces: ['#E8574F', '#C8443D', '#F2857E'] },
  { kind: 'tube', r: 55, h: 120, side: '#D9A86C', top: '#E6BC86' },
  { kind: 'tube', r: 45, h: 110, side: '#E8574F', top: '#C9C9C9' },
  { kind: 'tube', r: 70, h: 60, side: '#F2C230', top: '#F7E2A0' },
  { kind: 'tube', r: 35, h: 140, side: '#F2F2F2', top: '#DADADA' },
  { kind: 'ball', r: 65, color: '#F28A2E' },
  { kind: 'ball', r: 60, color: '#4DB04A', stripes: true },
  { kind: 'ball', r: 55, color: '#3E7FE0' },
];
// 단계별: 보기 이름 수, 처음 보이는 각도 [옆으로, 위아래로]
const CFG = [
  { opts: 1, start: [-28, -18] },
  { opts: 2, start: [-28, -18] },
  { opts: 3, start: [-28, -18] },
  { opts: 3, start: [0, 0] },
  { opts: 3, start: [0, -88] },
];
const CUBE = ['#E8574F', '#F2C230', '#4DB04A', '#3E7FE0', '#F2F2F2', '#F28A2E'];

function face(w, hgt, transform, bg) {
  return h('i', { class: 'ob-face', style: { width: `${w}px`, height: `${hgt}px`, margin: `${-hgt / 2}px 0 0 ${-w / 2}px`, transform, background: bg } });
}
// 물건을 CSS 입체로 만든다 (상자 · 둥근 기둥). 공은 어느 쪽에서 봐도 동그랗다
function build(t) {
  if (t.kind === 'ball') {
    return h('div', { class: `ob-ball${t.stripes ? ' stripes' : ''}`, style: { width: `${t.r * 2}px`, height: `${t.r * 2}px`, '--c': t.color } });
  }
  const g = h('div', { class: 'ob-obj' });
  if (t.kind === 'box') {
    const grid = (c) => `repeating-linear-gradient(90deg, transparent 0 31%, #222 31% 34.3%), repeating-linear-gradient(0deg, transparent 0 31%, #222 31% 34.3%), ${c}`;
    const [f, s, tp] = t.cube ? [grid(CUBE[0]), grid(CUBE[1]), grid(CUBE[2])] : t.faces;
    const [b2, s2, bt] = t.cube ? [grid(CUBE[3]), grid(CUBE[4]), grid(CUBE[5])] : t.faces;
    g.append(
      face(t.w, t.h, `translateZ(${t.d / 2}px)`, f),
      face(t.w, t.h, `rotateY(180deg) translateZ(${t.d / 2}px)`, b2),
      face(t.d, t.h, `rotateY(90deg) translateZ(${t.w / 2}px)`, s),
      face(t.d, t.h, `rotateY(-90deg) translateZ(${t.w / 2}px)`, s2),
      face(t.w, t.d, `rotateX(90deg) translateZ(${t.h / 2}px)`, tp),
      face(t.w, t.d, `rotateX(-90deg) translateZ(${t.h / 2}px)`, bt),
    );
    return g;
  }
  // 둥근 기둥: 옆면 띠 24장 + 위 · 아래 동그라미
  const N = 24;
  const sw = (2 * Math.PI * t.r) / N + 0.6;
  for (let i = 0; i < N; i++) {
    const shade = 0.82 + 0.18 * Math.cos((i / N) * Math.PI * 2);
    g.append(face(sw, t.h, `rotateY(${(i * 360) / N}deg) translateZ(${t.r}px)`, `color-mix(in srgb, ${t.side} ${Math.round(shade * 100)}%, #000)`));
  }
  const disc = (z) => { const d = face(t.r * 2, t.r * 2, `rotateX(90deg) translateZ(${z}px)`, t.top); d.classList.add('disc'); return d; };
  g.append(disc(t.h / 2), disc(-t.h / 2));
  return g;
}

// 사물 관찰하기(ObserveShapes): 물건을 옆 · 위아래 슬라이더로 이리저리 돌려 보고,
// "어떤 모양인가요?"에 알맞은 이름(상자 모양 · 둥근 기둥 모양 · 공 모양)을 빈칸에 끌어 넣는다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const view = h('div', { class: 'ob-view' });
  const yaw = h('input', { class: 'ob-yaw', type: 'range', min: -90, max: 90, value: 0, 'aria-label': '옆으로 돌리기' });
  const pitch = h('input', { class: 'ob-pitch', type: 'range', min: -90, max: 90, value: 0, 'aria-label': '위아래로 돌리기' });
  const slot = h('div', { class: 'ob-slot', 'aria-label': '이름 넣는 칸' });
  const labels = h('div', { class: 'ob-labels' });
  stage.append(h('div', { class: 'observe' },
    h('div', { class: 'ob-left' }, pitch, view, yaw),
    h('div', { class: 'ob-right' }, h('div', { class: 'ob-ask' }, h('button', { class: 'ob-ear', type: 'button', 'aria-label': '다시 듣기', onclick: () => speak('어떤 모양인가요?') }, '🔊'), h('p', {}, '어떤 모양인가요?'), slot), labels)));
  let n = 0;
  let firstTry = 0;
  let lastKind = '';
  let obj = null;
  const turn = () => { if (obj?.classList.contains('ob-obj')) obj.style.transform = `rotateX(${-Number(pitch.value)}deg) rotateY(${yaw.value}deg)`; };
  yaw.addEventListener('input', turn);
  pitch.addEventListener('input', turn);

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let t;
    do t = pick(THINGS); while (t.kind === lastKind && Math.random() < 0.7);
    lastKind = t.kind;
    obj = build(t);
    view.replaceChildren(obj);
    yaw.value = cfg.start[0];
    pitch.value = -cfg.start[1];
    turn();
    slot.replaceChildren();
    slot.classList.remove('ok');
    const answer = NAMES[t.kind];
    const names = cfg.opts === 1 ? [answer] : shuffle([answer, ...shuffle(Object.values(NAMES).filter((x) => x !== answer)).slice(0, cfg.opts - 1)]);
    let missed = false;
    labels.replaceChildren(...names.map((name) => {
      const b = h('button', { class: 'ob-label', type: 'button' }, name);
      const put = () => {
        if (slot.classList.contains('ok')) return;
        if (name !== answer) {
          missed = true;
          wiggle(b);
          hinter.miss([...labels.children].find((x) => x.textContent === answer));
          return;
        }
        hinter.reset();
        if (!missed) firstTry++;
        slot.append(b);
        slot.classList.add('ok');
        b.disabled = true;
        pop(slot);
        sfx.correct();
        cheer(view);
        speak(answer);
        ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
      };
      draggable(b, { onDrop: (pt) => { if (hits(slot, pt, 20)) put(); else wiggle(b); } });
      b.addEventListener('click', put);
      return b;
    }));
    speak('어떤 모양인가요?');
  }

  ctx.prompt('슬라이더를 움직여 물건을 이리저리 돌려 봐요. 어떤 모양인지 알맞은 이름을 빈칸에 끌어 넣어요!', () => speak('물건을 돌려 보고 어떤 모양인지 알아봐요!'));
  round();
}
