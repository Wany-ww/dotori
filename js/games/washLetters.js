import { h, shuffle, pickN, burst } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO_SOUND, JUNG_SOUND, JAMO_NAME, QUIZ_SYLLABLES, QUIZ_BATCHIM, EN_LETTER_WORDS, hasBatchim } from '../data.js';

const ROUNDS = 6;
// 단계별 글자 묶음과 때 자국 수
const POOLS = [
  Object.keys(CHO_SOUND),
  Object.keys(JUNG_SOUND),
  ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅐ', 'ㅔ', 'ㅚ', 'ㅟ', 'ㅘ', 'ㅝ'],
  QUIZ_SYLLABLES,
  QUIZ_BATCHIM,
];
const SPOTS = [5, 6, 7, 8, 9];
// 영어판: 쉬운 대문자 → 대문자 → 소문자 → 헷갈리는 소문자 → 섞어서
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const EN_POOLS = [
  'ABCDEHLMOST'.split(''),
  UPPER,
  UPPER.map((c) => c.toLowerCase()),
  'bdpqmnuhftij'.split(''),
  [...UPPER, ...UPPER.map((c) => c.toLowerCase())],
];
// 깨끗해진 알파벳은 이름과 그 소리로 시작하는 단어를 말한다: "B. B is for ball."
const enVoice = (c) => { const u = c.toUpperCase(); return `${u}. ${u} is for ${EN_LETTER_WORDS[c.toLowerCase()]}.`; };
const TENSE_SOUND = { ㄲ: '끄', ㄸ: '뜨', ㅃ: '쁘', ㅆ: '쓰', ㅉ: '쯔' };
const COLORS = ['#2C9BE0', '#F06A92', '#3BAE8A', '#F28C48', '#8B5CF6', '#E8A400'];

// 깨끗해진 글자가 내는 소리: 자음은 이름과 소리, 모음은 소리, 글자는 그대로
function voiceOf(c) {
  const sound = CHO_SOUND[c] || TENSE_SOUND[c];
  if (sound) return [JAMO_NAME[c], sound];
  return JAMO_NAME[c] || c;
}
// 글자 모양 안쪽의 점들 (캔버스에 그려 픽셀을 읽는다)
function insidePoints(cv, step) {
  const g = cv.getContext('2d');
  const k = cv.width / cv.clientWidth;
  const { data, width } = g.getImageData(0, 0, cv.width, cv.height);
  const pts = [];
  for (let y = step / 2; y < cv.clientHeight; y += step) {
    for (let x = step / 2; x < cv.clientWidth; x += step) {
      if (data[(Math.round(y * k) * width + Math.round(x * k)) * 4 + 3] > 200) pts.push({ x, y });
    }
  }
  return pts;
}

