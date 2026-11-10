import { h, shuffle, pick, pickN, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, PUZZLE_WORDS, SEARCH_SETS, FLASH_SETS, CVC_WORDS, compose, decompose, similarSyllables } from '../data.js';
import { LEXICON, isPicture } from '../lexicon.js';

const ROUNDS = 4;
const FRIENDS = [
  ['🦊', '여우'], ['🦁', '사자'], ['🐻', '곰'], ['🐼', '판다'], ['🐰', '토끼'], ['🐯', '호랑이'],
  ['🐨', '코알라'], ['🐸', '개구리'], ['🐵', '원숭이'], ['🐶', '강아지'], ['🐱', '고양이'], ['🐷', '돼지'],
];
const CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const VOWS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ'];
const JONGS = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
// 예사소리·거센소리·된소리 (가/카/까)
const TENSE = [['ㄱ', 'ㅋ', 'ㄲ'], ['ㄷ', 'ㅌ', 'ㄸ'], ['ㅂ', 'ㅍ', 'ㅃ'], ['ㅈ', 'ㅊ', 'ㅉ'], ['ㅅ', 'ㅆ']];
const HELP = [
  '한 친구만 다른 소리를 내요.',
  '한 친구만 소리가 조금 달라요.',
  '한 친구만 첫소리가 달라요.',
  '한 친구만 받침 소리가 달라요.',
  '한 친구만 소리가 살짝 달라요. 귀 기울여 들어 봐요!',
];

// 첫소리(초성)별로 묶은 낱말
const BY_CHO = (() => {
  const words = new Set([
    ...[...WORDS, ...WORDS2, ...PUZZLE_WORDS].map((w) => w.word),
    ...[...SEARCH_SETS, ...FLASH_SETS].flatMap((s) => s.words.map((w) => w[0])),
  ]);
  const map = {};
  words.forEach((w) => {
    const d = decompose(w);
    if (d) (map[d.c] ||= []).push(w);
  });
  return map;
})();

const others = (list, x) => list.filter((y) => y !== x);

// 첫 글자가 같은 그림 낱말 묶음 (말소리 단위를 배우는 2단계)
const BY_FIRST = (() => {
  const map = {};
  LEXICON.filter(isPicture).forEach((it) => { if ([...it.word].length >= 2) (map[it.word[0]] ||= []).push(it.word); });
  return map;
})();

// 차시에 맞는 소리: 2단계는 첫 글자가 다른 낱말, 모음·자음·받침 차시는 그 자리만 다른 글자
function lessonSounds(lesson, n) {
  if (lesson.early) {
    const keys = Object.keys(BY_FIRST).filter((k) => BY_FIRST[k].length >= n - 1);
    const k = pick(keys);
    const rest = Object.keys(BY_FIRST).filter((x) => x !== k).flatMap((x) => BY_FIRST[x]);
    return { same: pickN(BY_FIRST[k], n - 1), odd: pick(rest) };
  }
  // 받침 차시: 받침이 같은 서로 다른 글자들 + 받침만 다른 글자 하나
  if (lesson.slot === 'jong' || lesson.kind === 'finals') {
    const syls = lesson.syllables(12);
    const base = pick(syls);
    const t = decompose(base).t;
    const same = [base, ...syls.filter((s) => s !== base && decompose(s).t === t)].slice(0, n - 1);
    while (same.length < n - 1) same.push(base);
    return { same, odd: lesson.alike(base, 3).find((s) => decompose(s).t !== t) || lesson.alike(base, 1)[0] };
  }
  const base = pick(lesson.syllables(8));
  return { same: Array(n - 1).fill(base), odd: lesson.alike(base, 1)[0] || similarSyllables(base)[0] };
}

