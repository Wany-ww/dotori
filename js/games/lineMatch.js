import { h, shuffle, pick, pickN, wiggle, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, CHO, decompose, VOCAB, VOCAB2, NATIVE_NUM } from '../data.js';

const BOARDS = 2;
const ROWS = [3, 4, 4, 3, 4];
const SVG = 'http://www.w3.org/2000/svg';

// 그림 ↔ 낱말. 자음·받침을 배우는 차시는 첫소리 ↔ 낱말 ↔ 그림 (세 줄)
function makeBoard(L, lesson) {
  const three = lesson ? ['cons', 'cv'].includes(lesson.kind) && L >= 3 : L >= 4;
  const pool = lesson ? lesson.words(20, { pic: true }) : shuffle(L >= 3 ? [...WORDS, ...WORDS2] : WORDS);
  const rows = [];
  const usedCho = new Set();
  for (const w of pool) {
    const cho = CHO[decompose(w.word).c];
    if (three && usedCho.has(cho)) continue;
    usedCho.add(cho);
    rows.push({ id: rows.length, word: w.word, emoji: w.emoji, cho });
    if (rows.length === ROWS[L - 1]) break;
  }
  const cols = three ? ['cho', 'word', 'pic'] : ['pic', 'word'];
  return { rows, cols };
}

// 영어: 그림 ↔ 단어, Lv4+ 첫 글자 ↔ 단어 ↔ 그림
// 영어 차시: 오늘 단어. 알파벳 · 소리 단계는 첫 글자 칸도 함께 잇는다
function enBoard(L, unit) {
  const three = L >= 4 || unit?.track === 'alpha' || unit?.kind === 'sound';
  const pool = unit ? unit.words(12) : shuffle(L >= 3 ? [...VOCAB, ...VOCAB2] : VOCAB);
  const rows = [];
  const used = new Set();
  for (const w of pool) {
    const first = w.w[0].toUpperCase();
    if (three && used.has(first)) continue;
    used.add(first);
    rows.push({ id: rows.length, word: w.w, emoji: w.e, cho: first });
    if (rows.length === ROWS[L - 1]) break;
  }
  return { rows, cols: three ? ['cho', 'word', 'pic'] : ['pic', 'word'] };
}
// 수학(짝 연결하기): 위 카드와 아래 카드를 색깔 · 개수 · 모양 · 입체도형에 따라 선으로 잇는다 (참고 영상 기준)
const SHAPE_THINGS = [['⚪', '동그라미', ['⚽', '🍪', '🕐', '🍩']], ['🔺', '세모', ['🍕', '⛺', '📐']], ['🟦', '네모', ['🎁', '🧇', '🖼️']], ['▬', '긴 네모', ['🚪', '📱', '📕']]];
const COLOR_THINGS = [['#E8483C', '빨간색', ['🍎', '🍓', '🚒', '🍅']], ['#F2C230', '노란색', ['🍌', '🌻', '🐤', '🍋']], ['#4DB04A', '초록색', ['🥦', '🐸', '🥒', '🍀']], ['#8A4CC8', '보라색', ['🍇', '🍆', '🔮']], ['#F28A2E', '주황색', ['🍊', '🥕', '🎃']], ['#3E7FE0', '파란색', ['🐳', '🫐', '💙']]];
const SOLIDS = [['sphere', '공 모양', ['⚽', '🏀', '🌐', '🍊']], ['box', '상자 모양', ['🎁', '📦', '🧊']], ['tube', '둥근 기둥 모양', ['🥫', '🥁', '🧻']], ['cone', '뿔 모양', ['🍦', '🎄', '🥕']]];
const SVG_SOLID = {
  sphere: '<defs><radialGradient id="g" cx=".35" cy=".35"><stop offset="0" stop-color="#9FD3FF"/><stop offset="1" stop-color="#2F7FD0"/></radialGradient></defs><circle cx="50" cy="50" r="36" fill="url(#g)"/>',
  box: '<path d="M20 38L50 24L80 38V70L50 84L20 70Z" fill="#F2A23A"/><path d="M20 38L50 52L80 38L50 24Z" fill="#FFD27A"/><path d="M50 52V84L80 70V38Z" fill="#C9761E"/>',
  tube: '<rect x="26" y="26" width="48" height="50" fill="#45B035"/><ellipse cx="50" cy="76" rx="24" ry="9" fill="#2F8A24"/><ellipse cx="50" cy="26" rx="24" ry="9" fill="#8FDB6A"/>',
  cone: '<path d="M50 14L76 74H24Z" fill="#E85C9A"/><ellipse cx="50" cy="74" rx="26" ry="9" fill="#B23A74"/>',
};
const solidEl = (k) => { const s = h('span', { class: 'lm-solid', 'aria-hidden': 'true' }); s.innerHTML = `<svg viewBox="0 0 100 100">${SVG_SOLID[k]}</svg>`; return s; };
const MIXED = ['🍎', '🍌', '🍇', '🍓', '🍊'];
const many = (list) => h('span', { class: `lm-many n${list.length}`, 'aria-hidden': 'true' }, list.map((e) => h('i', {}, e)));
const bars = (n) => h('span', { class: 'lm-bars', 'aria-hidden': 'true' }, Array.from({ length: n }, () => h('i')));
// 단계별 기준: 색깔 → 개수(막대 ↔ 크레파스) → 평면도형 → 개수(섞인 과일 ↔ 쿠키) → 입체도형
function mathBoard(L) {
  if (L === 1) {
    return { rows: shuffle(COLOR_THINGS).slice(0, 4).map(([c, name, things], id) => ({ id, word: name, faces: { top: h('span', { class: 'lm-paint', style: { background: c }, 'aria-hidden': 'true' }), bot: pick(things) } })), cols: ['top', 'bot'] };
  }
  if (L === 3 || L === 5) {
    const src = L === 3 ? SHAPE_THINGS : SOLIDS;
    return { rows: shuffle(src).slice(0, 4).map(([e, name, things], id) => ({ id, word: name, faces: { top: L === 3 ? e : solidEl(e), bot: pick(things) } })), cols: ['top', 'bot'] };
  }
  const nums = shuffle(L === 2 ? [1, 2, 3, 4] : [3, 4, 5, 6]);
  return {
    rows: nums.map((v, id) => ({
      id, word: NATIVE_NUM[v - 1],
      faces: L === 2 ? { top: bars(v), bot: many(Array(v).fill('🖍️')) } : { top: many(Array.from({ length: v }, () => pick(MIXED))), bot: many(Array(v).fill('🍪')) },
    })),
    cols: ['top', 'bot'],
  };
}

