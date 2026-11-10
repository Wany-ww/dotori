import { h, shuffle, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SYLLABLE_WORDS } from '../data.js';
import { draggable, hits } from './dragTap.js';

const ROUNDS = 4;
// 단계별: 쟁반 수, 낱말 글자 수 범위, 처음 젤리 모양(한 덩어리 · 낱개 · 섞임), 쟁반에 칸 모양을 보여 줄지
const CFG = [
  { trays: 2, min: 1, max: 2, start: 'bar', outline: true },
  { trays: 2, min: 1, max: 3, start: 'bar', outline: true },
  { trays: 2, min: 1, max: 3, start: 'bar', outline: false },
  { trays: 3, min: 1, max: 3, start: 'cubes', outline: false },
  { trays: 3, min: 1, max: 4, start: 'mixed', outline: false },
];
const FLAVORS = [['#8B5A2B', '#FFF4E0'], ['#4A2C17', '#FFE1A8'], ['#F48FB1', '#7A1F45'], ['#F3E3C3', '#6B4A1C']];
const MAX_BLOCKS = 8;

// 쟁반 낱말: 서로 다른 낱말, 글자 수 합이 MAX_BLOCKS 이하. 한글 차시면 그 차시의 낱말을 글자 수별로 묶어 쓴다
function trayWords(cfg, lesson) {
  // 차시에 잘 맞는 낱말부터 (모자라는 글자 수는 기본 낱말로)
  const bank = lesson ? byLength(lesson.words(14, { maxLen: cfg.max })) : SYLLABLE_WORDS;
  for (let k = 0; k < 200; k++) {
    const counts = Array.from({ length: cfg.trays }, () => randInt(cfg.min, cfg.max));
    if (counts.reduce((a, b) => a + b, 0) > MAX_BLOCKS) continue;
    const words = [];
    counts.forEach((n) => {
      const pool = (bank[n] || []).filter((w) => !words.includes(w));
      words.push(pick(pool.length ? pool : SYLLABLE_WORDS[n].filter((w) => !words.includes(w))));
    });
    return words;
  }
  return ['사과', '곰'];
}
function byLength(list) {
  const out = {};
  list.forEach((w) => { (out[[...w.word].length] ||= []).push(w.word); });
  return out;
}

