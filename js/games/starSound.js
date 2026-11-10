import { h, shuffle, pick, pickN, wiggle, makeHinter, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO_SOUND, JUNG_SOUND, JAMO_NAME, QUIZ_SYLLABLES, QUIZ_BATCHIM, CVC_WORDS, VOCAB, similarSyllables } from '../data.js';

const Q = 6;
// 단계별: 무엇을 듣나(자음·모음 jamo · 글자 syl · 받침 글자 bat), 함께 켜지는 별자리 수, 함정이 비슷한 소리인지
const CFG = [
  { kind: 'jamo', n: 2, alike: false },
  { kind: 'syl', n: 2, alike: false },
  { kind: 'syl', n: 3, alike: true },
  { kind: 'bat', n: 3, alike: true },
  { kind: 'bat', n: 4, alike: true },
];
// 함께 켜지는 별자리의 모양: 이웃한 칸끼리 [열, 행] 만큼 떨어져 있다
const GROUPS = {
  2: [[[0, 0], [1, 0]], [[0, 0], [0, 1]]],
  3: [[[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]]],
  4: [[[0, 0], [1, 0], [0, 1], [1, 1]]],
};
const CONS = Object.keys(CHO_SOUND);
const VOWS = Object.keys(JUNG_SOUND);
const NS = 'http://www.w3.org/2000/svg';

const sayOf = (c) => JAMO_NAME[c] ?? c;

/* 영어판(별자리 맞히기): 대문자 → 소문자 → 단어 → 한 글자만 다른 단어(cat/cap/hat) */
const EN_CFG = [
  { kind: 'upper', n: 2 },
  { kind: 'lower', n: 3 },
  { kind: 'word', n: 3 },
  { kind: 'alike', n: 3 },
  { kind: 'alike', n: 4 },
];
const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
const oneOff = (a, b) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
function enQuestion(cfg, last) {
  if (cfg.kind === 'upper' || cfg.kind === 'lower') {
    const pool = cfg.kind === 'upper' ? ABC.map((c) => c.toUpperCase()) : ABC;
    const ans = pick(pool.filter((x) => x !== last));
    return [ans, ...pickN(pool.filter((x) => x !== ans), cfg.n - 1)];
  }
  if (cfg.kind === 'word') {
    const pool = VOCAB.map((v) => v.w).filter((w) => w.length <= 4);
    const ans = pick(pool.filter((x) => x !== last));
    return [ans, ...pickN(pool.filter((x) => x !== ans), cfg.n - 1)];
  }
  const ok = CVC_WORDS.filter((w) => w !== last && CVC_WORDS.filter((x) => oneOff(w, x)).length >= cfg.n - 1);
  const ans = pick(ok);
  return [ans, ...pickN(CVC_WORDS.filter((x) => oneOff(ans, x)), cfg.n - 1)];
}

// 영어 차시: 알파벳 · 소리 단계는 오늘 배우는 글자(대문자 · 소문자 번갈아), 그 뒤로는 오늘 단어
function unitQuestion(unit, n, last, k) {
  if (unit.track === 'alpha' || unit.kind === 'sound') {
    const low = unit.kind === 'sound' || k % 2 === 1;
    const face = (U) => (low ? U.toLowerCase() : U);
    const ans = face(unit.letters(3, { review: false }).find((U) => face(U) !== last) || unit.letters(1)[0]);
    const others = shuffle(unit.known.length >= n ? unit.known : ABC.map((c) => c.toUpperCase())).map(face).filter((x) => x !== ans);
    return [ans, ...others.slice(0, n - 1)];
  }
  const ws = unit.words(n + 3, { spell: false }).map((x) => x.w).filter((w) => w !== last);
  return ws.slice(0, n);
}

