import { shuffle } from '../ui.js';

// 나뭇결 책상 위 카드 놀이(낱말 카드 · 같은 글자 짝 찾기)가 함께 쓰는 배치와 연출

// 놓을 자리: 가로로 긴 책상은 4×3, 세로로 긴 책상(휴대폰)은 3×4 칸에 조금씩 흔들어 흩뿌린다 (0~1 비율 좌표)
function spots(tall) {
  const [cols, rows] = tall ? [3, 4] : [4, 3];
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const j = () => (Math.random() - 0.5) * 0.08;
      out.push({ u: Math.min(1, Math.max(0, c / (cols - 1) + j())), v: Math.min(1, Math.max(0, r / (rows - 1) + j())) });
    }
  }
  return shuffle(out);
}

// 앞쪽 카드는 빈자리에, 뒤쪽 piles장은 이미 놓인 카드 위에 비스듬히 겹쳐 놓는다.
// 겹쳐도 모든 카드의 가운데(그림·글자)는 보이도록 여러 번 놓아 보고 가장 덜 가린 배치를 고른다.
export function scatter(table, n, piles) {
  const W = table.clientWidth;
  const H = table.clientHeight;
  const cw = parseFloat(getComputedStyle(table).getPropertyValue('--cw')) || 100;
  const ch = cw * 1.25;
  const base = n - piles;
  let best = null;
  for (let t = 0; t < 40 && best?.bad !== 0; t++) {
    const free = spots(H > W);
    const unders = shuffle([...Array(base).keys()]).slice(0, piles);
    const place = [...Array(n)].map((_, i) => {
      if (i < base) return { ...free[i], ox: 0, oy: 0, z: 1 };
      const s = free[unders[i - base]];
      const sx = s.u > 0.5 ? -1 : 1;
      const sy = s.v > 0.5 ? -1 : 1;
      return { u: s.u, v: s.v, ox: sx * (0.58 + Math.random() * 0.12), oy: sy * (0.25 + Math.random() * 0.2), z: 2 };
    });
    const rect = place.map((p) => {
      const x = p.u * (W - cw) + p.ox * cw;
      const y = p.v * (H - ch) + p.oy * ch;
      return { x, y, cx: x + cw / 2, cy: y + ch / 2 };
    });
    // 위에 놓인 카드(더 높은 z, 같으면 나중 카드)가 가운데 점 둘레를 덮으면 가린 것으로 센다
    let bad = 0;
    rect.forEach((a, i) => {
      const m = cw * 0.06;
      rect.forEach((o, j) => {
        if (j === i || place[j].z < place[i].z || (place[j].z === place[i].z && j < i)) return;
        if (a.cx + m > o.x && a.cx - m < o.x + cw && a.cy + m > o.y && a.cy - m < o.y + ch) bad++;
      });
    });
    if (!best || bad < best.bad) best = { place, bad };
  }
  return best.place;
}

// .tcard에 넣을 위치 변수
export const placeStyle = (p) => ({
  '--u': p.u.toFixed(3), '--v': p.v.toFixed(3), '--ox': p.ox, '--oy': p.oy, '--z': p.z,
  '--rot': `${(Math.random() * 16 - 8).toFixed(1)}deg`,
});

// 맞힌 카드: 반짝인 뒤 책상 위쪽 가운데로 날아가 사라진다
export function flyAway(table, els, later) {
  els.forEach((x) => {
    x.disabled = true;
    x.style.setProperty('--fx', `${table.clientWidth / 2 - x.offsetLeft - x.offsetWidth / 2}px`);
    x.style.setProperty('--fy', `${-x.offsetTop - x.offsetHeight * 0.6}px`);
    x.classList.add('hit');
    later(() => x.classList.add('fly'), 450);
  });
}
