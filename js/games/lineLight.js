import { h, shuffle, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 5;
const COLORS = ['#8BE04A', '#E85BD8', '#4FD3F0', '#3A7DF0', '#2EC4A0', '#F2C230', '#F0883A'];
// 단계별: 수직선 끝 수, 만들 수(b) 범위, 10 만들기인지
const CFG = [
  { end: 6, b: [3, 5] },
  { end: 13, b: [10, 10] },
  { end: 13, b: [5, 10] },
  { end: 20, b: [11, 20] },
  { end: 20, b: [12, 20], close: true },
];

// 수직선 불 켜기(NumberLine · 수직선 밝히기): "7 + ? = 10"을 보고 블록 줄을 골라 수직선의 7 뒤에 이어 붙인 뒤
// ✓를 눌러 10에 닿으면 블록과 식에 불이 켜진다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const eq = h('div', { class: 'll-eq', 'aria-live': 'polite' });
  const ok = h('button', { class: 'll-ok', type: 'button', 'aria-label': '확인' }, '✓');
  const rail = h('div', { class: 'll-rail' });
  const line = h('div', { class: 'll-line' });
  const tray = h('div', { class: 'll-tray' });
  const track = h('div', { class: 'll-track' }, rail, line, tray);
  stage.append(h('div', { class: 'line-light' }, h('div', { class: 'll-top' }, eq, ok), track));
  // 눈금: 0 ~ end
  line.append(...Array.from({ length: cfg.end + 1 }, (_, v) => h('span', { class: 'll-tick', style: { left: `calc(${v} * var(--u))` } }, h('b', {}, String(v)))));
  const marker = h('i', { class: 'll-marker', 'aria-hidden': 'true' }, '▲');
  line.append(marker);
  // 블록 한 칸 = 수직선 한 칸 (화면 크기에 맞춰 px로)
  const ro = new ResizeObserver(() => track.style.setProperty('--u', `${line.clientWidth / cfg.end}px`));
  ro.observe(line);
  ctx.onCleanup(() => ro.disconnect());
  let n = 0;
  let firstTry = 0;
  const used = [];

  const train = (k, color) => h('span', { class: 'll-train', style: { '--c': color, width: `calc(${k} * var(--u))` } }, Array.from({ length: k }, () => h('i')));

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let a; let b;
    do { b = randInt(...cfg.b); a = randInt(1, b - 1); } while (used.includes(`${a}+${b}`));
    used.push(`${a}+${b}`);
    const ans = b - a;
    let missed = false;
    let locked = false;
    let attached = null;
    const paintEq = (v) => eq.replaceChildren(h('b', {}, String(a)), '+', h('b', { class: v ? 'got' : 'q' }, v ? String(v) : '?'), '=', h('b', {}, String(b)));
    paintEq();
    eq.classList.remove('lit');
    ok.classList.remove('lit');
    marker.style.left = `calc(${b} * var(--u))`;
    const base = train(a, COLORS[0]);
    base.classList.add('base');
    rail.replaceChildren(base);
    // 고를 블록 줄: 정답, 가까운 수, 앞 수, 다른 수
    const lens = new Set([ans]);
    [cfg.close ? ans + 1 : ans + 2, ans - 1, a, ans + 3, randInt(1, cfg.end - a)].forEach((v) => { if (lens.size < 4 && v >= 1 && v <= cfg.end - a + 3) lens.add(v); });
    const pieces = shuffle([...lens]).sort((x, y) => x - y).map((k, i) => {
      const t = train(k, COLORS[(i + 1) % COLORS.length]);
      const btn = h('button', { class: 'll-pick', type: 'button', 'aria-label': `블록 ${k}개` }, t);
      btn.dataset.k = k;
      btn.addEventListener('click', () => {
        if (locked) return;
        sfx.pop();
        if (attached === btn) { tray.append(btn); sortTray(); attached = null; paintEq(); return; }
        if (attached) { tray.append(attached); }
        attached = btn;
        rail.append(btn);
        sortTray();
        pop(btn);
        speak(String(a + k));
      });
      return btn;
    });
    const sortTray = () => pieces.filter((p) => p.parentElement === tray).forEach((p) => tray.append(p));
    tray.replaceChildren(...pieces);

    ok.onclick = () => {
      if (locked) return;
      if (!attached) { wiggle(ok); hinter.miss(tray.firstElementChild); return; }
      const k = Number(attached.dataset.k);
      if (k !== ans) {
        missed = true;
        locked = true;
        attached.classList.add('bad');
        wiggle(attached);
        speak(k > ans ? '너무 길어요!' : '조금 모자라요!');
        hinter.miss(pieces.find((p) => Number(p.dataset.k) === ans));
        ctx.later(() => { attached.classList.remove('bad'); tray.append(attached); sortTray(); attached = null; locked = false; }, 800);
        return;
      }
      locked = true;
      if (!missed) firstTry++;
      hinter.reset();
      paintEq(ans);
      eq.classList.add('lit');
      ok.classList.add('lit');
      rail.classList.add('lit');
      sfx.correct();
      cheer(eq);
      burst(rail, ['✨', '💡', '⭐']);
      speak([String(a), '더하기', String(ans), '는', String(b)]);
      ctx.later(() => { rail.classList.remove('lit'); n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
    };
    ctx.prompt(`${a}에 블록 몇 개를 이어야 ${b}에 닿을까요? 블록 줄을 눌러 붙이고 ✓를 눌러요.`, () => speak([String(a), '더하기 몇은', String(b)]));
  }

  round();
}