/* 영어판(엉뚱한 모자): 알파벳 이름 → 첫소리 → 끝소리 → 운율(cat/hat/bat) → 가운데 모음 */
const EN_HELP = [
  '한 친구만 다른 알파벳을 말해요.',
  '한 친구만 첫소리가 달라요.',
  '한 친구만 끝소리가 달라요.',
  '한 친구만 끝부분 소리(운율)가 달라요.',
  '한 친구만 가운데 모음 소리가 달라요.',
];
const LETTERS = 'BCDFGHJKLMNPRSTVZ'.split('');
function enSounds(L, n) {
  if (L === 1) {
    const [a, b] = pickN(LETTERS, 2);
    return { same: Array(n - 1).fill(a), odd: b };
  }
  // 같은 자리 소리끼리 묶는다: 첫소리 · 끝소리 · 운율(뒤 두 글자) · 가운데 모음
  const keyOf = [null, (w) => w[0], (w) => w[2], (w) => w.slice(1), (w) => w[1]][L - 1];
  const map = {};
  CVC_WORDS.forEach((w) => { (map[keyOf(w)] ||= []).push(w); });
  const k = pick(Object.keys(map).filter((x) => map[x].length >= n - 1));
  const odd = pick(CVC_WORDS.filter((w) => keyOf(w) !== k && (L !== 4 || w[2] !== k[1])));
  return { same: pickN(map[k], n - 1), odd };
}

// 영어 차시: 알파벳 · 소리 단계는 오늘 글자 이름, 그 뒤로는 오늘 단어의 첫소리(모음 차시는 가운데 모음)로 묶는다
function unitSounds(unit, n) {
  if (unit.track === 'alpha' || (unit.kind === 'sound' && !unit.vowels)) {
    const [a] = unit.letters(1, { review: false });
    const b = pick(unit.known.filter((x) => x !== a)) || pick(LETTERS.filter((x) => x !== a));
    return { same: Array(n - 1).fill(a), odd: b };
  }
  const mid = unit.vowels || unit.kind === 'family' || unit.kind === 'long';
  const keyOf = mid ? (w) => w[1] : (w) => w[0];
  const mine = unit.words(20, { spell: true, maxLen: 5 }).map((x) => x.w).filter((w) => !mid || w.length === 3);
  const map = {};
  [...new Set([...mine, ...CVC_WORDS])].forEach((w) => { (map[keyOf(w)] ||= []).push(w); });
  const lead = [...new Set(mine.map(keyOf))].filter((k) => map[k].length >= n - 1);
  const k = pick(lead.length ? lead : Object.keys(map).filter((x) => map[x].length >= n - 1));
  const same = [...shuffle(map[k].filter((w) => mine.includes(w))), ...shuffle(map[k].filter((w) => !mine.includes(w)))].slice(0, n - 1);
  const odd = pick([...mine, ...CVC_WORDS].filter((w) => keyOf(w) !== k));
  return { same, odd };
}

// 한 판의 소리: 같은 소리 n-1개와 다른 소리 하나
function sounds(L, n, lesson) {
  if (lesson) return lessonSounds(lesson, n);
  const c = pick(CONS);
  const v = pick(VOWS);
  if (L === 1) {
    const base = compose(c, v);
    return { same: Array(n - 1).fill(base), odd: compose(pick(others(CONS, c)), pick(others(VOWS, v))) };
  }
  if (L === 2) {
    const base = compose(c, v);
    return { same: Array(n - 1).fill(base), odd: similarSyllables(base)[0] };
  }
  if (L === 3) {
    const cho = pick(Object.keys(BY_CHO).filter((k) => BY_CHO[k].length >= n - 1));
    const rest = Object.keys(BY_CHO).filter((k) => k !== cho).flatMap((k) => BY_CHO[k]);
    return { same: pickN(BY_CHO[cho], n - 1), odd: pick(rest) };
  }
  if (L === 4) {
    const j = pick(JONGS);
    const pool = shuffle(CONS.flatMap((cc) => VOWS.map((vv) => [cc, vv])));
    const same = pool.slice(0, n - 1).map(([cc, vv]) => compose(cc, vv, j));
    const [cc, vv] = pool[n - 1];
    return { same, odd: compose(cc, vv, pick(others(JONGS, j))) };
  }
  const [a, b] = pickN(pick(TENSE), 2);
  return { same: Array(n - 1).fill(compose(a, v)), odd: compose(b, v) };
}

