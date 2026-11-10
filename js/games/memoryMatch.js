import { h, shuffle, pickN, randInt, cheer, wiggle, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, VOCAB, VOCAB2, JAMO_NAME } from '../data.js';

const PAIRS = [3, 4, 5, 6, 8];
const COLS = { 6: 3, 8: 4, 10: 5, 12: 4, 16: 4 };

const dotsFace = (n) => h('span', { class: 'dots-face', 'aria-label': `점 ${n}개` }, Array.from({ length: n }, () => h('i')));

function mathPairs(L, count) {
  if (L <= 3) {
    const max = [5, 8, 10][L - 1];
    return pickN(Array.from({ length: max }, (_, i) => i + 1), count).map((v) => ({
      a: { face: String(v), cls: 'num' }, b: { face: dotsFace(v), cls: 'dots' }, say: `${v}`,
    }));
  }
  const seen = new Set();
  const out = [];
  while (out.length < count) {
    const mul = L >= 5 && out.length % 2 === 1;
    const a = mul ? randInt(2, 5) : randInt(1, 9);
    const b = mul ? randInt(2, 5) : randInt(1, 9);
    const ans = mul ? a * b : a + b;
    if (seen.has(ans)) continue;
    seen.add(ans);
    out.push({
      a: { face: `${a}${mul ? '×' : '+'}${b}`, cls: 'num eqn' },
      b: { face: String(ans), cls: 'num' },
      say: `${a} ${mul ? '곱하기' : '더하기'} ${b}는 ${ans}`,
    });
  }
  return out;
}

// 짝 맞추기(MatchGame · 수학, set 'same'): 같은 카드 두 장씩. 그림 → 한 자리 수 → 두 자리 수 → 뒤집힌 두 자리 수(12 · 21) (참고 영상 기준)
const SAME_PAIRS = [3, 4, 4, 4, 5];
const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🍐'];
function samePairs(L, count) {
  if (L === 1) return pickN(FRUIT, count).map((e) => ({ a: { face: e, cls: 'pic' }, b: { face: e, cls: 'pic' }, say: '' }));
  let nums;
  if (L === 2) nums = pickN(Array.from({ length: 10 }, (_, i) => i + 1), count);
  else if (L === 3) nums = pickN(Array.from({ length: 20 }, (_, i) => i + 10), count);
  else if (L === 4) {
    // 끝자리나 앞자리가 같은 헷갈리는 수끼리 (22 · 26)
    const t = randInt(1, 4) * 10;
    nums = pickN([t, t + 2, t + 6, t + 10, t + 12, t + 16, t + 20], count);
  } else {
    const ab = pickN([12, 13, 14, 15, 16, 17, 18, 19, 23, 24, 25, 26, 27, 28, 29, 34, 35, 36, 37, 38, 39], Math.ceil(count / 2));
    nums = ab.flatMap((x) => [x, Number(String(x).split('').reverse().join(''))]).slice(0, count);
  }
  return nums.map((v) => ({ a: { face: String(v), cls: 'num' }, b: { face: String(v), cls: 'num' }, say: String(v) }));
}

function buildPairs(set, L, count, lesson, unit) {
  if (set === 'same') return samePairs(L, count);
  // 영어 차시: 알파벳 단계는 오늘 글자의 대 · 소문자 짝, 그 뒤로는 오늘 단어의 그림 · 단어 짝
  if (set === 'english' && unit) {
    if (unit.track === 'alpha') {
      return unit.letters(count).map((c) => ({
        a: { face: c, cls: 'latin' }, b: { face: c.toLowerCase(), cls: 'latin' }, say: c, lang: 'en-US',
      }));
    }
    return unit.words(count).map((v) => ({
      a: { face: v.e, cls: 'pic' }, b: { face: v.w, cls: 'latin word' }, say: v.w, lang: 'en-US',
    }));
  }
  if (set === 'hangul' && lesson) {
    // 낱자 모양 차시: 같은 낱자 짝 / 그림 낱말 차시: 같은 그림 짝 / 그 뒤로는 그림과 낱말 짝
    if (lesson.kind === 'jamoShape') {
      return [...new Set(lesson.jamo(count * 2))].slice(0, count).map((c) => ({
        a: { face: c, cls: 'word jamo' }, b: { face: c, cls: 'word jamo' }, say: JAMO_NAME[c] || c,
      }));
    }
    const same = lesson.kind === 'vocab';
    return lesson.words(count, { pic: true }).map((w) => ({
      a: { face: w.emoji, cls: 'pic' },
      b: same ? { face: w.emoji, cls: 'pic' } : { face: w.word, cls: 'word' },
      say: w.word,
    }));
  }
  if (set === 'hangul') {
    return pickN(L >= 4 ? WORDS2 : WORDS, count).map((w) => ({
      a: { face: w.emoji, cls: 'pic' },
      b: L === 1 ? { face: w.emoji, cls: 'pic' } : { face: w.word, cls: 'word' },
      say: w.word,
    }));
  }
  if (set === 'math') return mathPairs(L, count);
  if (L <= 2) {
    return pickN('ABDEFGHLMNQRT'.split(''), count).map((c) => ({
      a: { face: c, cls: 'latin' }, b: { face: c.toLowerCase(), cls: 'latin' }, say: c, lang: 'en-US',
    }));
  }
  return pickN(L >= 4 ? VOCAB2 : VOCAB, count).map((v) => ({
    a: { face: v.e, cls: 'pic' }, b: { face: v.w, cls: 'latin word' }, say: v.w, lang: 'en-US',
  }));
}

