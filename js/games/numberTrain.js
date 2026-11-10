import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

// 단계별: 수 카드 만들기, 줄 세우는 차례(up = 작은 수부터, down = 큰 수부터, any = 둘 중 하나)
const CFG = [
  { cards: () => consec(1, 5, 3), dir: 'up' },
  { cards: () => pickN(range(1, 10), 4), dir: 'up' },
  { cards: () => consec(11, 20, 5), dir: 'any' },
  { cards: () => pickN(range(10, 99), 5), dir: 'any' },
  // 자리 숫자를 바꾼 수(47 · 74)처럼 헷갈리는 수를 섞는다
  { cards: () => twisted(), dir: 'any' },
];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const consec = (lo, hi, k) => { const a = randInt(lo, hi - k + 1); return shuffle(range(a, a + k - 1)); };
function twisted() {
  const a = randInt(1, 8);
  const b = randInt(a + 1, 9);
  const s = new Set([a * 10 + b, b * 10 + a, a * 10 + randInt(0, 9), b * 10 + randInt(0, 9)]);
  while (s.size < 5) s.add(randInt(10, 99));
  return shuffle([...s]);
}
const SAY = {
  big: '가장 큰 수', small: '가장 작은 수',
  down: '가장 큰 수에서부터 작은 순서대로 나열하세요.', up: '가장 작은 수에서부터 큰 순서대로 나열하세요.',
  ends: '가장 큰 수와 가장 작은 수를 찾아 열차에 실어요!',
};

