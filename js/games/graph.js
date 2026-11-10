import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { numPad } from './numPad.js';

const R = 2;
// 주제: 그래프 제목, 갈래 [그림, 이름, 개수 질문], 마지막 질문 (두 갈래: 더 · 여러 갈래: 가장)
const THEMES = {
  flower: {
    title: '꽃병에 꽂혀 있는 꽃',
    kinds: [['🌻', '노란색', '노란색 꽃은 몇 송이인가요?'], ['🌸', '분홍색', '분홍색 꽃은 몇 송이인가요?'], ['🌹', '빨간색', '빨간색 꽃은 몇 송이인가요?'], ['🌼', '하얀색', '하얀색 꽃은 몇 송이인가요?']],
    more: '더 많은 꽃의 색깔은 무엇인가요?', less: '더 적은 꽃의 색깔은 무엇인가요?',
    most: '가장 많은 꽃의 색깔은 무엇인가요?', least: '가장 적은 꽃의 색깔은 무엇인가요?',
  },
  fruit: {
    title: '좋아하는 과일',
    kinds: [['🍎', '사과', '사과를 좋아하는 어린이는 몇 명인가요?'], ['🍊', '오렌지', '오렌지를 좋아하는 어린이는 몇 명인가요?'], ['🍌', '바나나', '바나나를 좋아하는 어린이는 몇 명인가요?'], ['🍇', '포도', '포도를 좋아하는 어린이는 몇 명인가요?']],
    more: '더 많은 어린이가 좋아하는 과일은 무엇인가요?', less: '더 적은 어린이가 좋아하는 과일은 무엇인가요?',
    most: '가장 많은 어린이가 좋아하는 과일은 무엇인가요?', least: '가장 적은 어린이가 좋아하는 과일은 무엇인가요?',
  },
  clothes: {
    title: '오늘 팔린 옷',
    kinds: [['👕', '셔츠', '셔츠는 몇 벌 팔렸나요?'], ['👖', '바지', '바지는 몇 벌 팔렸나요?'], ['👗', '치마', '치마는 몇 벌 팔렸나요?'], ['🧥', '외투', '외투는 몇 벌 팔렸나요?']],
    more: '어떤 옷이 더 많이 팔렸나요?', less: '어떤 옷이 더 적게 팔렸나요?',
    most: '어떤 옷이 가장 많이 팔렸나요?', least: '어떤 옷이 가장 적게 팔렸나요?',
  },
  veg: {
    title: '오늘 사 온 채소',
    kinds: [['🥕', '당근', '당근은 몇 개인가요?'], ['🧅', '양파', '양파는 몇 개인가요?'], ['🥔', '감자', '감자는 몇 개인가요?'], ['🥒', '오이', '오이는 몇 개인가요?']],
    more: '더 많이 사 온 채소는 무엇인가요?', less: '더 적게 사 온 채소는 무엇인가요?',
    most: '가장 많이 사 온 채소는 무엇인가요?', least: '가장 적게 사 온 채소는 무엇인가요?',
  },
  toy: {
    title: '우리 반 장난감',
    kinds: [['⚽', '공', '공은 몇 개인가요?'], ['🧸', '인형', '인형은 몇 개인가요?'], ['🧱', '블록', '블록은 몇 개인가요?'], ['🚗', '자동차', '자동차는 몇 개인가요?']],
    more: '더 많은 장난감은 무엇인가요?', less: '더 적은 장난감은 무엇인가요?',
    most: '가장 많은 장난감은 무엇인가요?', least: '가장 적은 장난감은 무엇인가요?',
  },
};
// 단계별: 갈래 수, 개수 범위, 그래프 칸 수, 모두 몇 개인지도 묻는지
const SORT = [
  { kinds: 2, n: [1, 4], rows: 5 },
  { kinds: 2, n: [1, 5], rows: 5 },
  { kinds: 3, n: [1, 5], rows: 5 },
  { kinds: 3, n: [2, 6], rows: 6 },
  { kinds: 4, n: [2, 6], rows: 6, total: true },
];
const MARK = [
  { kinds: 2, n: [1, 5], rows: 10 },
  { kinds: 3, n: [1, 5], rows: 10 },
  { kinds: 3, n: [1, 8], rows: 10 },
  { kinds: 4, n: [1, 9], rows: 10 },
  { kinds: 4, n: [2, 10], rows: 10, total: true },
];

