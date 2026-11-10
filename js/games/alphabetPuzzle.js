import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const BOARDS = 3;
// 알파벳 노래처럼 일곱·일곱·여섯·여섯 줄
const ROWS = ['ABCDEFG', 'HIJKLMN', 'OPQRST', 'UVWXYZ'];
const ABC = ROWS.join('');
// 단계별: 빈 자리 수, 소문자 판인지, 빈 자리에 글자 모양 홈이 보이는지 (안 보이면 알파벳 순서로 찾기)
const CFG = [
  { holes: 2, lower: false, shape: true },
  { holes: 3, lower: false, shape: true },
  { holes: 3, lower: true, shape: true },
  { holes: 4, lower: false, shape: false },
  { holes: 5, lower: true, shape: false },
];
const TINTS = ['#E8574F', '#F08A3A', '#E3AE1F', '#58B45F', '#35A3B8', '#4A7FE0', '#9265D3', '#E2689F'];
const tint = (L) => TINTS[ABC.indexOf(L) % TINTS.length];

// 알파벳 퍼즐(AlphabetPuzzle): 나무판의 빈 자리에 알파벳 조각을 끌어다 끼운다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const board = h('div', { class: 'ab-board' });
  const tray = h('div', { class: 'ab-tray' });
  stage.append(h('div', { class: 'abc-puzzle' }, board, tray));
  // 영어 차시: 빈 자리는 오늘 배우는 글자에서. 알파벳 단계(A · B)는 대문자판 · 소문자판을 번갈아 낸다
  const unit = ctx.unit;
  const lowerAt = (k) => (unit?.track === 'alpha' ? k % 2 === 1 : cfg.lower);
  let lower = lowerAt(0);
  const face = (L) => (lower ? L.toLowerCase() : L);
  const say = (L) => speak(L, 'en-US');
  let b = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(b, BOARDS);
    lower = lowerAt(b);
    const missing = new Set(unit ? pickN(unit.letters(Math.max(cfg.holes, unit.focus.length), { review: false }), cfg.holes) : pickN(ABC.split(''), cfg.holes));
    const cells = new Map();
    let sel = null;
    let left = missing.size;

    board.classList.remove('out', 'wave');
    board.replaceChildren(...ROWS.map((row) => h('div', { class: 'ab-row' }, row.split('').map((L) => {
      const hole = missing.has(L);
      const el = h('button', {
        class: `ab-cell${hole ? ` hole${cfg.shape ? '' : ' blank'}` : ''}`,
        type: 'button',
        style: { '--tint': tint(L), '--i': ABC.indexOf(L) },
        'aria-label': hole ? '빈 자리' : L,
      }, h('span', {}, face(L)));
      el.addEventListener('click', () => {
        if (el.classList.contains('hole')) {
          if (sel) place(sel, el);
          return;
        }
        sfx.tap();
        pop(el);
        say(L);
      });
      cells.set(L, el);
      return el;
    }))));

    const pieces = shuffle([...missing]).map((L, i) => {
      const p = h('button', {
        class: 'ab-piece',
        type: 'button',
        style: { '--tint': tint(L), animationDelay: `${0.25 + i * 0.12}s` },
        'aria-label': `${L} 조각`,
      }, face(L));
      p.dataset.l = L;
      p.dataset.miss = '0';
      draggable(p, {
        onDrop: (pt) => {
          const hole = [...cells.values()].find((c) => c.classList.contains('hole') && hits(c, pt, 6));
          if (hole) place(p, hole);
          else wiggle(p);
        },
      });
      p.addEventListener('click', () => {
        sfx.tap();
        say(L);
        if (sel === p) {
          p.classList.remove('sel');
          sel = null;
          return;
        }
        sel?.classList.remove('sel');
        sel = p;
        p.classList.add('sel');
      });
      return p;
    });
    tray.replaceChildren(...pieces);

    function place(p, cell) {
      const L = p.dataset.l;
      const target = cells.get(L);
      if (cell !== target) {
        p.dataset.miss = String(Number(p.dataset.miss) + 1);
        wiggle(p);
        wiggle(cell);
        hinter.miss(target);
        return;
      }
      hinter.reset();
      if (sel === p) sel = null;
      p.remove();
      total++;
      if (p.dataset.miss === '0') firstTry++;
      cell.classList.remove('hole', 'blank');
      cell.classList.add('placed');
      cell.setAttribute('aria-label', L);
      pop(cell);
      sfx.pop();
      say(L);
      left--;
      ctx.progress(b + (missing.size - left) / missing.size, BOARDS);
      if (left > 0) return;
      // 판 완성: 글자들이 차례로 통통 튀고, 판이 사라졌다가 새 판이 나온다
      ctx.later(() => {
        sfx.correct();
        cheer(board, 'en');
        board.classList.add('wave');
      }, 600);
      ctx.later(() => board.classList.add('out'), 2300);
      ctx.later(() => {
        b++;
        if (b >= BOARDS) ctx.finish({ firstTry, total });
        else round();
      }, 2800);
    }

    ctx.prompt(
      cfg.shape ? '빈 자리 모양을 보고, 꼭 맞는 알파벳 조각을 끌어다 끼워요!' : '알파벳 순서를 떠올리며, 빈 자리에 들어갈 조각을 끼워요!',
      () => speak('Find the missing letters!', 'en-US'),
    );
  }

  round();
}
