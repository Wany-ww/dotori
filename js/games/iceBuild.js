import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const R = 5;
// 단계(Lv)마다: 비우는 낱말 수, 섞는 함정 얼음 수
const GAPS = [1, 2, 3, 3, 4];
const TRAPS = [0, 0, 1, 1, 2];
const say = (t) => speak(t, 'en-US');

// 얼음 맞추기(BreaknBuild): 문장 얼음다리의 빈 곳에 물 위에 뜬 낱말 얼음을 맞춰 넣는다.
// 다리가 이어지면 펭귄 한 마리가 미끄러져 건너가 생선을 먹는다 (참고 영상: "It will be chilly tomorrow.")
export function mount(stage, ctx) {
  const L = ctx.level;
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= L)));
  const hinter = makeHinter();
  const pool = U.sentences(12);
  // 낱말이 너무 많은 문장은 다리에 다 안 들어가서, 짧은 문장부터
  const rounds = [...pool].sort((a, b) => a.words.length - b.words.length).slice(0, R);
  const penguins = h('div', { class: 'ib-penguins', 'aria-hidden': 'true' }, rounds.map(() => h('span', {}, '🐧')));
  const bridge = h('div', { class: 'ib-bridge latin' });
  const water = h('div', { class: 'ib-water' });
  const slider = h('span', { class: 'ib-slider', 'aria-hidden': 'true' }, '🐧');
  stage.append(h('div', { class: 'ice-build' },
    h('div', { class: 'ib-sky' }, penguins, h('span', { class: 'ib-fish', 'aria-hidden': 'true' }, '🐟🐟'), slider),
    h('div', { class: 'ib-cliffs' }, h('span', { class: 'ib-cliff' }), bridge, h('span', { class: 'ib-cliff right' })),
    water));
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, rounds.length);
    const s = rounds[n];
    // 문장 끝 문장부호는 다리 끝 조각으로 따로
    const toks = s.text.replace(/([.?!])$/, ' $1').split(' ');
    const words = toks.map((w, i) => ({ w, i })).filter((x) => /[A-Za-z]/.test(x.w));
    // 빈 곳: 그 문장의 정답 낱말을 먼저, 모자라면 다른 낱말
    const ans = words.find((x) => x.w.replace(/[^A-Za-z']/g, '').toLowerCase() === String(s.answer).toLowerCase());
    const k = Math.min(GAPS[L - 1], words.length - 1);
    const gapIdx = new Set([...(ans ? [ans.i] : []), ...pickN(words.filter((x) => x !== ans).map((x) => x.i), k)].slice(0, Math.max(1, k)));
    const gaps = [];
    bridge.replaceChildren(...toks.map((w, i) => {
      if (!gapIdx.has(i)) return h('span', { class: `ib-block${/^[.?!]$/.test(w) ? ' end' : ''}` }, w);
      const g = h('span', { class: 'ib-gap', 'aria-label': '빈 곳' });
      g.dataset.w = w;
      gaps.push(g);
      return g;
    }));
    total += gaps.length;
    const traps = pickN([...new Set(pool.flatMap((x) => x.words).map((w) => w.replace(/[^A-Za-z']/g, '')).filter((w) => w && !toks.includes(w)))], TRAPS[L - 1]);
    let sel = null;
    const blocks = shuffle([...gaps.map((g) => g.dataset.w), ...traps]).map((w, i) => {
      const b = h('button', { class: 'ib-ice latin', type: 'button', style: { left: `${8 + ((i * 29 + randInt(0, 10)) % 80)}%`, top: `${12 + (i % 2) * 40 + randInt(0, 10)}%`, animationDelay: `${i * 0.4}s` } }, w);
      b.dataset.w = w;
      b.dataset.miss = '0';
      draggable(b, {
        onDrop: (pt) => {
          const g = gaps.find((x) => !x.classList.contains('full') && hits(x, pt, 10));
          if (g) put(b, g);
          else wiggle(b);
        },
      });
      b.addEventListener('click', () => {
        sfx.tap();
        say(w);
        // 누르면 맞는 빈 곳으로 날아가 붙는다 (맞는 곳이 없으면 고른 채로 두고, 빈 곳을 눌러 붙인다)
        const g = gaps.find((x) => !x.classList.contains('full') && x.dataset.w === w);
        if (g) { put(b, g); return; }
        sel?.classList.remove('sel');
        sel = sel === b ? null : b;
        sel?.classList.add('sel');
      });
      return b;
    });
    gaps.forEach((g) => g.addEventListener('click', () => { if (sel) put(sel, g); }));
    water.replaceChildren(...blocks);

    function put(b, g) {
      if (b.dataset.w !== g.dataset.w) {
        b.dataset.miss = '1';
        wiggle(b);
        hinter.miss(blocks.find((x) => x.isConnected && x.dataset.w === g.dataset.w) || null);
        return;
      }
      hinter.reset();
      if (sel === b) sel = null;
      if (b.dataset.miss === '0') firstTry++;
      b.remove();
      g.textContent = g.dataset.w;
      g.classList.add('full');
      pop(g);
      sfx.pop();
      if (!gaps.every((x) => x.classList.contains('full'))) return;
      // 다리가 이어졌다: 함정 얼음은 녹고, 펭귄이 미끄러져 건넌다
      water.replaceChildren();
      sfx.correct();
      say(s.text);
      penguins.children[n]?.classList.add('gone');
      slider.classList.remove('go');
      void slider.offsetWidth;
      slider.classList.add('go');
      cheer(bridge, 'en');
      ctx.later(() => {
        n++;
        if (n < rounds.length) round();
        else ctx.finish({ firstTry, total });
      }, 2600);
    }
    ctx.prompt('얼음 조각을 빈 곳에 맞춰 문장 다리를 이어 주세요. 펭귄이 생선을 먹으러 건너가요!', () => say('Help the penguin!'));
  }

  round();
}
