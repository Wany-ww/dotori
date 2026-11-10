import { h, shuffle, pick, pickN, wiggle, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { SEARCH_SETS, GALAXY_SEARCH_SETS, SEARCH_FILLER, EN_FLASH_SETS } from '../data.js';
import { galaxyBar } from './galaxy.js';

const BOARDS = 2;
const SIZE = [4, 4, 5, 5, 6];
const WORDS = [2, 3, 3, 4, 5];
const COLORS = ['#F06A92', '#3E9EEA', '#8A5FEE', '#1FB386', '#EE8A3C'];

// 낱말을 가로(→)로, Lv3부터 세로(↓)로도 숨긴다
function place(size, words, vertical, fill = SEARCH_FILLER) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = Array.from({ length: size * size }, () => null);
    const placed = [];
    for (const [w, e] of words) {
      const chars = [...w];
      let ok = false;
      for (let t = 0; t < 80 && !ok; t++) {
        const down = vertical && Math.random() < 0.5;
        const r = Math.floor(Math.random() * (down ? size - chars.length + 1 : size));
        const c = Math.floor(Math.random() * (down ? size : size - chars.length + 1));
        const cells = chars.map((_, i) => (down ? (r + i) * size + c : r * size + c + i));
        if (cells.every((p, i) => grid[p] === null || grid[p] === chars[i])) {
          cells.forEach((p, i) => { grid[p] = chars[i]; });
          placed.push({ w, e, cells });
          ok = true;
        }
      }
      if (!ok) break;
    }
    if (placed.length === words.length) {
      const used = new Set(words.flatMap(([w]) => [...w]));
      const filler = fill.filter((s) => !used.has(s));
      return { grid: grid.map((s) => s ?? pick(filler)), placed };
    }
  }
  return null;
}

