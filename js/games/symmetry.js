import { h, pick, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 3;
const PALETTE = ['#E8574F', '#4A90E2', '#F2C230', '#5DBB63', '#9B6BD6'];
// 단계별: 판 크기(행, 열), 색 수, 칠해진 칸 비율, 동그란 칸인지 (참고 영상: 4 × 6 동그라미 한 색 → 6 × 10 네모 → 두 색)
const CFG = [[[4, 6], 1, 0.25, true], [[6, 10], 1, 0.12, false], [[4, 6], 2, 0.35, true], [[5, 8], 1, 0.45, true], [[6, 8], 3, 0.4, false]];

// 데칼코마니(Decalcomanie): 가운데 접는 선을 기준으로 왼쪽 무늬를 오른쪽에 똑같이 (거울처럼) 칠한다
export function mount(stage, ctx) {
  const [[rows, cols], nColors, fill, round0] = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const palette = h('div', { class: 'sy-palette' });
  const board = h('div', { class: 'sy-board', style: { gridTemplateColumns: `repeat(${cols}, 1fr)` } });
  const go = h('button', { class: 'btn btn-primary', type: 'button' }, '다 칠했어요');
  const reset = h('button', { class: 'btn btn-ghost', type: 'button' }, '↺ 다시');
  board.classList.toggle('round', round0);
  stage.append(h('div', { class: 'symmetry' }, palette, board, h('div', { class: 'sy-btns' }, reset, go)));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const colors = PALETTE.slice(0, nColors);
    let missed = false;
    const half = cols / 2;
    // 왼쪽 무늬 (적어도 한 칸은 칠해 둔다)
    const want = Array.from({ length: rows }, () => Array.from({ length: half }, () => (Math.random() < fill ? pick(colors) : null)));
    want[randInt(0, rows - 1)][randInt(0, half - 1)] ||= colors[0];
    const mine = Array.from({ length: rows }, () => Array.from({ length: half }, () => null));
    // 칸을 누를 때마다 색이 바뀐다 (빈칸 → 1번 색 → 2번 색 … → 빈칸)
    palette.replaceChildren();
    const cells = [];
    board.replaceChildren(...Array.from({ length: rows * cols }, (_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const left = c < half;
      const cell = h(left ? 'span' : 'button', { class: `sy-cell${left ? ' given' : ''}${c === half - 1 ? ' axis' : ''}`, type: left ? undefined : 'button', style: left && want[r][c] ? { background: want[r][c] } : {} });
      if (!left) {
        const mc = cols - 1 - c;
        cell.dataset.r = r;
        cell.dataset.m = mc;
        cell.dataset.want = want[r][mc] || '';
        cell.addEventListener('click', () => {
          const k = colors.indexOf(mine[r][mc]);
          mine[r][mc] = k + 1 < colors.length ? colors[k + 1] : null;
          cell.style.background = mine[r][mc] || '';
          sfx.pop();
        });
        cells.push(cell);
      }
      return cell;
    }));
    reset.onclick = () => { cells.forEach((cell) => { mine[cell.dataset.r][cell.dataset.m] = null; cell.style.background = ''; }); sfx.tap(); };
    go.disabled = false;
    go.onclick = () => {
      const bad = cells.find((cell) => (mine[cell.dataset.r][cell.dataset.m] || null) !== (want[cell.dataset.r][cell.dataset.m] || null));
      if (bad) { missed = true; wiggle(go); hinter.miss(bad); return; }
      if (!missed) firstTry++;
      go.disabled = true;
      hinter.reset();
      sfx.correct();
      board.classList.add('fold');
      pop(board);
      cheer(board);
      speak('똑같이 찍혔어요! 데칼코마니 완성!');
      ctx.later(() => {
        board.classList.remove('fold');
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else round();
      }, 2200);
    };
    ctx.prompt(nColors > 1 ? '가운데 선을 접으면 물감이 찍혀요. 오른쪽 칸을 누를 때마다 색이 바뀌어요. 왼쪽과 거울처럼 똑같이 칠해요!' : '가운데 선을 접으면 물감이 찍혀요. 왼쪽 무늬와 거울처럼 똑같이 오른쪽 칸을 눌러 칠해요!', () => speak('왼쪽과 똑같이 오른쪽을 칠해요!'));
  }

  round();
}
