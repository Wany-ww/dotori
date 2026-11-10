import { h, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { numPad } from './numPad.js';

const R = 4;
const UNITS = 18;
// 물건: 이름, 질문, 모습(본체 색 · 끝 모양)
const THINGS = [
  { name: '숟가락', q: '숟가락의 길이는 얼마인가요?', kind: 'spoon' },
  { name: '블록', q: '블록의 길이는 얼마인가요?', kind: 'block' },
  { name: '연필', q: '연필의 길이는 얼마인가요?', kind: 'pencil' },
  { name: '크레파스', q: '크레파스의 길이는 얼마인가요?', kind: 'crayon' },
  { name: '사탕', q: '사탕의 길이는 얼마인가요?', kind: 'candy' },
  { name: '리본', q: '리본의 길이는 얼마인가요?', kind: 'ribbon' },
];
// 단계별: 길이 범위, 물건이 0에서 시작하는지, 자를 움직여 맞추는지, 두 물건의 길이 차이를 묻는지
const CFG = [
  { len: [3, 8], zero: true },
  { len: [4, 15], zero: true },
  { len: [3, 12], zero: false, move: true },
  { len: [3, 10], zero: false },
  { len: [4, 14], zero: true, two: true },
];

// 물건 모습: 길이(칸)에 맞춰 늘어나는 본체와 끝
export function thingEl(kind, len, unit = 'var(--u)') {
  const w = `calc(${unit} * ${len})`;
  const parts = {
    spoon: [h('i', { class: 'rl-handle' }), h('i', { class: 'rl-bowl' })],
    block: [h('i', { class: 'rl-wood' })],
    pencil: [h('i', { class: 'rl-pbody' }), h('i', { class: 'rl-tip' })],
    crayon: [h('i', { class: 'rl-cbody' }), h('i', { class: 'rl-ctip' })],
    candy: [h('i', { class: 'rl-candy' })],
    ribbon: [h('i', { class: 'rl-ribbon' })],
  }[kind];
  return h('div', { class: `rl-thing is-${kind}`, style: { width: w }, 'aria-hidden': 'true' }, parts);
}

// 길이 재기 II(RulerMeasure): 자 위에 놓인 물건의 길이를 읽어 숫자판으로 넣는다 (cm).
// 0에서 시작 → 자 옮겨 맞추기 → 0이 아닌 곳에서 시작(빼서 구하기) → 두 물건의 길이 차이 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const q = h('p', { class: 'rl-ask' });
  const track = h('div', { class: 'rl-track' });
  const ruler = h('div', { class: 'rl-ruler' },
    Array.from({ length: UNITS * 2 + 1 }, (_, i) => h('span', { class: `rl-tick${i % 2 ? ' half' : ''}`, style: { left: `calc(var(--u) * ${i / 2})` } }, i % 2 ? '' : h('b', {}, i / 2))));
  const answer = h('div', { class: 'rl-answer' });
  stage.append(h('div', { class: 'ruler-measure' }, q, track, answer));
  let n = 0;
  let firstTry = 0;
  let last = '';

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let t;
    do t = pick(THINGS); while (t.name === last);
    last = t.name;
    const len = randInt(...cfg.len);
    const start = cfg.zero ? 0 : randInt(1, UNITS - len);
    const items = [{ t, len, start }];
    if (cfg.two) {
      let t2;
      do t2 = pick(THINGS); while (t2.name === t.name);
      let len2;
      do len2 = randInt(...cfg.len); while (len2 === len);
      items.push({ t: t2, len: len2, start: 0 });
    }
    // 자를 옮기는 단계는 자가 0 칸(물건과 어긋난 자리)에서 시작한다
    let rulerAt = 0;
    track.replaceChildren(...items.map((it, k) => {
      const el = thingEl(it.t.kind, it.len);
      el.style.left = `calc(var(--u) * ${it.start})`;
      el.style.bottom = `${50 + (items.length - 1 - k) * 56}px`;
      return el;
    }), ruler);
    track.style.setProperty('--rows', items.length);
    const place = () => { ruler.style.left = `calc(var(--u) * ${rulerAt})`; };
    place();
    answer.replaceChildren();
    let missed = false;

    const ask = () => {
      const want = cfg.two ? Math.abs(items[0].len - items[1].len) : len;
      const text = cfg.two ? `${items[0].t.name}과(와) ${items[1].t.name}의 길이는 몇 cm 차이일까요?` : t.q;
      q.textContent = text;
      const pad = numPad((v, clear) => {
        if (v !== want) { missed = true; wiggle(answer); hinter.miss(pad.keyOf(want)); clear(); return; }
        if (!missed) firstTry++;
        hinter.reset();
        sfx.correct();
        pad.el.remove();
        pad.screen.textContent = v;
        cheer(track);
        speak(`${want}센티미터`);
        ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
      }, { cls: 'rl' });
      answer.replaceChildren(pad.screen, h('span', { class: 'rl-unit' }, 'cm'), pad.el);
      if (cfg.two) speak('두 물건의 길이는 몇 센티미터 차이일까요?'); else speak(t.q);
    };

    if (cfg.move) {
      // 자를 끌어 0 눈금을 물건의 왼쪽 끝에 맞춘다
      q.textContent = `자를 끌어서 0을 ${t.name}의 왼쪽 끝에 맞춰요!`;
      let drag = null;
      ruler.classList.add('movable');
      ruler.onpointerdown = (ev) => { drag = { x: ev.clientX, at: rulerAt }; try { ruler.setPointerCapture(ev.pointerId); } catch {} };
      ruler.onpointermove = (ev) => {
        if (!drag) return;
        const u = ruler.getBoundingClientRect().width / UNITS;
        rulerAt = Math.max(0, Math.min(UNITS - len, drag.at + Math.round((ev.clientX - drag.x) / u)));
        place();
      };
      // 0이 물건 끝에 맞으면 자가 멈추고 길이를 묻는다
      const lock = () => {
        if (rulerAt !== start || !ruler.classList.contains('movable')) return;
        ruler.classList.remove('movable');
        ruler.onpointerdown = ruler.onpointermove = ruler.onpointerup = ruler.onpointercancel = null;
        pop(ruler);
        ask();
      };
      ruler.onpointerup = ruler.onpointercancel = () => {
        if (!drag) return;
        drag = null;
        sfx.tap();
        lock();
      };
      // 화살표 단추로도 옮길 수 있다
      const nudge = (d) => { if (!ruler.classList.contains('movable')) return; rulerAt = Math.max(0, Math.min(UNITS - len, rulerAt + d)); place(); sfx.tap(); lock(); };
      answer.replaceChildren(h('button', { class: 'btn btn-ghost', type: 'button', 'aria-label': '자를 왼쪽으로', onclick: () => nudge(-1) }, '◀'),
        h('button', { class: 'btn btn-ghost', type: 'button', 'aria-label': '자를 오른쪽으로', onclick: () => nudge(1) }, '▶'));
      ctx.prompt('자를 끌어서 0 눈금을 물건의 왼쪽 끝에 맞춘 뒤, 길이를 읽어요!', () => speak('자의 0을 물건 끝에 맞춰요!'));
      return;
    }
    ask();
    ctx.prompt(cfg.zero ? '물건 끝이 닿은 눈금을 읽고, 몇 cm인지 숫자판으로 넣어요!' : '물건이 0에서 시작하지 않아요! 끝 눈금에서 시작 눈금을 빼서 길이를 구해요.',
      () => speak(cfg.two ? '두 물건의 길이를 재어 봐요!' : t.q));
  }

  round();
}
