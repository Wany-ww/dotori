import { h, shuffle, pick, wiggle, pop, cheer, makeHinter, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO_SOUND, JUNG_SOUND, JONG_SOUND, JAMO_NAME, compose } from '../data.js';

const R = 4;
const CARDS = [6, 8, 8, 9, 10];
const MATCH = [2, 3, 3, 3, 4];
// 단계별 말소리: 첫소리 → 첫소리 → 모음 → 받침 → 섞어서
const KIND = [['c'], ['c'], ['j'], ['t'], ['c', 'j', 't']];
const CS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const VS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'];
const TS = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
const syl = (c, j, t = '') => compose(c, j, t || 0);

// 말소리 발표(PhonicsPresentation): 토리가 발표할 말소리를 듣고, 그 소리가 나는 글자를 모두 찾아 발표판에 붙인다
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const podium = h('div', { class: 'fa-podium' }, h('span', { class: 'fa-tori' }, charFace('tori', '🐿️')), h('div', { class: 'fa-board', 'aria-live': 'polite' }));
  const grid = h('div', { class: 'fa-grid' });
  stage.append(h('div', { class: 'find-all' }, podium, grid));
  const board = podium.querySelector('.fa-board');
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const kind = pick(KIND[L - 1]);
    const target = pick(kind === 'c' ? CS : kind === 'j' ? VS : TS);
    const make = (has) => {
      const c = kind === 'c' ? (has ? target : pick(CS.filter((x) => x !== target))) : pick(CS);
      const j = kind === 'j' ? (has ? target : pick(VS.filter((x) => x !== target))) : pick(VS);
      const t = kind === 't' ? (has ? target : pick(['', ...TS.filter((x) => x !== target)])) : L >= 4 && Math.random() < 0.3 ? pick(TS) : '';
      return syl(c, j, t);
    };
    const yes = new Set();
    while (yes.size < MATCH[L - 1]) yes.add(make(true));
    const no = new Set();
    while (no.size < CARDS[L - 1] - yes.size) { const s = make(false); if (!yes.has(s)) no.add(s); }
    const sound = kind === 'c' ? CHO_SOUND[target] : kind === 'j' ? JUNG_SOUND[target] : JONG_SOUND[target];
    const say = kind === 't' ? `받침 ${JAMO_NAME[target]}, ${sound}` : `${JAMO_NAME[target]}, ${sound}`;
    let found = 0;
    total += yes.size;
    let missed = false;
    board.replaceChildren(h('b', {}, kind === 't' ? `받침 ${target}` : target), h('span', { class: 'fa-found' }));
    const cards = shuffle([...yes, ...no]).map((s) => {
      const b = h('button', { class: 'fa-card', type: 'button' }, s);
      const ok = yes.has(s);
      b.dataset.ok = ok ? '1' : '';
      b.addEventListener('click', () => {
        if (b.classList.contains('got')) return;
        speak(s);
        if (!ok) {
          missed = true;
          wiggle(b);
          hinter.miss(cards.find((x) => x.dataset.ok && !x.classList.contains('got')));
          return;
        }
        hinter.reset();
        sfx.pop();
        b.classList.add('got');
        pop(b);
        board.querySelector('.fa-found').append(h('span', {}, s));
        found++;
        ctx.progress(n + found / yes.size, R);
        if (found < yes.size) return;
        if (!missed) firstTry += yes.size; else firstTry += Math.max(0, yes.size - 1);
        // 다 찾으면 토리가 발표한다
        sfx.correct();
        podium.classList.add('present');
        cheer(board);
        speak([...yes]);
        ctx.later(() => {
          podium.classList.remove('present');
          n++;
          if (n >= R) ctx.finish({ firstTry, total });
          else round();
        }, 2400);
      });
      return b;
    });
    grid.replaceChildren(...cards);
    const what = kind === 'c' ? '첫소리' : kind === 'j' ? '모음 소리' : '받침 소리';
    ctx.prompt(`토리가 '${kind === 't' ? `받침 ${target}` : target}' ${what}를 발표해요. 이 소리가 나는 글자를 모두 찾아 주세요!`, () => speak(say));
  }

  round();
}
