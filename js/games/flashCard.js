import { h, shuffle, pickN, wiggle, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { FLASH_SETS } from '../data.js';
import { scatter, placeStyle, flyAway } from './cardTable.js';

const BOARDS = 2;
// 단계별: 짝 수, 겹쳐 놓는 카드 수, 짝의 종류(같은 그림 / 그림↔낱말), 낱말 카드를 읽어 주는지
const CFG = [
  { pairs: 4, piles: 0, word: false, read: true },
  { pairs: 4, piles: 1, word: true, read: true },
  { pairs: 5, piles: 2, word: true, read: true },
  { pairs: 6, piles: 3, word: true, read: false },
  { pairs: 7, piles: 4, word: true, read: false },
];
const COLORS = ['#6FC48A', '#4FA3DD', '#F2994A', '#F088A8', '#A68AEA', '#EFC03A'];

// 낱말 카드(FlashCard): 나무 책상 위에 흩어져 겹친 카드에서 그림과 낱말의 짝을 찾는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = { ...CFG[L - 1] };
  const hinter = makeHinter();
  const bubble = h('span', { class: 'ft-bubble' });
  const table = h('div', { class: 'ft-table' });
  stage.append(h('div', { class: 'flashtable' }, h('div', { class: 'ft-host' }, h('span', { class: 'ft-friend', 'aria-hidden': 'true' }, '🐿️'), bubble), table));
  // 한글 차시: 그 차시의 그림 낱말로 두 판을 만든다. 그림 낱말 차시(1-1)는 같은 그림 짝, 통글자 차시는 낱말을 읽어 준다
  const lesson = ctx.lesson;
  const THEME_NAME = { fruit: '과일', veg: '채소', food: '음식', animal: '동물', family: '가족', clothes: '옷', school: '학용품' };
  const lessonSets = () => {
    const ws = lesson.words(cfg.pairs * BOARDS, { pic: true }).map((w) => [w.word, w.emoji]);
    const name = lesson.kind === 'theme' ? lesson.themes.map((t) => THEME_NAME[t]).join('·')
      : lesson.kind === 'rule' ? lesson.ruleName : '오늘의 낱말';
    return Array.from({ length: BOARDS }, (_, i) => ({ name, e: '🃏', words: ws.slice(i * cfg.pairs, (i + 1) * cfg.pairs) }));
  };
  if (lesson) {
    cfg.word = lesson.kind !== 'vocab';
    cfg.read = lesson.early || cfg.read;
  }
  const sets = lesson ? lessonSets() : shuffle(FLASH_SETS.filter((s) => s.words.length >= cfg.pairs)).slice(0, BOARDS);
  let b = 0;
  let total = 0;
  let misses = 0;

  function board() {
    hinter.reset();
    ctx.progress(b, BOARDS);
    const set = sets[b];
    const pairs = pickN(set.words, cfg.pairs).map(([word, emoji]) => ({ word, emoji }));
    total += pairs.length;
    bubble.textContent = `${set.e} ${set.name} 카드`;

    // 같은 그림 짝은 카드 색도 같게 (참고 영상처럼)
    const colors = shuffle(COLORS);
    const faces = shuffle(pairs.flatMap((w, i) => [{ id: i, w, kind: 'pic' }, { id: i, w, kind: cfg.word ? 'word' : 'pic' }]));
    table.replaceChildren();
    const place = scatter(table, faces.length, cfg.piles);

    let found = 0;
    let sel = null;
    const cards = faces.map((f, i) => {
      const el = h('button', {
        class: `tcard ${f.kind}${f.w.word.length >= 3 ? ' long' : ''}`,
        type: 'button',
        'aria-label': f.kind === 'pic' ? `${f.w.word} 그림 카드` : `낱말 카드 ${f.w.word}`,
        style: { ...placeStyle(place[i]), '--tc': f.kind === 'pic' ? colors[f.id % colors.length] : '#fff' },
      }, h('span', { class: 'tcard-face' }, f.kind === 'pic' ? wordPic(f.w.word, f.w.emoji) : f.w.word));
      el.addEventListener('click', () => choose(el, f));
      return el;
    });

    function say(f) {
      if (f.kind === 'pic' || cfg.read) speak(f.w.word);
    }

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
        ctx.progress(b + found / pairs.length, BOARDS);
        if (found < pairs.length) return;
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
      cfg.word ? '그림 카드와 같은 낱말 카드를 찾아 두 장을 차례로 눌러요!' : '똑같은 그림 카드 두 장을 찾아 차례로 눌러요!',
      () => speak(cfg.word ? '그림과 낱말이 같은 카드를 찾아 볼까요?' : '같은 그림을 맞춰 봐요!'),
    );
  }

  board();
}
