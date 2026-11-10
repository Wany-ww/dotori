import { h } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { hasBatchim } from '../data.js';
import { makePad, toolbar } from './drawKit.js';

const FONT = '"Jua", "Gowun Dodum", sans-serif';
export const CARDS = [
  { id: 'birthday', name: '생일 축하해요', e: '🎂', bg: ['#FFE3EC', '#FFC2D4'], deco: ['🎈', '🎁', '🎉'] },
  { id: 'thanks', name: '고마워요', e: '💐', bg: ['#E8F7E3', '#C8EDBE'], deco: ['🌷', '🌼', '🍀'] },
  { id: 'love', name: '사랑해요', e: '💖', bg: ['#FFE9E3', '#FFD0C2'], deco: ['❤️', '💕', '🌹'] },
  { id: 'cheer', name: '힘내요', e: '💪', bg: ['#E3F1FF', '#C2DEFF'], deco: ['⭐', '🌈', '☀️'] },
  { id: 'sorry', name: '미안해요', e: '🤗', bg: ['#F3E8FF', '#E0CCFF'], deco: ['🫶', '🌙', '🍬'] },
];
const TO = ['엄마', '아빠', '할머니', '할아버지', '언니', '오빠', '누나', '형', '동생', '친구', '선생님'];
const STAMPS = ['❤️', '⭐', '🌸', '🎈', '🐰', '🍰'];

// 카드 배경: 위에 "○○에게", 아래에 "△△가", 귀퉁이 장식
const cardBg = (card, to, from) => (g, W, H) => {
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, card.bg[0]);
  grd.addColorStop(1, card.bg[1]);
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.75)';
  g.fillRect(W * 0.06, H * 0.2, W * 0.88, H * 0.62);
  g.fillStyle = '#5A3A2A';
  g.textBaseline = 'middle';
  g.font = `${H * 0.09}px ${FONT}`;
  g.textAlign = 'left';
  g.fillText(`${to}에게`, W * 0.07, H * 0.11);
  g.textAlign = 'right';
  g.font = `${H * 0.07}px ${FONT}`;
  g.fillText(`${from}${hasBatchim(from) ? '이가' : '가'}`, W * 0.93, H * 0.9);
  g.textAlign = 'center';
  g.font = `${H * 0.1}px serif`;
  [[0.88, 0.1], [0.08, 0.9], [0.5, 0.9]].forEach(([x, y], i) => g.fillText(card.deco[i % card.deco.length], W * x, H * y));
  g.fillText(card.e, W * 0.75, H * 0.11);
  // 편지 줄
  g.strokeStyle = 'rgba(150, 120, 100, .25)';
  g.lineWidth = Math.max(1, W / 500);
  for (let k = 1; k <= 4; k++) { const y = H * (0.2 + (0.62 * k) / 5); g.beginPath(); g.moveTo(W * 0.1, y); g.lineTo(W * 0.9, y); g.stroke(); }
};

// 카드 쓰기(WritingCards): 카드 모양과 받는 사람을 고르고, 카드에 손글씨와 스탬프로 마음을 적는다.
// 보내는 기능은 없고 앨범에만 저장한다
export function mount(stage, fx) {
  const root = h('div', { class: 'free-card' });
  stage.append(root);
  const from = fx.profile.name;
  let pad = null;
  let card = null;
  let to = '';
  fx.onCleanup(() => pad?.destroy());

  function chooseCard() {
    pad?.destroy();
    pad = null;
    root.replaceChildren(h('p', { class: 'fr-ask' }, '어떤 카드를 쓸까요?'), h('div', { class: 'cd-pick' }, CARDS.map((c) => {
      const b = h('button', { class: 'cd-thumb', type: 'button', style: { background: `linear-gradient(${c.bg[0]}, ${c.bg[1]})` } }, h('span', { 'aria-hidden': 'true' }, c.e), h('b', {}, c.name));
      b.addEventListener('click', () => { sfx.tap(); speak(c.name); card = c; chooseTo(); });
      return b;
    })));
    fx.prompt('어떤 마음을 전하는 카드를 쓸까요?', '어떤 카드를 쓸까요?');
  }

  function chooseTo() {
    root.replaceChildren(h('p', { class: 'fr-ask' }, `${card.e} 누구에게 쓸까요?`), h('div', { class: 'cd-to' }, TO.map((t) => {
      const b = h('button', { class: 'cd-chip', type: 'button' }, t);
      b.addEventListener('click', () => { sfx.tap(); speak(`${t}에게`); to = t; write(); });
      return b;
    })));
    fx.prompt('카드를 받을 사람을 골라요!', '누구에게 쓸까요?');
  }

  function write() {
    pad = makePad({ ratio: 0.68, label: '카드', background: cardBg(card, to, from) });
    pad.setSize(0.012);
    const again = h('button', { class: 'btn btn-ghost', type: 'button' }, '💌 다른 카드');
    again.addEventListener('click', () => { if (pad.empty || confirm('다른 카드로 바꿀까요? 지금 쓴 것은 사라져요.')) chooseCard(); });
    root.replaceChildren(h('div', { class: 'cd-board' }, pad.el), toolbar(pad, { stamps: STAMPS }), h('p', { class: 'cd-note' }, '카드는 앨범에만 저장돼요. 보여 주고 싶으면 앨범에서 함께 봐요!'), again);
    document.fonts?.ready.then(() => pad?.refit());
    fx.prompt(`${to}에게 하고 싶은 말을 카드에 써요. 그림과 스탬프로 꾸며도 좋아요!`, `${to}에게 하고 싶은 말을 써요!`);
  }

  fx.onSave(async () => {
    if (!pad || pad.empty) return null;
    return { title: `${to}에게 · ${card.name}`, image: await pad.toBlob(), replay: { strokes: pad.strokes, ratio: pad.ratio, bg: await pad.layerBlob('bg') } };
  });
  chooseCard();
}
