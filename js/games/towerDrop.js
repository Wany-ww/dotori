import { h, shuffle, pickN, wiggle, pop, cheer, charFace, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const WORDS = 5;
const CANDY = 5;
const BAR_COLORS = ['#F06A3C', '#F6C343', '#4FC3F7', '#7DDB3A', '#B28DF0'];
// 단계(Lv)마다: 단어 길이, 글자판 글자 수, 그림을 보면서 소리를 저절로 들려주는지
const CFG = [
  { maxLen: 3, keys: 6, auto: true },
  { maxLen: 4, keys: 7, auto: true },
  { maxLen: 5, keys: 8, auto: true },
  { maxLen: 6, keys: 9, auto: false },
  { maxLen: 7, keys: 10, auto: false },
];
const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');

// 낙하탑 낱말 맞히기(TowerDrop): 그림과 소리를 보고 빈칸에 글자를 골라 낱말을 완성한다.
// 사탕(도전 기회) 5개가 탑의 막대 5개 — 틀린 글자를 고를 때마다 사탕 하나를 쓰고 탑 맨 위 막대가 떨어져 다람쥐가 내려온다.
// 사탕을 다 쓰면 다람쥐가 떨어져 게임 오버 (무벌점 원칙의 예외로 정함, 2026-11-04)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= ctx.level)));
  let words = [];
  let n = 0;
  let candies = CANDY;
  let solved = 0;
  let clean = 0;

  const candyEls = Array.from({ length: CANDY }, () => h('i', { class: 'on' }, '🍬'));
  const bars = Array.from({ length: CANDY }, (_, i) => h('span', { class: 'td-bar', style: { '--c': BAR_COLORS[i] } }));
  const tori = h('div', { class: 'td-tori', 'aria-hidden': 'true' }, charFace('tori', '🐿️'));
  const tower = h('div', { class: 'td-tower', 'aria-label': `탑 막대 ${CANDY}개` }, tori, h('div', { class: 'td-bars' }, [...bars].reverse()), h('span', { class: 'td-base' }));
  const card = h('div', { class: 'td-card' });
  const slots = h('div', { class: 'td-slots' });
  const keys = h('div', { class: 'td-keys' });
  const top = h('div', { class: 'td-top' },
    h('span', { class: 'td-count' }),
    h('div', { class: 'td-candy', 'aria-label': '남은 사탕' }, h('small', {}, 'Candy'), h('span', {}, candyEls)));
  const over = h('div', { class: 'td-over', hidden: true });
  const root = h('div', { class: 'tower-drop' }, top, h('div', { class: 'td-main' }, h('div', { class: 'td-left' }, card, slots, keys), tower), over);
  stage.append(root);

  function start() {
    const all = U.words(20, { pic: true, spell: true, maxLen: cfg.maxLen, minLen: 3 });
    words = (all.length >= WORDS ? all : [...all, ...U.words(20, { pic: true, spell: true, maxLen: 7, minLen: 3 })]).slice(0, WORDS);
    n = 0;
    candies = CANDY;
    solved = 0;
    clean = 0;
    candyEls.forEach((c) => { c.className = 'on'; });
    bars.forEach((b) => b.classList.remove('fall'));
    tori.className = 'td-tori';
    tower.style.setProperty('--h', CANDY);
    over.hidden = true;
    root.classList.remove('lost');
    round();
  }

  function round() {
    const x = words[n];
    const letters = [...x.w];
    let at = 0;
    let miss = 0;
    top.firstChild.textContent = `${n + 1} / ${words.length}`;
    ctx.progress(n, words.length);
    const say = () => speak(x.w, 'en-US');
    card.replaceChildren(
      h('span', { class: 'td-pic', 'aria-hidden': 'true' }, wordPic(x.w, x.e)),
      h('button', { class: 'td-say', type: 'button', 'aria-label': '단어 듣기', onclick: () => { sfx.tap(); say(); } }, '🔊'));
    const cells = letters.map(() => h('span', { class: 'td-slot' }));
    slots.replaceChildren(...cells);
    cells[0].classList.add('now');
    // 글자판: 단어의 글자 + 함정 글자 (같은 글자는 한 번만, 여러 번 눌러 쓴다)
    const own = [...new Set(letters)];
    const extra = pickN(ABC.filter((c) => !own.includes(c)), Math.max(2, cfg.keys - own.length));
    keys.replaceChildren(...shuffle([...own, ...extra]).map((c) => {
      const b = h('button', { class: 'td-key', type: 'button' }, c);
      b.dataset.c = c;
      b.addEventListener('click', () => press(b));
      return b;
    }));
    mark();

    function mark() { keys.querySelectorAll('.td-key').forEach((b) => { b.dataset.ok = at < letters.length && b.dataset.c === letters[at] ? '1' : '0'; }); }

    function press(b) {
      if (at >= letters.length || candies <= 0) return;
      if (b.dataset.c === letters[at]) {
        sfx.pop();
        cells[at].textContent = letters[at];
        cells[at].classList.remove('now');
        cells[at].classList.add('done');
        pop(cells[at]);
        at++;
        if (at < letters.length) { cells[at].classList.add('now'); mark(); return; }
        // 낱말 완성
        solved++;
        if (miss === 0) clean++;
        sfx.correct();
        cheer(slots, 'en');
        say();
        ctx.later(() => {
          n++;
          if (n < words.length) round();
          else win();
        }, 1600);
        return;
      }
      // 틀린 글자: 사탕 하나 · 탑 막대 하나
      miss++;
      sfx.wrong();
      wiggle(b);
      // 단어에 없는 글자는 다시 못 누르게, 단어의 다른 자리 글자는 잠깐만 표시
      if (own.includes(b.dataset.c)) {
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 700);
      } else {
        b.classList.add('gone');
        b.disabled = true;
      }
      lose();
    }

    ctx.prompt(cfg.auto ? '그림과 소리를 듣고, 알맞은 글자를 골라 단어를 완성해요. 틀리면 탑 막대가 하나씩 떨어져요!' : '그림을 보고 단어를 완성해요. 모르면 🔊를 눌러요. 틀리면 탑 막대가 떨어져요!',
      say, { auto: cfg.auto });
  }

  function lose() {
    candies--;
    candyEls[candies].className = 'used';
    bars[candies].classList.add('fall');
    tower.style.setProperty('--h', candies);
    tori.classList.add('wobble');
    ctx.later(() => tori.classList.remove('wobble'), 500);
    if (candies > 0) return;
    // 게임 오버: 다람쥐가 떨어진다
    root.classList.add('lost');
    tori.classList.add('fall');
    ctx.later(() => {
      speak('Game over!', 'en-US');
      over.replaceChildren(h('div', { class: 'td-over-card' },
        h('b', {}, 'GAME OVER'),
        h('p', {}, `사탕을 다 썼어요. 단어 ${solved}개를 완성했어요.`),
        h('div', { class: 'td-over-actions' },
          h('button', { class: 'btn', type: 'button', onclick: () => { sfx.tap(); start(); } }, '🔁 다시 도전'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => ctx.finish({ firstTry: clean, total: words.length }) }, '끝내기'))));
      over.hidden = false;
    }, 1200);
  }

  function win() {
    ctx.progress(words.length, words.length);
    tori.classList.add('happy');
    speak('You did it!', 'en-US');
    // 남은 사탕만큼 덤 도토리
    ctx.later(() => ctx.finish({ firstTry: clean, total: words.length, bonus: candies }), 1400);
  }

  start();
}
