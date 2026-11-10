import { h, pick, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const R = 5;
const KEYS = ['abcdefghijklmnop'.split(''), [...'qrstuvwxyz'.split(''), "'", '!', '?', ',', '.']];
// 단계(Lv)마다 빠지는 글자 수 (낱말의 앞에서부터. 5단계는 낱말 하나 통째로)
const MISSING = [1, 1, 2, 3, 99];
const say = (t) => speak(t, 'en-US');

// 문장 다리 만들기(SentenceBridge): 트럭이 건너야 할 벽돌 다리의 문장에 글자가 빠졌어요!
// 아래 알파벳 자판으로 빠진 글자를 쳐서 문장을 이으면 트럭이 다리를 건넌다 (참고 영상: "I _ill live in a big houseboat.")
export function mount(stage, ctx) {
  const L = ctx.level;
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= L)));
  const hinter = makeHinter();
  const rounds = U.sentences(R);
  const line = h('p', { class: 'bt-line latin', 'aria-live': 'polite' });
  const truck = h('span', { class: 'bt-truck', 'aria-hidden': 'true' }, '🚚');
  const ear = h('button', { class: 'bt-ear', type: 'button', 'aria-label': '문장 듣기' }, '🔊');
  const keys = KEYS.map((row) => h('div', { class: 'bt-row' }, row.map((c) => {
    const k = h('button', { class: 'bt-key latin', type: 'button' }, c);
    k.dataset.c = c;
    k.addEventListener('click', () => type(c, k));
    return k;
  })));
  stage.append(h('div', { class: 'bridge-type' },
    h('div', { class: 'bt-road' }, truck, ear),
    h('div', { class: 'bt-bridge' }, line, h('div', { class: 'bt-keys' }, keys))));
  let n = 0;
  let firstTry = 0;
  let cells = [];
  let at = 0;
  let miss = 0;
  let busy = false;

  // 컴퓨터 자판으로도 칠 수 있다
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const c = e.key.toLowerCase();
    const k = stage.querySelector(`.bt-key[data-c="${CSS.escape(c)}"]`);
    if (k) { e.preventDefault(); type(c, k); }
  };
  addEventListener('keydown', onKey);
  ctx.onCleanup(() => removeEventListener('keydown', onKey));

  function round() {
    hinter.reset();
    ctx.progress(n, rounds.length);
    const s = rounds[n];
    const toks = s.text.split(' ');
    // 빠질 낱말: 그 문장의 정답 낱말(빈칸 놀이용으로 고른 말)부터, 없으면 글자가 3개 넘는 낱말
    const clean = (w) => w.replace(/[^A-Za-z']/g, '');
    let wi = toks.findIndex((w) => clean(w).toLowerCase() === String(s.answer).toLowerCase() && clean(w).length >= 2);
    if (wi < 0) wi = toks.indexOf(pick(toks.filter((w) => clean(w).length >= 3)) || toks[0]);
    const word = toks[wi];
    const start = word.search(/[A-Za-z]/);
    const len = Math.min(MISSING[L - 1], clean(word).length);
    cells = [];
    at = 0;
    miss = 0;
    line.replaceChildren(...toks.flatMap((w, i) => {
      const parts = [];
      if (i !== wi) parts.push(w);
      else {
        parts.push(w.slice(0, start));
        for (let j = 0; j < len; j++) {
          const c = h('span', { class: `bt-cell${j === 0 ? ' now' : ''}` });
          c.dataset.c = w[start + j].toLowerCase();
          c.dataset.show = w[start + j];
          cells.push(c);
          parts.push(c);
        }
        parts.push(w.slice(start + len));
      }
      return i < toks.length - 1 ? [...parts, ' '] : parts;
    }));
    line.classList.remove('roll');
    void line.offsetWidth;
    line.classList.add('roll');
    truck.className = 'bt-truck';
    ear.onclick = () => { sfx.tap(); say(s.text); };
    busy = false;
    ctx.prompt(L <= 3 ? '문장을 듣고, 빠진 글자를 아래 자판으로 쳐요. 트럭이 다리를 건너요!' : '문장을 읽고 빠진 글자를 쳐요. 모르면 🔊를 눌러 들어 봐요!', () => say(s.text), { auto: L <= 3 });
  }

  function type(c, k) {
    if (busy || !cells[at]) return;
    const cell = cells[at];
    if (c !== cell.dataset.c) {
      miss++;
      sfx.wrong();
      wiggle(k);
      if (miss >= 2) hinter.miss(stage.querySelector(`.bt-key[data-c="${CSS.escape(cell.dataset.c)}"]`));
      return;
    }
    hinter.reset();
    sfx.pop();
    pop(k);
    cell.textContent = cell.dataset.show;
    cell.classList.remove('now');
    cell.classList.add('full');
    at++;
    if (cells[at]) { cells[at].classList.add('now'); return; }
    // 문장이 이어졌다: 트럭이 하트를 날리며 건너간다
    busy = true;
    if (miss === 0) firstTry++;
    const s = rounds[n];
    say(s.text);
    truck.classList.add('go');
    cheer(line, 'en');
    ctx.later(() => {
      n++;
      if (n < rounds.length) round();
      else ctx.finish({ firstTry, total: rounds.length });
    }, 2600);
  }

  round();
}
