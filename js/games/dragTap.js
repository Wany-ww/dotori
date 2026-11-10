// 끌어서 놓기 공용 도우미: 8px 넘게 움직이면 끌기로, 아니면 보통 click으로 처리한다.
// 위치는 transform이 아니라 translate 속성으로 옮겨서, 요소의 다른 transform(기울기·확대)을 건드리지 않는다.

export const center = (el) => {
  const b = el.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
};

export const hits = (el, p, pad = 16) => {
  const b = el.getBoundingClientRect();
  return p.x > b.left - pad && p.x < b.right + pad && p.y > b.top - pad && p.y < b.bottom + pad;
};

export function draggable(el, { can = () => true, onMove, onDrop }) {
  let d = null;
  // 누르는 순간 포인터를 붙잡아야 빠르게 끌어도 따라온다.
  // 안쪽 단추가 click을 받아야 하면 can(e)에서 false를 돌려 붙잡지 않게 한다
  el.addEventListener('pointerdown', (e) => {
    if (!can(e)) return;
    try { el.setPointerCapture(e.pointerId); } catch {}
    d = { sx: e.clientX, sy: e.clientY, moved: false };
  });
  el.addEventListener('pointermove', (e) => {
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    if (!d.moved) {
      d.moved = true;
      el.classList.add('dragging');
    }
    el.style.translate = `${dx}px ${dy}px`;
    onMove?.(center(el));
  });
  const up = () => {
    if (!d) return;
    const moved = d.moved;
    d = null;
    if (!moved) return;
    el.dataset.dragged = '1';
    const p = center(el);
    el.classList.remove('dragging');
    el.style.translate = '';
    onDrop?.(p);
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  // 끌기가 끝난 직후의 click은 게임 쪽 click 처리로 넘기지 않는다
  el.addEventListener('click', (e) => {
    if (!el.dataset.dragged) return;
    delete el.dataset.dragged;
    e.stopImmediatePropagation();
  }, true);
}