export function mount(stage, ctx) {
  const L = ctx.level;
  // 낱말 찾기 은하(opts.galaxy 1·2): 그림 없이 주제와 글자 수만 주고, 한 판에 더 많은 긴 낱말을 숨긴다
  const g = ctx.opts.galaxy || 0;
  // 영어판(숨은 낱말 찾기): 알파벳 판, 주제 단어를 소리로도 들려준다
  const en = ctx.lang === 'en';
  const say = (t) => speak(t, en ? 'en-US' : 'ko-KR');
  const size = g ? 4 + g : en ? [5, 5, 6, 6, 7][L - 1] : SIZE[L - 1];
  const boards = g ? 1 : BOARDS;
  const count = g ? [3, 3, 4, 4, 5][L - 1] + g - 1 : WORDS[L - 1];
  const vertical = g ? g === 2 : L >= 3;
  // 한글 차시(은하가 아닐 때): 그 차시의 낱말로 두 판을 만든다
  const lesson = ctx.lesson;
  const THEME_NAME = { fruit: '과일', veg: '채소', food: '음식', animal: '동물', family: '가족', clothes: '옷', school: '학용품' };
  const lessonSets = () => {
    const ws = lesson.words(count * BOARDS + 6, { minLen: 2, maxLen: size }).map((w) => [w.word, w.emoji || null]);
    const name = lesson.kind === 'theme' ? lesson.themes.map((t) => THEME_NAME[t]).join('·') : lesson.kind === 'rule' ? lesson.ruleName : '오늘의 낱말';
    return [0, 1].map((i) => ({ name, e: '🔎', words: ws.slice(i * (count + 3), (i + 1) * (count + 3)) }));
  };
  const sets = g
    ? pickN(GALAXY_SEARCH_SETS, 1).map((s) => ({ ...s, words: s.words.map((w) => [w, null]) }))
    : en && ctx.unit ? Array.from({ length: BOARDS }, () => ({ name: ctx.unit.show || ctx.unit.title, e: '🔎', words: ctx.unit.words(10, { spell: true, maxLen: size }).map((x) => [x.w, x.e]) }))
    : en ? pickN(EN_FLASH_SETS, BOARDS).map((s) => ({ name: s.name, e: '🔎', words: s.words }))
      : lesson ? lessonSets() : pickN(SEARCH_SETS, BOARDS);
  const bar = g ? galaxyBar(count) : null;
  const hinter = makeHinter();
  const root = h('div', { class: `search${g ? ' galaxy' : ''}${en ? ' en' : ''}` });
  stage.append(root);
  let b = 0;
  let total = 0;
  let misses = 0;

  function board() {
    hinter.reset();
    const set = sets[b];
    let made = null;
    while (!made) made = place(size, pickN(set.words.filter(([w]) => [...w].length >= 2 && [...w].length <= size), count), vertical, en ? [...'abcdefghijklmnopqrstuvwxyz'] : SEARCH_FILLER);
    const { grid, placed } = made;
    total += placed.length;
    let found = 0;
    ctx.progress(b, boards);

    const cells = grid.map((s, i) => h('span', { class: 'ws-cell', 'data-i': i }, s));
    const gridEl = h('div', { class: 'ws-grid', style: { gridTemplateColumns: `repeat(${size}, 1fr)` } }, cells);
    // Lv4~5와 은하는 낱말 글자를 감추고 글자 수(○)만 보여 준다
    const listItems = placed.map((p) => h('li', { class: 'ws-word' },
      p.e ? h('span', { class: 'ws-pic', 'aria-hidden': 'true' }, wordPic(p.w, p.e)) : null,
      h('span', { class: 'ws-text' }, g || L >= 4 ? '○'.repeat([...p.w].length) : p.w)));
    root.replaceChildren(
      ...(bar ? [bar.el] : []),
      h('div', { class: 'ws-panel' },
        h('aside', { class: 'ws-list' }, h('p', { class: 'ws-topic' }, set.e ? `${set.e} ${set.name}` : set.name), h('ul', {}, listItems)),
        gridEl),
    );
    ctx.prompt(
      g ? `'${set.name}' 낱말 ${placed.length}개가 숨어 있어요. 글자 수(○)를 힌트로 ${vertical ? '가로·세로로' : '가로로'} 찾아요!`
        : vertical ? '글자판에 숨은 낱말을 가로(→)나 세로(↓)로 이어 찾아요!' : '글자판에 숨은 낱말을 가로(→)로 이어 찾아요!',
      () => (en ? say(['Find the words!', ...placed.map((p) => p.w)]) : speak(g ? '숨은 낱말을 찾아 볼까요?' : ['숨은 낱말을 찾아 볼까요?', ...placed.map((p) => p.w)])),
    );

    const rc = (i) => [Math.floor(i / size), i % size];
    // 시작 칸에서 끝 칸까지 가로·세로 한 줄일 때만 선택이 된다
    function lineBetween(a, z) {
      const [r1, c1] = rc(a);
      const [r2, c2] = rc(z);
      if (r1 === r2) return Array.from({ length: Math.abs(c2 - c1) + 1 }, (_, k) => r1 * size + Math.min(c1, c2) + k);
      if (c1 === c2) return Array.from({ length: Math.abs(r2 - r1) + 1 }, (_, k) => (Math.min(r1, r2) + k) * size + c1);
      return [a];
    }
    const paint = (sel) => cells.forEach((c, i) => c.classList.toggle('sel', sel.includes(i)));

    function check(sel) {
      paint([]);
      if (sel.length < 2 || found >= placed.length) return;
      const key = sel.join(',');
      const hit = placed.find((p) => !p.found && [...p.cells].sort((x, y) => x - y).join(',') === key);
      if (!hit) {
        misses++;
        sel.forEach((i) => wiggle(cells[i]));
        const next = placed.find((p) => !p.found);
        hinter.miss(cells[next.cells[0]]);
        return;
      }
      hinter.reset();
      hit.found = true;
      const color = COLORS[found % COLORS.length];
      hit.cells.forEach((i) => { cells[i].classList.add('found'); cells[i].style.setProperty('--found', color); });
      const li = listItems[placed.indexOf(hit)];
      li.classList.add('got');
      li.querySelector('.ws-text').textContent = hit.w;
      sfx.correct();
      say(hit.w);
      found++;
      bar?.star();
      bar?.progress(found);
      if (found < placed.length) return;
      cheer(gridEl, en ? 'en' : 'ko');
      ctx.later(() => {
        b++;
        if (b >= boards) ctx.finish({ firstTry: Math.max(0, total - misses), total });
        else board();
      }, 1600);
    }

    // 끌어서 고르거나, 첫 글자와 끝 글자를 차례로 눌러 고른다
    let start = null;
    let tapStart = null;
    let sel = [];
    const cellAt = (x, y) => document.elementFromPoint(x, y)?.closest('.ws-cell');
    gridEl.addEventListener('pointerdown', (e) => {
      const c = e.target.closest('.ws-cell');
      if (!c) return;
      e.preventDefault();
      try { gridEl.setPointerCapture(e.pointerId); } catch {}
      start = Number(c.dataset.i);
      sel = [start];
      paint(tapStart !== null ? lineBetween(tapStart, start) : sel);
      sfx.tap();
    });
    gridEl.addEventListener('pointermove', (e) => {
      if (start === null) return;
      const c = cellAt(e.clientX, e.clientY);
      if (!c) return;
      sel = lineBetween(start, Number(c.dataset.i));
      paint(sel);
    });
    const end = () => {
      if (start === null) return;
      const s = start;
      start = null;
      if (sel.length > 1) {
        tapStart = null;
        check(sel);
        return;
      }
      if (tapStart === null || tapStart === s) {
        tapStart = tapStart === s ? null : s;
        paint(tapStart === null ? [] : [tapStart]);
        return;
      }
      const line = lineBetween(tapStart, s);
      tapStart = null;
      check(line);
    };
    gridEl.addEventListener('pointerup', end);
    gridEl.addEventListener('pointercancel', end);
  }

  board();
}