// 그래프 I(DataSort · sort): 오른쪽에 흩어진 물건을 끌어 갈래별 그래프 칸에 쌓는다.
// 그래프 II(DataMark · mark): 쪽지("당근 1개, 양파 2개")를 보고 ▲ ▼로 점을 찍어 그래프를 만든다.
// 다 만들면 갈래마다 몇 개인지 숫자판으로 넣고, 더 많은(적은) 것을 고른다 (참고 영상 기준)
export function mount(stage, ctx) {
  const mark = ctx.opts.mode === 'mark';
  const cfg = (mark ? MARK : SORT)[ctx.level - 1];
  const hinter = makeHinter();
  const title = h('p', { class: 'gp-title' });
  const chart = h('div', { class: 'gp-chart' });
  const side = h('div', { class: 'gp-side' });
  stage.append(h('div', { class: `graph mode-${mark ? 'mark' : 'sort'}` }, h('div', { class: 'gp-left' }, title, chart), side));
  let b = 0;
  let firstTry = 0;
  let total = 0;
  let lastTheme = '';

  function round() {
    hinter.reset();
    ctx.progress(b, R);
    const names = Object.keys(THEMES).filter((k) => (mark ? ['veg', 'toy'] : ['flower', 'fruit', 'clothes']).includes(k) && k !== lastTheme);
    const theme = THEMES[names[randInt(0, names.length - 1)]];
    lastTheme = Object.keys(THEMES).find((k) => THEMES[k] === theme);
    const kinds = pickN(theme.kinds, cfg.kinds);
    // 개수는 서로 다르게 (가장 많은 · 적은 것이 하나로 정해지게)
    const counts = pickN(Array.from({ length: cfg.n[1] - cfg.n[0] + 1 }, (_, i) => cfg.n[0] + i), cfg.kinds);
    let missed = false;
    title.textContent = `[ ${theme.title} ]`;
    side.classList.remove('ask');
    const cols = kinds.map(([e, name], i) => {
      const cells = Array.from({ length: cfg.rows }, () => h('span', { class: 'gp-cell' }));
      const up = mark ? h('button', { class: 'gp-arrow up', type: 'button', 'aria-label': `${name} 하나 더` }, '▲') : null;
      const down = mark ? h('button', { class: 'gp-arrow down', type: 'button', 'aria-label': `${name} 하나 빼기` }, '▼') : null;
      const col = h('div', { class: 'gp-col' },
        h('div', { class: 'gp-stack' }, ...cells.slice().reverse()),
        up, h('span', { class: 'gp-label', 'aria-label': name }, e), down);
      col.dataset.fill = 0;
      return { col, cells, up, down, fill: 0 };
    });
    chart.style.setProperty('--rows', cfg.rows);
    chart.replaceChildren(h('div', { class: 'gp-axis', 'aria-hidden': 'true' }, Array.from({ length: cfg.rows }, (_, k) => h('span', {}, cfg.rows - k))), ...cols.map((c) => c.col));
    const paint = (c, i) => c.cells.forEach((x, j) => { x.classList.toggle('on', j < c.fill); x.textContent = j < c.fill ? (mark ? '' : kinds[i][0]) : ''; });

    if (mark) {
      // 쪽지를 보고 ▲ ▼로 점을 찍는다. 맞게 찍힌 줄은 파랗게, 다 맞으면 질문으로
      const lines = kinds.map(([, name], i) => h('p', { class: 'gp-line' }, `${name} ${counts[i]}개`));
      side.replaceChildren(h('div', { class: 'gp-note' }, lines));
      let done = false;
      const check = () => {
        cols.forEach((c, i) => lines[i].classList.toggle('ok', c.fill === counts[i]));
        if (done || cols.some((c, i) => c.fill !== counts[i])) return;
        done = true;
        if (!missed) firstTry++;
        total++;
        sfx.correct();
        ctx.later(ask, 700);
      };
      cols.forEach((c, i) => {
        c.up.addEventListener('click', () => {
          if (done) return;
          if (c.fill >= cfg.rows) { wiggle(c.up); return; }
          c.fill++;
          sfx.pop();
          paint(c, i);
          // 쪽지보다 많이 찍으면 알려 준다
          if (c.fill > counts[i]) { missed = true; wiggle(c.col); hinter.miss(c.down); }
          check();
        });
        c.down.addEventListener('click', () => {
          if (done || !c.fill) return;
          c.fill--;
          sfx.tap();
          paint(c, i);
          check();
        });
      });
      ctx.prompt('쪽지를 보고 ▲를 눌러 그래프에 점을 찍어요. 잘못 찍었으면 ▼로 빼요!', () => speak('쪽지를 보고 그래프를 만들어요!'));
    } else {
      // 흩어진 물건을 끌어(또는 골라서) 같은 그림 줄에 쌓는다
      const items = shuffle(kinds.flatMap(([e], i) => Array.from({ length: counts[i] }, () => ({ e, i }))));
      let sel = null;
      const pile = h('div', { class: 'gp-pile' });
      side.replaceChildren(pile);
      const put = (t, i) => {
        if (Number(t.dataset.i) !== i) { missed = true; wiggle(t); hinter.miss(cols[Number(t.dataset.i)].col); return; }
        hinter.reset();
        const c = cols[i];
        c.fill++;
        paint(c, i);
        pop(c.cells[c.fill - 1]);
        t.remove();
        if (sel === t) sel = null;
        sfx.pop();
        if (pile.querySelector('.gp-item')) return;
        if (!missed) firstTry++;
        total++;
        ctx.later(ask, 600);
      };
      pile.replaceChildren(...items.map((it) => {
        const t = h('button', { class: 'gp-item', type: 'button', 'aria-label': kinds[it.i][1], style: { left: `${randInt(4, 78)}%`, top: `${randInt(4, 80)}%` } }, it.e);
        t.dataset.i = it.i;
        draggable(t, {
          onDrop: (pt) => {
            const i = cols.findIndex((c) => hits(c.col, pt, 8));
            if (i >= 0) put(t, i); else wiggle(t);
          },
        });
        t.addEventListener('click', () => { sfx.tap(); sel?.classList.remove('sel'); sel = sel === t ? null : t; sel?.classList.add('sel'); });
        return t;
      }));
      cols.forEach((c, i) => c.col.addEventListener('click', () => { if (sel) put(sel, i); }));
      ctx.prompt('물건을 끌어서 같은 그림이 있는 줄에 쌓아 그래프를 만들어요!', () => speak('같은 것끼리 그래프에 쌓아요!'));
    }

    // 그래프를 보고 답하기: 개수 둘(숫자판) → (모두 몇 개) → 더 많은 · 적은 것 고르기
    function ask() {
      hinter.reset();
      const pickI = pickN(kinds.map((_, i) => i), 2);
      const steps = [
        ...pickI.map((i) => ({ q: kinds[i][2], answer: counts[i] })),
        ...(cfg.total ? [{ q: '모두 몇 개인가요?', answer: counts.reduce((x, y) => x + y, 0) }] : []),
      ];
      const big = cfg.kinds === 2;
      const most = Math.random() < 0.5;
      const pickBy = most ? Math.max(...counts) : Math.min(...counts);
      const final = { q: big ? (most ? theme.more : theme.less) : (most ? theme.most : theme.least), answer: kinds[counts.indexOf(pickBy)][1] };
      const rows = steps.map((s) => {
        const box = h('div', { class: 'gp-box' }, '?');
        const row = h('div', { class: 'gp-qrow' }, h('p', { class: 'gp-ask' }, h('button', { class: 'gp-ear', type: 'button', 'aria-label': '다시 듣기', onclick: () => speak(s.q) }, '🔊'), s.q), box);
        return { ...s, row, box };
      });
      side.classList.add('ask');
      side.replaceChildren(...rows.map((r) => r.row));
      let k = 0;
      const next = () => {
        if (k >= rows.length) { choose(); return; }
        const r = rows[k];
        r.row.classList.add('cur');
        speak(r.q);
        const pad = numPad((v, clear) => {
          if (v !== r.answer) { wiggle(r.box); hinter.miss(pad.keyOf(r.answer)); clear(); return; }
          total++;
          if (hinter.count === 0) firstTry++;
          hinter.reset();
          sfx.pop();
          r.box.replaceChildren(String(v));
          r.row.classList.remove('cur');
          r.row.classList.add('ok');
          k++;
          ctx.later(next, 500);
        }, { cls: 'gp' });
        r.box.replaceChildren(pad.screen, pad.el);
      };
      const choose = () => {
        side.replaceChildren(h('p', { class: 'gp-ask' }, h('button', { class: 'gp-ear', type: 'button', 'aria-label': '다시 듣기', onclick: () => speak(final.q) }, '🔊'), final.q),
          choiceSet(shuffle(kinds.map((x) => x[1])), {
            answer: final.answer,
            hinter,
            cls: 'choice gp-opt',
            onCorrect: (btn, miss) => {
              total++;
              if (miss === 0) firstTry++;
              cheer(chart);
              ctx.later(() => { b++; if (b >= R) ctx.finish({ firstTry, total }); else round(); }, 1800);
            },
          }));
        speak(final.q);
      };
      next();
    }
  }

  round();
}
