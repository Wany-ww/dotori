import { h } from '../ui.js';
import { sfx } from '../audio.js';

export const PAD_KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0, 'ok'];

// 답 넣기 판: 7 8 9 / 4 5 6 / 1 2 3 / ← 0 ✓. screen은 답 칸(?), onOk(값, 지우기)로 확인한다
export function numPad(onOk, { max = 2, cls = 'sd' } = {}) {
  let entry = '';
  const screen = h('b', { class: `${cls}-q` }, '?');
  const clear = () => { entry = ''; screen.textContent = '?'; };
  const keys = PAD_KEYS.map((k) => {
    const b = h('button', { class: `${cls}-key${k === 'ok' ? ' ok' : ''}`, type: 'button', 'aria-label': k === 'ok' ? '확인' : k === 'x' ? '지우기' : String(k) }, k === 'ok' ? '✓' : k === 'x' ? '←' : String(k));
    b.addEventListener('click', () => {
      sfx.tap();
      if (k === 'x') entry = entry.slice(0, -1);
      else if (k === 'ok') { if (entry) onOk(Number(entry), clear); return; }
      else if (entry.length < max) entry += k;
      screen.textContent = entry || '?';
    });
    return b;
  });
  // 정답 숫자의 첫 자리 단추 (힌트로 반짝일 때)
  const keyOf = (v) => keys[PAD_KEYS.indexOf(Number(String(v)[0]))];
  return { screen, el: h('div', { class: `${cls}-pad` }, keys), keys, keyOf, clear };
}
