import { h, pickN, cheer, burst } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SAYHO_LINES } from '../data.js';
import { makeMic } from './sayKit.js';

const R = 4;
const FANS = ['🐰', '🦊', '🐻', '🐼', '🐸', '🐨', '🐯', '🐷'];

// 따라 말하기(SayHo): 무대 위 가수가 박자에 맞춰 외치면, 관객이 되어 똑같이 크게 따라 외친다
export function mount(stage, ctx) {
  const L = ctx.level;
  // 영어 차시: 알파벳 · 소리 단계는 오늘 단어(A is for apple!), 그 뒤로는 오늘 문장 중 짧은 것
  const u = ctx.unit;
  const unitLines = !u ? null : u.sentenceUnit
    ? u.sentences(10).map((x) => x.text).filter((t) => t.split(' ').length <= 7)
    : u.track === 'alpha' ? u.letters(R).map((U) => u.sayFor(U).replace(/\.$/, '!')) : u.words(R).map((x) => `${x.w}!`);
  const lines = unitLines?.length >= R ? [...new Set(unitLines)].slice(0, R) : pickN(SAYHO_LINES[L - 1], R);
  const singer = h('div', { class: 'sh2-singer', 'aria-hidden': 'true' }, h('span', { class: 'sh2-star' }, '🦁'), h('span', { class: 'sh2-mic' }, '🎤'));
  const shout = h('p', { class: 'sh2-shout latin', 'aria-live': 'polite' });
  const lights = h('div', { class: 'sh2-lights', 'aria-hidden': 'true' }, Array.from({ length: 6 }, (_, i) => h('i', { style: { '--i': i } })));
  const crowd = h('div', { class: 'sh2-crowd', 'aria-hidden': 'true' }, FANS.map((f, i) => h('span', { style: { '--i': i } }, f)));
  const meter = h('div', { class: 'sh2-meter', 'aria-hidden': 'true' }, Array.from({ length: R }, () => h('i')));
  const mic = makeMic(ctx, { lang: 'en-US' });
  const hall = h('div', { class: 'sayho' }, lights, h('div', { class: 'sh2-stage' }, singer, shout), meter, crowd, mic.el);
  stage.append(hall);

  let n = 0;
  let firstTry = 0;

  // 북소리 네 번에 맞춰 가수가 외친다
  async function call(line) {
    hall.classList.remove('hooray');
    shout.textContent = line;
    singer.classList.add('sing');
    [0, 0.3, 0.6].forEach((t) => ctx.later(() => sfx.tap(), t * 1000));
    await new Promise((r) => ctx.later(r, 900));
    if (!ctx.alive) return;
    await speak(line, 'en-US', { rate: 1 });
    singer.classList.remove('sing');
  }

  async function round() {
    ctx.progress(n, R);
    const line = lines[n];
    ctx.prompt('가수가 외치는 말을 듣고, 마이크를 눌러 똑같이 크게 따라 외쳐요!', () => call(line), { auto: false });
    mic.wait();
    await call(line);
    if (!ctx.alive) return;
    const res = await mic.ask({ target: line, hint: '마이크를 누르고 크게 외쳐요!' });
    if (!ctx.alive) return;
    if (!res.skipped && res.tries === 1) firstTry++;
    hall.classList.add('hooray');
    meter.children[n].classList.add('on');
    sfx.win();
    burst(crowd, ['🎉', '🎵', '⭐', '🎶']);
    cheer(singer, 'en');
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 2400);
  }

  round();
}
