import { h, shuffle, pickN, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SPACE_SETS } from '../data.js';
import { draggable, hits } from './dragTap.js';

const R = 5;
const en = (t) => speak(t, 'en-US');
// 단계별: 땅에 놓인 단어 수, 화면에 그림을 보여 줄지, 단어를 먼저 읽어 줄지, 🔊로 다시 들을 수 있는지
const CFG = [
  { tags: 3, pic: true, say: true, ear: true },
  { tags: 4, pic: true, say: true, ear: true },
  { tags: 5, pic: true, say: false, ear: true },
  { tags: 6, pic: true, say: false, ear: false },
  { tags: 6, pic: false, say: true, ear: true },
];

// 우주 정비소(SpaceRepairShop): 고장 난 우주선 화면의 그림에 맞는 단어 부품을 우주선으로 끌어 올려 고쳐 보낸다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const set = ctx.unit ? { name: (ctx.unit.show || ctx.unit.title).replace(/[^ -~·~]/g, '').trim() || 'words', words: ctx.unit.words(Math.max(cfg.tags, R) + 2).map((x) => [x.w, x.e]) } : pick(SPACE_SETS);
  const targets = pickN(set.words, R);
  const screen = h('div', { class: 'sr-screen' });
  const ear = h('button', { class: 'sr-ear', type: 'button', 'aria-label': '단어 듣기' }, '🔊');
  const ufo = h('div', { class: 'sr-ufo' }, h('div', { class: 'sr-dome' }, screen, ear), h('div', { class: 'sr-body', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), h('div', { class: 'sr-beam', 'aria-hidden': 'true' }));
  const box = h('div', { class: 'sr-toolbox' }, h('span', { 'aria-hidden': 'true' }, '🧰'), h('b', {}, set.name));
  const ground = h('div', { class: 'sr-ground' });
  stage.append(h('div', { class: 'space-repair' }, ufo, box, ground));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const [word, e] = targets[n];
    const say = () => en(word);
    let done = false;
    ufo.classList.remove('fly', 'fixed');
    ufo.classList.add('land');
    screen.replaceChildren(h('span', { class: 'sr-pic', 'aria-hidden': 'true' }, cfg.pic ? e : '?'));
    screen.dataset.w = word;
    ear.hidden = !cfg.ear;
    ear.onclick = () => { sfx.tap(); say(); };

    const words = shuffle([word, ...pickN(set.words.map(([w]) => w).filter((w) => w !== word), cfg.tags - 1)]);
    const tags = words.map((w, i) => {
      const t = h('button', { class: 'sr-tag', type: 'button', style: { '--r': `${randInt(-6, 6)}deg`, animationDelay: `${i * 0.08}s` } }, w);
      t.dataset.w = w;
      draggable(t, { onDrop: (pt) => (hits(ufo, pt, 0) ? fix(t) : null) });
      t.addEventListener('click', () => fix(t));
      return t;
    });
    ground.replaceChildren(...tags);

    function fix(t) {
      if (done) return;
      if (t.dataset.w !== word) {
        wiggle(t);
        en(t.dataset.w);
        hinter.miss(tags.find((x) => x.dataset.w === word));
        return;
      }
      done = true;
      if (hinter.count === 0) firstTry++;
      hinter.reset();
      sfx.correct();
      t.classList.add('up');
      ufo.classList.add('fixed');
      screen.replaceChildren(h('span', { class: 'sr-pic', 'aria-hidden': 'true' }, e), h('b', { class: 'sr-word' }, word));
      pop(screen);
      cheer(ufo, 'en');
      say();
      ctx.later(() => { ufo.classList.remove('land'); ufo.classList.add('fly'); sfx.sparkle?.(); }, 1500);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2600);
    }

    ctx.prompt(
      cfg.pic ? '우주선 화면의 그림에 맞는 단어 부품을 우주선으로 끌어 올려 고쳐 줘요!' : '우주선이 말하는 단어를 듣고, 맞는 단어 부품을 끌어 올려요!',
      () => (cfg.say || !cfg.pic ? say() : en('Fix the spaceship!')),
    );
  }

  round();
}
