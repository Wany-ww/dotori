import { h, shuffle, pick, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO_SOUND, JUNG_SOUND, JAMO_NAME, CVC_WORDS, PHONICS, END_WORDS, compose, decompose, similarSyllables } from '../data.js';
import { draggable, hits, center } from './dragTap.js';

const PAGES = 2;
const ROWS = 3;
const V_PAIRS = [['ㅏ', 'ㅑ'], ['ㅓ', 'ㅕ'], ['ㅗ', 'ㅛ'], ['ㅜ', 'ㅠ']];
const C_PAIRS = [['ㄱ', 'ㅋ'], ['ㄷ', 'ㅌ'], ['ㅂ', 'ㅍ'], ['ㅈ', 'ㅊ'], ['ㄴ', 'ㄷ'], ['ㅇ', 'ㅎ'], ['ㅁ', 'ㅂ'], ['ㅅ', 'ㅈ']];
const T_PAIRS = [['ㄱ', 'ㄲ'], ['ㄷ', 'ㄸ'], ['ㅂ', 'ㅃ'], ['ㅅ', 'ㅆ'], ['ㅈ', 'ㅉ'], ['ㅗ', 'ㅚ'], ['ㅜ', 'ㅟ']];
const BASIC_C = ['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const DECOYS = [1, 2, 3, 3, 4];
const COLORS = ['#E8484F', '#2C9BE0', '#E8A400', '#3BAE8A', '#8B5CF6', '#F28C48', '#D2386A'];
// 그림 장면: 배경과 소품 (첫 소품이 주인공)
const SCENES = [
  { id: 'forest', props: ['🧒', '🌳', '🎒', '⛺', '🍄', '🦔', '🌼', '🔦'] },
  { id: 'kitchen', props: ['🧑‍🍳', '🍲', '🥕', '🧅', '🍳', '🫖', '🍞', '🧂'] },
  { id: 'beach', props: ['🏄', '⛱️', '🦀', '🐚', '⛵', '🏐', '🍉', '🪣'] },
  { id: 'room', props: ['🧸', '🛏️', '📚', '🪀', '🪁', '🎈', '🧩', '🖍️'] },
];

const nameOf = (c) => (c.charCodeAt(0) < 0xac00 ? JAMO_NAME[c] : c);

/* ---------- 영어판 짝 ----------
   1단계 대문자 → 소문자 · 2단계 소문자 → 대문자 · 3단계 헷갈리는 소문자(b/d/p/q…)
   4단계 그림 단어의 첫 글자(🐱 _at → c) · 5단계 가운데 모음(c_t → a) */
const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MIRROR = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n'], ['i', 'l'], ['h', 'n'], ['v', 'w'], ['f', 't']];
const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const PIC = new Map([...PHONICS, ...END_WORDS].map((x) => [x.w, x.e]));
function enPairs(L) {
  if (L === 1) {
    const ls = pickN(ABC, ROWS);
    return { pairs: ls.map((l) => [l.toUpperCase(), l]), pool: ABC, hide: 1 };
  }
  if (L === 2) {
    const ls = pickN(ABC, ROWS);
    return { pairs: ls.map((l) => [l, l.toUpperCase()]), pool: ABC.map((l) => l.toUpperCase()), hide: 1 };
  }
  if (L === 3) {
    const ps = distinctPairs(MIRROR, ROWS);
    return { pairs: ps.map(([a, b]) => (Math.random() < 0.5 ? [a, b] : [b, a])), pool: MIRROR.flat(), hide: 1 };
  }
  // 그림이 있는 세 글자 단어
  const words = pickN([...PIC.keys()].filter((w) => w.length === 3 && (L === 4 || VOWELS.includes(w[1]))), ROWS * 2);
  const out = [];
  for (const w of words) {
    const c = L === 4 ? w[0] : w[1];
    if (out.some((p) => p[1] === c)) continue;
    const shown = L === 4 ? `_${w.slice(1)}` : `${w[0]}_${w[2]}`;
    out.push([{ w, shown, e: PIC.get(w) }, c]);
    if (out.length >= ROWS) break;
  }
  return { pairs: out, pool: L === 4 ? ABC.filter((l) => !VOWELS.includes(l)) : VOWELS, hide: 1, word: true };
}

// 영어 차시: 알파벳 단계는 오늘 배우는 글자의 대 · 소문자 짝, 소리 단계는 단어의 첫 글자(모음 차시는 가운데 모음)
function unitPairs(unit, L, pg) {
  if (unit.track === 'alpha') {
    const ls = unit.letters(ROWS).map((U) => U.toLowerCase());
    const up = pg % 2 === 0;
    return { pairs: ls.map((l) => (up ? [l.toUpperCase(), l] : [l, l.toUpperCase()])), pool: up ? ABC : ABC.map((l) => l.toUpperCase()), hide: 1 };
  }
  if (unit.kind === 'sound' || unit.kind === 'family' || unit.kind === 'initial') {
    const mid = unit.vowels || unit.kind === 'family';
    const out = [];
    for (const x of unit.words(ROWS * 3, { spell: true, maxLen: 5 })) {
      if (mid && x.w.length !== 3) continue;
      const c = mid ? x.w[1] : x.w[0];
      if (out.some((p) => p[1] === c)) continue;
      out.push([{ w: x.w, shown: mid ? `${x.w[0]}_${x.w.slice(2)}` : `_${x.w.slice(1)}`, e: x.e }, c]);
      if (out.length >= ROWS) break;
    }
    if (out.length >= 2) return { pairs: out, pool: mid ? VOWELS : ABC.filter((l) => !VOWELS.includes(l)), hide: 1, word: true };
  }
  return enPairs(L);
}

// 서로 글자가 겹치지 않는 짝 n개
function distinctPairs(pairs, n) {
  const out = [];
  for (const p of shuffle(pairs)) {
    if (out.flat().some((x) => p.includes(x))) continue;
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

// 이중 모음과 기본 모음 짝 (ㅘ/ㅗ, ㅑ/ㅏ …)
const DIPH_BASE = { ㅘ: 'ㅗ', ㅝ: 'ㅜ', ㅟ: 'ㅜ', ㅢ: 'ㅡ', ㅑ: 'ㅏ', ㅕ: 'ㅓ', ㅛ: 'ㅗ', ㅠ: 'ㅜ', ㅚ: 'ㅗ', ㅙ: 'ㅗ', ㅔ: 'ㅓ', ㅐ: 'ㅏ' };
const TENSE_OF = { ㅋ: 'ㄱ', ㅌ: 'ㄷ', ㅍ: 'ㅂ', ㅊ: 'ㅈ', ㄲ: 'ㄱ', ㄸ: 'ㄷ', ㅃ: 'ㅂ', ㅉ: 'ㅈ', ㅆ: 'ㅅ' };

// 한글 차시의 짝: 배우는 낱자를 숨은 글자로, 짝꿍은 헷갈리기 쉬운 낱자(또는 받침 없는 글자)
function lessonPairs(lesson) {
  const others = (x, list) => list.filter((y) => y !== x);
  const known = lesson.slot === 'jung' ? lesson.known.vows : lesson.known.cons.filter((c) => c !== 'ㅇ');
  if (lesson.kind === 'diph') {
    return { pairs: shuffle(lesson.focus).slice(0, ROWS).map((v) => [DIPH_BASE[v] || 'ㅏ', v]), pool: [...lesson.known.vows] };
  }
  if (lesson.tense) {
    return { pairs: shuffle(lesson.focus).slice(0, ROWS).map((c) => [TENSE_OF[c] || 'ㄱ', c]), pool: [...Object.keys(TENSE_OF), 'ㄱ', 'ㄷ', 'ㅂ', 'ㅈ', 'ㅅ'] };
  }
  if (lesson.slot === 'cho' || lesson.slot === 'jung') {
    const focus = shuffle(lesson.focus);
    const pairs = [];
    for (let i = 0; pairs.length < ROWS && i < ROWS * 3; i++) {
      const f = focus[i % focus.length];
      const mate = pick(others(f, [...new Set([...known, ...lesson.focus])]));
      if (mate && !pairs.some((p) => p[1] === f && p[0] === mate)) pairs.push([mate, f]);
    }
    return { pairs, pool: [...new Set([...known, ...lesson.jamo(10)])] };
  }
  // 받침 차시 등: 받침 없는 글자와 받침 있는 글자의 짝 (가/감)
  const syls = lesson.syllables(ROWS * 2).filter((s) => decompose(s)?.t);
  const pairs = syls.slice(0, ROWS).map((s) => { const d = decompose(s); return [compose(d.c, d.j), s]; });
  return pairs.length >= 2 ? { pairs, pool: null, alike: (s) => lesson.alike(s, 3) } : pagePairs(5);
}

// 한 쪽의 짝: [보이는 글자와 숨은 글자의 짝] 3개와 그림 속 함정 글자
function pagePairs(L) {
  if (L === 1) return { pairs: pickN(V_PAIRS, ROWS), pool: Object.keys(JUNG_SOUND) };
  if (L === 2) return { pairs: distinctPairs(C_PAIRS, ROWS), pool: Object.keys(CHO_SOUND) };
  if (L === 3) return { pairs: distinctPairs(T_PAIRS, ROWS), pool: [...T_PAIRS.flat()] };
  const cs = pickN(BASIC_C, ROWS);
  if (L === 4) return { pairs: cs.map((c) => pick(V_PAIRS).map((v) => compose(c, v))), pool: null };
  return { pairs: cs.map((c) => { const v = pick(['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ']); return [compose(c, v), compose(c, v, pick(['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅇ']))]; }), pool: null };
}

// 나를 찾아줘(ISpy): 그림책 왼쪽의 짝꿍 자리(?)에 들어갈 글자를 오른쪽 그림 속에서 찾아 누른다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const hinter = makeHinter();
  const left = h('div', { class: 'ip-page ip-pairs' });
  const pic = h('div', { class: 'ip-page ip-pic' });
  const book = h('div', { class: 'ispy-book' }, left, pic);
  stage.append(book);

  const scenes = pickN(SCENES, PAGES);
  let p = 0;
  let firstTry = 0;
  let total = 0;
  let rows = [];

  const askFor = (row) => {
    if (en) speak([row.word || row.target.toUpperCase(), 'Find me!'], 'en-US');
    else speak([nameOf(row.target), '나를 찾아 주세요!']);
  };
  const active = () => rows.find((r) => !r.done);

  function markActive() {
    rows.forEach((r) => r.slot.classList.toggle('now', r === active()));
  }

  // 그림 속 글자가 구름 연기와 함께 스티커가 되어 짝꿍 자리로 날아간다
  function fly(from, to, text, color) {
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const el = h('span', { class: `ip-fly${en ? ' latin' : ''}`, style: { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, color } }, text);
    document.body.append(el);
    ctx.onCleanup(() => el.remove());
    requestAnimationFrame(() => {
      el.style.translate = `${b.left - a.left + (b.width - a.width) / 2}px ${b.top - a.top + (b.height - a.height) / 2}px`;
    });
    ctx.later(() => el.remove(), 650);
  }

  // 누르면 맞는 자리를 알아서 찾아가고, 끌어다 놓으면 놓은 자리(onto)가 맞는지 본다
  function choose(btn, c, onto = null) {
    if (btn.disabled) return;
    const row = onto ? (onto.target === c ? onto : null) : rows.find((r) => !r.done && r.target === c);
    if (!row) {
      const now = onto || active();
      if (!now) return;
      wiggle(btn);
      sfx.wrong();
      hinter.miss(now.hidden);
      now.missed = true;
      return;
    }
    hinter.reset();
    btn.disabled = true;
    btn.classList.add('puff');
    sfx.pop();
    if (!onto) fly(btn, row.slot, c, btn.style.color);
    row.done = true;
    if (!row.missed) firstTry++;
    ctx.later(() => {
      row.slot.classList.remove('now');
      row.slot.classList.add('got');
      row.slot.style.color = btn.style.color;
      row.slot.replaceChildren(c);
      pop(row.slot);
      btn.remove();
      if (row.word) row.known.lastChild.textContent = row.word;
      if (en) speak(row.word || c.toUpperCase(), 'en-US');
      else speak(nameOf(c));
      const next = active();
      ctx.progress(p + rows.filter((r) => r.done).length / ROWS, PAGES);
      if (next) {
        markActive();
        ctx.later(() => askFor(next), 900);
        return;
      }
      sfx.correct();
      cheer(left);
      ctx.later(() => {
        p++;
        if (p >= PAGES) ctx.finish({ firstTry, total });
        else page();
      }, 1800);
    }, 550);
  }

  function page() {
    hinter.reset();
    ctx.progress(p, PAGES);
    const got = en ? (ctx.unit ? unitPairs(ctx.unit, L, p) : enPairs(L)) : ctx.lesson ? lessonPairs(ctx.lesson) : pagePairs(L);
    const { pool, alike } = got;
    const pairs = got.pairs;
    total += pairs.length;
    rows = pairs.map((pair) => {
      // 한글 차시와 영어판은 짝의 뒤쪽이 늘 숨은 글자
      const hide = ctx.lesson || en ? 1 : Math.random() < 0.5 ? 0 : 1;
      const target = pair[hide];
      const shown = pair[1 - hide];
      const slot = h('button', { class: `ip-cell ip-slot${en ? ' latin' : ''}`, type: 'button', 'aria-label': '짝꿍 자리' }, '?');
      const known = h('span', { class: `ip-cell ip-known${got.word ? ' wide' : ''}${en ? ' latin' : ''}` }, got.word ? [h('span', { class: 'ip-e', 'aria-hidden': 'true' }, shown.e), h('span', {}, shown.shown)] : shown);
      const row = { target, slot, known, done: false, missed: false, word: got.word ? shown.w : '', e: got.word ? shown.e : '' };
      slot.addEventListener('click', () => { if (!row.done) askFor(row); });
      row.el = h('div', { class: 'ip-row' }, ...(hide === 0 ? [slot, known] : [known, slot]));
      return row;
    });
    left.replaceChildren(...rows.map((r) => r.el));

    // 그림 속 글자: 찾을 글자 + 함정 글자 (높은 단계는 보이는 짝꿍 글자도 함정으로 섞는다)
    const targets = rows.map((r) => r.target);
    const knowns = pairs.flat().filter((x) => typeof x === 'string' && !targets.includes(x));
    const trapPool = pool
      ? [...(L >= 3 ? shuffle(knowns) : []), ...shuffle(pool.filter((x) => !pairs.flat().includes(x)))]
      : shuffle([...new Set(targets.flatMap((t) => (alike || ((s) => similarSyllables(s).slice(0, 3)))(t)))].filter((x) => !pairs.flat().includes(x)));
    const traps = [...new Set(trapPool)].slice(0, DECOYS[L - 1]);
    const letters = shuffle([...targets, ...traps]);

    const scene = scenes[p];
    // 3×3 칸에 글자와 소품을 나눠 놓고 칸 안에서 조금씩 흔든다
    const cells = shuffle([...Array(9).keys()]);
    const at = (i) => ({ x: 17 + (i % 3) * 33 + (Math.random() * 12 - 6), y: 18 + Math.floor(i / 3) * 31 + (Math.random() * 10 - 5) });
    const props = scene.props.map((e, i) => {
      const q = i < 9 - letters.length ? at(cells[letters.length + i]) : { x: 8 + Math.random() * 84, y: 86 + Math.random() * 8 };
      return h('span', { class: `ip-prop${i === 0 ? ' ip-hero' : ''}`, 'aria-hidden': 'true', style: { left: `${q.x}%`, top: `${q.y}%` } }, e);
    });
    const btns = letters.map((c, i) => {
      const q = at(cells[i]);
      const btn = h('button', {
        class: `ip-letter${en ? ' latin' : ''}`, type: 'button', 'aria-label': `숨은 글자 ${c}`,
        style: { left: `${q.x}%`, top: `${q.y}%`, color: COLORS[i % COLORS.length], '--rot': `${Math.round(Math.random() * 36 - 18)}deg` },
      }, c);
      btn.dataset.c = c;
      btn.addEventListener('click', () => choose(btn, c));
      // 끌고 있는 동안은 책장 밖으로 나가도 잘리지 않게 한다
      draggable(btn, {
        can: () => !btn.disabled,
        onMove: (pt) => {
          book.classList.add('drag');
          rows.forEach((r) => r.slot.classList.toggle('over', !r.done && hits(r.slot, pt)));
        },
        onDrop: (pt) => {
          book.classList.remove('drag');
          rows.forEach((r) => r.slot.classList.remove('over'));
          const row = rows.find((r) => !r.done && hits(r.slot, pt));
          if (!row) return;
          // 맞는 자리에 놓았으면 놓은 곳에서 연기처럼 사라진다
          if (row.target === c) {
            const o = center(btn);
            btn.style.translate = `${pt.x - o.x}px ${pt.y - o.y}px`;
          }
          choose(btn, c, row);
        },
      });
      rows.filter((r) => r.target === c).forEach((r) => { r.hidden = btn; });
      return btn;
    });
    pic.className = `ip-page ip-pic ip-${scene.id}`;
    pic.replaceChildren(...props, ...btns);
    markActive();
    ctx.prompt(
      en
        ? ['그림 속에 숨은 알파벳을 찾아요! 소리를 듣고 ? 자리에 들어갈 글자를 끌어다 놓거나 눌러요.',
          '그림 속에 숨은 알파벳을 찾아요! 소리를 듣고 ? 자리에 들어갈 글자를 끌어다 놓거나 눌러요.',
          '비슷하게 생긴 글자를 조심해요! 소리를 듣고 ? 자리에 들어갈 글자를 찾아요.',
          '그림 단어의 첫 글자가 숨어 있어요. 소리를 듣고 찾아 ? 자리에 붙여요.',
          '단어 가운데 모음이 숨어 있어요. 소리를 듣고 찾아 ? 자리에 붙여요.'][L - 1]
        : '그림 속에 숨은 글자를 찾아요! ? 자리에 들어갈 짝꿍 글자를 그림에서 찾아 끌어다 놓거나 눌러요.',
      () => askFor(active() || rows[0]),
    );
  }

  page();
}
