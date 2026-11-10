import { h, shuffle, randInt, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
const KO_COUNT = ['한', '두', '세', '네', '다섯', '여섯', '일곱'];
// 단계별: 처음 헛간에 있는 양, 들어가는 양, 나오는 양, 들고 나는 차례를 섞을지, 보기 수, 보기를 숫자로 보일지
const CFG = [
  { start: [0, 0], ins: [1, 3], outs: [0, 0], mix: false, opts: 3, digits: false },
  { start: [0, 0], ins: [2, 5], outs: [0, 0], mix: false, opts: 3, digits: false },
  { start: [0, 0], ins: [2, 4], outs: [1, 1], mix: false, opts: 3, digits: false },
  { start: [1, 2], ins: [1, 3], outs: [1, 2], mix: false, opts: 3, digits: true },
  { start: [0, 2], ins: [2, 4], outs: [1, 3], mix: true, opts: 4, digits: true },
];

const flock = (n) => h('span', { class: 'bc-flock', 'aria-hidden': 'true' }, Array.from({ length: n }, () => h('i', {}, '🐑')));

// 작은 농장(LittleFarm): 양이 하나씩 헛간에 들어가고 나오는 것을 지켜본 뒤,
// 헛간 안에 양이 몇 마리 있는지 보기 카드에서 고른다. 맞히면 헛간이 열려 양들이 보인다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const door = h('div', { class: 'bc-door' });
  const inside = h('div', { class: 'bc-inside' });
  const barn = h('div', { class: 'bc-barn' }, h('div', { class: 'bc-roof' }), inside, door);
  const yard = h('div', { class: 'bc-yard' });
  const cards = h('div', { class: 'bc-cards' });
  const start = h('button', { class: 'bc-start', type: 'button' }, '시작');
  const again = h('button', { class: 'bc-again', type: 'button', 'aria-label': '다시 보기' }, '🔁 다시 보기');
  const field = h('div', { class: 'barn-count' },
    h('span', { class: 'bc-hay', 'aria-hidden': 'true' }), h('span', { class: 'bc-tree', 'aria-hidden': 'true' }),
    h('div', { class: 'bc-fence', 'aria-hidden': 'true' }), barn, yard, cards, start, again);
  stage.append(field);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    // 들고 나는 차례: 'in' · 'out'. 헛간 안 수가 0 밑으로 내려가지 않게 만든다
    const base = randInt(...cfg.start);
    const ins = randInt(...cfg.ins);
    const outs = Math.min(randInt(...cfg.outs), base + ins - 1);
    let steps = [...Array(ins).fill('in'), ...Array(outs).fill('out')];
    const valid = (seq) => { let k = base; return seq.every((s) => (k += s === 'in' ? 1 : -1) >= 0); };
    if (cfg.mix) do steps = shuffle(steps); while (!valid(steps));
    const answer = base + ins - outs;
    let missed = false;
    let busy = false;

    field.classList.remove('open');
    inside.replaceChildren(flock(answer));
    cards.replaceChildren();
    door.textContent = '';
    again.hidden = true;
    yard.replaceChildren();

    // 양 한 마리가 걸어 들어가거나 나온다 (헛간 문이 가운데)
    const walk = (dir, i) => ctx.later(() => {
      const s = h('span', { class: `bc-sheep ${dir}`, 'aria-hidden': 'true' }, '🐑');
      yard.append(s);
      sfx.pop();
      ctx.later(() => s.remove(), 1500);
    }, i * 1100);

    function play(done) {
      busy = true;
      cards.replaceChildren();
      door.textContent = '';
      again.hidden = true;
      // 처음부터 들어 있는 양은 문을 잠깐 열어 보여 준다
      let t = 0;
      if (base) {
        field.classList.add('peek');
        speak([KO_COUNT[base - 1], '마리가 있어요!']);
        ctx.later(() => field.classList.remove('peek'), 1800);
        t = 2200;
      }
      ctx.later(() => steps.forEach(walk), t);
      ctx.later(() => { busy = false; done(); }, t + steps.length * 1100 + 700);
    }

    function ask() {
      door.textContent = '?';
      speak('헛간에 양이 몇 마리 있을까요?');
      const pool = new Set([answer]);
      while (pool.size < cfg.opts) {
        const v = answer + randInt(-3, 3);
        if (v >= 1 && v <= 9) pool.add(v);
      }
      const opts = [...pool].sort((a, b) => a - b);
      const els = opts.map((v) => {
        const b = h('button', { class: 'bc-card', type: 'button', 'aria-label': `양 ${v}마리` }, cfg.digits ? h('b', {}, v) : flock(v));
        b.addEventListener('click', () => {
          if (busy || field.classList.contains('open')) return;
          if (v !== answer) {
            missed = true;
            wiggle(b);
            hinter.miss(els[opts.indexOf(answer)]);
            again.hidden = false;
            return;
          }
          if (!missed) firstTry++;
          hinter.reset();
          sfx.correct();
          els.forEach((x) => x.classList.toggle('no', x !== b));
          b.classList.add('yes');
          door.textContent = '';
          again.hidden = true;
          field.classList.add('open');
          cheer(barn);
          speak([KO_COUNT[answer - 1], '마리가 있어요!']);
          ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2800);
        });
        return b;
      });
      cards.replaceChildren(...els);
    }

    again.onclick = () => { if (!busy) { sfx.tap(); play(ask); } };
    start.hidden = false;
    start.onclick = () => {
      sfx.tap();
      start.hidden = true;
      play(ask);
    };
    ctx.prompt('시작을 누르고, 양이 헛간에 들어가고 나오는 것을 잘 봐요. 헛간 안에는 양이 몇 마리 있을까요?',
      () => speak('양이 헛간에 몇 마리 들어가는지 잘 봐요!'));
  }

  round();
}