export function mount(stage, ctx) {
  const L = ctx.level;
  const same = ctx.opts.set === 'same';
  const count = (same ? SAME_PAIRS : PAIRS)[L - 1];
  const pairs = buildPairs(ctx.opts.set, L, count, ctx.lesson, ctx.unit);
  const cards = shuffle(pairs.flatMap((p, i) => [{ pid: i, say: p.say, ...p.a }, { pid: i, say: p.say, ...p.b }]));
  let open = [];
  let found = 0;
  let mismatches = 0;
  let streakMiss = 0;
  let locked = true;

  const els = cards.map((c) => {
    const btn = h('button', { class: 'mcard flipped', type: 'button', 'aria-label': '카드' },
      h('span', { class: 'mcard-inner' },
        h('span', { class: 'mcard-face mcard-back', 'aria-hidden': 'true' }, '🌰'),
        h('span', { class: `mcard-face mcard-front ${c.cls}` }, c.cls === 'pic' ? wordPic(c.say, c.face) : c.face)));
    btn.dataset.pid = c.pid;
    btn.addEventListener('click', () => flip(c, btn));
    return btn;
  });
  const grid = h('div', { class: 'mgrid', style: { gridTemplateColumns: `repeat(${COLS[cards.length]}, minmax(0, 118px))` } }, els);
  const status = h('p', { class: 'soft-note' });
  stage.append(h('div', { class: 'memory' }, grid, status));
  ctx.progress(0, count);

  const peekMs = L === 1 ? 3000 : L === 2 ? 2200 : 1200;
  status.textContent = '카드를 잘 봐 두세요! 👀';
  ctx.prompt('짝이 되는 카드 두 장을 찾아 뒤집어요!', () => speak('짝이 되는 카드 두 장을 찾아 뒤집어 볼까요?'));
  ctx.later(() => {
    els.forEach((e) => e.classList.remove('flipped'));
    status.textContent = '';
    locked = false;
  }, peekMs);

  function clearHint() {
    els.forEach((e) => e.classList.remove('hint-glow'));
  }

  function flip(c, btn) {
    if (locked || btn.classList.contains('matched') || open.some((o) => o.btn === btn)) return;
    sfx.tap();
    // 1~2단계는 뒤집을 때마다 낱말·낱자 이름을 들려준다
    if (ctx.lesson?.early) speak(pairs[c.pid].say);
    btn.classList.add('flipped');
    btn.setAttribute('aria-label', '뒤집힌 카드');
    open.push({ c, btn });
    if (open.length === 1) {
      if (streakMiss >= 2) {
        const partner = els[cards.findIndex((x, i) => x.pid === c.pid && els[i] !== btn)];
        partner.classList.add('hint-glow');
      }
      return;
    }
    const [x, y] = open;
    open = [];
    clearHint();
    if (x.c.pid === y.c.pid) {
      streakMiss = 0;
      found++;
      [x.btn, y.btn].forEach((b) => { b.classList.add('matched'); b.setAttribute('aria-label', '찾은 카드'); });
      // 짝 맞추기는 찾은 카드가 사라진다
      if (same) ctx.later(() => [x.btn, y.btn].forEach((b) => b.classList.add('gone')), 700);
      sfx.correct();
      cheer(y.btn, ctx.lang);
      const p = pairs[x.c.pid];
      if (p.say) speak(p.say, p.lang || 'ko-KR');
      ctx.progress(found, count);
      if (found === count) {
        const extra = Math.max(0, mismatches - count);
        ctx.later(() => ctx.finish({ firstTry: Math.max(0, count - extra), total: count }), 1300);
      }
      return;
    }
    mismatches++;
    streakMiss++;
    locked = true;
    sfx.wrong();
    status.textContent = streakMiss >= 2 ? '괜찮아요! 다음엔 짝꿍 카드가 반짝일 거예요 ✨' : '앗, 짝이 아니에요. 다시 찾아봐요!';
    ctx.later(() => {
      [x.btn, y.btn].forEach((b) => { b.classList.remove('flipped'); b.setAttribute('aria-label', '카드'); wiggle(b); });
      locked = false;
    }, 900);
  }
}
