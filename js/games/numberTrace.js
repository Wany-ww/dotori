import { h, shuffle, pickN, randInt, pop, cheer, burst } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { TRACE_SETS, numEn, NATIVE_NUM } from '../data.js';
import { advice } from '../handwriting.js';
import { traceGame } from './trace.js';
import { makePad } from './writeKit.js';

const DIGIT = new Map(TRACE_SETS.digits.items.map((it) => [it.ch, it]));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// 수학판(ko)은 숫자를 한자어로 읽고 고유어 수를 함께 보여 준다: 2 → '2' · '둘'
const koWord = (n) => (n === 0 ? '영' : NATIVE_NUM[n - 1]);

// 두 자리 수: 숫자 둘을 반씩 줄여 나란히 놓는다 (획순은 십의 자리부터)
const squeeze = (st, cx) => {
  const f = ([x, y]) => [cx + (x - 50) * 0.5, 14 + y * 0.74];
  return Array.isArray(st) ? st.map(f) : { ...st, p: st.p.map(f) };
};
export function item(n, ko = false) {
  const word = ko ? koWord(n) : numEn(n);
  const strokes = n < 10 ? DIGIT.get(String(n)).strokes
    : [...DIGIT.get(String(n)[0]).strokes.map((st) => squeeze(st, 28)), ...DIGIT.get(String(n)[1]).strokes.map((st) => squeeze(st, 72))];
  return { ch: String(n), n, say: ko ? String(n) : word, label: word, strokes };
}

// 왼쪽 칸: 수만큼 노란 점. 열까지는 4×4 칸 중 몇 자리에 흩어 놓고(겹치지 않게), 열이 넘으면 다섯 개씩 줄 맞춰
function dots(it) {
  const many = it.n > 10;
  const spots = pickN(range(0, 15), Math.min(it.n, 16));
  return h('div', { class: `nt-dots${many ? ' frame' : ''}` }, range(1, it.n).map((k) => h('i', {
    style: many ? {} : {
      left: `${6 + (spots[k - 1] % 4) * 22 + randInt(0, 6)}%`,
      top: `${6 + Math.floor(spots[k - 1] / 4) * 22 + randInt(0, 6)}%`,
      animationDelay: `${(k % 5) * 0.3}s`,
    },
  })));
}

// 단계별 숫자: 1~5 차례로 → 6~10과 0 → 0~10 섞어서 → 11~20 두 자리 → 듣고 혼자 쓰기
const PICK = [
  () => { const a = randInt(1, 3); return range(a, a + 2); },
  () => shuffle([0, ...pickN(range(6, 10), 3)]),
  () => pickN(range(0, 10), 4),
  () => pickN(range(11, 20), 5),
];

const SET = {
  lang: 'en-US',
  latin: true,
  lines: true,
  cls: 'numtrace',
  prompt: (it) => `${it.ch} (${it.say}) — Start at the yellow dot and follow the arrows!`,
  side: dots,
};

const SET_KO = {
  ...SET,
  lang: 'ko-KR',
  prompt: (it) => `${it.ch} (${it.label}) — 노란 점에서 출발해 화살표 방향으로 따라 써요!`,
};

// 숫자 따라쓰기(NumberTracing · 수학 Tracing): 왼쪽에 수만큼 점, 오른쪽에서 숫자를 획순대로 따라 쓰며 이름을 듣는다.
// 5단계는 본보기 없이 들은 숫자를 혼자 쓰고, 획 수 · 획순 · 방향 · 모양으로 판정한다
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  const en = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  if (ctx.level <= 4) {
    traceGame(stage, ctx, { ...(ko ? SET_KO : SET), pick: (L) => PICK[L - 1]().map((k) => item(k, ko)) });
    return;
  }
  const R = 5;
  const nums = shuffle(range(0, 9)).slice(0, R);
  const card = h('div', { class: 'nt-card' });
  const row = h('div', { class: 'nt-pad' });
  const tip = h('p', { class: 'hw-tip', 'aria-live': 'polite' });
  const undo = h('button', { class: 'btn btn-ghost hw-tool', type: 'button' }, ko ? '↩ 한 획 지우기' : '↩ Undo');
  const how = h('button', { class: 'btn btn-ghost hw-tool', type: 'button' }, ko ? '👀 쓰는 순서 보기' : '👀 Show me how');
  const skip = h('button', { class: 'btn btn-ghost hw-tool', type: 'button', hidden: true }, ko ? '다음으로 ▶' : 'Next ▶');
  stage.append(h('div', { class: 'numwrite' }, card, row, tip, h('div', { class: 'hw-tools' }, undo, how, skip)));
  let n = 0;
  let firstTry = 0;
  let pad = null;
  undo.addEventListener('click', () => { sfx.tap(); pad?.undo(); });
  how.addEventListener('click', () => { sfx.tap(); pad?.showDemo(); });

  function round() {
    ctx.progress(n, R);
    const k = nums[n];
    const word = ko ? String(k) : numEn(k);
    const say = () => en(word);
    let misses = 0;
    let over = false;
    skip.hidden = true;
    tip.textContent = '';
    const ear = h('button', { class: 'hw-ear', type: 'button', 'aria-label': '숫자 다시 듣기', onclick: () => { sfx.tap(); say(); } }, '🔊');
    card.replaceChildren(ear);
    const next = (clean) => {
      if (over) return;
      over = true;
      if (clean) firstTry++;
      card.replaceChildren(h('span', { class: 'nt-word' }, ko ? `${k} · ${koWord(k)}` : word), dots({ n: k }));
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
    };
    pad = makePad(ctx, {
      ch: String(k), model: 'none', level: 3,
      onJudge: (r, p) => {
        if (r.ok) {
          sfx.correct();
          pop(p.el);
          burst(p.el, ['⭐', '✨', '🎉']);
          cheer(row, ko ? 'ko' : 'en');
          tip.textContent = '';
          say();
          next(misses === 0);
          return;
        }
        misses++;
        sfx.wrong();
        const t = advice(r, ctx.lang);
        tip.textContent = t;
        en(t);
        if (p.fails >= 3) skip.hidden = false;
      },
    });
    skip.onclick = () => { sfx.tap(); skip.hidden = true; pad.give(); say(); next(false); };
    row.replaceChildren(pad.el);
    ctx.prompt(ko ? '들려주는 숫자를 잘 듣고, 칸에 바른 순서로 써 봐요!' : 'Listen to the number and write it in the box!', say);
  }
  round();
}