// 서로 gap 이상 떨어진 점을 n개까지 고른다
function spread(pts, n, gap) {
  const out = [];
  for (const p of shuffle(pts)) {
    if (out.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= gap)) out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

// 목욕 시간(WashingAlphabet): 때가 묻은 글자를 스펀지로 문질러 거품을 내고, 샤워로 헹구면 글자가 소리를 낸다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const lesson = ctx.lesson;
  // 한글 차시: 낱자를 배우는 차시는 낱자, 그 뒤로는 그 차시의 글자를 씻긴다
  const jamoKinds = ['vocab', 'jamoShape', 'theme', 'vowel', 'cons', 'diph'];
  // 영어 차시: 오늘 배우는 글자를 씻긴다 (알파벳 단계는 대문자 · 소문자를 번갈아)
  const unit = ctx.unit;
  const letters = lesson
    ? (jamoKinds.includes(lesson.kind) ? lesson.jamo(ROUNDS) : lesson.syllables(ROUNDS))
    : unit ? unit.letters(ROUNDS).map((U, i) => (unit.track === 'alpha' && i % 2 === 0 ? U : U.toLowerCase()))
      : pickN((en ? EN_POOLS : POOLS)[L - 1], ROUNDS);
  const voiceEn = (c) => (unit ? `${c.toUpperCase()}. ${unit.sayFor(c.toUpperCase())}` : enVoice(c));
  const box = h('div', { class: 'wa-box' });
  const sponge = h('span', { class: 'wa-sponge', 'aria-hidden': 'true' });
  const rain = h('div', { class: 'wa-rain', 'aria-hidden': 'true' });
  const tub = h('div', { class: 'wa-tub' }, box, sponge, rain);
  stage.append(h('div', { class: 'bath' }, tub));

  let r = 0;
  let spots = [];
  let left = 0;
  let done = false;
  let scrubbing = false;

  function scrubAt(x, y) {
    sponge.style.left = `${x}px`;
    sponge.style.top = `${y}px`;
    const b = box.getBoundingClientRect();
    const t = tub.getBoundingClientRect();
    spots.forEach((s) => {
      if (s.clean) return;
      if (Math.hypot(b.left - t.left + s.x - x, b.top - t.top + s.y - y) < 40) foam(s);
    });
  }

  function foam(s) {
    if (s.clean || done) return;
    s.clean = true;
    s.el.classList.add('foam');
    s.el.disabled = true;
    sfx.sparkle();
    left--;
    if (left === 0) rinse();
  }

  // 손가락(또는 마우스)으로 문지르면 스펀지가 따라오며 때를 거품으로 바꾼다
  tub.addEventListener('pointerdown', (e) => {
    if (done) return;
    scrubbing = true;
    try { tub.setPointerCapture(e.pointerId); } catch {}
    tub.classList.add('scrub');
    const t = tub.getBoundingClientRect();
    scrubAt(e.clientX - t.left, e.clientY - t.top);
  });
  tub.addEventListener('pointermove', (e) => {
    if (!scrubbing) return;
    const t = tub.getBoundingClientRect();
    scrubAt(e.clientX - t.left, e.clientY - t.top);
  });
  const stop = () => { scrubbing = false; tub.classList.remove('scrub'); };
  tub.addEventListener('pointerup', stop);
  tub.addEventListener('pointercancel', stop);

  // 거품을 다 내면 샤워로 헹구고, 반짝반짝 깨끗해진 글자가 자기 소리를 낸다
  function rinse() {
    done = true;
    box.classList.add('soapy');
    ctx.later(() => {
      tub.classList.add('shower');
      sfx.pop();
    }, 600);
    ctx.later(() => {
      box.classList.remove('soapy');
      box.classList.add('clean');
      spots.forEach((s) => s.el.remove());
      tub.classList.remove('shower');
      sfx.correct();
      burst(box, ['✨', '🫧', '⭐', '💧']);
      ctx.progress(r + 1, ROUNDS);
      if (en) speak(voiceEn(letters[r]), 'en-US');
      else speak(voiceOf(letters[r]));
    }, 2000);
    ctx.later(() => {
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry: ROUNDS, total: ROUNDS });
      else round();
    }, 4200);
  }

  async function round() {
    ctx.progress(r, ROUNDS);
    done = false;
    const c = letters[r];
    const cv = h('canvas', { class: `wa-glyph${en ? ' latin' : ''}`, 'aria-hidden': 'true' });
    const face = h('span', { class: 'wa-face', 'aria-hidden': 'true' }, h('i'), h('i'), h('b'));
    box.className = 'wa-box';
    box.replaceChildren(cv, face, h('span', { class: 'wa-feet', 'aria-hidden': 'true' }));
    box.setAttribute('aria-label', `${c} 글자`);
    box.classList.add('walk-in');
    sponge.style.left = '';
    sponge.style.top = '';

    // 글자를 캔버스에 그린다 (글꼴이 늦게 오면 기다렸다가)
    const size = cv.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size * dpr;
    cv.height = size * dpr;
    const family = getComputedStyle(cv).fontFamily;
    try { await document.fonts.load(`100px ${family}`, c); } catch {}
    if (!stage.isConnected) return;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    // 글자마다 실제 모양 크기를 재서 상자의 82%를 채우도록 키운다 (낱자는 글꼴 안에서 작게 그려진다)
    g.font = `100px ${family}`;
    const m = g.measureText(c);
    const gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const k = Math.min((size * 0.82) / gw, (size * 0.78) / gh);
    g.font = `${100 * k}px ${family}`;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillStyle = COLORS[r % COLORS.length];
    g.fillText(c, size / 2 - ((m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2) * k, size * 0.46 + ((m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2) * k);

    const pts = insidePoints(cv, 6);
    // 얼굴은 글자 윗부분 가운데에 가장 가까운 획 위에 붙인다
    const ys = pts.map((p) => p.y);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const want = { x: size / 2, y: top + (bottom - top) * 0.32 };
    const fp = pts.reduce((a, p) => (Math.hypot(p.x - want.x, p.y - want.y) < Math.hypot(a.x - want.x, a.y - want.y) ? p : a), pts[0]);
    face.style.left = `${fp.x}px`;
    face.style.top = `${fp.y}px`;
    box.style.setProperty('--feet', `${bottom}px`);

    spots = spread(pts.filter((p) => Math.hypot(p.x - fp.x, p.y - fp.y) > 26), SPOTS[L - 1], size * 0.13).map((p) => {
      const el = h('button', { class: 'wa-spot', type: 'button', 'aria-label': '때 자국', style: { left: `${p.x}px`, top: `${p.y}px`, '--rot': `${Math.random() * 360}deg` } });
      const s = { ...p, el, clean: false };
      el.addEventListener('click', () => foam(s));
      return s;
    });
    left = spots.length;
    box.append(...spots.map((s) => s.el));
    // 다 씻기면 온몸이 거품으로 덮이도록 거품 방울을 미리 깔아 둔다
    box.append(...spread(pts, 16, size * 0.09).map((p) => h('i', { class: 'wa-suds', style: { left: `${p.x}px`, top: `${p.y}px` } })));

    ctx.prompt(
      `'${c}' 글자가 더러워졌어요! 스펀지로 문질러서 깨끗이 씻겨 주세요.`,
      () => {
        if (en) return speak([c.toUpperCase(), "Oh no! Let's wash it!"], 'en-US');
        const nm = c.charCodeAt(0) < 0xac00 ? JAMO_NAME[c] : c;
        speak([nm, '더러워졌어요. 깨끗이 씻겨 줄까요?']);
      },
    );
  }

  round();
}