// 신기한 초콜릿(FantasticChocolate): 쟁반의 낱말을 듣고 글자 수만큼 젤리를 자르거나 붙여 쟁반에 올린다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const hinter = makeHinter();
  const shelf = h('div', { class: 'ch-trays' });
  const bar = h('div', { class: 'ch-bar' });
  const knife = h('button', { class: 'ch-knife', type: 'button', 'aria-label': '칼' }, h('i'));
  const board = h('div', { class: 'ch-board' }, bar, knife);
  stage.append(h('div', { class: 'choco' }, shelf, board));

  let r = 0;
  let firstTry = 0;
  let total = 0;
  let misses = 0;
  let trays = [];
  let segs = [];
  let sel = null;
  let busy = false;

  /* ---------- 쟁반 ---------- */
  async function readAll() {
    const my = r;
    for (const t of trays) {
      if (my !== r || !stage.isConnected) return;
      if (t.done) continue;
      t.el.classList.add('talk');
      await Promise.all([speak(t.word), new Promise((res) => ctx.later(res, 900))]);
      t.el.classList.remove('talk');
    }
  }

  function makeTray(word, i) {
    const n = [...word].length;
    const spot = h('span', { class: `ch-spot${cfg.outline ? ' outline' : ''}`, style: { '--n': n } },
      cfg.outline ? Array.from({ length: n }, () => h('i')) : null);
    const say = h('button', { class: 'ch-say', type: 'button', 'aria-label': `${i + 1}번 쟁반 낱말 듣기` }, '🔊');
    const el = h('button', { class: 'ch-tray', type: 'button', 'aria-label': `${i + 1}번 쟁반` }, spot);
    const t = { el, spot, word, n, done: false };
    el.dataset.n = n;
    say.addEventListener('click', (e) => { e.stopPropagation(); speak(word); });
    el.addEventListener('click', () => {
      if (sel) place(sel, t);
      else speak(word);
    });
    t.wrap = h('div', { class: 'ch-tray-wrap' }, say, el);
    return t;
  }

  /* ---------- 젤리 막대 ---------- */
  // segs: 도마 위 조각들의 길이 (예: [4] → 칼로 자르면 [2, 2]).
  // 젤리 한 칸에 글자 하나가 적혀 있다. letters는 막대 전체의 글자 (쟁반 낱말들을 이어 붙인 것)
  let letters = [];
  const startOf = (k) => segs.slice(0, k).reduce((a, b) => a + b, 0);
  const textOf = (k) => letters.slice(startOf(k), startOf(k) + segs[k]).join('');

  // 조각을 누르면 그 조각의 글자를 한 칸씩 짚어 가며 읽어 준다
  let readTimer = 0;
  function readPiece(piece, k) {
    const cubes = [...piece.querySelectorAll('.ch-cube')];
    clearTimeout(readTimer);
    bar.querySelectorAll('.ch-cube.say').forEach((c) => c.classList.remove('say'));
    // 낱말이 된 조각은 낱말로, 아니면 한 글자씩 끊어 읽는다
    const text = textOf(k);
    speak(trays.some((t) => t.word === text) ? text : [...text]);
    cubes.forEach((c, i) => {
      const t = ctx.later(() => {
        cubes.forEach((x) => x.classList.remove('say'));
        c.classList.add('say');
        if (i === cubes.length - 1) readTimer = ctx.later(() => c.classList.remove('say'), 420);
      }, i * 330);
      readTimer = t;
    });
  }

  function render() {
    sel = null;
    const kids = [];
    segs.forEach((len, k) => {
      if (k > 0) {
        const gap = h('button', { class: 'ch-gap', type: 'button', 'aria-label': '두 조각 붙이기' });
        gap.addEventListener('click', () => join(k - 1));
        kids.push(gap);
      }
      const cells = [];
      for (let j = 0; j < len; j++) {
        if (j > 0) {
          const seam = h('button', { class: 'ch-seam', type: 'button', 'aria-label': '여기 자르기' });
          seam.dataset.k = k;
          seam.dataset.j = j;
          seam.addEventListener('click', (e) => { e.stopPropagation(); cut(k, j, seam); });
          cells.push(seam);
        }
        cells.push(h('i', { class: 'ch-cube' }, h('b', {}, letters[startOf(k) + j])));
      }
      const piece = h('div', { class: 'ch-piece', role: 'button', tabindex: '0', 'aria-label': `젤리 ${len}칸 ${textOf(k)}` }, cells);
      piece.dataset.len = len;
      const pc = { el: piece, k, len, text: textOf(k) };
      piece.addEventListener('click', () => { select(pc); readPiece(piece, k); });
      draggable(piece, {
        can: (e) => !busy && !e.target.closest('.ch-seam'),
        onMove: (p) => trays.forEach((t) => t.el.classList.toggle('over', !t.done && hits(t.el, p))),
        onDrop: (p) => {
          trays.forEach((t) => t.el.classList.remove('over'));
          const t = trays.find((o) => !o.done && hits(o.el, p));
          if (t) place(pc, t);
        },
      });
      kids.push(piece);
    });
    bar.replaceChildren(...kids);
  }

  // 칼이 내려와 자르는 모습
  function chop(at) {
    const b = board.getBoundingClientRect();
    const s = at.getBoundingClientRect();
    knife.style.left = `${s.left - b.left + s.width / 2}px`;
    knife.classList.remove('chop');
    void knife.offsetWidth;
    knife.classList.add('chop');
    ctx.later(() => { knife.classList.remove('chop'); knife.style.left = ''; }, 450);
  }

  function cut(k, j, seam) {
    if (busy) return;
    chop(seam);
    sfx.tap();
    segs.splice(k, 1, j, segs[k] - j);
    ctx.later(render, 180);
  }

  function join(k) {
    if (busy) return;
    sfx.pop();
    segs.splice(k, 2, segs[k] + segs[k + 1]);
    render();
  }

  // 칼을 끌어 젤리 사이에 놓아도 자른다
  draggable(knife, {
    can: () => !busy,
    onDrop: (p) => {
      const seam = [...bar.querySelectorAll('.ch-seam')].find((s) => hits(s, p, 18));
      if (seam) cut(+seam.dataset.k, +seam.dataset.j, seam);
    },
  });
  knife.addEventListener('click', () => {
    const seam = bar.querySelector('.ch-seam');
    if (seam) hinter.miss(seam);
  });

  function select(pc) {
    if (busy) return;
    sfx.tap();
    bar.querySelectorAll('.ch-piece.sel').forEach((p) => p.classList.remove('sel'));
    if (sel?.el === pc.el) { sel = null; return; }
    sel = pc;
    pc.el.classList.add('sel');
  }

  /* ---------- 쟁반에 올리기 ---------- */
  // 글자가 적혀 있으니 글자 수만이 아니라 낱말이 같아야 쟁반에 올라간다
  function place(pc, t) {
    if (busy || t.done) return;
    if (pc.len !== t.n || pc.text !== t.word) {
      misses++;
      wiggle(pc.el);
      pc.el.classList.remove('sel');
      sel = null;
      speak(t.word);
      hinter.miss(trays.find((o) => !o.done && o.word === pc.text)?.el);
      return;
    }
    hinter.reset();
    t.done = true;
    letters.splice(startOf(pc.k), pc.len);
    segs.splice(pc.k, 1);
    render();
    // 젤리가 쟁반 위에서 초콜릿으로 변하고, 한 칸에 한 글자씩 나타난다
    const [bg, fg] = FLAVORS[trays.indexOf(t) % FLAVORS.length];
    t.spot.className = 'ch-spot filled';
    // 초콜릿 한 칸을 누르면 그 글자를, 쟁반을 누르면 낱말 전체를 읽어 준다
    t.spot.replaceChildren(...[...t.word].map((s) => {
      const piece = h('i', { style: { background: bg, color: fg }, role: 'button', 'aria-label': `${s} 읽기` }, s);
      piece.addEventListener('click', (e) => { e.stopPropagation(); pop(piece); speak(s); });
      return piece;
    }));
    pop(t.spot);
    sfx.correct();
    speak(t.word);
    ctx.progress(r + trays.filter((o) => o.done).length / trays.length, ROUNDS);
    if (trays.some((o) => !o.done)) return;
    busy = true;
    cheer(shelf);
    ctx.later(() => {
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
      else round();
    }, 2000);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    busy = false;
    const words = trayWords(cfg, ctx.lesson);
    total += words.length;
    trays = words.map(makeTray);
    shelf.replaceChildren(...trays.map((t) => t.wrap));
    // 막대에는 쟁반 낱말들이 섞인 순서로 이어져 있다
    const order = shuffle(words);
    letters = order.flatMap((w) => [...w]);
    const n = letters.length;
    if (cfg.start === 'bar') segs = [n];
    else if (cfg.start === 'cubes') segs = Array(n).fill(1);
    else {
      // 섞임: 아무렇게나 잘린 조각들 (정답 모양과 같지 않게)
      const want = order.map((w) => [...w].length).join();
      do {
        segs = [];
        let left = n;
        while (left > 0) { const s = randInt(1, Math.min(3, left)); segs.push(s); left -= s; }
      } while (segs.join() === want);
    }
    render();
    ctx.prompt(
      cfg.start === 'bar'
        ? '쟁반의 낱말을 듣고, 젤리를 낱말만큼 칼로 잘라 쟁반에 올려요! 젤리를 누르면 읽어 줘요.'
        : '쟁반의 낱말을 듣고, 젤리를 붙이거나 잘라서 낱말을 만들어 쟁반에 올려요! 젤리를 누르면 읽어 줘요.',
      () => readAll(),
    );
  }

  round();
}
