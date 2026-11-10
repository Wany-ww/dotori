import { h, shuffle, pickN, randInt, wiggle, pop, cheer } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const STARS = 8;
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// 단계(Lv)마다: 떨어지는 것과 고르는 것, 보기 수, 떨어지는 시간(초)
//   same: 대문자 → 같은 대문자 · lower: 대문자 → 소문자 · pic: 단어 → 그림
const CFG = [
  { mode: 'same', n: 3, fall: 7.5 },
  { mode: 'lower', n: 3, fall: 7 },
  { mode: 'pic', n: 3, fall: 7 },
  { mode: 'pic', n: 4, fall: 6 },
  { mode: 'pic', n: 4, fall: 5 },
];

// 떨어지는 별 받기(StarFall): 밤하늘에서 글자나 단어가 적힌 별이 떨어진다.
// 별이 땅에 닿기 전에 아래 보기에서 알맞은 글자(낮은 단계)나 그림(높은 단계)을 누르면 별을 받는다.
// 놓친 별은 정답을 보여 주고 다음 별로 (벌점 없음)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= ctx.level)));
  const letters = cfg.mode !== 'pic';
  // 떨어질 것: 글자 단계는 차시 글자(배우는 글자부터), 단어 단계는 차시 그림 단어
  const pool = letters ? U.letters(10) : U.words(12, { pic: true, maxLen: 9 });
  const items = Array.from({ length: STARS }, (_, i) => pool[i % pool.length]);
  const sky = h('div', { class: 'sf-sky' });
  const choices = h('div', { class: 'sf-choices' });
  const count = h('span', { class: 'sf-count' });
  stage.append(h('div', { class: 'star-fall' }, h('div', { class: 'sf-head' }, count), sky, h('div', { class: 'sf-ground', 'aria-hidden': 'true' }), choices));

  let n = 0;
  let caught = 0;
  let firstTry = 0;

  const show = (x) => (letters ? x : x.w);
  const key = (x) => (letters ? (cfg.mode === 'lower' ? x.toLowerCase() : x) : x.e);
  const sayOf = (x) => (letters ? x : x.w);

  function round() {
    ctx.progress(n, STARS);
    count.textContent = `⭐ ${caught} / ${STARS}`;
    const x = items[n];
    const ans = key(x);
    // 보기: 정답 + 함정 (글자는 차시 글자 · 다른 글자, 그림은 차시의 다른 그림)
    const others = letters
      ? [...pool.filter((L) => L !== x), ...shuffle(ABC.filter((L) => !pool.includes(L)))].map(key)
      : pool.filter((y) => y.e !== x.e).map(key);
    const opts = shuffle([ans, ...pickN([...new Set(others)].filter((o) => o !== ans), cfg.n - 1)]);
    let miss = 0;
    let done = false;

    const star = h('div', {
      class: `sf-star${letters ? ' letter' : ''}`,
      style: { left: `${randInt(18, 72)}%`, '--fall': `${cfg.fall}s`, '--tilt': `${randInt(-12, 12)}deg` },
      'aria-live': 'polite',
    }, h('span', {}, show(x)));
    sky.replaceChildren(star);
    // 땅에 닿으면 놓친 별
    star.addEventListener('animationend', (e) => {
      if (e.animationName !== 'sf-fall' || done) return;
      done = true;
      sfx.wrong();
      star.classList.add('landed');
      buttons.find((b) => b.dataset.ok === '1')?.classList.add('show');
      speak(sayOf(x), 'en-US');
      ctx.later(next, 1500);
    });

    const buttons = opts.map((o) => {
      const b = h('button', { class: `sf-choice${letters ? ' letter' : ''}`, type: 'button', 'aria-label': letters ? o : '그림' }, o);
      b.dataset.ok = o === ans ? '1' : '0';
      b.addEventListener('click', () => {
        if (done) return;
        if (o !== ans) {
          miss++;
          sfx.wrong();
          wiggle(b);
          return;
        }
        done = true;
        caught++;
        if (miss === 0) firstTry++;
        sfx.correct();
        b.classList.add('ok');
        // 별이 멈추고 반짝 터진다
        const r = star.getBoundingClientRect();
        const s = sky.getBoundingClientRect();
        star.style.top = `${r.top - s.top}px`;
        star.classList.add('caught');
        pop(b);
        speak(sayOf(x), 'en-US');
        ctx.later(next, 1100);
      });
      return b;
    });
    choices.replaceChildren(...buttons);
  }

  function next() {
    n++;
    if (n < STARS) { round(); return; }
    count.textContent = `⭐ ${caught} / ${STARS}`;
    ctx.progress(STARS, STARS);
    cheer(sky, 'en');
    ctx.later(() => ctx.finish({ firstTry, total: STARS }), 1200);
  }

  ctx.prompt(
    letters
      ? (cfg.mode === 'lower' ? '별에 적힌 대문자의 소문자를 아래에서 골라 별을 받아요!' : '별에 적힌 글자와 같은 글자를 아래에서 골라 별을 받아요!')
      : '별에 적힌 단어에 맞는 그림을 아래에서 골라 별을 받아요!',
    () => speak('Catch the falling stars!', 'en-US'),
  );
  round();
}
