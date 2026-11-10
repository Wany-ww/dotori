import { h, shuffle, pick, pickN, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO_SOUND, JUNG_SOUND, JAMO_NAME, QUIZ_SYLLABLES, QUIZ_BATCHIM, similarSyllables } from '../data.js';
import { scatter, placeStyle, flyAway } from './cardTable.js';

const BOARDS = 2;
// 단계별: 짝 수, 겹쳐 놓는 카드 수, 글자 묶음 (기본 자음 → 모든 자음 → 모음 → 글자 → 받침 글자)
const CFG = [
  { pairs: 4, piles: 0, pool: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'], name: '자음' },
  { pairs: 5, piles: 1, pool: Object.keys(CHO_SOUND), name: '자음' },
  { pairs: 5, piles: 2, pool: Object.keys(JUNG_SOUND), name: '모음' },
  { pairs: 6, piles: 2, pool: QUIZ_SYLLABLES, name: '글자', alike: true },
  { pairs: 7, piles: 3, pool: QUIZ_BATCHIM, name: '받침 글자', alike: true },
];
// 짝끼리 글꼴과 색을 다르게 해서 "모양은 달라도 같은 글자"를 찾게 한다
// [글꼴, 크기 보정] — 글꼴마다 낱자가 그려지는 크기가 달라서 비슷한 크기로 맞춘다
const FONTS = [
  ["'Jua'", 1.05], ["'Do Hyeon'", 1.1], ["'Black Han Sans'", 0.85], ["'Gaegu'", 1.45],
  ["'Yeon Sung'", 1.05], ["'Gowun Dodum'", 1.15], ["'Sunflower'", 1.1], ["'Gugi'", 0.95],
];
const STYLES = [
  ['#2F4C7E', '#FFD34E'], ['#E6EDF3', '#2F4C7E'], ['#FFFFFF', '#F06A92'], ['#3BAE8A', '#FFFFFF'], ['#F5C542', '#5A3A8C'],
  ['#F28C48', '#FFFFFF'], ['#A98BEA', '#FFFFFF'], ['#FFF4D6', '#1F9E74'], ['#2C9BE0', '#FFFFFF'], ['#FFE1EA', '#D2386A'],
];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Black+Han+Sans&family=Gaegu:wght@700&family=Yeon+Sung&family=Sunflower:wght@700&family=Gugi&display=swap';

function loadFonts() {
  if (document.getElementById('letter-fonts')) return;
  document.head.append(h('link', { id: 'letter-fonts', rel: 'stylesheet', href: FONT_HREF }));
}

// 한 판의 글자: Lv4부터는 모양이 비슷한 글자(가/거/고)를 일부러 함께 놓는다
function letters(cfg) {
  if (!cfg.alike) return pickN(cfg.pool, cfg.pairs);
  const seed = pick(cfg.pool);
  const family = [seed, ...(cfg.like || similarSyllables)(seed).slice(0, 2)];
  return shuffle([...new Set([...family, ...pickN(cfg.pool.filter((s) => !family.includes(s)), cfg.pairs)])].slice(0, cfg.pairs));
}

// 차시의 글자 묶음: 낱자를 배우는 차시는 낱자, 그 뒤로는 그 차시의 글자
function lessonCfg(base, lesson) {
  const jamoKinds = ['vocab', 'jamoShape', 'theme', 'vowel', 'cons', 'diph'];
  if (jamoKinds.includes(lesson.kind)) {
    const pool = [...new Set(lesson.jamo(base.pairs * 2))];
    const name = lesson.slot === 'jung' ? '모음' : lesson.slot === 'cho' ? '자음' : '낱자';
    return { ...base, pool, name, alike: false };
  }
  const pool = [...new Set(lesson.syllables(base.pairs * 2))];
  return { ...base, pool, name: lesson.batchim ? '받침 글자' : '글자', alike: base.pairs >= 6, like: (s) => lesson.alike(s, 2) };
}

// 같은 글자 짝 찾기(FindThePair): 책상 위에 흩어진 글자 카드에서 글꼴·색이 달라도 같은 글자인 두 장을 찾는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = ctx.lesson ? lessonCfg(CFG[L - 1], ctx.lesson) : CFG[L - 1];
  loadFonts();
  const hinter = makeHinter();
  const bubble = h('span', { class: 'ft-bubble' }, `🔠 ${cfg.name} 카드`);
  const table = h('div', { class: 'ft-table' });
  stage.append(h('div', { class: 'flashtable' }, h('div', { class: 'ft-host' }, h('span', { class: 'ft-friend', 'aria-hidden': 'true' }, '🐿️'), bubble), table));
  let b = 0;
  let total = 0;
  let misses = 0;

  function board() {
    hinter.reset();
    ctx.progress(b, BOARDS);
    const chars = letters(cfg);
    total += chars.length;
    const faces = shuffle(chars.flatMap((c, i) => {
      const [f1, f2] = pickN(FONTS, 2);
      const [s1, s2] = pickN(STYLES, 2);
      return [{ id: i, c, font: f1, style: s1 }, { id: i, c, font: f2, style: s2 }];
    }));
    table.replaceChildren();
    const place = scatter(table, faces.length, cfg.piles);

    let found = 0;
    let sel = null;
    const cards = faces.map((f, i) => {
      const el = h('button', {
        // 낱자(ㄱ, ㅏ)는 글꼴 안에서 작게 그려져서 더 크게 보여 준다
        class: `tcard letter${f.c.charCodeAt(0) < 0xac00 ? ' jamo' : ''}`,
        type: 'button',
        'aria-label': `글자 카드 ${f.c}`,
        style: { ...placeStyle(place[i]), '--tc': f.style[0], '--fg': f.style[1], '--font': f.font[0], '--fs': f.font[1] },
      }, h('span', { class: 'tcard-face' }, f.c));
      el.addEventListener('click', () => choose(el, f));
      return el;
    });

    const say = (f) => speak(JAMO_NAME[f.c] || f.c);

    function choose(el, f) {
      if (el.disabled) return;
      sfx.tap();
      if (!sel) {
        sel = { el, f };
        el.classList.add('sel');
        say(f);
        return;
      }
      if (sel.el === el) {
        el.classList.remove('sel');
        sel = null;
        return;
      }
      const a = sel;
      sel = null;
      a.el.classList.remove('sel');
      if (a.f.id === f.id) {
        hinter.reset();
        say(f);
        sfx.correct();
        cheer(el);
        flyAway(table, [a.el, el], ctx.later);
        found++;
        ctx.progress(b + found / chars.length, BOARDS);
        if (found < chars.length) return;
        ctx.later(() => {
          b++;
          if (b >= BOARDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
          else board();
        }, 1500);
        return;
      }
      misses++;
      wiggle(a.el);
      wiggle(el);
      // 먼저 고른 카드의 짝을 반짝여 알려 준다
      hinter.miss(cards.find((c, i) => !c.disabled && faces[i].id === a.f.id && c !== a.el));
    }

    table.replaceChildren(...cards);
    ctx.prompt(
      '글씨 모양과 색이 달라도 같은 글자예요. 같은 글자 카드 두 장을 찾아 차례로 눌러요!',
      () => speak('모양은 달라도 같은 글자를 찾아 볼까요?'),
    );
  }

  board();
}
