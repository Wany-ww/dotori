import { h, pick, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SPELL_WORDS } from '../data.js';

const R = 4;
const ABC = 'abcdefghijklmnopqrstuvwxyz';
const en = (t) => speak(t, 'en-US');
// 단계별: 단어 길이, 떨어지는 빠르기(초), 그림을 보여 줄지
const CFG = [
  { len: 3, fall: 6.5, pic: true },
  { len: 3, fall: 5.5, pic: true },
  { len: 4, fall: 5.5, pic: true },
  { len: 4, fall: 5, pic: false },
  { len: 5, fall: 4.5, pic: false },
];

// 떨어지는 글자 받기(SpellBalls): 나무에서 떨어지는 글자 공 중에서 단어의 다음 글자를 눌러 받아 단어를 완성한다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const words = ctx.unit ? ctx.unit.words(R, { spell: true, minLen: 3, maxLen: cfg.len + 1 }) : pickN(SPELL_WORDS[cfg.len], R);
  const word = h('div', { class: 'sb-word' });
  const sky = h('div', { class: 'sb-sky' }, h('span', { class: 'sb-tree', 'aria-hidden': 'true' }, '🌳'));
  stage.append(h('div', { class: 'spell-balls' }, word, sky));
  let n = 0;
  let firstTry = 0;
  let timer = 0;
  ctx.onCleanup(() => clearInterval(timer));

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = words[n];
    const letters = [...it.w];
    let at = 0;
    let missed = false;
    const slots = letters.map(() => h('span', { class: 'sb-slot' }));
    word.dataset.w = it.w;
    word.replaceChildren(
      h('span', { class: 'sb-pic', 'aria-hidden': 'true' }, cfg.pic ? it.e : '❓'),
      ...slots,
      h('button', { class: 'sb-ear', type: 'button', 'aria-label': '단어 듣기', onclick: () => en(it.w) }, '🔊'));
    sky.querySelectorAll('.sb-ball').forEach((b) => b.remove());
    let drops = 0;
    // 공을 떨어뜨린다: 셋 중 하나는 꼭 다음 글자
    const drop = () => {
      if (at >= letters.length) return;
      drops++;
      const c = drops % 3 === 1 ? letters[at] : pick([...ABC].filter((x) => !letters.slice(at, at + 1).includes(x)));
      const ball = h('button', { class: 'sb-ball latin', type: 'button', style: { left: `${randInt(6, 82)}%`, '--fall': `${cfg.fall}s`, '--hue': randInt(0, 360) } }, c);
      ball.dataset.c = c;
      ball.addEventListener('click', () => {
        if (at >= letters.length) return;
        if (c !== letters[at]) {
          missed = true;
          wiggle(ball);
          ball.classList.add('bounce');
          return;
        }
        sfx.pop();
        en(c);
        ball.remove();
        slots[at].textContent = c;
        slots[at].classList.add('full');
        pop(slots[at]);
        at++;
        if (at < letters.length) return;
        if (!missed) firstTry++;
        clearInterval(timer);
        sky.querySelectorAll('.sb-ball').forEach((b) => b.remove());
        sfx.correct();
        word.querySelector('.sb-pic').textContent = it.e;
        cheer(word, 'en');
        en(it.w);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 2000);
      });
      ball.addEventListener('animationend', () => ball.remove());
      sky.append(ball);
    };
    clearInterval(timer);
    drop();
    timer = setInterval(() => { if (ctx.alive) drop(); }, 1100);
    ctx.prompt(cfg.pic ? '그림의 단어를 떠올리며, 떨어지는 글자 공을 순서대로 받아요!' : '단어를 잘 듣고, 떨어지는 글자 공을 순서대로 받아요!', () => en(it.w));
  }

  round();
}
