import { h } from '../ui.js';
import { makePad, toolbar } from './drawKit.js';

const STAMPS = ['⭐', '❤️', '🌸', '🐰', '🐶', '🌈', '☀️', '🎈'];

// 자유 그리기(Painting): 빈 도화지에 붓 · 색 · 스탬프로 마음대로 그린다
export function mount(stage, fx) {
  const pad = makePad({ ratio: 0.68, label: '도화지', background: (g, W, H) => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); } });
  stage.append(h('div', { class: 'free-paint' }, pad.el, toolbar(pad, { stamps: STAMPS })));
  fx.onCleanup(() => pad.destroy());
  fx.prompt('도화지에 마음대로 그려요. 다 그리면 앨범에 저장해요!', '마음대로 그려 보세요!');
  fx.onSave(async () => {
    if (pad.empty) return null;
    return { title: '내 그림', image: await pad.toBlob(), replay: { strokes: pad.strokes, ratio: pad.ratio, bg: await pad.layerBlob('bg') } };
  });
}
