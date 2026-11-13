import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const SHIPS = 3;
// 단계(Lv)마다: 배 한 척의 문장(빈칸) 수, 섞는 함정 조각 수
const LINES = [1, 2, 2, 2, 3];
const TRAPS = [1, 1, 2, 2, 2];
const say = (t) => speak(t, 'en-US');

// 배를 고치자(FixtheShip): 부두의 배 옆구리에 쓰인 문장에 빠진 조각(낱말 · 구)이 있어요.
// 부두에 놓인 나무 조각을 빈칸에 끼우면 배가 다 고쳐져 돛을 올리고 선원들과 떠난다 (참고 영상: "This person works in a spaceship.")
export function mount(stage, ctx) {
  const L = ctx.level;
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= L)));
  const hinter = makeHinter();
  const k = LINES[L - 1];
  const pool = U.sentences(SHIPS * k + 3).filter((s) => /[A-Za-z]/.test(s.answer || ''));
  const hull = h('div', { class: 'fs-hull latin' });
  const ship = h('div', { class: 'fs-ship' }, h('div', { class: 'fs-mast', 'aria-hidden': 'true' }, h('span', { class: 'fs-sail' }), h('span', { class: 'fs-sail small' })), h('div', { class: 'fs-crew', 'aria-hidden': 'true' }, '🧑‍✈️👷👩‍✈️'), hull);
  const dock = h('div', { class: 'fs-dock' });
  stage.append(h('div', { class: 'fix-ship' }, h('div', { class: 'fs-sea' }, h('span', { class: 'fs-light', 'aria-hidden': 'true' }, '🗼'), ship), dock));
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, SHIPS);
    const lines = pool.slice(n * k, (n + 1) * k);
    ship.className = 'fs-ship arrive';
    const slots = [];
    hull.replaceChildren(...lines.map((s) => {
      const g = h('button', { class: 'fs-slot', type: 'button', 'aria-label': '빈칸' });
      g.dataset.w = s.answer;
      slots.push(g);
      const glue = /^[.,?!]/.test(s.after) ? '' : ' ';
      return h('p', { class: 'fs-line' }, s.before ? `${s.before} ` : '', g, s.after ? `${glue}${s.after}` : '');
    }));
    total += slots.length;
    const traps = pickN([...new Set(lines.flatMap((s) => s.wrong || []))].filter((w) => !slots.some((g) => g.dataset.w === w)), TRAPS[L - 1]);
    let sel = null;
    const planks = shuffle([...slots.map((g) => g.dataset.w), ...traps]).map((w, i) => {
      const p = h('button', { class: 'fs-plank latin', type: 'button', style: { '--r': `${randInt(-4, 4)}deg`, animationDelay: `${i * 0.08}s` } }, w);
      p.dataset.w = w;
      p.dataset.miss = '0';
      draggable(p, {
        onDrop: (pt) => {
          const g = slots.find((x) => !x.classList.contains('full') && hits(x, pt, 10));
          if (g) put(p, g);
          else wiggle(p);
        },
      });
      p.addEventListener('click', () => {
        sfx.tap();
        say(w);
        // 빈칸이 하나 남았으면 바로 끼워 보고, 아니면 골라 두었다가 빈칸을 누른다
        const open = slots.filter((x) => !x.classList.contains('full'));
        if (open.length === 1) { put(p, open[0]); return; }
        sel?.classList.remove('sel');
        sel = sel === p ? null : p;
        sel?.classList.add('sel');
      });
      return p;
    });
    slots.forEach((g) => g.addEventListener('click', () => { if (sel) put(sel, g); }));
    dock.replaceChildren(...planks);

    function put(p, g) {
      if (p.dataset.w !== g.dataset.w) {
        p.dataset.miss = '1';
        wiggle(p);
        wiggle(g);
        hinter.miss(planks.find((x) => x.isConnected && x.dataset.w === g.dataset.w) || null);
        return;
      }
      hinter.reset();
      if (sel === p) sel = null;
      if (p.dataset.miss === '0') firstTry++;
      p.remove();
      g.textContent = g.dataset.w;
      g.classList.add('full');
      pop(g);
      sfx.pop();
      say(g.dataset.w);
      if (!slots.every((x) => x.classList.contains('full'))) return;
      // 다 고쳤다: 반짝 → 돛 · 선원 → 출항
      dock.replaceChildren();
      ship.classList.add('fixed');
      sfx.correct();
      say(lines.map((s) => s.text));
      cheer(ship, 'en');
      ctx.later(() => ship.classList.add('sail'), 1500 + lines.length * 700);
      ctx.later(() => {
        n++;
        if (n < SHIPS) round();
        else ctx.finish({ firstTry, total });
      }, 3400 + lines.length * 700);
    }
    ctx.prompt('배에 쓰인 문장의 빈칸에 알맞은 나무 조각을 끼워 배를 고쳐요. 다 고치면 배가 떠나요!', () => say("Let's fix the ship!"));
  }

  round();
}
