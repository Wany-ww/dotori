import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_JELLY, JOSA_PAIRS, KICKER_NOUNS, KICKER_TEMPLATES, hasBatchim } from '../data.js';
import { draggable, hits } from './dragTap.js';

const ROWS = 6;
const SHOW = 4;
const TINTS = ['#F6CF2E', '#F06A3C', '#EC6FB0', '#7DDB3A', '#4FC3F7', '#B28DF0'];
// 함정 젤리 수 (단계별)
const TRAPS = [0, 1, 1, 2, 2];
// 한글: 단계별 조사 짝 (이/가 → 을/를 → 섞어서 → 은/는 → 와/과까지)
const KO_PAIRS = [['subj'], ['obj'], ['subj', 'obj'], ['subj', 'obj', 'topic'], ['subj', 'obj', 'topic', 'with']];

// 젤리 줄 하나: { pre, stem, e, ans, post, text }
// 영어 차시는 차시에 맞는 묶음(복수형 · 비교급 · 과거형)에서, 그 차시 끝말(keep)을 먼저 고른다
function enRows(J, keep) {
  const all = EN_JELLY[J];
  const mine = keep ? all.filter((r) => keep.includes(r[2])) : all;
  return [...pickN(mine, ROWS), ...pickN(all.filter((r) => !mine.includes(r)), ROWS)].slice(0, ROWS).map(([pre, stem, ans, post]) => ({
    pre, stem, ans, post, text: `${pre} ${stem}${ans}${post === '.' ? '' : ' '}${post}`,
  }));
}
function koRows(L) {
  const used = new Set();
  return Array.from({ length: ROWS }, () => {
    const tpl = pick(KICKER_TEMPLATES.filter((t) => KO_PAIRS[L - 1].includes(t.pair)));
    const noun = pick(KICKER_NOUNS.filter((x) => (!tpl.animal || x.a) && !used.has(x.w)));
    used.add(noun.w);
    const pair = JOSA_PAIRS[tpl.pair];
    const ans = hasBatchim(noun.w) ? pair[0] : pair[1];
    return { pre: '', stem: noun.w, e: noun.e, ans, other: ans === pair[0] ? pair[1] : pair[0], post: tpl.rest, text: `${noun.w}${ans} ${tpl.rest}` };
  });
}

// 젤리 붙이기(JellyAffix): 젤리 문장의 빈 곳에 알맞은 젤리를 끌어다 붙인다.
// 영어는 낱말 끝(-s · -es · -en · -ing · -ed …), 한글은 조사(이/가 · 을/를 …)를 받침에 맞게 붙인다
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  // 조사 고르기는 받침을 알아야 해서, 한글 차시에서는 받침을 배운 뒤 난이도를 따른다 (단어 축구와 같이)
  const L = ko && ctx.lesson && !ctx.lesson.batchim ? Math.min(ctx.level, 2) : ctx.level;
  const lang = ko ? 'ko-KR' : 'en-US';
  const hinter = makeHinter();
  const J = !ko && ctx.unit?.jelly != null ? ctx.unit.jelly : L - 1;
  const keep = { U: ['er', 'est'], W: ['ed'] }[ctx.unit?.code] || null;
  const rows = ko ? koRows(L) : enRows(J, keep);
  const board = h('div', { class: 'jl-board' });
  const sand = h('div', { class: 'jl-sand' });
  stage.append(h('div', { class: `jelly-affix${ko ? ' ko' : ' en'}` }, board, sand));
  let firstTry = 0;
  let done = 0;
  let next = 0;
  let sel = null;
  const live = new Set();

  // 함정 젤리: 한글은 짝의 다른 쪽(가 ↔ 이), 영어는 이 단계의 다른 낱말 끝
  const enSufs = [...new Set(EN_JELLY[J].map((r) => r[2]))];
  const traps = Array.from({ length: TRAPS[L - 1] }, (_, i) => {
    const r = rows[i % rows.length];
    return ko ? r.other : pick(enSufs.filter((s) => s !== r.ans)) || 's';
  });
  shuffle([...rows.map((r) => r.ans), ...traps]).forEach((a, i) => sand.append(jelly(a, i)));

  function jelly(a, i) {
    const j = h('button', { class: 'jl-drop', type: 'button', style: { '--r': `${randInt(-8, 8)}deg`, animationDelay: `${i * 0.06}s` } }, a);
    j.dataset.a = a;
    draggable(j, {
      onDrop: (pt) => {
        const row = [...live].find((r) => hits(r.el, pt, 4));
        if (row) stick(j, row);
        else wiggle(j);
      },
    });
    j.addEventListener('click', () => {
      sfx.tap();
      if (sel === j) { j.classList.remove('sel'); sel = null; return; }
      sel?.classList.remove('sel');
      sel = j;
      j.classList.add('sel');
    });
    return j;
  }

  function addRow(slotEl) {
    if (next >= rows.length) { slotEl?.remove(); return; }
    const r = rows[next];
    const tint = TINTS[next % TINTS.length];
    next++;
    r.miss = 0;
    r.gap = h('span', { class: 'jl-gap', 'aria-label': '빈 곳' });
    r.el = h('button', { class: 'jl-row', type: 'button', style: { '--tint': tint } },
      r.pre ? h('span', { class: 'jl-pre' }, r.pre) : null,
      h('span', { class: 'jl-stem' }, r.e ? h('i', { 'aria-hidden': 'true' }, r.e) : null, r.stem, r.gap),
      ko ? h('span', { class: 'jl-post' }, r.post) : null);
    r.el.dataset.a = r.ans;
    r.el.addEventListener('click', () => {
      if (sel) stick(sel, r);
      else { sfx.tap(); speak(r.text, lang); }
    });
    live.add(r);
    if (slotEl) slotEl.replaceWith(r.el);
    else board.append(r.el);
  }

  function stick(j, r) {
    if (j.dataset.a !== r.ans) {
      r.miss++;
      wiggle(j);
      wiggle(r.el);
      hinter.miss([...live].find((x) => x.ans === j.dataset.a)?.el);
      return;
    }
    hinter.reset();
    if (sel === j) sel = null;
    j.remove();
    live.delete(r);
    if (r.miss === 0) firstTry++;
    done++;
    ctx.progress(done, rows.length);
    sfx.pop();
    // 붙으면 한 덩어리 문장 젤리가 된다
    r.el.classList.add('whole');
    r.el.replaceChildren(h('span', { class: 'jl-text' }, r.text));
    pop(r.el);
    speak(r.text, lang);
    ctx.later(() => {
      r.el.classList.add('out');
      ctx.later(() => addRow(r.el), 450);
    }, 1700);
    if (done >= rows.length) {
      ctx.later(() => { sfx.correct(); cheer(board, ko ? 'ko' : 'en'); }, 600);
      ctx.later(() => ctx.finish({ firstTry, total: rows.length }), 2600);
    }
  }

  for (let i = 0; i < SHOW; i++) addRow(null);
  ctx.progress(0, rows.length);
  ctx.prompt(
    ko ? '젤리 문장의 빈 곳에 알맞은 말 젤리를 붙여요. 받침이 있는지 잘 보세요!' : '젤리 단어 끝에 알맞은 젤리를 붙여 문장을 완성해요!',
    () => (ko ? speak('알맞은 젤리를 붙여 보세요!') : speak('Stick the jelly!', 'en-US')),
  );
}
