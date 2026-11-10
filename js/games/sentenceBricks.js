import { h, shuffle, pickN, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { BRICK_FRAMES } from '../content.js';

const R = 3;
const COLORS = ['#F28C28', '#4FB3E8', '#62C462', '#E25DD6', '#A77BEA', '#F2D13B'];
const say = (t) => speak(t, 'en-US');
const fill = (frame, w) => frame.replace('___', w);

// 차시에 맞는 틀: 그 단계용 틀을 먼저, 모자라면 난이도가 맞는 틀
function framesFor(unit, L) {
  const own = unit ? BRICK_FRAMES.filter((f) => f.code === unit.code) : [];
  const fit = BRICK_FRAMES.filter((f) => !own.includes(f) && f.lv.includes(L));
  const near = BRICK_FRAMES.filter((f) => !own.includes(f) && !fit.includes(f) && Math.abs(f.lv[0] - L) <= 1);
  return [...own, ...shuffle(fit), ...shuffle(near)].slice(0, R);
}

// 문장 벽돌(SentenceBricks): "He will ___ tomorrow." 빈칸에 들어갈 수 있는 낱말 벽돌을 모두 찾아 깨뜨린다.
// 맞는 벽돌을 누르면 빈칸에 들어가 문장을 읽어 주고 벽돌이 깨지며, 위의 벽돌이 아래로 내려온다 (참고 영상)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const rounds = framesFor(ctx.unit, L);
  const sentence = h('p', { class: 'sb-sentence latin', 'aria-live': 'polite' });
  const wall = h('div', { class: 'sb-wall' });
  const found = h('div', { class: 'sb-found latin', 'aria-label': '찾은 낱말' });
  stage.append(h('div', { class: 'sentence-bricks' }, sentence, wall, found));
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, rounds.length);
    const f = rounds[n];
    const good = pickN(f.good, Math.min(f.good.length, [4, 4, 5, 5, 6][L - 1]));
    const bad = pickN(f.bad, Math.min(f.bad.length, 12 - good.length));
    const words = shuffle([...good, ...bad]);
    let left = good.length;
    let miss = 0;
    total += good.length;
    const show = (w) => {
      const [a, b] = f.frame.split('___');
      sentence.replaceChildren(a, h('span', { class: `sb-blank${w ? ' full' : ''}` }, w || ''), b);
    };
    show('');
    found.replaceChildren();
    // 벽돌 두 줄 기둥: 아래에서부터 쌓인다 (깨지면 위 벽돌이 내려온다)
    const cols = [h('div', { class: 'sb-col' }), h('div', { class: 'sb-col' })];
    words.forEach((w, i) => {
      const b = h('button', { class: 'sb-brick latin', type: 'button', style: { '--c': COLORS[i % COLORS.length] } }, w);
      b.dataset.ok = good.includes(w) ? '1' : '0';
      b.addEventListener('click', () => tap(b, w));
      cols[i % 2].append(b);
    });
    wall.replaceChildren(...cols);

    function tap(b, w) {
      if (b.classList.contains('broken')) return;
      if (b.dataset.ok !== '1') {
        miss++;
        sfx.wrong();
        wiggle(b);
        show(w);
        sentence.querySelector('.sb-blank').classList.add('bad');
        ctx.later(() => show(''), 900);
        if (miss >= 2) hinter.miss([...wall.querySelectorAll('.sb-brick[data-ok="1"]:not(.broken)')][0]);
        return;
      }
      hinter.reset();
      sfx.pop();
      show(w);
      say(fill(f.frame, w));
      b.classList.add('broken');
      burst(b, ['💥', '✨', '🧱']);
      // 위의 벽돌이 내려오는 모습: 깨진 벽돌 자리를 접는다
      ctx.later(() => b.remove(), 380);
      found.append(h('span', {}, w));
      left--;
      if (left > 0) return;
      firstTry += Math.max(0, good.length - miss);
      ctx.later(() => {
        sfx.correct();
        cheer(wall, 'en');
        sentence.replaceChildren(h('span', { class: 'sb-done' }, `${good.length} words!`));
      }, 900);
      ctx.later(() => {
        n++;
        if (n < rounds.length) round();
        else ctx.finish({ firstTry, total });
      }, 2600);
    }
    ctx.prompt(`빈칸에 들어갈 수 있는 낱말 벽돌을 모두 찾아 깨뜨려요! (${good.length}개)`, () => say('Find all the words!'));
  }

  round();
}
