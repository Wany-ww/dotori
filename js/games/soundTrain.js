import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SPELL_WORDS } from '../data.js';
import { draggable, hits } from './dragTap.js';

const R = 5;
const en = (t) => speak(t, 'en-US');
const ABC = 'abcdefghijklmnopqrstuvwxyz';
// 단계별: 단어 길이, 기관차에 단어 · 그림을 보여 줄지, 헷갈리게 하는 글자 수
const CFG = [
  { len: [3], word: true, pic: true, extra: 0 },
  { len: [3], word: false, pic: true, extra: 0 },
  { len: [3], word: false, pic: false, extra: 1 },
  { len: [4], word: false, pic: false, extra: 1 },
  { len: [4, 5], word: false, pic: false, extra: 2 },
];

// 소리 기차(SoundTrain): 원숭이 기관사가 말하는 단어를 듣고, 글자 상자를 순서대로 객차에 싣는다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const words = ctx.unit ? ctx.unit.words(R, { spell: true, minLen: 3, maxLen: Math.max(...cfg.len) + 1 }) : pickN(cfg.len.flatMap((n) => SPELL_WORDS[n]), R);
  const rail = h('div', { class: 'st-rail' });
  const yard = h('div', { class: 'st-yard' });
  stage.append(h('div', { class: 'sound-train' }, rail, yard));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = words[n];
    const letters = [...it.w];
    const say = () => en(it.w);
    let at = 0;
    let missed = false;

    const ear = h('button', { class: 'st-ear', type: 'button', 'aria-label': '단어 다시 듣기' }, '🔊');
    ear.addEventListener('click', () => { sfx.tap(); say(); });
    const cars = letters.map(() => h('div', { class: 'st-car' }, h('span', { class: 'st-box' }), h('i', { class: 'st-wheels', 'aria-hidden': 'true' })));
    const engine = h('div', { class: 'st-engine' },
      h('span', { class: 'st-driver', 'aria-hidden': 'true' }, '🐵'),
      h('span', { class: 'st-name' }, cfg.word ? it.w : cfg.pic ? it.e : '?'),
      h('i', { class: 'st-wheels', 'aria-hidden': 'true' }));
    const train = h('div', { class: 'st-train' }, engine, ...cars);
    train.dataset.w = it.w;
    rail.replaceChildren(ear, train);

    const extra = pickN([...ABC].filter((c) => !letters.includes(c)), cfg.extra);
    const tiles = shuffle([...letters, ...extra]).map((c) => {
      const t = h('button', { class: 'st-tile', type: 'button', 'aria-label': `${c} 글자 상자` }, c);
      t.dataset.c = c;
      draggable(t, { onDrop: (pt) => (cars.some((car) => hits(car, pt, 10)) ? load(t) : wiggle(t)) });
      t.addEventListener('click', () => load(t));
      return t;
    });
    yard.replaceChildren(...tiles);

    // 다음 빈 객차에 맞는 글자면 싣고, 아니면 튕겨 낸다
    function load(t) {
      if (at >= letters.length) return;
      if (t.dataset.c !== letters[at]) {
        missed = true;
        wiggle(t);
        en(t.dataset.c);
        hinter.miss(tiles.find((x) => x.isConnected && x.dataset.c === letters[at]));
        return;
      }
      hinter.reset();
      sfx.pop();
      t.remove();
      const box = cars[at].querySelector('.st-box');
      box.textContent = t.dataset.c;
      cars[at].classList.add('full');
      pop(cars[at]);
      at++;
      if (at < letters.length) return;
      if (!missed) firstTry++;
      engine.querySelector('.st-name').textContent = it.w;
      sfx.correct();
      cheer(train, 'en');
      say();
      ctx.later(() => train.classList.add('go'), 1300);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2600);
    }
    ctx.prompt(cfg.word ? '기관사님이 말하는 단어를 듣고, 글자 상자를 순서대로 객차에 실어요!' : '단어를 잘 듣고, 들리는 글자를 차례로 객차에 실어요!', say);
  }

  round();
}
