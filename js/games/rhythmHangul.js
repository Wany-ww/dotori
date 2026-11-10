import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO, JUNG, JONG, CHO_SOUND, JUNG_SOUND, JONG_SOUND, JAMO_NAME, QUIZ_SYLLABLES, QUIZ_BATCHIM, compose, decompose } from '../data.js';
import { draggable, hits } from './dragTap.js';

const ROUNDS = 4;
const CONS = Object.keys(CHO_SOUND);
const VOWS = Object.keys(JUNG_SOUND);
const FINALS = Object.keys(JONG_SOUND);
// 단계별: 채워야 하는 자리(cho 첫소리 · jung 가운뎃소리 · jong 받침)와 함정 조각 수
const CFG = [
  { pool: QUIZ_SYLLABLES, need: ['jung'], extra: { jung: 2 } },
  { pool: QUIZ_SYLLABLES, need: ['cho'], extra: { cho: 3 } },
  { pool: QUIZ_SYLLABLES, need: ['cho', 'jung'], extra: { cho: 2, jung: 1 } },
  { pool: QUIZ_BATCHIM, need: ['jong'], extra: { jong: 3 } },
  { pool: QUIZ_BATCHIM, need: ['cho', 'jung', 'jong'], extra: { cho: 1, jung: 1, jong: 2 } },
];
const SOUND = { cho: CHO_SOUND, jung: JUNG_SOUND, jong: JONG_SOUND };

// 한글 차시: 배우는 자리(모음·첫소리·받침)를 비워 두고, 여러 낱자를 배운 차시는 여러 자리를 비운다
function lessonCfg(lesson, base) {
  const n = Math.max(1, Math.min(3, Object.values(base.extra).reduce((a, b) => a + b, 0)));
  let need = lesson.slot ? [lesson.slot] : lesson.batchim ? ['cho', 'jung', 'jong'] : ['cho', 'jung'];
  if (lesson.kind === 'rule') need = ['jong'];
  return { need, extra: Object.fromEntries(need.map((k) => [k, need.length > 1 ? 1 : n])), lesson };
}

// 리듬 한글(RhythmHangeul): 빠진 자음·모음 조각을 스피커 원에 넣어 글자를 완성하면 리듬이 흘러나온다
export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const cfg = lesson ? lessonCfg(lesson, CFG[L - 1]) : CFG[L - 1];
  const hinter = makeHinter();
  const syllables = lesson ? lesson.syllables(ROUNDS) : pickN(cfg.pool, ROUNDS);
  const badge = h('button', { class: 'rh-badge', type: 'button', 'aria-label': '만들 글자 듣기' });
  const screen = h('span', { class: 'rh-screen' });
  const speaker = h('div', { class: 'rh-speaker', 'aria-label': '글자 스피커' }, screen);
  const notes = h('div', { class: 'rh-staff', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'), h('i'));
  const floor = h('div', { class: 'rh-floor' });
  stage.append(h('div', { class: 'neon' }, h('div', { class: 'rh-top' }, badge, speaker, notes), floor));

  let r = 0;
  let firstTry = 0;
  let parts = {};
  let filled = {};
  let pieces = [];
  let missed = false;
  let busy = false;
  let need = cfg.need;

  const syl = () => syllables[r];
  badge.addEventListener('click', () => speak(syl()));

  // 스피커에는 지금까지 모은 조각을 보여 준다 (첫소리+가운뎃소리가 모이면 글자로 합친다)
  function show() {
    const cur = (k) => (parts.given.includes(k) ? parts[k] : filled[k]);
    if (cur('cho') && cur('jung')) screen.textContent = compose(cur('cho'), cur('jung'), cur('jong') || 0);
    else screen.textContent = ['cho', 'jung', 'jong'].map(cur).filter(Boolean).join(' ');
  }

  function attempt(pc) {
    if (busy || pc.el.disabled) return;
    const slot = need.find((k) => !filled[k] && parts[k] === pc.c);
    if (!slot) {
      missed = true;
      wiggle(pc.el);
      const want = need.find((k) => !filled[k]);
      hinter.miss(pieces.find((o) => !o.el.disabled && o.c === parts[want])?.el);
      return;
    }
    hinter.reset();
    filled[slot] = pc.c;
    pc.el.disabled = true;
    pc.el.classList.add('used');
    sfx.pop();
    show();
    pop(screen);
    if (need.some((k) => !filled[k])) {
      speak(SOUND[slot][pc.c] || JAMO_NAME[pc.c]);
      return;
    }
    // 완성! 글자를 읽어 주고, 스피커가 박자에 맞춰 울리며 음표가 흘러간다
    busy = true;
    if (!missed) firstTry++;
    speaker.classList.add('done');
    cheer(speaker);
    speak(syl());
    ctx.later(() => {
      speaker.classList.add('play');
      notes.classList.add('play');
      sfx.rhythm(r);
    }, 700);
    ctx.later(() => {
      speaker.classList.remove('play', 'done');
      notes.classList.remove('play');
      r++;
      ctx.progress(r, ROUNDS);
      if (r >= ROUNDS) ctx.finish({ firstTry, total: ROUNDS });
      else round();
    }, 2900);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    busy = false;
    missed = false;
    const d = decompose(syl());
    parts = { cho: CHO[d.c], jung: JUNG[d.j], jong: d.t ? JONG[d.t] : null };
    // 받침 없는 글자면 받침 자리는 비우지 않는다
    need = cfg.need.filter((k) => parts[k]);
    if (!need.length) need = ['jung'];
    parts.given = ['cho', 'jung', 'jong'].filter((k) => parts[k] && !need.includes(k));
    filled = {};
    badge.textContent = syl();
    show();

    // 필요한 조각 + 함정 조각 (같은 글자는 겹치지 않게)
    const used = new Set([parts.cho, parts.jung, parts.jong].filter(Boolean));
    // 함정 조각은 지금까지 배운 낱자에서
    const known = cfg.lesson?.known;
    const traps = Object.entries(cfg.extra).filter(([k]) => need.includes(k)).flatMap(([k, n]) => {
      const kk = { cho: 'cons', jung: 'vows', jong: 'fins' }[k];
      const pool = known && known[kk].length >= 3 ? known[kk] : { cho: CONS, jung: VOWS, jong: FINALS }[k];
      const pickd = shuffle(pool.filter((x) => !used.has(x))).slice(0, n);
      pickd.forEach((x) => used.add(x));
      return pickd;
    });
    pieces = shuffle([...need.map((k) => parts[k]), ...traps]).map((c) => {
      const el = h('button', { class: 'rh-piece', type: 'button', 'aria-label': `${c} 조각`, style: { '--rot': `${Math.round(Math.random() * 24 - 12)}deg`, '--dy': `${Math.round(Math.random() * 30)}px` } }, c);
      const pc = { el, c };
      el.addEventListener('click', () => attempt(pc));
      draggable(el, {
        can: () => !busy && !el.disabled,
        onMove: (p) => speaker.classList.toggle('over', hits(speaker, p, 30)),
        onDrop: (p) => {
          speaker.classList.remove('over');
          if (hits(speaker, p, 30)) attempt(pc);
        },
      });
      return pc;
    });
    floor.replaceChildren(...pieces.map((pc) => pc.el));
    const what = need.length > 1 ? '조각들' : { cho: '자음', jung: '모음', jong: '받침' }[need[0]];
    ctx.prompt(
      `'${syl()}' 글자를 만들어요! 알맞은 ${what}을 스피커 안으로 넣으면 리듬이 흘러나와요.`,
      () => speak([syl(), '글자를 만들어 볼까요?']),
    );
  }

  round();
}
