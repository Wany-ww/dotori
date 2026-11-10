import { h, shuffle, pick, pickN, randInt, cheer, wiggle, pop, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { PATTERN_SETS, numEn } from '../data.js';

const R = 5;
const TYPES_BY_LEVEL = [
  ['AB', 'AB', 'AAB', 'AB', 'AAB'],
  ['AB', 'AAB', 'ABB', 'AAB', 'ABB'],
  ['AAB', 'ABB', 'ABC', 'ABB', 'ABC'],
  ['ABC', 'AABB', 'ABB', 'NUM', 'AABB'],
  ['AABB', 'ABCD', 'NUM', 'ABBC', 'NUM'],
];

function numberRound(L) {
  const step = pick(L >= 5 ? [2, 5, 10] : [1, 2]);
  const start = step === 10 ? randInt(1, 3) * 10 : randInt(1, 10);
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
  const answer = seq[4];
  const options = shuffle([answer, answer + step, answer - 1, answer + 1].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 3);
  if (!options.includes(answer)) options[0] = answer;
  return { shown: seq.slice(0, 4), answer, options: shuffle(options), numeric: true };
}

function emojiRound(type, L) {
  const set = shuffle(pick(PATTERN_SETS));
  const letters = [...new Set(type)];
  const map = Object.fromEntries(letters.map((ch, i) => [ch, set[i]]));
  const len = type.length;
  const shown = len * 2 + randInt(0, len > 3 ? 1 : len - 1);
  const seq = Array.from({ length: shown + 1 }, (_, i) => map[type[i % len]]);
  const nOpt = L >= 4 || letters.length >= 4 ? 4 : 3;
  return { shown: seq.slice(0, shown), answer: seq[shown], options: shuffle(set.slice(0, Math.max(nOpt, letters.length))), numeric: false };
}

// 영어판(ctx.lang 'en'): 수를 영어로 읽어 준다
export function mount(stage, ctx) {
  if (ctx.opts.mode === 'table') return table(stage, ctx);
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const types = TYPES_BY_LEVEL[L - 1];
  const hinter = makeHinter();
  const root = h('div', { class: 'patterns' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const r = types[n] === 'NUM' ? numberRound(L) : emojiRound(types[n], L);
    const qCar = h('div', { class: `car q${r.numeric ? ' num' : ''}`, 'aria-label': '물음표 칸' }, '?');
    const train = h('div', { class: 'train' },
      h('div', { class: 'car engine', 'aria-hidden': 'true' }, '🚂'),
      r.shown.map((x) => h('div', { class: `car${r.numeric ? ' num' : ''}` }, x)),
      qCar);

    root.replaceChildren(
      train,
      choiceSet(r.options, {
        answer: r.answer,
        hinter,
        cls: r.numeric ? 'choice' : 'choice emoji',
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          qCar.textContent = r.answer;
          qCar.classList.remove('q');
          qCar.classList.add('fill');
          train.classList.add('chug');
          cheer(qCar);
          if (en) speak(r.numeric ? [...r.shown, r.answer].map(numEn) : 'Choo choo! You found the pattern!', 'en-US');
          else speak(r.numeric ? `맞아요! ${r.shown.join(', ')}, ${r.answer}!` : '맞아요! 규칙을 찾았어요. 칙칙폭폭!');
          ctx.later(() => {
            n++;
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 1800);
        },
      }),
    );
    ctx.prompt(
      r.numeric ? '숫자 기차예요! 얼마씩 커지는지 찾아서 다음 수를 골라요.' : '패턴 기차의 규칙을 찾아서, 물음표 칸에 올 것을 골라요!',
      () => (en ? speak(r.numeric ? [...r.shown.map(numEn), 'What comes next?'] : 'What comes next?', 'en-US')
        : speak(r.numeric ? `${r.shown.join(', ')}, 다음은?` : '다음에 올 것은 무엇일까요?')),
    );
  }

  round();
}

// 규칙 찾기(Patterns · 수학, opts.mode 'table'): 식탁에 규칙대로 놓인 음식을 보고,
// 물음표 자리에 올 것을 바닥에서 끌어 올린다 (참고 영상 기준)
const FOODS = ['🥛', '☕', '🥪', '🍎', '🍩', '🧃', '🍌', '🧁', '🥐', '🍪', '🍓', '🥕'];
// 단계별: 규칙들, 빈자리 수, 빈자리가 끝에만 오는지, 바닥에 섞을 다른 음식 수
const TABLE = [
  { types: ['AB'], blanks: 1, end: true, extra: 0 },
  { types: ['AAB', 'ABB'], blanks: 1, end: true, extra: 0 },
  { types: ['ABC'], blanks: 1, end: true, extra: 0 },
  { types: ['ABC', 'AABB', 'ABB'], blanks: 1, end: false, extra: 1 },
  { types: ['ABCD', 'AABC', 'ABBC'], blanks: 2, end: false, extra: 1 },
];
function table(stage, ctx) {
  // 수학 상세 단계가 정한 규칙 종류 등이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...TABLE[ctx.level - 1], ...ctx.opts.cfg };
  const R = 5;
  const hinter = makeHinter();
  const top = h('div', { class: 'pt-top' });
  const floor = h('div', { class: 'pt-floor' });
  const root = h('div', { class: 'pattern-table' }, h('span', { class: 'pt-win a', 'aria-hidden': 'true' }), h('span', { class: 'pt-win b', 'aria-hidden': 'true' }),
    h('div', { class: 'pt-table' }, top, h('span', { class: 'pt-cloth', 'aria-hidden': 'true' })), floor);
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const type = pick(cfg.types);
    const letters = [...new Set(type)];
    const foods = pickN(FOODS, letters.length + cfg.extra);
    const map = Object.fromEntries(letters.map((c, i) => [c, foods[i]]));
    const len = Math.min(9, type.length * 2 + (type.length <= 3 ? randInt(0, type.length - 1) : 0) + 1);
    const seq = Array.from({ length: len }, (_, i) => map[type[i % type.length]]);
    // 빈자리: 끝 하나, 또는 한 번 규칙이 보인 뒤의 아무 자리
    const holes = cfg.end ? [len - 1] : pickN([...Array(len).keys()].filter((i) => i >= type.length), cfg.blanks).sort((a, b) => a - b);
    let missed = false;
    const spots = seq.map((f, i) => {
      const hole = holes.includes(i);
      const el = h('span', { class: `pt-spot${hole ? ' hole' : ''}`, 'aria-label': hole ? '물음표 자리' : '음식' }, hole ? h('b', { class: 'pt-q' }, '?') : f);
      el.dataset.i = i;
      return el;
    });
    top.replaceChildren(...spots);
    top.classList.remove('clear');
    const open = () => spots.filter((x) => x.classList.contains('hole'));
    const items = shuffle(foods).map((f) => {
      const b = h('button', { class: 'pt-food', type: 'button', 'aria-label': '음식' }, f);
      draggable(b, {
        onDrop: (pt) => {
          const spot = open().find((x) => hits(x, pt, 18));
          if (spot) put(f, b, spot); else wiggle(b);
        },
      });
      // 누르면 맨 앞 물음표 자리에 올려 본다
      b.addEventListener('click', () => { const spot = open()[0]; if (spot) put(f, b, spot); });
      return b;
    });
    floor.replaceChildren(...items);

    function put(f, b, spot) {
      const want = seq[Number(spot.dataset.i)];
      if (f !== want) {
        missed = true;
        wiggle(b);
        wiggle(spot);
        hinter.miss(items.find((x) => x.textContent === want));
        return;
      }
      hinter.reset();
      sfx.pop();
      spot.classList.remove('hole');
      spot.replaceChildren(f);
      pop(spot);
      if (cfg.blanks === 1) b.remove();
      if (open().length) return;
      if (!missed) firstTry++;
      sfx.correct();
      cheer(top);
      speak('맞아요! 규칙을 찾았어요.');
      ctx.later(() => top.classList.add('clear'), 1500);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
    }
    ctx.prompt('식탁 위 음식이 놓인 차례를 보고 규칙을 찾아요. 물음표 자리에 올 음식을 바닥에서 끌어 올려요!',
      () => speak('물음표 자리에는 무엇이 올까요?'));
  }
  round();
}