// 선 긋기(LineMatching): 한글 · 영어(ctx.lang 'en') · 수학(opts.mode 'math')
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const math = ctx.opts.mode === 'math';
  const say = (t) => speak(t, en ? 'en-US' : 'ko-KR');
  const hinter = makeHinter();
  const root = h('div', { class: `lines${en ? ' en' : ''}${math ? ' math' : ''}` });
  stage.append(root);
  let b = 0;
  let total = 0;
  let misses = 0;
  let ro = null;
  ctx.onCleanup(() => ro?.disconnect());

  function board() {
    hinter.reset();
    const { rows, cols } = math ? mathBoard(L) : en ? enBoard(L, ctx.unit) : makeBoard(L, ctx.lesson);
    const need = rows.length * (cols.length - 1);
    total += need;
    let linked = 0;
    const links = [];
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'lm-svg');
    svg.setAttribute('aria-hidden', 'true');
    const temp = document.createElementNS(SVG, 'line');
    temp.setAttribute('class', 'lm-temp');

    const face = (kind, r) => r.faces?.[kind] ?? (kind === 'pic' ? r.emoji : kind === 'cho' ? r.cho : r.word);
    const columns = cols.map((kind, ci) => shuffle(rows).map((r) => {
      const el = h('button', { class: `lm-item lm-${kind}`, type: 'button', 'data-col': ci, 'data-id': r.id, 'aria-label': kind === 'pic' ? `${r.word} 그림` : typeof face(kind, r) === 'string' ? face(kind, r) : r.word },
        ci > 0 ? h('span', { class: 'lm-dot left', 'aria-hidden': 'true' }) : null,
        h('span', { class: 'lm-face' }, kind === 'pic' && !r.faces?.pic ? wordPic(r.word, r.emoji) : face(kind, r)),
        ci < cols.length - 1 ? h('span', { class: 'lm-dot right', 'aria-hidden': 'true' }) : null);
      el.linked = { left: false, right: false };
      return el;
    }));
    const items = columns.flat();
    const boardEl = h('div', { class: `lm-board cols-${cols.length}` }, svg, columns.map((c) => h('div', { class: 'lm-col' }, c)));
    root.replaceChildren(boardEl);
    ctx.progress(b, BOARDS);

    const dotOf = (el, side) => {
      const d = el.querySelector(`.lm-dot.${side}`) || el;
      const r = d.getBoundingClientRect();
      const br = boardEl.getBoundingClientRect();
      return [r.left + r.width / 2 - br.left, r.top + r.height / 2 - br.top];
    };
    function drawLinks() {
      svg.replaceChildren(...links.map(([a, z]) => {
        const [x1, y1] = dotOf(a, 'right');
        const [x2, y2] = dotOf(z, 'left');
        const ln = document.createElementNS(SVG, 'line');
        ln.setAttribute('class', 'lm-line');
        Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => ln.setAttribute(k, v));
        return ln;
      }), temp);
    }
    ro?.disconnect();
    ro = new ResizeObserver(drawLinks);
    ro.observe(boardEl);

    const partnerOf = (el) => {
      const ci = Number(el.dataset.col);
      const want = !el.linked.right && ci < cols.length - 1 ? ci + 1 : ci - 1;
      return items.find((x) => Number(x.dataset.col) === want && x.dataset.id === el.dataset.id);
    };

    function attempt(a, z) {
      let ca = Number(a.dataset.col);
      let cz = Number(z.dataset.col);
      if (Math.abs(ca - cz) !== 1) { wiggle(z); return; }
      if (ca > cz) { [a, z] = [z, a]; [ca, cz] = [cz, ca]; }
      if (a.linked.right || z.linked.left) { sfx.wrong(); wiggle(a.linked.right ? a : z); return; }
      if (a.dataset.id !== z.dataset.id) {
        misses++;
        wiggle(a);
        wiggle(z);
        hinter.miss(partnerOf(a));
        return;
      }
      hinter.reset();
      a.linked.right = true;
      z.linked.left = true;
      links.push([a, z]);
      [a, z].forEach((x) => x.classList.add('done'));
      drawLinks();
      sfx.correct();
      say(rows[Number(a.dataset.id)].word);
      linked++;
      if (linked < need) return;
      cheer(boardEl, en ? 'en' : 'ko');
      ctx.later(() => {
        b++;
        if (b >= BOARDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
        else board();
      }, 1600);
    }

    // 끌어서 잇거나, 하나를 누르고 짝을 눌러서 잇는다
    let picked = null;
    const setPicked = (el) => {
      picked?.classList.remove('picked');
      picked = el;
      el?.classList.add('picked');
    };
    items.forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const start = dotOf(el, Number(el.dataset.col) === 0 ? 'right' : 'left');
        let moved = false;
        const sx = e.clientX;
        const sy = e.clientY;
        const br = boardEl.getBoundingClientRect();
        try { el.setPointerCapture(e.pointerId); } catch {}
        const move = (ev) => {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10) moved = true;
          if (!moved) return;
          Object.entries({ x1: start[0], y1: start[1], x2: ev.clientX - br.left, y2: ev.clientY - br.top }).forEach(([k, v]) => temp.setAttribute(k, v));
          temp.style.display = 'block';
        };
        const up = (ev) => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
          temp.style.display = 'none';
          if (moved) {
            const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.lm-item');
            if (target && target !== el) attempt(el, target);
            setPicked(null);
            return;
          }
          sfx.tap();
          // 그림이나 낱말을 누르면 낱말을 읽어 준다 (아직 글자를 모르는 단계도 소리로 이을 수 있게)
          if (!el.classList.contains('lm-cho')) say(rows[Number(el.dataset.id)].word);
          if (picked && picked !== el && picked.dataset.col !== el.dataset.col) {
            const a = picked;
            setPicked(null);
            attempt(a, el);
          } else setPicked(picked === el ? null : el);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
      });
    });
    drawLinks();
    if (math) {
      ctx.prompt(['위와 아래에서 색깔이 같은 것끼리 선으로 이어요!', '위와 아래에서 개수가 같은 것끼리 선으로 이어요!', '도형과 같은 모양의 물건을 선으로 이어요!', '위와 아래에서 개수가 같은 것끼리 선으로 이어요!', '입체도형과 같은 모양의 물건을 선으로 이어요!'][L - 1],
        () => speak('짝을 선으로 이어 볼까요?'));
    }
    else if (en) ctx.prompt(cols.length === 3 ? '첫 글자 → 단어 → 그림 순서로 짝을 선으로 이어요!' : '그림과 알맞은 영어 단어를 선으로 이어요!', () => say('Match the pairs!'));
    else {
      ctx.prompt(
        cols.length === 3 ? '첫소리 → 낱말 → 그림 순서로 짝을 선으로 이어요!' : '그림과 알맞은 낱말을 선으로 이어요!',
        () => speak(cols.length === 3 ? '첫소리와 낱말과 그림을 선으로 이어 볼까요?' : '그림과 낱말을 선으로 이어 볼까요?'),
      );
    }
  }

  board();
}
