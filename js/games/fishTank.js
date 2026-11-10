import { h, shuffle, pick, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 4;
const FISH = ['🐡', '🐠', '🐟'];
// 단계별: 놀이 방식(bowls 어항 둘에 나누기 · net 그물로 건지기), 물고기 수 범위
const CFG = [
  { mode: 'bowls', n: [2, 4] },
  { mode: 'bowls', n: [3, 6] },
  { mode: 'net', n: [2, 6] },
  { mode: 'bowls', n: [5, 9] },
  { mode: 'net', n: [4, 10] },
];

// 어항 물고기 세기(FishTank · 수족관): 수조의 물고기를 숫자에 맞게 옮긴 뒤 식을 완성한다 (참고 영상 기준)
// bowls: 어항 두 개에 적힌 수만큼 나눠 담고 "5 = 3 + 2" · net: 그물에 적힌 수만큼 건지고 "5 − 2 = 3"
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const total = h('b', { class: 'ft-total' });
  const tank = h('div', { class: 'ft-tank' });
  const sea = h('div', { class: 'ft-sea' }, total, tank);
  const bowlsRow = h('div', { class: 'ft-bowls' });
  const eqRow = h('div', { class: 'ft-eq' });
  const tiles = h('div', { class: 'ft-tiles' });
  const board = h('div', { class: `fish-tank mode-${cfg.mode}` }, sea, bowlsRow, h('div', { class: 'ft-ground' }, eqRow, tiles));
  stage.append(board);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const N = randInt(...cfg.n);
    const net = cfg.mode === 'net';
    // 나눌 수: 어항 a + b = N (0도 나옴), 그물 k (1 ~ N−1)
    const a = net ? randInt(1, N - 1) : randInt(0, N);
    const b = N - a;
    const fishEmoji = pick(FISH);
    let missed = false;
    let sel = null;
    let phase = 'move';
    total.textContent = N;
    eqRow.replaceChildren();
    tiles.replaceChildren();
    // 그릇: 어항 둘, 또는 수조 안 그물 하나
    const homes = net
      ? [h('div', { class: 'ft-net' }, h('b', { class: 'ft-want' }, String(a)), h('span', { class: 'ft-in' }))]
      : [a, b].map((v) => h('button', { class: 'ft-bowl', type: 'button', 'aria-label': `${v}마리 어항` }, h('small', { class: 'ft-now' }), h('b', { class: 'ft-want' }, String(v)), h('span', { class: 'ft-in' })));
    homes.forEach((x, i) => { x.dataset.want = i ? b : a; });
    if (net) { bowlsRow.replaceChildren(); tank.replaceChildren(homes[0]); } else { tank.replaceChildren(); bowlsRow.replaceChildren(...homes); }
    const inner = (x) => x.querySelector('.ft-in');
    const count = (x) => inner(x).children.length;

    const fish = Array.from({ length: N }, (_, i) => {
      const f = h('button', { class: 'ft-fish', type: 'button', style: { '--d': `${(i % 3) * 0.5}s`, '--y': `${randInt(15, 70)}%`, '--x': `${randInt(5, net ? 50 : 85)}%` }, 'aria-label': '물고기' }, fishEmoji);
      draggable(f, {
        can: () => phase === 'move',
        onDrop: (pt) => { const to = homes.find((x) => hits(x, pt, 8)); if (to) move(f, to); else if (f.parentElement !== tank && hits(sea, pt, 0)) move(f, null); else wiggle(f); },
      });
      f.addEventListener('click', (e) => {
        e.stopPropagation();
        if (phase !== 'move') return;
        sfx.tap();
        // 그물은 누르면 바로 들어가고 나온다. 어항은 물고기를 고른 뒤 어항을 누른다 (어항 속 물고기를 누르면 수조로)
        if (net) { move(f, f.parentElement === tank ? homes[0] : null); return; }
        if (f.parentElement !== tank) { move(f, null); return; }
        sel?.classList.remove('sel');
        sel = sel === f ? null : f;
        sel?.classList.add('sel');
      });
      return f;
    });
    tank.append(...fish);
    homes.forEach((x) => x.addEventListener('click', () => { if (phase === 'move' && sel && !net) move(sel, x); }));

    function paint() { if (!net) homes.forEach((x) => { x.querySelector('.ft-now').textContent = count(x); }); }
    paint();

    function move(f, to) {
      f.classList.remove('sel');
      sel = null;
      (to ? inner(to) : tank).append(f);
      sfx.pop();
      pop(f);
      paint();
      if (to) speak(String(count(to)));
      const done = homes.every((x) => count(x) === Number(x.dataset.want)) && (net || tank.querySelectorAll('.ft-fish').length === 0);
      if (done) ctx.later(equation, 500);
      else if (to && count(to) > Number(to.dataset.want)) { missed = true; hinter.miss(to); speak('너무 많아요!'); }
    }

    // 식 완성: 빈칸에 수 카드를 넣는다
    function equation() {
      phase = 'eq';
      hinter.reset();
      const parts = net ? [null, '−', null, '=', String(b)] : [String(N), '=', null, '+', null];
      const answers = net ? [N, a] : [a, b];
      const blanks = [];
      eqRow.replaceChildren(...parts.map((p) => {
        if (p !== null) return h('span', { class: 'ft-cell' }, p);
        const s = h('span', { class: 'ft-cell blank' });
        blanks.push(s);
        return s;
      }));
      const cards = shuffle(answers.map((v, i) => ({ v, i }))).map(({ v }) => {
        const c = h('button', { class: 'ft-card', type: 'button' }, String(v));
        c.addEventListener('click', () => {
          const k = blanks.findIndex((s) => !s.textContent);
          if (k < 0) return;
          if (v !== answers[k]) { missed = true; wiggle(c); hinter.miss(cards.find((x) => !x.disabled && Number(x.textContent) === answers[k])); speak(net ? '처음에 있던 수부터 넣어요!' : '왼쪽 어항부터 넣어요!'); return; }
          blanks[k].textContent = v;
          blanks[k].classList.add('in');
          c.disabled = true;
          c.classList.add('used');
          sfx.pop();
          if (blanks.every((s) => s.textContent)) win();
        });
        return c;
      });
      tiles.replaceChildren(...cards);
      speak('식을 완성해요!');
    }

    function win() {
      phase = 'done';
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(eqRow);
      burst(sea, ['🫧', '⭐', '✨']);
      speak(net ? [String(N), '빼기', String(a), '는', String(b)] : [String(N), '는', String(a), '더하기', String(b)]);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2400);
    }

    ctx.prompt(net ? `물고기 ${N}마리 중에서 그물에 적힌 수만큼 건져요! 물고기를 누르면 그물로 들어가요.` : `물고기 ${N}마리를 어항에 적힌 수만큼 나눠 담아요! 물고기를 끌거나, 누른 뒤 어항을 눌러요.`,
      () => speak(net ? '그물에 적힌 수만큼 물고기를 건져요!' : '어항에 적힌 수만큼 물고기를 담아요!'));
  }

  round();
}