// 한글 차시: 낱자를 배우는 차시는 그 낱자들, 그 뒤로는 그 차시의 글자와 헷갈리는 글자
function lessonQuestion(lesson, n, last) {
  const jamoKinds = ['vocab', 'jamoShape', 'theme', 'vowel', 'cons', 'diph'];
  if (jamoKinds.includes(lesson.kind)) {
    const pool = lesson.jamo(10);
    const focus = lesson.focus.length ? lesson.focus : pool;
    const ans = pick(focus.filter((x) => x !== last).length ? focus.filter((x) => x !== last) : focus);
    return [ans, ...pickN(pool.filter((x) => x !== ans), n - 1)];
  }
  const syls = lesson.syllables(10);
  const ans = pick(syls.filter((x) => x !== last).length ? syls.filter((x) => x !== last) : syls);
  const near = lesson.alike(ans, n - 1);
  return [ans, ...near, ...pickN(syls.filter((x) => x !== ans && !near.includes(x)), n - 1 - near.length)];
}

function question(cfg, last, lesson) {
  if (lesson) return lessonQuestion(lesson, cfg.n, last);
  if (cfg.kind === 'jamo') {
    const pool = pick([CONS, VOWS]);
    const ans = pick(pool.filter((x) => x !== last));
    return [ans, ...pickN(pool.filter((x) => x !== ans), cfg.n - 1)];
  }
  const pool = cfg.kind === 'syl' ? QUIZ_SYLLABLES : QUIZ_BATCHIM;
  const ans = pick(pool.filter((x) => x !== last));
  const near = cfg.alike ? similarSyllables(ans).slice(0, cfg.n - 1) : [];
  return [ans, ...near, ...pickN(pool.filter((x) => x !== ans && !near.includes(x)), cfg.n - 1 - near.length)];
}

// 별자리 하나: 꼭짓점 5~6개를 둥글게 흩어 놓은 다각형
function shape() {
  const n = pick([5, 6]);
  const turn = Math.random() * Math.PI * 2;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = turn + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
    const r = 0.72 + Math.random() * 0.28;
    return [50 + Math.cos(a) * 40 * r, 35 + Math.sin(a) * 27 * r];
  });
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 70');
  svg.setAttribute('aria-hidden', 'true');
  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '));
  svg.append(poly);
  pts.forEach(([x, y]) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));
    c.setAttribute('r', '1.5');
    svg.append(c);
  });
  return { svg, pts };
}

