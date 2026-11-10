import { h, shuffle, pickN, cheer, burst } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { PAINT_THINGS } from '../data.js';
import { makeMic } from './sayKit.js';

const R = 5;
const NUMS = ['two', 'three'];
// 단계별: 보기 수, 보기에 글자를 쓰는지, 무엇을 말하나(이름 · 수+이름 · 크기+이름)
const CFG = [
  { opts: 2, label: true, say: 'name' },
  { opts: 3, label: true, say: 'name' },
  { opts: 3, label: false, say: 'name' },
  { opts: 3, label: true, say: 'count' },
  { opts: 3, label: true, say: 'size' },
];
const plural = (w) => (w === 'fish' ? 'fish' : w === 'house' ? 'houses' : `${w}s`);

// 단어 그리기(PainttheWord): 그리고 싶은 것을 말하면 붓이 그 그림을 도화지에 그려 준다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const paper = h('div', { class: 'pw-paper', 'aria-label': '도화지' }, h('i', { class: 'pw-ground', 'aria-hidden': 'true' }));
  const choices = h('div', { class: 'pw-choices' });
  const mic = makeMic(ctx, { lang: 'en-US' });
  stage.append(h('div', { class: 'paintword' }, h('div', { class: 'pw-easel' }, paper), choices, mic.el));

  // 영어 차시: 그릴 수 있는 것 중 오늘 단어를 먼저 보기로 낸다
  const today = ctx.unit ? new Set(ctx.unit.words(30).map((x) => x.w)) : new Set();
  const things = [...shuffle(PAINT_THINGS.filter((t) => today.has(t[0]))), ...shuffle(PAINT_THINGS.filter((t) => !today.has(t[0])))];
  const used = new Set();
  // 겹치지 않게 그림 놓을 자리 (하늘 · 땅 · 물)
  const SPOTS = {
    sky: [[18, 18], [50, 14], [80, 20], [34, 30], [66, 30]],
    land: [[18, 66], [40, 74], [62, 66], [84, 74], [30, 56], [72, 56]],
    water: [[24, 86], [54, 88], [80, 86]],
  };
  const taken = { sky: 0, land: 0, water: 0 };
  let n = 0;
  let firstTry = 0;

  // 말할 거리: 이름(sun) · 수+이름(two suns) · 크기+이름(a big sun)
  function phrase(t) {
    const [w] = t;
    if (cfg.say === 'count') {
      const k = NUMS[Math.floor(Math.random() * NUMS.length)];
      return { text: `${k} ${plural(w)}`, count: k === 'two' ? 2 : 3, size: 1 };
    }
    if (cfg.say === 'size') {
      const big = Math.random() < 0.5;
      return { text: `a ${big ? 'big' : 'small'} ${w}`, count: 1, size: big ? 1.5 : 0.65 };
    }
    return { text: w, count: 1, size: 1 };
  }

  function paint(t, ph) {
    const [, e, zone] = t;
    for (let k = 0; k < ph.count; k++) {
      const list = SPOTS[zone];
      const [x, y] = list[taken[zone]++ % list.length];
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 6;
      const art = h('span', {
        class: 'pw-art',
        style: { left: `${x + dx + k * 7}%`, top: `${y + dy}%`, '--s': ph.size, animationDelay: `${k * 0.35}s` },
        'aria-label': t[0],
      }, e);
      paper.append(art);
    }
    const brush = h('span', { class: 'pw-brush', 'aria-hidden': 'true' }, '🖌️');
    paper.append(brush);
    ctx.later(() => brush.remove(), 1200);
  }

  async function round() {
    ctx.progress(n, R);
    const fresh = things.filter((t) => !used.has(t[0]));
    const src = fresh.length >= cfg.opts ? fresh : things;
    // 오늘 단어가 있으면 보기마다 하나는 꼭 오늘 단어로
    const mine = src.filter((t) => today.has(t[0]));
    const opts = shuffle(mine.length ? [mine[0], ...pickN(src.filter((t) => t !== mine[0]), cfg.opts - 1)] : pickN(src, cfg.opts)).map((t) => ({ t, ph: phrase(t) }));
    choices.replaceChildren(...opts.map((o) => {
      const b = h('button', { class: 'pw-choice', type: 'button', 'aria-label': `${o.ph.text} 듣기` },
        h('span', { class: 'pw-ce', 'aria-hidden': 'true' }, o.ph.count > 1 ? o.t[1].repeat(o.ph.count) : o.t[1]),
        cfg.label ? h('span', { class: 'pw-cw latin' }, o.ph.text) : null);
      if (cfg.say === 'size') b.querySelector('.pw-ce').style.fontSize = o.ph.size > 1 ? '1.25em' : '0.75em';
      b.addEventListener('click', () => { sfx.tap(); speak(o.ph.text, 'en-US'); });
      o.btn = b;
      return b;
    }));
    ctx.prompt('무엇을 그리고 싶어요? 그림 중 하나를 골라 영어로 말하면 붓이 그려 줘요!', () => speak('What do you want to draw?', 'en-US'), { auto: false });
    mic.wait();
    await speak('What do you want to draw?', 'en-US');
    if (!ctx.alive) return;
    const res = await mic.ask({ options: opts.map((o) => o.ph.text) });
    if (!ctx.alive) return;
    const pickI = res.choice >= 0 ? res.choice : 0;
    const o = opts[pickI];
    if (!res.skipped && res.tries === 1) firstTry++;
    used.add(o.t[0]);
    o.btn.classList.add('chosen');
    sfx.correct();
    paint(o.t, o.ph);
    burst(paper, ['🎨', '✨', '🖍️']);
    speak(o.ph.text, 'en-US');
    ctx.later(() => cheer(paper, 'en'), 600);
    ctx.later(() => {
      n++;
      if (n >= R) {
        speak('What a beautiful picture!', 'en-US');
        paper.classList.add('done');
        ctx.later(() => ctx.finish({ firstTry, total: R }), 1800);
      } else round();
    }, 2200);
  }

  round();
}
