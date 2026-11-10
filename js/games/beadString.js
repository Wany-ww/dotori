import { h, shuffle, pick, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 2;
const SHAPES = ['heart', 'star', 'tri', 'round', 'square'];
const COLORS = ['#3D7BEA', '#2EC4D8', '#8E4FD8'];
// 단계별 단: 판마다 하나 (1단 → 2단 …)
const DAN = [[1, 2], [2, 3], [5, 10], [3, 4], [6, 7, 8, 9]];
const GAP = 34; // 실 위 구슬 사이 (px)

// 곱셈 구슬(BeadsPlay · 구슬 꿰기): 실 끝을 끌어 1×1, 1×2, 1×3 … 차례로 구슬을 꿴다.
// 꿴 구슬에는 곱(1, 2, 3 …)이 보인다. 구슬을 차례로 눌러도 꿸 수 있다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const title = h('b', { class: 'bs-title' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'bs-string');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  svg.append(path);
  const head = h('span', { class: 'bs-head', 'aria-hidden': 'true' });
  const board = h('div', { class: 'bs-board' }, svg, title, head);
  stage.append(h('div', { class: 'bead-string' }, board));
  const dans = shuffle(DAN[L - 1]).slice(0, R).sort((a, b) => a - b);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const dan = dans[n];
    title.textContent = `${dan} ×`;
    const W = board.clientWidth || 760;
    const H = board.clientHeight || 400;
    let trail = [[40, H / 2]];
    let next = 1;
    let missed = false;
    let done = false;
    const strung = [];
    board.querySelectorAll('.bs-bead').forEach((b) => b.remove());
    // 구슬 자리: 5 × 2 칸에 흩어 놓고 조금씩 흔든다
    const cells = shuffle(Array.from({ length: 10 }, (_, i) => i));
    const beads = Array.from({ length: 10 }, (_, i) => {
      const k = i + 1;
      const cell = cells[i];
      const x = 150 + (cell % 5) * ((W - 220) / 4) + (Math.random() * 40 - 20);
      const y = 80 + Math.floor(cell / 5) * ((H - 160) / 1) + (Math.random() * 50 - 25);
      const b = h('button', { class: `bs-bead ${pick(SHAPES)}`, type: 'button', style: { left: `${x}px`, top: `${y}px`, '--c': pick(COLORS) }, 'aria-label': `${dan} 곱하기 ${k}` }, h('span', {}, `${dan}×${k}`));
      b.dataset.k = k;
      b.addEventListener('click', () => touch(b, true));
      return b;
    });
    board.append(...beads);
    const paint = () => {
      path.setAttribute('points', trail.map((p) => p.join(',')).join(' '));
      const [hx, hy] = trail[trail.length - 1];
      head.style.left = `${hx}px`;
      head.style.top = `${hy}px`;
      // 꿴 구슬은 실을 따라 줄줄이 (먼저 꿴 것이 실 끝에서 가장 멀리)
      strung.forEach((b, j) => {
        const p = pointBack((strung.length - j) * GAP);
        b.style.left = `${p[0]}px`;
        b.style.top = `${p[1]}px`;
      });
    };
    // 실 끝에서 거리 d만큼 뒤의 점
    function pointBack(d) {
      let left = d;
      for (let i = trail.length - 1; i > 0; i--) {
        const [x1, y1] = trail[i];
        const [x0, y0] = trail[i - 1];
        const seg = Math.hypot(x1 - x0, y1 - y0);
        if (seg >= left) return [x1 + ((x0 - x1) * left) / seg, y1 + ((y0 - y1) * left) / seg];
        left -= seg;
      }
      return trail[0];
    }

    function touch(b, tapped) {
      if (done || b.classList.contains('on')) return;
      const k = Number(b.dataset.k);
      if (k !== next) {
        if (!tapped) { if (!b.classList.contains('wiggle')) wiggle(b); return; }
        missed = true;
        wiggle(b);
        hinter.miss(beads[next - 1]);
        speak([String(dan), '곱하기', String(next)]);
        return;
      }
      hinter.reset();
      if (tapped) {
        // 눌러서 꿸 때는 실 끝이 그 구슬로 간다
        const r = b.getBoundingClientRect();
        const o = board.getBoundingClientRect();
        trail.push([r.left - o.left + r.width / 2, r.top - o.top + r.height / 2]);
      }
      b.classList.add('on');
      b.querySelector('span').textContent = String(dan * k);
      strung.push(b);
      next++;
      sfx.pop();
      pop(b);
      speak(String(dan * k));
      paint();
      if (next > 10) finish();
    }

    function finish() {
      done = true;
      if (!missed) firstTry++;
      // 다 꿰면 실을 반듯하게 펴서 목걸이처럼
      trail = [[60, H / 2], [W - 60, H / 2]];
      strung.forEach((b, j) => { b.style.left = `${W / 2 + (j - 4.5) * (GAP + 6)}px`; b.style.top = `${H / 2}px`; });
      path.setAttribute('points', trail.map((p) => p.join(',')).join(' '));
      head.style.left = `${W - 60}px`;
      sfx.correct();
      cheer(board);
      burst(board, ['⭐', '✨']);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2600);
    }

    // 끌기: 판 어디를 눌러도 실 끝이 손가락을 따라간다
    let drag = false;
    board.onpointerdown = (e) => {
      if (done || e.target.closest('.bs-bead')) return;
      drag = true;
      try { board.setPointerCapture(e.pointerId); } catch {}
    };
    board.onpointermove = (e) => {
      if (!drag) return;
      const o = board.getBoundingClientRect();
      const p = [e.clientX - o.left, e.clientY - o.top];
      const last = trail[trail.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 6) return;
      trail.push(p);
      if (trail.length > 400) trail = trail.slice(-400);
      const hit = beads.find((b) => !b.classList.contains('on') && Math.hypot(p[0] - parseFloat(b.style.left), p[1] - parseFloat(b.style.top)) < 28);
      if (hit) touch(hit, false);
      paint();
    };
    board.onpointerup = board.onpointercancel = () => { drag = false; };
    paint();
    ctx.prompt(`${dan}단 구슬을 차례로 꿰어요! 실 끝을 끌어서 ${dan}×1, ${dan}×2 … 차례로 지나가거나 구슬을 차례로 눌러요.`, () => speak([`${dan}단!`, '차례로 꿰어요!']));
  }

  round();
}
