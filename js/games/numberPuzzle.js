import { h, shuffle, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { numEn, NATIVE_NUM } from '../data.js';
import { draggable, hits } from './dragTap.js';

const TINTS = ['#F2B630', '#F08A3A', '#E0404B', '#8B4FC4', '#3FB3A8', '#4A90E2', '#5DBB63', '#E2689F', '#B9763A', '#35A3B8'];
// 단계별: 판의 수, 조각을 순서대로 줄지, 한 번에 보이는 조각 수, 조각이 영어 낱말인지
const CFG = [
  { nums: [1, 2, 3, 4, 5], ordered: true, show: 2 },
  { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], show: 3 },
  { nums: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], show: 3 },
  { nums: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], show: 3 },
  { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], show: 3, words: true },
];
// 수학판은 참고 영상처럼 1단계부터 1~10 판에 차례대로 끼운다 (2단계부터는 영어판과 같다)
const CFG_KO = [{ nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], ordered: true, show: 3 }, ...CFG.slice(1)];

// 숫자 퍼즐(NumberPuzzle): 나무판에 새겨진 숫자 홈에 같은 숫자 조각을 끼우고, 영어 이름을 듣는다
// 수학판(숫자 퍼즐, ctx.lang 'ko'): 숫자를 한국어로 읽고, 5단계 낱말 조각은 '셋'처럼 고유어
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  const en = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  const numEnOrKo = (n) => (ko ? String(n) : numEn(n));
  const wordOf = (n) => (ko ? NATIVE_NUM[n - 1] : numEn(n));
  const cfg = (ko ? CFG_KO : CFG)[ctx.level - 1];
  const hinter = makeHinter();
  const board = h('div', { class: `np-board${cfg.nums.length <= 5 ? ' one' : ''}` });
  const tray = h('div', { class: 'np-tray' });
  stage.append(h('div', { class: 'num-puzzle' }, board, tray));
  const tint = (n) => TINTS[(cfg.nums.indexOf(n)) % TINTS.length];
  const holes = new Map();
  let sel = null;
  let firstTry = 0;
  let placed = 0;
  const total = cfg.nums.length;

  board.replaceChildren(...cfg.nums.map((n) => {
    const s = h('button', { class: 'np-hole', type: 'button', style: { '--tint': tint(n) }, 'aria-label': `${n} 자리` }, h('span', {}, n));
    s.addEventListener('click', () => {
      if (s.classList.contains('filled')) { sfx.tap(); pop(s); en(numEnOrKo(n)); return; }
      if (sel) place(sel, s);
    });
    holes.set(n, s);
    return s;
  }));

  const queue = cfg.ordered ? [...cfg.nums] : shuffle(cfg.nums);
  function piece(n, i) {
    const word = cfg.words ? wordOf(n) : numEnOrKo(n);
    const p = h('button', {
      class: `np-piece${cfg.words ? ' word' : ''}`,
      type: 'button',
      style: { '--tint': tint(n), '--r': `${randInt(-8, 8)}deg`, animationDelay: `${0.1 + i * 0.12}s` },
      'aria-label': `${cfg.words ? word : n} 조각`,
    }, cfg.words ? word : String(n));
    p.dataset.n = n;
    p.dataset.miss = '0';
    draggable(p, {
      onDrop: (pt) => {
        const s = [...holes.values()].find((x) => !x.classList.contains('filled') && hits(x, pt, 2));
        if (s) place(p, s);
        else wiggle(p);
      },
    });
    p.addEventListener('click', () => {
      sfx.tap();
      en(word);
      if (sel === p) { p.classList.remove('sel'); sel = null; return; }
      sel?.classList.remove('sel');
      sel = p;
      p.classList.add('sel');
    });
    return p;
  }
  function refill() {
    while (tray.children.length < cfg.show && queue.length) tray.append(piece(queue.shift(), tray.children.length));
  }

  function place(p, s) {
    const n = Number(p.dataset.n);
    const target = holes.get(n);
    if (s !== target) {
      p.dataset.miss = String(Number(p.dataset.miss) + 1);
      wiggle(p);
      wiggle(s);
      hinter.miss(target);
      return;
    }
    hinter.reset();
    if (sel === p) sel = null;
    p.remove();
    if (p.dataset.miss === '0') firstTry++;
    s.classList.add('filled');
    s.setAttribute('aria-label', `${n} ${wordOf(n)}`);
    if (cfg.words) s.append(h('small', {}, wordOf(n)));
    pop(s);
    sfx.pop();
    en(numEnOrKo(n));
    placed++;
    ctx.progress(placed, total);
    refill();
    if (placed < total) return;
    // 다 끼우면 숫자가 차례로 통통 튀며 영어로 하나씩 센다
    ctx.later(() => { sfx.correct(); cheer(board, ko ? 'ko' : 'en'); }, 700);
    cfg.nums.forEach((k, i) => ctx.later(() => {
      const el = holes.get(k);
      el.classList.add('sing');
      ctx.later(() => el.classList.remove('sing'), 520);
      en(numEnOrKo(k));
    }, 1700 + i * 680));
    ctx.later(() => ctx.finish({ firstTry, total }), 1700 + total * 680 + 900);
  }

  ctx.progress(0, total);
  refill();
  ctx.prompt(
    ko ? (cfg.words ? '숫자 낱말을 읽고, 같은 숫자 홈에 끼워요!' : '숫자 조각을 같은 모양의 홈에 끼우고, 소리 내어 읽어 봐요!')
      : cfg.words ? '영어 숫자 낱말을 읽고, 같은 숫자 홈에 끼워요!' : '숫자 조각을 같은 모양의 홈에 끼우고, 영어로 읽어 봐요!',
    () => en(ko ? (cfg.words ? '숫자 낱말을 읽고 끼워요!' : '숫자 조각을 같은 모양 홈에 끼워요!') : cfg.words ? 'Read the number words!' : 'Put the numbers in place!'),
  );
}
