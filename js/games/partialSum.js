import { h, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';

const R = 4;
// 단계별 문제: 두 자리 + 한 자리 → 두 자리 + 두 자리(받아올림 없이) → 두 자리 + 두 자리 → 세 자리 + 두 자리 → 세 자리 + 세 자리
const MAKE = [
  () => [randInt(11, 89), randInt(2, 9)],
  () => { const a = randInt(11, 74); return [a, randInt(1, 8 - Math.floor(a / 10)) * 10 + randInt(0, 9 - (a % 10))]; },
  () => [randInt(15, 69), randInt(15, 29)],
  () => [randInt(101, 799), randInt(11, 99)],
  () => [randInt(101, 499), randInt(101, 499)],
];
const PLACE = ['일', '십', '백'];
const SAY = ['일의 자리끼리 더해요!', '십의 자리끼리 더해요!', '백의 자리끼리 더해요!'];
const sayNum = (v) => (v > 100 ? [String(Math.floor(v / 100) * 100), ...(v % 100 ? [String(v % 100)] : [])] : String(v));

// 받아올림 없는 세로셈 덧셈(StackedAddition1 · 세로 덧셈 I): 자리마다 따로 더한 값(부분합)을 차례로 적고
// (8 + 9 = 17, 20 + 0 = 20) 마지막에 부분합을 더해 답(37)을 낸다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const sheet = h('div', { class: 'ps-sheet' });
  const pad = h('div', { class: 'ps-pad' });
  stage.append(h('div', { class: 'partial-sum' }, sheet, pad));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const [a, b] = MAKE[L - 1]();
    const cols = String(a + b).length;
    const dA = String(a).padStart(cols, ' ').split('');
    const dB = String(b).padStart(cols, ' ').split('');
    const val = (s, i) => Number(s[cols - 1 - i]) || 0;
    // 부분합: 자리마다 (일의 자리부터), 0인 자리는 건너뛴다
    const parts = [];
    for (let p = 0; p < cols; p++) {
      const v = (val(dA, p) + val(dB, p)) * 10 ** p;
      if (v || p === 0) parts.push({ p, v });
    }
    const steps = [...parts.map((x) => ({ ...x, kind: 'part' })), ...(parts.length > 1 ? [{ kind: 'sum', v: a + b }] : [])];
    const cell = (c, cls = '') => h('span', { class: `ps-cell ${cls}` }, c === ' ' ? '' : c);
    const topRow = h('div', { class: 'ps-row' }, cell(''), ...dA.map((c, i) => cell(c, `d${cols - 1 - i}`)));
    const botRow = h('div', { class: 'ps-row' }, cell('+', 'op'), ...dB.map((c, i) => cell(c, `d${cols - 1 - i}`)));
    const rows = steps.map((s) => h('div', { class: `ps-row ans ${s.kind === 'sum' ? 'sum' : `k${s.p}`}` }, cell(''), ...Array.from({ length: cols }, () => cell('', 'box'))));
    const partRows = rows.filter((_, i) => steps[i].kind === 'part');
    sheet.replaceChildren(topRow, botRow, h('hr', { class: 'ps-line' }), ...partRows, ...(rows.length > partRows.length ? [h('hr', { class: 'ps-line' }), rows[rows.length - 1]] : []));
    let at = 0;
    let entry = '';
    let missed = false;

    const show = (row, v) => {
      const ds = String(v).padStart(cols, ' ').split('');
      [...row.children].slice(1).forEach((c, i) => { c.textContent = ds[i] === ' ' ? '' : ds[i]; });
    };
    function focus() {
      rows.forEach((r, i) => r.classList.toggle('cur', i === at));
      sheet.querySelectorAll('.ps-cell').forEach((c) => c.classList.remove('hl'));
      const s = steps[at];
      if (s.kind === 'part') sheet.querySelectorAll(`.ps-row:not(.ans) .d${s.p}`).forEach((c) => c.classList.add('hl'));
      entry = '';
      show(rows[at], '');
      ctx.prompt(s.kind === 'part' ? `${PLACE[s.p]}의 자리끼리 더한 값을 적어요! (${s.p ? `끝에 0 ${s.p}개를 붙여요` : '그대로 적어요'})` : '적은 값들을 모두 더해 답을 적어요!',
        () => speak(s.kind === 'part' ? SAY[s.p] : '모두 더해요!'));
    }
    focus();

    // 숫자판: 7 8 9 / 4 5 6 / 1 2 3 / ⌫ 0 ✓
    const keys = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0, 'ok'].map((k) => {
      const b = h('button', { class: `ps-key${k === 'ok' ? ' ok' : k === 'x' ? ' del' : ''}`, type: 'button', 'aria-label': k === 'ok' ? '확인' : k === 'x' ? '지우기' : String(k) }, k === 'ok' ? '✓' : k === 'x' ? '←' : String(k));
      b.addEventListener('click', () => press(k, b));
      return b;
    });
    pad.replaceChildren(...keys);
    function press(k, b) {
      if (at >= steps.length) return;
      sfx.tap();
      if (k === 'x') { entry = entry.slice(0, -1); show(rows[at], entry); return; }
      if (k !== 'ok') { if (entry.length < cols) { entry += k; show(rows[at], entry); pop(rows[at]); } return; }
      const s = steps[at];
      if (Number(entry) !== s.v) {
        missed = true;
        wiggle(rows[at]);
        hinter.miss(keys[[7, 8, 9, 4, 5, 6, 1, 2, 3, 'x', 0].indexOf(Number(String(s.v)[0]))]);
        speak(s.kind === 'part' ? SAY[s.p] : '모두 더해요!');
        entry = '';
        ctx.later(() => show(rows[at], ''), 400);
        return;
      }
      hinter.reset();
      sfx.pop();
      rows[at].classList.add('done');
      speak(sayNum(s.v));
      at++;
      if (at < steps.length) { focus(); return; }
      rows.forEach((r) => r.classList.remove('cur'));
      sheet.querySelectorAll('.ps-cell').forEach((c) => c.classList.remove('hl'));
      if (!missed) firstTry++;
      sfx.correct();
      cheer(sheet);
      burst(sheet, ['⭐', '✨']);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2000);
    }
  }

  round();
}
