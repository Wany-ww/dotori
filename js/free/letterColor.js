import { h } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { JAMO_NAME } from '../data.js';
import { makePad, toolbar } from './drawKit.js';

const FONT = '"Jua", "Gowun Dodum", sans-serif';
const GROUPS = [
  ['자음', ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']],
  ['모음', ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ']],
  ['글자', ['가', '나', '다', '라', '마', '바', '사', '아', '자', '하', '엄', '빠', '꽃', '별']],
  ['알파벳', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')],
  ['숫자', '0123456789'.split('')],
];
const STAMPS = ['⭐', '❤️', '🌸', '🍀', '🦋', '🍓'];

const drawLetter = (ch, how) => (g, W, H) => {
  g.font = `${H * 0.86}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (how === 'mask') { g.fillStyle = '#000'; g.fillText(ch, W / 2, H * 0.54); return; }
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, W, H);
  g.lineWidth = Math.max(3, W / 120);
  g.strokeStyle = '#2B2B2B';
  g.lineJoin = 'round';
  g.strokeText(ch, W / 2, H * 0.54);
};

// 글자 색칠하기(ColoringLetters): 글자를 고르면 커다란 글자 테두리가 나오고, 글자 안에만 색이 칠해진다
export function mount(stage, fx) {
  const root = h('div', { class: 'free-letter' });
  stage.append(root);
  let pad = null;
  let ch = '';
  fx.onCleanup(() => pad?.destroy());

  function choose() {
    pad?.destroy();
    pad = null;
    root.replaceChildren(h('p', { class: 'fr-ask' }, '어떤 글자를 색칠할까요?'), ...GROUPS.map(([name, list]) => h('div', { class: 'lc-group' }, h('b', {}, name), h('div', { class: 'lc-list' }, list.map((c) => {
      const b = h('button', { class: 'lc-item', type: 'button' }, c);
      b.addEventListener('click', () => { sfx.tap(); speak(JAMO_NAME[c] || c); start(c); });
      return b;
    })))));
    fx.prompt('색칠하고 싶은 글자를 골라요!', '어떤 글자를 색칠할까요?');
  }

  function start(c) {
    ch = c;
    pad = makePad({ ratio: 1, label: `${c} 색칠판`, background: drawLetter(c, 'bg'), mask: drawLetter(c, 'mask') });
    pad.setSize(0.06);
    const again = h('button', { class: 'btn btn-ghost', type: 'button' }, '🔤 다른 글자');
    again.addEventListener('click', () => { if (pad.empty || confirm('다른 글자로 바꿀까요? 지금 칠한 것은 사라져요.')) choose(); });
    root.replaceChildren(h('div', { class: 'lc-board' }, pad.el), toolbar(pad, { stamps: STAMPS }), again);
    document.fonts?.ready.then(() => pad?.refit());
    fx.prompt(`'${c}' 글자 안을 예쁘게 칠해요. 글자 밖으로는 칠해지지 않아요!`, () => speak(JAMO_NAME[c] || c));
  }

  fx.onSave(async () => {
    if (!pad || pad.empty) return null;
    return { title: `'${ch}' 색칠`, image: await pad.toBlob(), replay: { strokes: pad.strokes, ratio: 1, bg: await pad.layerBlob('bg'), mask: await pad.layerBlob('mask') } };
  });
  choose();
}
