import { h, pop } from '../ui.js';
import { sfx } from '../audio.js';
import { PALETTE } from './drawKit.js';

const NS = 'http://www.w3.org/2000/svg';
// 밑그림: 칠할 수 있는 영역들(path d · 처음 색). viewBox 0 0 200 150
export const COLOR_PICS = [
  { id: 'house', name: '우리 집', e: '🏠', parts: [
    'M0 120H200V150H0Z', 'M40 70H140V125H40Z', 'M30 72L90 30L150 72Z', 'M78 95H102V125H78Z', 'M50 82H70V100H50Z', 'M110 82H130V100H110Z', 'M168 30a16 16 0 1 0 0.1 0Z', 'M150 128a8 6 0 1 0 0.1 0Z'] },
  { id: 'fish', name: '물고기', e: '🐟', parts: [
    'M0 0H200V150H0Z', 'M50 75C70 40 130 40 150 75C130 110 70 110 50 75Z', 'M150 75L185 50V100Z', 'M80 52L100 35L112 50Z', 'M70 70a7 7 0 1 0 0.1 0Z', 'M30 40a6 6 0 1 0 0.1 0Z', 'M22 22a4 4 0 1 0 0.1 0Z', 'M0 130Q50 115 100 130T200 130V150H0Z'] },
  { id: 'flower', name: '꽃', e: '🌸', parts: [
    'M96 85H104V145H96Z', 'M100 85C80 105 60 110 55 100C65 90 85 88 100 95Z', 'M100 50a14 14 0 1 0 0.1 0Z', 'M100 22a14 14 0 1 0 0.1 0Z', 'M126 40a14 14 0 1 0 0.1 0Z', 'M118 70a14 14 0 1 0 0.1 0Z', 'M82 70a14 14 0 1 0 0.1 0Z', 'M74 40a14 14 0 1 0 0.1 0Z', 'M0 140H200V150H0Z'] },
  { id: 'rocket', name: '로켓', e: '🚀', parts: [
    'M0 0H200V150H0Z', 'M80 40H120V115H80Z', 'M80 40Q100 0 120 40Z', 'M80 90L60 120H80Z', 'M120 90L140 120H120Z', 'M100 60a10 10 0 1 0 0.1 0Z', 'M86 118H114L100 145Z', 'M30 30L33 38L42 38L35 43L38 52L30 47L22 52L25 43L18 38L27 38Z', 'M165 60L168 68L177 68L170 73L173 82L165 77L157 82L160 73L153 68L162 68Z'] },
  { id: 'cat', name: '고양이', e: '🐱', parts: [
    'M70 95C70 70 130 70 130 95V140H70Z', 'M100 30a30 28 0 1 0 0.1 0Z', 'M74 42L76 10L96 30Z', 'M126 42L124 10L104 30Z', 'M130 125C160 120 165 95 150 90C155 105 145 115 130 112Z', 'M88 52a5 5 0 1 0 0.1 0Z', 'M112 52a5 5 0 1 0 0.1 0Z', 'M96 66L104 66L100 72Z'] },
  { id: 'car', name: '자동차', e: '🚗', parts: [
    'M0 120H200V150H0Z', 'M25 80H175V115H25Z', 'M55 50H140L160 80H40Z', 'M62 56H95V78H50Z', 'M102 56H136L150 78H102Z', 'M60 105a16 16 0 1 0 0.1 0Z', 'M140 105a16 16 0 1 0 0.1 0Z', 'M165 88H178V98H165Z'] },
];

// 밑그림 그리기 (fills: 영역 번호 → 색)
export function picSvg(pic, fills = {}, { onPart } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 150');
  svg.setAttribute('class', 'co-svg');
  pic.parts.forEach((d, i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', fills[i] || '#FFFFFF');
    p.setAttribute('stroke', '#2B2B2B');
    p.setAttribute('stroke-width', '2');
    p.setAttribute('stroke-linejoin', 'round');
    p.dataset.i = i;
    if (onPart) p.addEventListener('click', () => onPart(i, p));
    svg.append(p);
  });
  return svg;
}

// SVG 그림을 PNG로
export function svgToBlob(svg, w = 800) {
  const src = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' }));
  return new Promise((res) => {
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = Math.round(w * 0.75);
      const g = c.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => res(b), 'image/png');
    };
    img.src = url;
  });
}

// 색칠하기(Coloring): 밑그림을 고르고, 색을 골라 칸을 눌러 칠한다
export function mount(stage, fx) {
  const root = h('div', { class: 'free-coloring' });
  stage.append(root);
  let pic = null;
  let fills = {};
  let order = [];
  let color = PALETTE[1];

  function choose() {
    pic = null;
    root.replaceChildren(h('p', { class: 'fr-ask' }, '어떤 그림을 칠할까요?'), h('div', { class: 'co-pick' }, COLOR_PICS.map((p) => {
      const b = h('button', { class: 'co-thumb', type: 'button' }, picSvg(p), h('span', {}, `${p.e} ${p.name}`));
      b.addEventListener('click', () => { sfx.tap(); start(p); });
      return b;
    })));
    fx.prompt('칠하고 싶은 밑그림을 골라요!', '어떤 그림을 칠할까요?');
  }

  function start(p) {
    pic = p;
    fills = {};
    order = [];
    const svg = picSvg(p, fills, {
      onPart: (i, el) => {
        fills[i] = color;
        order.push([i, color]);
        el.setAttribute('fill', color);
        sfx.pop();
        pop(el);
      },
    });
    const sw = PALETTE.map((c, k) => {
      const b = h('button', { class: `dk-color${k === 1 ? ' on' : ''}`, type: 'button', style: { background: c }, 'aria-label': `${k + 1}번 색` });
      b.addEventListener('click', () => { color = c; sw.forEach((x) => x.classList.toggle('on', x === b)); });
      return b;
    });
    const undo = h('button', { class: 'dk-tool', type: 'button', 'aria-label': '한 번 되돌리기' }, '↩');
    undo.addEventListener('click', () => {
      const last = order.pop();
      if (!last) return;
      const prev = [...order].reverse().find(([i]) => i === last[0]);
      fills[last[0]] = prev ? prev[1] : undefined;
      svg.querySelector(`[data-i="${last[0]}"]`).setAttribute('fill', fills[last[0]] || '#FFFFFF');
    });
    const back = h('button', { class: 'btn btn-ghost', type: 'button' }, '🖼️ 다른 그림');
    back.addEventListener('click', () => { if (!order.length || confirm('다른 그림으로 바꿀까요? 지금 칠한 것은 사라져요.')) choose(); });
    root.replaceChildren(h('div', { class: 'co-board' }, svg), h('div', { class: 'dk-tools' }, h('div', { class: 'dk-colors' }, ...sw), h('div', { class: 'dk-sizes' }, undo, back)));
    fx.prompt(`${p.name}! 색을 고르고 칠할 곳을 눌러요.`, '색을 골라 칠해요!');
  }

  fx.onSave(async () => {
    if (!pic || !order.length) return null;
    return { title: `${pic.name} 색칠`, image: await svgToBlob(picSvg(pic, fills)), replay: { kind: 'fills', pic: pic.id, fills: order } };
  });
  choose();
}
