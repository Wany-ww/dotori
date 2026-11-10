import { h, shuffle, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

// 단계별: 목표 수 범위, 헷갈리는 카드(자리를 바꾼 카드)를 섞는지, 덤 카드 수
const CFG = [
  { range: [11, 59], swap: false, extra: 0 },
  { range: [21, 99], swap: true, extra: 0 },
  { range: [21, 99], swap: true, extra: 1 },
  { range: [101, 599], swap: false, extra: 0 },
  { range: [111, 999], swap: true, extra: 1 },
];
const PLACE = ['h', 't', 'o'];
// 수 읽기: 100이 넘으면 백의 자리와 나머지를 나눠 읽는다 (녹음된 0~100 · 100 단위 수를 이어 붙임)
const eul = (n) => ([2, 4, 5, 9].includes(n % 10) ? '를' : '을');
const sayNum = (v) => (v > 100 ? [String(Math.floor(v / 100) * 100), ...(v % 100 ? [String(v % 100)] : [])] : String(v));

// 자릿값 블록(NumberBlocks): 자리값 카드(90 · 4)를 상자에 겹쳐 놓아 위의 수(94)를 만든다 (참고 영상 "숫자 블록" 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const R = 4;
  const hinter = makeHinter();
  const goal = h('div', { class: 'pv-goal' });
  const box = h('div', { class: 'pv-box', 'aria-label': '수 상자' });
  const tray = h('div', { class: 'pv-tray' });
  stage.append(h('div', { class: 'pv-cards' }, goal, box, tray));
  let n = 0;
  let firstTry = 0;
  const used = [];

  const card = (v, place) => {
    const digits = String(v);
    return h('button', { class: `pv-card p-${place}`, type: 'button', 'aria-label': `${v} 카드` },
      [...digits].map((d, i) => h('span', { class: `pv-d p-${PLACE[3 - digits.length + i]}` }, d)));
  };

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let target;
    do target = randInt(...cfg.range); while (used.includes(target) || target % 10 === 0 || (target > 100 && Math.floor(target / 10) % 10 === 0));
    used.push(target);
    const ds = String(target);
    const len = ds.length;
    // 정답 카드: 자리마다 숫자 하나 + 뒤에 0 (900 · 40 · 5)
    const parts = [...ds].map((d, i) => ({ v: Number(d) * 10 ** (len - 1 - i), place: PLACE[3 - len + i] }));
    const pool = [];
    // 헷갈리는 카드: 같은 숫자를 다른 자리에 (94라면 9와 40)
    if (cfg.swap) for (let i = 0; i < len - 1; i++) { pool.push({ v: Number(ds[i + 1]) * 10 ** (len - 1 - i), place: PLACE[3 - len + i] }, { v: Number(ds[i]) * 10 ** (len - 2 - i), place: PLACE[3 - len + i + 1] }); }
    for (let k = 0; k < cfg.extra; k++) { const i = randInt(0, len - 1); pool.push({ v: randInt(1, 9) * 10 ** (len - 1 - i), place: PLACE[3 - len + i] }); }
    const wrong = pool.filter((p, i) => !parts.some((q) => q.v === p.v) && pool.findIndex((q) => q.v === p.v) === i);
    const all = shuffle([...parts, ...wrong]);
    let missed = false;
    let locked = false;
    const placed = {};

    goal.replaceChildren(h('b', {}, ...[...ds].map((d, i) => h('span', { class: `pv-gd p-${PLACE[3 - len + i]}` }, d))),
      h('div', { class: 'pv-bars' }, [...ds].map((_, i) => h('i', { class: `p-${PLACE[3 - len + i]}` }))));
    box.className = `pv-box len${len}`;
    box.replaceChildren();
    const cards = all.map((p, i) => {
      const c = card(p.v, p.place);
      c.style.animationDelay = `${i * 0.08}s`;
      c.dataset.v = p.v;
      c.dataset.place = p.place;
      draggable(c, {
        can: () => !locked && c.parentElement === tray,
        onDrop: (pt) => { if (hits(box, pt, 20)) put(c); else wiggle(c); },
      });
      c.addEventListener('click', () => { if (!locked && c.parentElement === tray) put(c); });
      return c;
    });
    tray.replaceChildren(...cards);

    function put(c) {
      const v = Number(c.dataset.v);
      const place = c.dataset.place;
      const ok = parts.some((p) => p.v === v) && !placed[place];
      if (!ok) {
        missed = true;
        wiggle(c);
        speak(sayNum(v));
        hinter.miss(cards.find((x) => x.parentElement === tray && parts.some((p) => p.v === Number(x.dataset.v)) && !placed[x.dataset.place]));
        return;
      }
      // 카드는 상자 안에서 자기 자리에 맞춰 겹친다 (뒤의 0은 작은 자리 카드가 덮는다)
      placed[place] = c;
      c.classList.add('in');
      box.append(c);
      [...box.children].sort((a, b) => Number(b.dataset.v) - Number(a.dataset.v)).forEach((x) => box.append(x));
      sfx.pop();
      pop(box);
      goal.querySelector(`.pv-bars .p-${place}`)?.classList.add('on');
      const sum = Object.values(placed).reduce((a, x) => a + Number(x.dataset.v), 0);
      if (sum !== target) { speak(sayNum(v)); return; }
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      box.classList.add('done');
      sfx.correct();
      cheer(box);
      burst(box, ['⭐', '✨']);
      speak(sayNum(target));
      tray.querySelectorAll('.pv-card').forEach((x) => x.classList.add('fall'));
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
    }

    ctx.prompt(`자릿값 카드를 상자에 겹쳐 놓아 ${target}${eul(target)} 만들어요! 카드를 누르거나 끌어요.`, () => speak([...[sayNum(target)].flat(), '만들어요!']));
  }

  round();
}
