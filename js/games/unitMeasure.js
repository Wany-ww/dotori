import { h, pick, randInt, wiggle, pop, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { numPad } from './numPad.js';
import { thingEl } from './ruler.js';

const R = 3;
// 물건과 읽어 줄 말 (동전 · 클립으로 몇 번인지)
const THINGS = [
  { kind: 'candy', name: '사탕', coin: '사탕의 길이는 동전으로 몇 번인가요?', clip: '사탕의 길이는 클립으로 몇 번인가요?' },
  { kind: 'pencil', name: '연필', coin: '연필의 길이는 동전으로 몇 번인가요?', clip: '연필의 길이는 클립으로 몇 번인가요?' },
  { kind: 'ribbon', name: '리본', coin: '리본의 길이는 동전으로 몇 번인가요?', clip: '리본의 길이는 클립으로 몇 번인가요?' },
  { kind: 'crayon', name: '크레파스', coin: '크레파스의 길이는 동전으로 몇 번인가요?', clip: '크레파스의 길이는 클립으로 몇 번인가요?' },
  { kind: 'block', name: '블록', coin: '블록의 길이는 동전으로 몇 번인가요?', clip: '블록의 길이는 클립으로 몇 번인가요?' },
];
// 단계별: 동전 몇 개 길이인지, 클립(동전 2개 길이)으로도 재는지, 마지막에 어느 쪽 수가 큰지 묻는지
const CFG = [
  { len: [2, 4] },
  { len: [2, 8] },
  { len: [2, 4], clip: true },
  { len: [3, 5], clip: true },
  { len: [3, 5], clip: true, compare: true },
];
const UNIT = { coin: 1, clip: 2 };

// 길이 재기 I(RulerCount): 동전(클립)을 점선 동그라미에 거듭 놓아 물건의 길이를 재고, 몇 번인지 숫자판으로 넣는다 (참고 영상 기준)
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const title = h('p', { class: 'um-title' });
  const field = h('div', { class: 'um-field' });
  const tools = h('div', { class: 'um-tools' });
  const lines = h('div', { class: 'um-lines' });
  stage.append(h('div', { class: 'unit-measure' }, title, field, tools, lines));
  let n = 0;
  let firstTry = 0;
  let total = 0;
  let last = '';

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let t;
    do t = pick(THINGS); while (t.kind === last);
    last = t.kind;
    // 클립으로도 잴 때는 동전 2개 길이의 몇 배가 되게
    const len = randInt(...cfg.len) * (cfg.clip ? 2 : 1);
    const units = cfg.clip ? ['coin', 'clip'] : ['coin'];
    const answers = units.map((u) => len / UNIT[u]);
    title.textContent = cfg.clip ? `동전과 클립으로 ${t.name}의 길이를 재어 보세요.` : `동전으로 ${t.name}의 길이를 재어 보세요.`;
    field.style.setProperty('--len', len);
    const marks = h('div', { class: 'um-marks' });
    const slot = h('span', { class: 'um-slot', 'aria-label': '여기에 놓아요' });
    field.replaceChildren(h('span', { class: 'um-edge l', 'aria-hidden': 'true' }), h('span', { class: 'um-edge r', 'aria-hidden': 'true' }), marks, slot, thingEl(t.kind, len, 'var(--c)'));
    const rows = units.map((u, i) => {
      const box = h('span', { class: 'um-box' }, '?');
      const row = h('p', { class: 'um-line' }, `${t.name}의 길이는 ${u === 'coin' ? '동전' : '클립'}으로 `, box, ' 번입니다.');
      return { u, box, row, answer: answers[i] };
    });
    lines.replaceChildren(...rows.map((r) => r.row));
    let missed = false;
    let k = 0;

    // k번째 도구로 재기: 도구를 점선 동그라미에 놓을 때마다 한 칸씩 찍힌다
    function measure() {
      const r = rows[k];
      const step = UNIT[r.u];
      let at = 0;
      marks.replaceChildren();
      const placeSlot = () => { slot.style.left = `calc(var(--c) * ${at})`; slot.style.width = `calc(var(--c) * ${step})`; slot.hidden = at >= len; };
      placeSlot();
      const tool = h('button', { class: `um-tool ${r.u}`, type: 'button', 'aria-label': r.u === 'coin' ? '동전' : '클립' }, h('i', { 'aria-hidden': 'true' }));
      const put = () => {
        if (at >= len) return;
        hinter.reset();
        marks.append(h('span', { class: `um-mark ${r.u}`, style: { left: `calc(var(--c) * ${at})`, width: `calc(var(--c) * ${step})` }, 'aria-hidden': 'true' }, h('i')));
        at += step;
        sfx.pop();
        pop(slot);
        placeSlot();
        if (at < len) return;
        tool.disabled = true;
        ctx.later(askCount, 400);
      };
      draggable(tool, {
        can: () => at < len,
        onDrop: (pt) => { if (hits(slot, pt, 24)) put(); else { wiggle(tool); hinter.miss(slot); } },
      });
      tool.addEventListener('click', put);
      tools.replaceChildren(tool);
      speak(r.u === 'coin' ? '동전을 점선 동그라미에 놓아 길이를 재어 봐요!' : '이번에는 클립으로 재어 봐요!');
    }

    function askCount() {
      const r = rows[k];
      r.row.classList.add('cur');
      const pad = numPad((v, clear) => {
        if (v !== r.answer) { missed = true; wiggle(r.box); hinter.miss(pad.keyOf(r.answer)); clear(); return; }
        hinter.reset();
        sfx.correct();
        pad.el.remove();
        r.box.replaceChildren(String(v));
        r.row.classList.remove('cur');
        r.row.classList.add('ok');
        k++;
        if (k < rows.length) { ctx.later(measure, 700); return; }
        if (cfg.compare) { ctx.later(compare, 700); return; }
        done();
      }, { cls: 'um' });
      r.box.replaceChildren(pad.screen, pad.el);
      speak(t[r.u]);
    }

    // 같은 물건을 재도 짧은 도구로 재면 수가 더 크다
    function compare() {
      const q = '동전과 클립 중 어느 것으로 잰 수가 더 큰가요?';
      tools.replaceChildren(h('p', { class: 'um-ask' }, q), choiceSet(['동전', '클립'], {
        answer: '동전',
        hinter,
        cls: 'choice um-opt',
        onCorrect: (b, miss) => { if (miss) missed = true; done(); },
      }));
      speak(q);
    }

    function done() {
      total++;
      if (!missed) firstTry++;
      cheer(field);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total }); else round(); }, 1800);
    }

    measure();
    ctx.prompt('동전(클립)을 끌어 점선 동그라미에 놓으면 한 번씩 재어져요. 끝까지 잰 뒤 몇 번인지 넣어요!',
      () => speak('동전을 점선 동그라미에 놓아 길이를 재어 봐요!'));
  }

  round();
}
