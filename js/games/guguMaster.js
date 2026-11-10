import { h, shuffle, randInt, wiggle, pop, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { store } from '../store.js';
import { numPad } from './numPad.js';
import { noteMiss, noteRight, topMisses } from './mathMiss.js';

const R = 10;
const PER_ROUND = 30;
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// 연습 묶음: [id, 공책 표지, 단 목록, 카드 이름, 색 묶음]
const SETS = [
  ['2', '2단', [2], '2단 연습하기', 'o'], ['3', '3단', [3], '3단 연습하기', 'o'], ['4', '4단', [4], '4단 연습하기', 'o'],
  ['u4', '2~4단', range(2, 4), '4단 이하 연습하기', 'g'],
  ['5', '5단', [5], '5단 연습하기', 'v'], ['6', '6단', [6], '6단 연습하기', 'v'], ['7', '7단', [7], '7단 연습하기', 'v'],
  ['u7', '2~7단', range(2, 7), '7단 이하 연습하기', 'g'],
  ['8', '8단', [8], '8단 연습하기', 'p'], ['9', '9단', [9], '9단 연습하기', 'p'],
  ['all', '2~9단', range(2, 9), '곱셈구구 연습하기', 'g'],
];
// 단계별로 먼저 권하는 묶음
const PICK = { 1: ['2', '5'], 2: ['3', '4', 'u4'], 3: ['6', '7'], 4: ['8', '9', 'u7'], 5: ['all'] };

// 곱셈구구 마스터(MultiplicationMaster): 연습할 단을 고르면 공책이 열리고, "2×7=□" 10문제를 숫자판으로 푼다.
// 묶음마다 30문제를 맞히면 다음 회차, 한 셈을 세 번 맞히면 공책 위 네모 세 칸이 찬다 (참고 영상 기준)
export function mount(stage, ctx) {
  const p = store.profile || {};
  p.gugu ||= {};
  p.guguFacts ||= {};
  const save = () => { try { store.save(); } catch {} };
  const root = h('div', { class: 'gugu-master' });
  stage.append(root);

  function menu() {
    const cards = SETS.map(([id, , , name, tone]) => {
      const rec = p.gugu[id] || { r: 1, n: 0 };
      const b = h('button', { class: `gm-card t-${tone}${PICK[ctx.level].includes(id) ? ' pick' : ''}`, type: 'button', 'aria-label': name },
        h('span', { class: 'gm-badge', 'aria-hidden': 'true' }, id.length === 1 ? `${id}×` : '?×'),
        h('span', { class: 'gm-info' }, h('b', {}, name), h('small', {}, `${rec.r}회차`),
          h('span', { class: 'gm-bar' }, h('i', { style: { width: `${(rec.n / PER_ROUND) * 100}%` } }), h('em', {}, `${rec.n} / ${PER_ROUND}`))));
      b.addEventListener('click', () => { sfx.tap(); start(id); });
      return b;
    });
    root.className = 'gugu-master menu';
    root.replaceChildren(h('h3', { class: 'gm-title' }, '곱셈구구 연습'), h('div', { class: 'gm-cards' }, cards));
    ctx.prompt('연습할 단을 골라요. 별표가 붙은 단부터 해 봐도 좋아요!', () => speak('연습할 단을 골라요!'));
  }

  function start(id) {
    const [, cover, dans, , tone] = SETS.find((s) => s[0] === id);
    // 문제 10개: 예전에 틀린 셈을 먼저 섞어 넣고, 나머지는 겹치지 않게
    const missed = topMisses(['×'], 20).filter((k) => dans.includes(Number(k.split('×')[0]))).slice(0, 3);
    const seen = new Set(missed);
    const list = missed.map((k) => k.split('×').map(Number));
    const pool = shuffle(dans.flatMap((a) => range(1, 9).map((b) => [a, b])));
    for (const f of pool) { if (list.length >= R) break; if (!seen.has(f.join('×'))) { seen.add(f.join('×')); list.push(f); } }
    while (list.length < R) list.push([dans[randInt(0, dans.length - 1)], randInt(2, 9)]);
    const qs = shuffle(list);

    const hinter = makeHinter();
    const bar = h('div', { class: 'gm-progress' }, h('span', { class: 'gm-combo' }), h('i'), h('b'));
    const boxes = h('span', { class: 'gm-boxes', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
    const eq = h('p', { class: 'gm-eq' });
    const stamp = h('p', { class: 'gm-stamp' });
    const page = h('div', { class: 'gm-page' }, boxes, eq, stamp);
    const coverEl = h('div', { class: 'gm-cover' }, h('span', { class: 'gm-st s1', 'aria-hidden': 'true' }, '🌈'), h('b', {}, cover), h('span', { class: 'gm-st s2', 'aria-hidden': 'true' }, '✏️'));
    const book = h('div', { class: 'gm-book' }, page, coverEl);
    let n = 0;
    let firstTry = 0;
    let combo = 0;
    let missed1 = false;
    let busy = true;
    const pad = numPad((v, clear) => {
      if (busy) return;
      const [a, b] = qs[n];
      const key = `${a}×${b}`;
      if (v !== a * b) {
        missed1 = true;
        combo = 0;
        noteMiss(key);
        wiggle(page);
        hinter.miss(pad.keyOf(a * b));
        clear();
        return;
      }
      busy = true;
      hinter.reset();
      if (!missed1) {
        firstTry++;
        combo++;
        noteRight(key);
        p.guguFacts[key] = Math.min(3, (p.guguFacts[key] || 0) + 1);
        save();
      }
      sfx.correct();
      eq.replaceChildren(`${a}×${b}=`, h('em', {}, String(a * b)));
      stamp.textContent = '정답 완료! 잘했어요!';
      page.classList.add('done');
      paintBoxes(key);
      burst(page, ['⭐', '✨']);
      n++;
      paintBar();
      clear();
      speak('정답 완료! 잘했어요!');
      ctx.later(() => { if (n >= R) end(id, firstTry); else ask(); }, 1300);
    }, { cls: 'gm', max: 2 });
    root.className = `gugu-master play t-${tone}`;
    root.replaceChildren(bar, h('div', { class: 'gm-desk' }, book, h('div', { class: 'gm-calc' }, pad.screen, pad.el)));
    function paintBoxes(key) {
      const k = p.guguFacts[key] || 0;
      boxes.querySelectorAll('i').forEach((b, i) => b.classList.toggle('on', i < k));
    }
    function paintBar() {
      bar.querySelector('i').style.width = `${(n / R) * 100}%`;
      bar.querySelector('b').textContent = `${n}/${R}`;
      const c = bar.querySelector('.gm-combo');
      c.textContent = combo >= 3 ? `${combo} COMBO!` : '';
      if (combo >= 3) pop(c);
      ctx.progress(n, R);
    }
    function ask() {
      const [a, b] = qs[n];
      missed1 = false;
      page.classList.remove('done');
      stamp.textContent = '';
      eq.replaceChildren(`${a}×${b}=`, h('span', { class: 'gm-box' }));
      paintBoxes(`${a}×${b}`);
      busy = false;
      speak([String(a), '곱하기', String(b), '는?']);
    }
    paintBar();
    ctx.prompt('곱셈의 답을 숫자판으로 누르고 ✓를 눌러요!', () => { const [a, b] = qs[Math.min(n, R - 1)]; speak([String(a), '곱하기', String(b), '는?']); }, { auto: false });
    // 표지가 넘어가면 시작
    ctx.later(() => book.classList.add('open'), 900);
    ctx.later(ask, 1500);
  }

  // 첫 시도에 맞힌 수만큼 이 묶음의 회차 진도가 찬다
  function end(id, firstTry) {
    const rec = (p.gugu[id] ||= { r: 1, n: 0 });
    rec.n += firstTry;
    while (rec.n >= PER_ROUND) { rec.n -= PER_ROUND; rec.r++; }
    save();
    ctx.finish({ firstTry, total: R });
  }

  menu();
}
