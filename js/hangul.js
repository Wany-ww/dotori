// 두벌식 한글 자판: 자모 입력을 글자로 조합하는 오토마타와 화면 자판
import { h } from './ui.js';
import { CHO, JUNG, JONG, compose, decompose } from './data.js';

const V_COMB = { ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ' };
const T_COMB = { ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ' };
const split = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, [...k]]));
const V_SPLIT = split(V_COMB);
const T_SPLIT = split(T_COMB);
const isVowel = (k) => JUNG.includes(k);
const isCons = (k) => CHO.includes(k);

// 글자를 눌러야 할 자모 순서로 바꾼다 (예: '읽' → ㅇ ㅣ ㄹ ㄱ)
export function keysFor(text) {
  return [...text].flatMap((ch) => {
    const d = decompose(ch);
    if (!d) return [ch];
    const v = JUNG[d.j];
    const t = JONG[d.t];
    return [CHO[d.c], ...(V_SPLIT[v] || [v]), ...(t ? T_SPLIT[t] || [t] : [])];
  });
}

// 자모 입력 순서를 글자로 조합한다 (예: ㄱ ㅏ ㄴ ㅏ → '가나')
export function composeKeys(keys) {
  let out = '';
  let cur = {};
  const flush = () => {
    if (cur.c && cur.j) out += compose(cur.c, cur.j, cur.t || 0);
    else out += cur.c || cur.j || '';
    cur = {};
  };
  for (const k of keys) {
    if (isCons(k)) {
      if (cur.c && cur.j && !cur.t && JONG.includes(k)) cur.t = k;
      else if (cur.t && T_COMB[cur.t + k]) cur.t = T_COMB[cur.t + k];
      else { flush(); cur = { c: k }; }
    } else if (isVowel(k)) {
      if (cur.t) {
        const [keep, move] = T_SPLIT[cur.t] || [null, cur.t];
        cur.t = keep;
        flush();
        cur = { c: move, j: k };
      } else if (cur.j && V_COMB[cur.j + k]) cur.j = V_COMB[cur.j + k];
      else if (cur.c && !cur.j) cur.j = k;
      else { flush(); cur = { j: k }; }
    } else {
      flush();
      out += k;
    }
  }
  flush();
  return out;
}

const ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['⇧', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
  [',', ' ', '.', '?', '!'],
];
const SHIFT = { ㅂ: 'ㅃ', ㅈ: 'ㅉ', ㄷ: 'ㄸ', ㄱ: 'ㄲ', ㅅ: 'ㅆ', ㅐ: 'ㅒ', ㅔ: 'ㅖ' };
const BASE = Object.fromEntries(Object.entries(SHIFT).map(([b, s]) => [s, b]));
// 실제 키보드(QWERTY 자리)로도 칠 수 있게
const CODE = {
  KeyQ: 'ㅂ', KeyW: 'ㅈ', KeyE: 'ㄷ', KeyR: 'ㄱ', KeyT: 'ㅅ', KeyY: 'ㅛ', KeyU: 'ㅕ', KeyI: 'ㅑ', KeyO: 'ㅐ', KeyP: 'ㅔ',
  KeyA: 'ㅁ', KeyS: 'ㄴ', KeyD: 'ㅇ', KeyF: 'ㄹ', KeyG: 'ㅎ', KeyH: 'ㅗ', KeyJ: 'ㅓ', KeyK: 'ㅏ', KeyL: 'ㅣ',
  KeyZ: 'ㅋ', KeyX: 'ㅌ', KeyC: 'ㅊ', KeyV: 'ㅍ', KeyB: 'ㅠ', KeyN: 'ㅜ', KeyM: 'ㅡ', Space: ' ', Comma: ',', Period: '.',
};

// 화면 자판. onKey(자모)로 알려 주고, keyEl(자모)로 힌트를 줄 버튼을 찾는다 (쌍자음은 Shift 키부터)
export function keyboard(onKey) {
  let shift = false;
  const keys = [];
  const label = (k) => (k === ' ' ? '띄어쓰기' : k === '⇧' ? '⇧' : shift && SHIFT[k] ? SHIFT[k] : k);
  const paint = () => keys.forEach((b) => { b.textContent = label(b.dataset.k); b.classList.toggle('on', b.dataset.k === '⇧' && shift); });
  const press = (k) => {
    if (k === '⇧') { shift = !shift; paint(); return; }
    const out = shift && SHIFT[k] ? SHIFT[k] : k;
    if (shift) { shift = false; paint(); }
    onKey(out);
  };
  const el = h('div', { class: 'kb', role: 'group', 'aria-label': '한글 자판' },
    ROWS.map((row) => h('div', { class: 'kb-row' }, row.map((k) => {
      const b = h('button', {
        class: `kb-key${k === ' ' ? ' space' : ''}${k === '⇧' ? ' shift' : ''}${isVowel(k) ? ' vowel' : ''}`,
        type: 'button', 'data-k': k, 'aria-label': k === ' ' ? '띄어쓰기' : k === '⇧' ? '쌍자음 (Shift)' : k,
      }, label(k));
      b.addEventListener('click', () => press(k));
      keys.push(b);
      return b;
    }))));
  const onDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let k = CODE[e.code];
    if (e.code === 'Slash' && e.shiftKey) k = '?';
    if (e.code === 'Digit1' && e.shiftKey) k = '!';
    if (!k) return;
    e.preventDefault();
    const out = e.shiftKey && SHIFT[k] ? SHIFT[k] : k;
    const b = keys.find((x) => x.dataset.k === k);
    b?.classList.add('down');
    setTimeout(() => b?.classList.remove('down'), 120);
    onKey(out);
  };
  window.addEventListener('keydown', onDown);
  return {
    el,
    // 눌러야 할 자모의 버튼. 쌍자음인데 Shift가 꺼져 있으면 Shift 키를 가리킨다
    keyEl(k) {
      if (BASE[k] && !shift) return keys.find((b) => b.dataset.k === '⇧');
      return keys.find((b) => b.dataset.k === (BASE[k] || k));
    },
    destroy() { window.removeEventListener('keydown', onDown); },
  };
}