// 별빛 소리(ListenNMatch): 밤하늘 별자리 중 몇 개가 글자를 품고 반짝이면, 소리를 듣고 같은 글자의 별자리를 누른다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const cfg = (en ? EN_CFG : CFG)[L - 1];
  const hinter = makeHinter();
  const narrow = matchMedia('(max-width: 600px)').matches;
  const COLS = narrow ? 4 : 5;
  const ROWS = narrow ? 5 : 4;
  const grid = h('div', { class: `ss-grid${en ? ' latin' : ''}${en && L >= 3 ? ' words' : ''}`, style: { '--cols': COLS } });
  const sayBtn = h('button', { class: 'ss-say', type: 'button', 'aria-label': '소리 다시 듣기' }, '🔊');
  stage.append(h('div', { class: 'starsky' }, h('span', { class: 'ss-owl', 'aria-hidden': 'true' }, charFace('owl', '🦉')), sayBtn, grid));

  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const { svg, pts } = shape();
    const letter = h('span', { class: 'ss-letter' });
    const el = h('button', { class: 'ss-star', type: 'button', tabindex: '-1', 'aria-hidden': 'true' }, svg, letter);
    const cell = { el, letter, pts, x: i % COLS, y: Math.floor(i / COLS), c: '', on: false, got: false };
    el.addEventListener('click', () => choose(cell));
    grid.append(el);
    return cell;
  });
  const at = (x, y) => cells[y * COLS + x];

  let n = 0;
  let firstTry = 0;
  let ans = '';
  let lit = [];
  let missed = false;
  let busy = false;

  const say = () => (en ? speak(ans.length === 1 ? ans.toUpperCase() : ans, 'en-US') : speak(sayOf(ans)));
  sayBtn.addEventListener('click', say);

  // 아직 모으지 않은 별자리끼리 이웃한 자리를 고른다 (자리가 없으면 모은 것도 다시 쓴다)
  function pickGroup() {
    const all = [];
    for (const g of GROUPS[cfg.n]) {
      const w = Math.max(...g.map((o) => o[0]));
      const hgt = Math.max(...g.map((o) => o[1]));
      for (let y = 0; y + hgt < ROWS; y++) for (let x = 0; x + w < COLS; x++) all.push(g.map(([dx, dy]) => at(x + dx, y + dy)));
    }
    const fresh = all.filter((g) => g.every((c) => !c.got));
    return pick(fresh.length ? fresh : all);
  }

  function light(cell, c) {
    cell.c = c;
    cell.on = true;
    cell.letter.textContent = c;
    cell.el.classList.remove('no', 'boom');
    cell.el.classList.add('on');
    cell.el.tabIndex = 0;
    cell.el.removeAttribute('aria-hidden');
    cell.el.setAttribute('aria-label', `글자 ${c} 별자리`);
  }

  function dim(cell) {
    cell.on = false;
    cell.el.classList.remove('on', 'no');
    cell.el.tabIndex = -1;
    cell.el.setAttribute('aria-hidden', 'true');
    cell.el.removeAttribute('aria-label');
  }

  // 맞힌 별자리는 꼭짓점마다 별이 튀어나가며 흩어진다
  function sparkle(cell) {
    const b = cell.el.getBoundingClientRect();
    cell.pts.forEach(([x, y], i) => {
      ['★', '✦'].forEach((s, k) => {
        const a = Math.random() * Math.PI * 2;
        const d = 30 + Math.random() * 40;
        const sp = h('span', {
          class: 'ss-spark', 'aria-hidden': 'true',
          style: { left: `${x}%`, top: `${(y / 70) * 100}%`, '--dx': `${Math.cos(a) * d}px`, '--dy': `${Math.sin(a) * d}px`, animationDelay: `${(i + k) * 40}ms`, fontSize: `${b.width / (k ? 9 : 6)}px` },
        }, s);
        cell.el.append(sp);
        ctx.later(() => sp.remove(), 1300);
      });
    });
  }

  function choose(cell) {
    if (!cell.on || busy) return;
    if (cell.c !== ans) {
      missed = true;
      cell.el.classList.add('no');
      wiggle(cell.el);
      sfx.wrong();
      hinter.miss(lit.find((o) => o.c === ans).el);
      ctx.later(say, 500);
      return;
    }
    busy = true;
    hinter.reset();
    if (!missed) firstTry++;
    sfx.correct();
    say();
    cell.el.classList.add('boom');
    sparkle(cell);
    ctx.progress(n + 1, Q);
    ctx.later(() => lit.filter((o) => o !== cell).forEach(dim), 400);
    ctx.later(() => {
      dim(cell);
      cell.got = true;
      cell.el.classList.remove('boom');
      cell.el.classList.add('got');
    }, 1000);
    ctx.later(() => {
      n++;
      if (n >= Q) ctx.finish({ firstTry, total: Q });
      else round();
    }, 1700);
  }

  function round() {
    hinter.reset();
    ctx.progress(n, Q);
    busy = false;
    missed = false;
    const opts = en ? (ctx.unit ? unitQuestion(ctx.unit, cfg.n, ans, n) : enQuestion(cfg, ans)) : question(cfg, ans, ctx.lesson);
    ans = opts[0];
    lit = pickGroup();
    shuffle(opts).forEach((c, i) => light(lit[i], c));
    ctx.prompt(en ? '어떤 별자리를 말하는지 잘 듣고, 그 글자나 단어가 반짝이는 별자리를 눌러요.' : '소리를 잘 듣고, 같은 글자가 반짝이는 별자리를 눌러요.', say);
  }

  round();
}