// 누가 누가 다를까(SillyHat): 친구들이 차례로 소리를 내고, 혼자 다른 소리를 낸 친구에게 마법 모자를 씌운다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const n = L === 1 ? 3 : 4;
  const hinter = makeHinter();
  const row = h('div', { class: 'sh-friends' });
  const stump = h('span', { class: 'sh-stump', 'aria-hidden': 'true' });
  const hat = h('button', { class: 'sh-hat', type: 'button', 'aria-label': '마법 모자' }, h('i', { class: 'sh-band' }), h('i', { class: 'sh-star' }, '⭐'));
  const scene = h('div', { class: 'sillyhat' }, row, stump, hat);
  stage.append(scene);

  let r = 0;
  let firstTry = 0;
  let friends = [];
  let busy = true;
  let lifted = false;
  let missed = false;
  let spot = null;
  let at = null;

  /* ---------- 모자 ---------- */
  // 모자를 그루터기(null) 또는 친구 머리 위로 옮긴다
  function hatTo(f) {
    at = f;
    const s = scene.getBoundingClientRect();
    const box = (f ? f.face : stump).getBoundingClientRect();
    const hw = hat.offsetWidth;
    const hh = hat.offsetHeight;
    hat.style.left = `${box.left - s.left + box.width / 2 - hw / 2}px`;
    hat.style.top = `${box.top - s.top - hh * (f ? 0.8 : 0.55)}px`;
    hat.classList.toggle('on-head', Boolean(f));
  }
  const relayout = () => { if (!hat.classList.contains('dragging')) hatTo(at); };
  window.addEventListener('resize', relayout);
  ctx.onCleanup(() => window.removeEventListener('resize', relayout));

  function lift(on) {
    lifted = on;
    hat.classList.toggle('lifted', on);
    hat.setAttribute('aria-pressed', String(on));
  }

  const wait = (ms) => new Promise((res) => ctx.later(res, ms));

  // 친구가 소리를 낼 때는 통통 뛴다 (모자를 쓰고 있으면 모자도 함께)
  async function voice(f) {
    f.el.classList.remove('talk');
    void f.el.offsetWidth;
    f.el.classList.add('talk');
    if (at === f) {
      hat.classList.remove('hop');
      void hat.offsetWidth;
      hat.classList.add('hop');
    }
    await Promise.all([speak(f.sound, en ? 'en-US' : 'ko-KR'), wait(900)]);
    f.el.classList.remove('talk');
    hat.classList.remove('hop');
  }

  // 처음에는 모자가 친구들 머리 위를 차례로 옮겨 다니며 소리를 들려준다
  async function intro() {
    const my = r;
    busy = true;
    lift(false);
    for (const f of friends) {
      if (my !== r || !stage.isConnected) return;
      hatTo(f);
      await wait(450);
      await voice(f);
    }
    if (my !== r) return;
    hatTo(null);
    await wait(450);
    busy = false;
  }

  /* ---------- 고르기 ---------- */
  function answer(f) {
    if (busy) return;
    busy = true;
    lift(false);
    hatTo(f);
    if (f.odd) {
      hinter.reset();
      if (!missed) firstTry++;
      ctx.later(() => {
        sfx.correct();
        cheer(f.face);
        spotlight(f);
        voice(f);
      }, 450);
      ctx.later(() => {
        spot?.remove();
        r++;
        ctx.progress(r, ROUNDS);
        if (r >= ROUNDS) ctx.finish({ firstTry, total: ROUNDS });
        else round();
      }, 2600);
      return;
    }
    // 틀리면 모자가 미끄러져 그루터기로 돌아간다
    missed = true;
    ctx.later(() => {
      wiggle(f.face);
      hinter.miss(friends.find((o) => o.odd).el);
      hat.classList.add('slip');
      hatTo(null);
      ctx.later(() => {
        hat.classList.remove('slip');
        busy = false;
      }, 500);
    }, 450);
  }

  // 맞힌 친구만 밝게 비춘다
  function spotlight(f) {
    const b = f.face.getBoundingClientRect();
    spot = h('div', { class: 'sh-spot', 'aria-hidden': 'true', style: { '--sx': `${b.left + b.width / 2}px`, '--sy': `${b.top + b.height / 2 - 20}px` } });
    document.body.append(spot);
    ctx.onCleanup(() => spot?.remove());
  }

  const friendAt = (x, y) => friends.find((f) => {
    const q = f.el.getBoundingClientRect();
    return x > q.left - 10 && x < q.right + 10 && y > q.top - 70 && y < q.bottom;
  });

  // 모자는 끌어서 씌우거나, 눌러서 든 다음 친구를 눌러 씌운다
  let drag = null;
  hat.addEventListener('pointerdown', (e) => {
    if (busy || at) return;
    try { hat.setPointerCapture(e.pointerId); } catch {}
    const s = scene.getBoundingClientRect();
    drag = { sx: e.clientX, sy: e.clientY, x0: hat.offsetLeft, y0: hat.offsetTop, s, moved: false };
  });
  hat.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    if (!drag.moved) {
      drag.moved = true;
      hat.classList.add('dragging');
      lift(false);
    }
    hat.style.left = `${drag.x0 + dx}px`;
    hat.style.top = `${drag.y0 + dy}px`;
    const b = hat.getBoundingClientRect();
    const over = friendAt(b.left + b.width / 2, b.bottom);
    friends.forEach((f) => f.el.classList.toggle('over', f === over));
  });
  const up = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) return;
    hat.justDragged = true;
    hat.classList.remove('dragging');
    friends.forEach((f) => f.el.classList.remove('over'));
    const b = hat.getBoundingClientRect();
    const over = friendAt(b.left + b.width / 2, b.bottom);
    if (over) answer(over);
    else hatTo(null);
  };
  hat.addEventListener('pointerup', up);
  hat.addEventListener('pointercancel', up);
  hat.addEventListener('click', () => {
    if (hat.justDragged) { hat.justDragged = false; return; }
    if (busy || at) return;
    sfx.tap();
    lift(!lifted);
  });

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    missed = false;
    const { same, odd } = en ? (ctx.unit ? unitSounds(ctx.unit, n) : enSounds(L, n)) : sounds(L, n, ctx.lesson);
    const oddAt = Math.floor(Math.random() * n);
    const list = [...same];
    list.splice(oddAt, 0, odd);
    friends = pickN(FRIENDS, n).map(([e, name], i) => {
      const face = h('span', { class: 'sh-face' }, e);
      const el = h('button', { class: 'sh-friend', type: 'button', 'aria-label': `${name} 친구` }, face, h('i', { class: 'sh-shadow' }));
      const f = { el, face, sound: list[i], odd: i === oddAt };
      el.dataset.sound = list[i];
      el.addEventListener('click', () => {
        if (lifted && !busy) answer(f);
        else if (!busy) voice(f);
      });
      return f;
    });
    row.replaceChildren(...friends.map((f) => f.el));
    hatTo(null);
    const lesson = ctx.lesson;
    const help = en ? EN_HELP[L - 1] : !lesson ? HELP[L - 1]
      : lesson.early ? '한 친구만 첫 글자 소리가 달라요.'
        : { jung: '한 친구만 모음 소리가 달라요.', cho: '한 친구만 첫소리가 달라요.', jong: '한 친구만 받침 소리가 달라요.' }[lesson.slot]
          || '한 친구만 소리가 살짝 달라요. 귀 기울여 들어 봐요!';
    ctx.prompt(`${help} 누구인지 찾아 마법 모자를 씌워 주세요!`, () => { if (!busy) intro(); }, { auto: false });
    ctx.later(() => intro(), 500);
  }

  round();
}
