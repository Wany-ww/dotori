import { h } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, SENTENCES } from '../data.js';
import { makePad, toolbar } from './drawKit.js';

const FONT = '"Gowun Dodum", "Jua", sans-serif';
const PER_ROW = 8;
const INK = ['#2B2B2B', '#2E9BEA', '#E8484F', '#5DBB63', '#8B5CF6'];

// 원고지 칸 배경: 칸마다 흐린 본보기 글자와 십자 안내선
function gridBackground(chars, rows, cols) {
  return (g, W, H) => {
    g.fillStyle = '#FFFDF5';
    g.fillRect(0, 0, W, H);
    const cw = W / cols;
    const ch = H / rows;
    chars.forEach((c, i) => {
      const x = (i % cols) * cw;
      const y = Math.floor(i / cols) * ch;
      g.strokeStyle = '#E3B6A4';
      g.lineWidth = Math.max(1, W / 400);
      g.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
      if (c === ' ') return;
      g.setLineDash([W / 160, W / 160]);
      g.strokeStyle = '#F0D8CE';
      g.beginPath();
      g.moveTo(x + cw / 2, y + 6); g.lineTo(x + cw / 2, y + ch - 6);
      g.moveTo(x + 6, y + ch / 2); g.lineTo(x + cw - 6, y + ch / 2);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = 'rgba(160, 160, 170, .35)';
      g.font = `${Math.min(cw, ch) * 0.72}px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(c, x + cw / 2, y + ch / 2 + ch * 0.03);
    });
  };
}

// 낱말 쓰기 연습(WritingPractice · word) · 문장 쓰기 연습(SentenceWritingPractice · sentence):
// 쓰고 싶은 낱말(문장)을 고르면 원고지 칸에 흐린 본보기가 나오고, 그 위에 따라 쓴다 (채점 없음)
export function mount(stage, fx) {
  const sentence = fx.opts.mode === 'sentence';
  const root = h('div', { class: 'free-writing' });
  stage.append(root);
  let pad = null;
  let text = '';
  fx.onCleanup(() => pad?.destroy());

  function choose() {
    pad?.destroy();
    pad = null;
    const items = sentence
      ? [2, 3, 4].flatMap((k) => SENTENCES[k]).map((s) => ({ t: `${s.words.join(' ')}.`, e: s.e }))
      : [...WORDS, ...WORDS2].map((w) => ({ t: w.word, e: w.emoji }));
    root.replaceChildren(h('p', { class: 'fr-ask' }, sentence ? '어떤 문장을 써 볼까요?' : '어떤 낱말을 써 볼까요?'), h('div', { class: `wr-pick${sentence ? ' long' : ''}` }, items.map((it) => {
      const b = h('button', { class: 'wr-item', type: 'button' }, h('span', { 'aria-hidden': 'true' }, it.e), h('b', {}, it.t));
      b.addEventListener('click', () => { sfx.tap(); speak(it.t.replace(/\.$/, '')); start(it); });
      return b;
    })));
    fx.prompt(sentence ? '써 보고 싶은 문장을 골라요!' : '써 보고 싶은 낱말을 골라요!', sentence ? '어떤 문장을 써 볼까요?' : '어떤 낱말을 써 볼까요?');
  }

  function start(it) {
    text = it.t;
    const chars = [...text];
    const cols = sentence ? Math.min(PER_ROW, chars.length) : chars.length;
    const rows = Math.ceil(chars.length / cols);
    pad = makePad({ ratio: rows / cols, label: '쓰기 칸', background: gridBackground(chars, rows, cols) });
    pad.setSize(sentence ? 0.012 : 0.018);
    const again = h('button', { class: 'btn btn-ghost', type: 'button' }, sentence ? '📝 다른 문장' : '📝 다른 낱말');
    again.addEventListener('click', () => { if (pad.empty || confirm('다른 것으로 바꿀까요? 지금 쓴 것은 사라져요.')) choose(); });
    root.replaceChildren(h('div', { class: 'wr-head' }, h('span', { 'aria-hidden': 'true' }, it.e), h('b', {}, text), again), h('div', { class: `wr-sheet${sentence ? ' long' : ''}` }, pad.el), toolbar(pad, { colors: INK, sizes: true }));
    pad.setColor(INK[0]);
    // 글꼴이 늦게 오면 본보기 글자를 다시 그린다
    document.fonts?.ready.then(() => pad?.refit());
    fx.prompt('흐린 글자 위에 또박또박 따라 써요. 다 쓰면 앨범에 저장해요!', () => speak(text.replace(/\.$/, '')));
  }

  fx.onSave(async () => {
    if (!pad || pad.empty) return null;
    return { title: text, image: await pad.toBlob(), replay: { strokes: pad.strokes, ratio: pad.ratio, bg: await pad.layerBlob('bg') } };
  });
  choose();
}
