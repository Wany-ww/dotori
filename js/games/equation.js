import { h, shuffle, pickN, randInt, pick, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { STORY_WHO, storyParts } from '../data.js';

const R = 4;

// 수식 완성하기(EquationMaker · eq): 식에 쓰일 숫자 · 기호 카드를 다섯 칸에 늘어놓아 맞는 등식을 만든다 (맞기만 하면 어떤 순서든 정답).
// 읽고 수식 만들기(WordToEquation · word): 문장제를 읽고, 남는 카드가 섞인 카드 중에서 골라 다섯 칸에 식을 만든다 (참고 영상 기준).
// 숫자 조합기(NumberLineUp · digits): 숫자 카드를 자리 칸에 넣어 목표 수를 만든다
export function mount(stage, ctx) {
  const digits = ctx.opts.mode === 'digits';
  const word = ctx.opts.mode === 'word';
  const L = ctx.level;
  const hinter = makeHinter();
  const ask = h('p', { class: 'eq-ask' });
  const row = h('div', { class: 'eq-row' });
  const bank = h('div', { class: 'eq-bank' });
  const go = h('button', { class: 'btn btn-primary', type: 'button' }, '확인');
  stage.append(h('div', { class: `equation mode-${digits ? 'digits' : 'eq'}${word ? ' mode-word' : ''}` }, ask, row, bank, go));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let missed = false;
    // 칸: 고정 글자(문자열) 또는 빈칸({ kind: 'num' | 'op' })
    let parts;
    let tiles;
    let check;
    let say;
    if (digits) {
      // 참고 영상(수 만들기 2단계)처럼 2단계는 카드 두 장으로 가장 큰/작은 두 자리 수, 남는 카드는 3단계부터
      const len = L >= 4 ? 3 : 2;
      const cards = shuffle(pickN([1, 2, 3, 4, 5, 6, 7, 8, 9], len + (L >= 3 ? 1 : 0)));
      const goal = L === 1 || L === 4 ? 'make' : pick(['big', 'small']);
      const used = cards.slice(0, len);
      const target = goal === 'make' ? Number(used.join('')) : goal === 'big' ? Number([...cards].sort((a, b) => b - a).slice(0, len).join('')) : Number([...cards].sort((a, b) => a - b).slice(0, len).join(''));
      parts = Array.from({ length: len }, () => ({ kind: 'num' }));
      tiles = cards.map(String);
      check = (vals) => Number(vals.join('')) === target;
      const MAKE_SAY = { big2: '가장 큰 두 자리 수를 만드세요.', small2: '가장 작은 두 자리 수를 만드세요.', big3: '가장 큰 세 자리 수를 만드세요.', small3: '가장 작은 세 자리 수를 만드세요.' };
      ask.textContent = goal === 'make' ? `숫자 카드로 ${target}${[2, 4, 5, 9].includes(target % 10) ? '를' : '을'} 만들어요!` : MAKE_SAY[goal + len];
      say = goal === 'make' ? (target > 100 ? [String(Math.floor(target / 100) * 100), String(target % 100), '만들어요!'] : [String(target), '만들어요!']) : MAKE_SAY[goal + len];
    } else {
      // 참고 영상(수식 만들기)처럼 식에 쓰일 카드만 섞어 주고, 다섯 칸에 늘어놓아 맞는 식을 만든다 (맞기만 하면 어떤 순서든 정답)
      const op = L <= 2 ? '+' : L === 3 ? '−' : pick(['+', '−']);
      const top = word ? [5, 10, 10, 10, 15][L - 1] : [5, 10, 10, 10, 20][L - 1];
      let x; let y;
      if (op === '+') { x = randInt(1, top - 1); y = randInt(1, Math.min(9, top - x)); } else { x = randInt(2, top); y = randInt(1, Math.min(9, x - 1)); }
      const z = op === '+' ? x + y : x - y;
      parts = Array.from({ length: 5 }, () => ({ kind: 'any' }));
      tiles = shuffle([String(x), op, String(y), '=', String(z)]);
      // 문장제는 다른 기호 하나와 헷갈리는 수 하나를 섞는다 (5 3 − + 2 10 =)
      if (word) {
        const odd = [x + y, Math.abs(x - y), z + 5, 10].find((v) => v > 0 && ![x, y, z].includes(v)) ?? z + 1;
        tiles = shuffle([...tiles, op === '+' ? '−' : '+', String(odd)]);
      }
      check = (vals) => {
        const k = vals.indexOf('=');
        if (k < 0 || vals.lastIndexOf('=') !== k) return false;
        const side = (xs) => (xs.length === 1 && /^\d+$/.test(xs[0]) ? Number(xs[0])
          : xs.length === 3 && /^\d+$/.test(xs[0]) && /^\d+$/.test(xs[2]) && '+−'.includes(xs[1]) ? (xs[1] === '+' ? Number(xs[0]) + Number(xs[2]) : Number(xs[0]) - Number(xs[2])) : NaN);
        const l = side(vals.slice(0, k));
        if (Number.isNaN(l) || l !== side(vals.slice(k + 1))) return false;
        // 문장제: 이야기의 세 수와 이야기의 셈으로 만든 식만 (2 + 3 = 5 · 3 + 2 = 5 · 5 = 2 + 3)
        const nums = vals.filter((v) => /^\d+$/.test(v)).map(Number).sort((p, q) => p - q).join();
        return !word || (vals.includes(op) && nums === [x, y, z].sort((p, q) => p - q).join());
      };
      if (word) {
        const parts3 = storyParts(op === '+' ? '+' : '-', pick(STORY_WHO), x, y);
        const story = parts3.join(' ');
        ask.replaceChildren(h('button', { class: 'eq-story', type: 'button', onclick: () => speak(parts3) }, h('i', { 'aria-hidden': 'true' }, '🔊'), story));
        say = parts3;
      } else {
        ask.textContent = '카드를 칸에 늘어놓아 맞는 식을 만들어요!';
        say = '카드로 맞는 식을 만들어요!';
      }
      tiles.sol = [String(x), op, String(y), '=', String(z)];
    }
    const slots = [];
    // 시험용: 정답 하나 (숫자 조합기는 목표 수의 숫자들, 등식은 맞는 짝 하나)
    const sol = digits ? null : tiles.sol;
    row.dataset.sol = JSON.stringify(sol || []);
    row.replaceChildren(...parts.map((p) => {
      if (typeof p === 'string') return h('span', { class: 'eq-fixed' }, p);
      const s = h('button', { class: `eq-slot ${p.kind}`, type: 'button', 'aria-label': p.kind === 'op' ? '기호 칸' : '숫자 칸' });
      s.dataset.kind = p.kind;
      s.addEventListener('click', () => { if (s.dataset.v) { const t = bank.querySelector(`.eq-tile[data-used="${slots.indexOf(s)}"]`); if (t) { t.disabled = false; delete t.dataset.used; } delete s.dataset.v; s.textContent = ''; sfx.tap(); } });
      slots.push(s);
      return s;
    }));
    bank.replaceChildren(...tiles.map((v) => {
      const t = h('button', { class: `eq-tile${'+−'.includes(v) ? ' op' : ''}`, type: 'button' }, v);
      t.dataset.v = v;
      t.addEventListener('click', () => {
        if (t.disabled) return;
        const kind = '+−'.includes(v) ? 'op' : 'num';
        const s = slots.find((x) => !x.dataset.v && (x.dataset.kind === kind || x.dataset.kind === 'any'));
        if (!s) { wiggle(t); return; }
        sfx.pop();
        s.dataset.v = v;
        s.textContent = v;
        pop(s);
        // 카드는 한 번만 쓴다. 수식 만들기는 다섯 칸이 다 차면 바로 맞는지 본다
        t.disabled = true;
        t.dataset.used = slots.indexOf(s);
        if (!digits && slots.every((x) => x.dataset.v)) go.onclick();
      });
      return t;
    }));
    go.disabled = false;
    go.hidden = !digits;
    let locked = false;
    go.onclick = () => {
      if (locked || go.disabled) return;
      if (slots.some((s) => !s.dataset.v)) { wiggle(go); hinter.miss(slots.find((s) => !s.dataset.v)); return; }
      const vals = slots.map((s) => s.dataset.v);
      if (!check(vals)) {
        missed = true;
        wiggle(row);
        speak('다시 생각해 봐요');
        locked = true;
        ctx.later(() => {
          locked = false;
          slots.forEach((s) => { delete s.dataset.v; s.textContent = ''; });
          bank.querySelectorAll('.eq-tile').forEach((t) => { t.disabled = false; delete t.dataset.used; });
        }, 700);
        return;
      }
      if (!missed) firstTry++;
      go.disabled = true;
      hinter.reset();
      sfx.correct();
      cheer(row);
      speak(digits ? '맞아요!' : '맞는 식이에요!');
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 1900);
    };
    ctx.prompt(word ? '이야기를 읽고 카드로 알맞은 식을 만들어요!' : ask.textContent, () => speak(say));
    if (word) speak(say);
  }

  round();
}
