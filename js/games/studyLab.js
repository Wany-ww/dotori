import { h, shuffle, pick, randInt, wiggle, pop, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { numPad } from './numPad.js';

const R = 6;
const NS = 'http://www.w3.org/2000/svg';

/* ---------- 덧셈 / 뺄셈: 세 수의 계산 ---------- */
// 단계별 개념 카드: 제목, 설명, 보기 식 [a, op1, b, op2, c]
const ADDSUB = [
  { title: '세 수의 덧셈', text: '세 수의 덧셈은 두 수를 더한 다음 나머지 수를 더합니다.', ex: [34, '+', 17, '+', 28] },
  { title: '세 수의 뺄셈', text: '세 수의 뺄셈은 앞의 두 수를 뺀 다음 나머지 수를 뺍니다.', ex: [80, '-', 25, '-', 17] },
  { title: '덧셈과 뺄셈이 섞인 계산', text: '덧셈과 뺄셈이 섞인 식은 앞에서부터 차례로 계산합니다.', ex: [45, '+', 28, '-', 19] },
  { title: '덧셈과 뺄셈이 섞인 계산', text: '덧셈과 뺄셈이 섞인 식은 앞에서부터 차례로 계산합니다.', ex: [62, '-', 27, '+', 38] },
  { title: '세 자리 수의 계산', text: '세 자리 수도 앞에서부터 두 수씩 차례로 계산합니다.', ex: [250, '+', 135, '-', 80] },
];
const calc = (x, op, y) => (op === '+' ? x + y : x - y);
function addsubProblem(L) {
  for (;;) {
    let a; let b; let c; let o1; let o2;
    if (L === 1) { o1 = '+'; o2 = '+'; a = randInt(11, 49); b = randInt(11, 39); c = randInt(2, 9); }
    else if (L === 2) { o1 = '-'; o2 = '-'; a = randInt(50, 99); b = randInt(11, 39); c = randInt(2, 19); }
    else if (L === 3) { [o1, o2] = pick([['+', '-'], ['-', '+']]); a = randInt(20, 60); b = randInt(5, 29); c = randInt(3, 19); }
    else if (L === 4) { [o1, o2] = pick([['+', '-'], ['-', '+'], ['+', '+'], ['-', '-']]); a = randInt(30, 89); b = randInt(11, 49); c = randInt(11, 39); }
    else { [o1, o2] = pick([['+', '-'], ['-', '+'], ['+', '+']]); a = randInt(12, 45) * 10; b = randInt(11, 29) * 5; c = randInt(3, 15) * 10; }
    const s1 = calc(a, o1, b);
    const s2 = calc(s1, o2, c);
    if (s1 > 0 && s2 > 0 && s1 < 1000 && s2 < 1000 && (L > 1 || s2 < 100)) return { nums: [a, b, c], ops: [o1, o2], steps: [s1, s2] };
  }
}
const SYM = { '+': '+', '-': '−' };

/* ---------- 나눗셈 ---------- */
const DIV = [
  { title: '나눗셈식 알아보기', text: '구슬 24개를 4개씩 묶어 봅시다. 24 ÷ 4 = 6', ex: [24, 4] },
  { title: '나눗셈식 알아보기', text: '똑같이 묶은 묶음의 수가 나눗셈의 몫입니다.', ex: [18, 3] },
  { title: '곱셈과 나눗셈의 관계', text: '6 × 5 = 30이면 30 ÷ 5 = 6입니다. 곱셈식으로 나눗셈의 몫을 구할 수 있어요.', ex: [30, 5] },
  { title: '곱셈구구로 몫 구하기', text: '나누는 수의 단 곱셈구구를 떠올리면 몫을 빨리 구할 수 있어요.', ex: [42, 7] },
  { title: '나머지가 있는 나눗셈', text: '17 ÷ 5는 5씩 3묶음이고 2개가 남습니다. 17 ÷ 5 = 3 … 2', ex: [17, 5] },
];
const DIVR = [[[2, 5], [2, 5]], [[2, 9], [2, 6]], [[3, 9], [3, 7]], [[2, 9], [3, 9]], [[3, 6], [2, 5]]];
const dotsEl = (total, per) => h('div', { class: 'sl-dots' }, Array.from({ length: Math.ceil(total / per) }, (_, g) => h('span', { class: `sl-group${(g + 1) * per > total ? ' rest' : ''}` },
  Array.from({ length: Math.min(per, total - g * per) }, () => h('i')))));

/* ---------- 도형: 입체도형의 면 · 모서리 · 꼭짓점 ---------- */
const SOLIDS = {
  cube: { name: '정육면체', f: 6, e: 12, v: 8, color: '#F7D84A', hull: 'M20 35L38 17H83V62L65 80H20Z', vis: 'M20 35H65V80H20Z M20 35L38 17H83L65 35 M65 80L83 62V17', hid: 'M38 62V17 M38 62H83 M38 62L20 80' },
  rect: { name: '직육면체', f: 6, e: 12, v: 8, color: '#F28AB8', hull: 'M28 30L44 16H74V74L58 88H28Z', vis: 'M28 30H58V88H28Z M28 30L44 16H74L58 30 M58 88L74 74V16', hid: 'M44 74V16 M44 74H74 M44 74L28 88' },
  sqpyr: { name: '사각뿔', f: 5, e: 8, v: 5, color: '#F4A58A', hull: 'M48 10L80 60L60 78H15Z', vis: 'M15 78H60L80 60 M48 10L15 78 M48 10L60 78 M48 10L80 60', hid: 'M15 78L35 60H80 M48 10L35 60' },
  tripyr: { name: '삼각뿔', f: 4, e: 6, v: 4, color: '#9AA8F2', hull: 'M42 12L72 80H14Z', vis: 'M14 80H72 M42 12L14 80 M42 12L72 80', hid: 'M14 80L56 60L72 80 M42 12L56 60' },
  triprism: { name: '삼각기둥', f: 5, e: 9, v: 6, color: '#8ADBC4', hull: 'M15 80L35 45L65 30L85 65L55 80Z', vis: 'M15 80H55L35 45Z M35 45L65 30L85 65L55 80', hid: 'M45 65L65 30 M45 65H85 M45 65L15 80' },
  sphere: { name: '구', curved: true, color: '#9EE07A', hull: 'M50 16a34 34 0 1 0 0.1 0Z', vis: 'M50 16a34 34 0 1 0 0.1 0Z M16 50a34 10 0 0 0 68 0', hid: 'M16 50a34 10 0 0 1 68 0' },
  cylinder: { name: '원기둥', curved: true, color: '#7FB6F2', hull: 'M24 24a26 9 0 0 1 52 0V76a26 9 0 0 1 -52 0Z', vis: 'M24 24a26 9 0 1 0 52 0a26 9 0 1 0 -52 0 M24 24V76 M76 24V76 M24 76a26 9 0 0 0 52 0', hid: 'M24 76a26 9 0 0 1 52 0' },
  cone: { name: '원뿔', curved: true, color: '#E89AE8', hull: 'M50 12L78 76a28 9 0 0 1 -56 0Z', vis: 'M50 12L22 76 M50 12L78 76 M22 76a28 9 0 0 0 56 0', hid: 'M22 76a28 9 0 0 1 56 0' },
};
const POLY = ['cube', 'rect', 'sqpyr', 'tripyr', 'triprism'];
const SHAPES = [
  { title: '입체도형의 면', text: '입체도형에서 면은 평면도형으로 둘러싸인 부분입니다.', ex: 'cube', ask: ['f'] },
  { title: '입체도형의 면', text: '입체도형에서 면은 평면도형으로 둘러싸인 부분입니다. 면의 수가 같은 도형을 찾아봐요.', ex: 'sqpyr', ask: ['pickF'] },
  { title: '입체도형의 모서리', text: '면과 면이 만나는 선을 모서리라고 합니다.', ex: 'cube', ask: ['e'] },
  { title: '입체도형의 꼭짓점', text: '모서리와 모서리가 만나는 점을 꼭짓점이라고 합니다.', ex: 'sqpyr', ask: ['v'] },
  { title: '면 · 모서리 · 꼭짓점', text: '면, 모서리, 꼭짓점의 수를 세어 입체도형을 알아봐요.', ex: 'triprism', ask: ['f', 'e', 'v', 'pickF'] },
];
const ASK = { f: '면의 수는 몇 개일까요?', e: '모서리의 수는 몇 개일까요?', v: '꼭짓점의 수는 몇 개일까요?' };
const WORD = { f: '면', e: '모서리', v: '꼭짓점' };
function solidEl(id, big) {
  const s = SOLIDS[id];
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `sl-solid${big ? ' big' : ''}`);
  svg.setAttribute('aria-hidden', 'true');
  const path = (d, attrs) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); Object.entries(attrs).forEach(([k, v]) => p.setAttribute(k, v)); svg.append(p); };
  path(s.hull, { fill: s.color, opacity: '.85' });
  path(s.hid, { fill: 'none', stroke: '#333', 'stroke-width': 1.4, 'stroke-dasharray': '3 3' });
  path(s.vis, { fill: 'none', stroke: '#222', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  return svg;
}

// 스터디 랩(StudyGameAddSub · StudyGameDivision · StudyGameShapes): 개념 카드를 먼저 보고(보기 식이 차례로 풀린다),
// 같은 개념의 문제를 숫자판이나 보기로 푼다 (참고 영상 기준)
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const card = (mode === 'div' ? DIV : mode === 'shapes' ? SHAPES : ADDSUB)[L - 1];
  const hinter = makeHinter();
  const head = h('p', { class: 'sl-head' });
  const body = h('div', { class: 'sl-body' });
  const side = h('div', { class: 'sl-side' });
  const root = h('div', { class: `study-lab mode-${mode}` }, h('div', { class: 'sl-main' }, head, body), side);
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  // 개념 카드: 닫으면 문제가 시작된다
  function showCard() {
    const demo = h('div', { class: 'sl-demo' });
    const close = h('button', { class: 'sl-close', type: 'button', 'aria-label': '닫기' }, '✕');
    const go = h('button', { class: 'btn btn-primary sl-go', type: 'button' }, '문제 풀기');
    const modal = h('div', { class: 'sl-modal' }, h('div', { class: 'sl-card' }, h('div', { class: 'sl-card-top' }, h('b', {}, card.title), close), h('p', { class: 'sl-card-text' }, card.text), demo, go));
    root.append(modal);
    if (mode === 'shapes') demo.append(solidEl(card.ex, true));
    else if (mode === 'div') {
      const [a, b] = card.ex;
      demo.append(dotsEl(a, b));
      ctx.later(() => demo.firstChild.classList.add('grouped'), 900);
    } else {
      const [a, o1, b, o2, c] = card.ex;
      const s1 = calc(a, o1, b);
      const s2 = calc(s1, o2, c);
      const step1 = h('b', { class: 'sl-step hidden' }, s1);
      const step2 = h('b', { class: 'sl-step hidden' }, s2);
      demo.append(h('p', { class: 'sl-eq' }, `${a} ${SYM[o1]} ${b} ${SYM[o2]} ${c} =`), h('div', { class: 'sl-steps' }, h('span', { class: 'sl-no' }, '①'), step1, h('span', { class: 'sl-no' }, '②'), step2));
      ctx.later(() => { step1.classList.remove('hidden'); pop(step1); }, 1000);
      ctx.later(() => { step2.classList.remove('hidden'); pop(step2); }, 2200);
    }
    speak(card.text);
    const start = () => { if (!modal.isConnected) return; sfx.tap(); modal.remove(); round(); };
    close.onclick = start;
    go.onclick = start;
  }

  const next = (missed) => {
    if (!missed) firstTry++;
    hinter.reset();
    sfx.correct();
    cheer(body);
    ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 1500);
  };

  // 숫자판으로 답 칸 하나를 채운다
  function ask(box, want, done) {
    box.classList.add('cur');
    const pad = numPad((v, clear) => {
      if (v !== want) { missedNow = true; wiggle(box); hinter.miss(pad.keyOf(want)); clear(); return; }
      hinter.reset();
      sfx.pop();
      box.classList.remove('cur');
      box.classList.add('ok');
      box.replaceChildren(String(v));
      done();
    }, { max: 3, cls: 'sl' });
    box.replaceChildren(pad.screen);
    side.replaceChildren(pad.el);
  }
  let missedNow = false;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    missedNow = false;
    side.replaceChildren();
    if (mode === 'addsub') {
      const q = addsubProblem(L);
      const [a, b, c] = q.nums;
      const box = () => h('span', { class: 'sl-box' }, '?');
      const fin = box();
      const b1 = box();
      const b2 = box();
      head.textContent = '식을 계산하세요.';
      body.replaceChildren(
        h('p', { class: 'sl-eq' }, `${a} ${SYM[q.ops[0]]} ${b} ${SYM[q.ops[1]]} ${c} = `, fin),
        h('div', { class: 'sl-steps' }, h('span', { class: 'sl-no' }, '①'), b1, h('span', { class: 'sl-no' }, '②'), b2),
      );
      speak('식을 계산하세요.');
      ask(b1, q.steps[0], () => ask(b2, q.steps[1], () => ask(fin, q.steps[1], () => { side.replaceChildren(); next(missedNow); })));
      return;
    }
    if (mode === 'div') {
      const [dr, qr] = DIVR[L - 1];
      const d = randInt(...dr);
      const qq = randInt(...qr);
      const rest = L === 5 ? randInt(1, d - 1) : 0;
      const a = d * qq + rest;
      const ans = h('span', { class: 'sl-box' }, '?');
      const rem = L === 5 ? h('span', { class: 'sl-box' }, '?') : null;
      head.textContent = L === 5 ? '나눗셈의 몫과 나머지를 구하세요.' : '나눗셈의 몫을 구하세요.';
      body.replaceChildren(...[
        L === 4 ? h('p', { class: 'sl-hint' }, `${d}단 곱셈구구를 떠올려요.`) : dotsEl(a, d),
        L === 3 ? h('p', { class: 'sl-hint' }, `${qq} × ${d} = ${a}`) : null,
        h('p', { class: 'sl-eq' }, `${a} ÷ ${d} = `, ans, ...(rem ? [' … ', rem] : [])),
      ].filter(Boolean));
      body.querySelector('.sl-dots')?.classList.add('grouped');
      speak(L === 5 ? '나눗셈의 몫과 나머지를 구하세요.' : '나눗셈의 몫을 구하세요.');
      ask(ans, qq, () => (rem ? ask(rem, rest, () => { side.replaceChildren(); next(missedNow); }) : (side.replaceChildren(), next(missedNow))));
      return;
    }
    // 도형
    const kind = pick(card.ask);
    if (kind === 'pickF') {
      // 면의 수를 보고 알맞은 도형 고르기 (곡면 도형이나 면의 수가 다른 도형이 함께 나온다)
      const id = pick(POLY);
      const f = SOLIDS[id].f;
      const others = shuffle(Object.keys(SOLIDS).filter((k) => k !== id && SOLIDS[k].f !== f)).slice(0, 2);
      const opts = shuffle([id, ...others]);
      head.textContent = '면의 수가 같은 도형을 고르세요.';
      body.replaceChildren(h('p', { class: 'sl-big' }, `면의 수 : ${f}`));
      side.replaceChildren(choiceSet(opts, { answer: id, hinter, cls: 'choice sl-pick', render: (k) => solidEl(k), label: (k) => SOLIDS[k].name, onCorrect: (btn, miss) => next(miss > 0) }));
      speak('면의 수가 같은 도형을 고르세요.');
      return;
    }
    const id = pick(POLY);
    const want = SOLIDS[id][kind];
    const pool = new Set([want]);
    while (pool.size < 4) { const v = want + randInt(-3, 3); if (v >= 3) pool.add(v); }
    head.textContent = `${SOLIDS[id].name}의 ${WORD[kind]}의 수는?`;
    body.replaceChildren(solidEl(id, true));
    side.replaceChildren(choiceSet(shuffle([...pool]), { answer: want, hinter, cls: 'choice sl-num', onCorrect: (btn, miss) => next(miss > 0) }));
    speak([SOLIDS[id].name, ASK[kind]]);
  }

  ctx.prompt(mode === 'shapes' ? '개념 카드를 읽고, 입체도형의 면 · 모서리 · 꼭짓점을 세어 답해요!'
    : mode === 'div' ? '개념 카드를 읽고, 똑같이 묶어 나눗셈의 몫을 구해요!'
      : '개념 카드를 읽고, 앞에서부터 두 수씩 차례로 계산해요!', () => speak(card.title));
  showCard();
}