// 숫자 열차(CircusTrain): 가장 큰 수 · 가장 작은 수를 찾아 싣고, 수를 크기 차례대로 열차 칸에 늘어놓는다 (참고 영상 기준)
export function mount(stage, ctx) {
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const talk = h('div', { class: 'nt-talk' });
  const train = h('div', { class: 'nt-train' });
  const bank = h('div', { class: 'nt-bank' });
  const go = h('button', { class: 'nt-go', type: 'button', 'aria-label': '다 실었어요' }, '✓');
  const track = h('div', { class: 'nt-track' }, train);
  stage.append(h('div', { class: 'number-train' }, talk, track, h('div', { class: 'nt-ground' }, bank, go)));
  // 판: 가장 큰/작은 수 찾기와 줄 세우기를 번갈아
  const kinds = ['ends', 'order', 'ends', 'order'];
  const R = kinds.length;
  let n = 0;
  let firstTry = 0;
  let sel = null;

  const bubble = (key) => {
    const b = h('button', { class: 'nt-say', type: 'button' }, h('i', { 'aria-hidden': 'true' }, '🔊'), SAY[key]);
    b.addEventListener('click', () => speak(SAY[key]));
    return b;
  };

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const kind = kinds[n];
    // 상세 단계가 수 범위(nums)를 정하면 그 범위에서 다섯 장
    const nums = cfg.nums ? pickN(range(...cfg.nums), 5) : cfg.cards();
    const dir = cfg.dir === 'any' ? pick(['up', 'down']) : cfg.dir;
    const sorted = [...nums].sort((a, b) => (dir === 'up' ? a - b : b - a));
    let missed = false;
    let locked = false;
    sel = null;
    train.classList.remove('go', 'in');
    // 칸: 큰 수 · 작은 수 찾기는 두 칸, 줄 세우기는 수만큼
    const want = kind === 'ends' ? [Math.max(...nums), Math.min(...nums)] : sorted;
    const cars = want.map((v, i) => {
      const c = h('button', { class: `nt-car${i === 0 ? ' head' : ''}`, type: 'button', 'aria-label': `${i + 1}번째 칸` });
      c.dataset.want = v;
      c.addEventListener('click', () => {
        if (locked) return;
        const t = c.querySelector('.nt-num');
        if (t) { back(t); return; }
        if (sel) put(sel, c);
      });
      return c;
    });
    const engine = h('div', { class: 'nt-engine', 'aria-hidden': 'true' }, h('span', { class: 'nt-driver' }, kind === 'ends' ? '🐻' : '🦊'), h('b', {}, '★'));
    train.replaceChildren(engine, ...cars);
    talk.replaceChildren(...(kind === 'ends' ? [bubble('big'), bubble('small')] : [bubble(dir)]));
    if (kind === 'ends') cars.forEach((c, i) => c.append(h('small', { class: 'nt-tag' }, i ? '작은 수' : '큰 수')));
    requestAnimationFrame(() => train.classList.add('in'));
    const tiles = shuffle(nums).map((v) => {
      const t = h('button', { class: 'nt-num', type: 'button' }, String(v));
      t.dataset.v = v;
      draggable(t, {
        can: () => !locked,
        onDrop: (pt) => {
          const c = cars.find((x) => !x.querySelector('.nt-num') && hits(x, pt, 6));
          if (c) put(t, c);
          else if (t.parentElement !== bank && !hits(train, pt, 10)) back(t);
          else wiggle(t);
        },
      });
      t.addEventListener('click', (e) => {
        if (locked) return;
        e.stopPropagation();
        if (t.parentElement !== bank) { back(t); return; }
        sfx.tap();
        speak(String(v));
        // 줄 세우기는 누르면 앞에서부터 빈 칸에 차례로 들어간다
        if (kind === 'order') { const c = cars.find((x) => !x.querySelector('.nt-num')); if (c) put(t, c); return; }
        sel?.classList.remove('sel');
        sel = sel === t ? null : t;
        sel?.classList.add('sel');
      });
      return t;
    });
    bank.replaceChildren(...tiles);
    go.hidden = kind === 'ends';
    go.classList.remove('on');

    function back(t) {
      t.classList.remove('sel', 'bad');
      bank.append(t);
      [...bank.children].sort((a, b) => tiles.indexOf(a) - tiles.indexOf(b)).forEach((x) => bank.append(x));
      sfx.tap();
      go.classList.toggle('on', cars.every((c) => c.querySelector('.nt-num')));
    }

    function put(t, c) {
      sel?.classList.remove('sel');
      sel = null;
      // 큰 수 · 작은 수 칸은 넣는 즉시 맞는지 본다
      if (kind === 'ends' && Number(t.dataset.v) !== Number(c.dataset.want)) {
        missed = true;
        wiggle(t);
        speak(c === cars[0] ? '더 큰 수가 있어요!' : '더 작은 수가 있어요!');
        hinter.miss(tiles.find((x) => Number(x.dataset.v) === Number(c.dataset.want)));
        return;
      }
      c.querySelector('.nt-tag')?.remove();
      c.append(t);
      sfx.pop();
      pop(c);
      if (kind === 'ends') {
        speak(String(t.dataset.v));
        if (cars.every((x) => x.querySelector('.nt-num'))) done();
        return;
      }
      go.classList.toggle('on', cars.every((x) => x.querySelector('.nt-num')));
    }

    go.onclick = () => {
      if (locked) return;
      if (!cars.every((c) => c.querySelector('.nt-num'))) { wiggle(go); hinter.miss(bank.firstElementChild); return; }
      const bad = cars.filter((c) => Number(c.querySelector('.nt-num').dataset.v) !== Number(c.dataset.want));
      if (bad.length) {
        missed = true;
        speak(SAY[dir]);
        bad.forEach((c) => { const t = c.querySelector('.nt-num'); t.classList.add('bad'); wiggle(t); });
        ctx.later(() => bad.forEach((c) => { const t = c.querySelector('.nt-num'); if (t) back(t); }), 700);
        hinter.miss(tiles.find((x) => Number(x.dataset.v) === Number(bad[0].dataset.want)));
        return;
      }
      done();
    };

    function done() {
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(train);
      go.classList.remove('on');
      speak(want.map(String));
      ctx.later(() => { train.classList.add('go'); burst(track, ['⭐', '✨', '💨']); }, 900 + want.length * 450);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2400 + want.length * 450);
    }

    ctx.prompt(kind === 'ends' ? '가장 큰 수는 앞 칸에, 가장 작은 수는 뒤 칸에 실어요! 수를 누른 뒤 칸을 누르거나 끌어다 놓아요.'
      : dir === 'up' ? '가장 작은 수부터 큰 수까지 차례대로 열차 칸에 실어요! 다 실으면 ✓를 눌러요.' : '가장 큰 수부터 작은 수까지 차례대로 열차 칸에 실어요! 다 실으면 ✓를 눌러요.',
    () => speak(kind === 'ends' ? SAY.ends : SAY[dir]));
  }

  round();
}
