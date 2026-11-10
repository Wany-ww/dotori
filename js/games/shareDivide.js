import { h, randInt, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable } from './dragTap.js';
import { tallyUnit } from './tallyBlocks.js';
import { numPad } from './numPad.js';

const R = 4;
// 탈리 나눗셈: 단계별 [나누는 수(저울 수) 범위, 몫 범위]
const SCALE = [[[2, 2], [1, 3]], [[2, 3], [2, 4]], [[3, 4], [2, 5]], [[3, 5], [3, 6]], [[4, 6], [3, 7]]];
// 젤리곰 나눗셈: 단계별 [묶음 크기 범위, 몫 범위]
const JELLY = [[[2, 2], [2, 5]], [[2, 3], [2, 4]], [[2, 5], [2, 4]], [[3, 6], [3, 5]], [[4, 9], [3, 5]]];

// 탈리 묶음 나눗셈(TallyDivision · scale · 탈리 나눗셈): 탈리를 저울 위에 똑같이 나눠 올린 뒤 "4 ÷ 2 = ?"의 답을 넣는다.
// 젤리 블록 나눗셈(BlockDivision · jelly · 젤리곰 나눗셈): "2개씩 선택하세요" — 젤리곰을 끌어 2개씩 골라 봉지에 담고,
// 봉지가 몇 개인지 답한다 (참고 영상 기준)
export function mount(stage, ctx) {
  const jelly = ctx.opts.mode === 'jelly';
  const L = ctx.level;
  const hinter = makeHinter();
  const eq = h('div', { class: 'sd-eq' });
  const field = h('div', { class: 'sd-field' });
  const side = h('div', { class: 'sd-side' });
  const ask = h('div', { class: 'sd-ask' });
  stage.append(h('div', { class: `share-divide mode-${jelly ? 'jelly' : 'scale'}` }, h('div', { class: 'sd-top' }, eq, ask), h('div', { class: 'sd-body' }, field, side)));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const [dr, qr] = (jelly ? JELLY : SCALE)[L - 1];
    const d = randInt(...dr);
    const q = randInt(...qr);
    const a = d * q;
    let missed = false;
    const paintEq = (v) => eq.replaceChildren(h('b', { class: 'sd-a' }, a), '÷', h('b', { class: 'sd-d' }, d), '=', v ?? h('b', { class: 'sd-q' }, '?'));
    paintEq();
    ask.replaceChildren();
    const finish = () => {
      if (!missed) firstTry++;
      hinter.reset();
      sfx.correct();
      cheer(eq);
      burst(field, ['⭐', '✨']);
      speak([String(a), '나누기', String(d), '는', String(q)]);
      ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
    };
    // 다 나누면 식 옆에 숫자판이 떠서 몫을 넣는다
    const askAnswer = () => {
      const pad = numPad((v, clear) => {
        if (v !== q) { missed = true; wiggle(eq); hinter.miss(pad.keyOf(q)); clear(); return; }
        ask.replaceChildren();
        paintEq(h('b', { class: 'sd-q ok' }, q));
        finish();
      });
      paintEq(pad.screen);
      ask.replaceChildren(pad.el);
      speak([String(a), '나누기', String(d)]);
    };

    if (!jelly) {
      /* ---------- 탈리 나눗셈: 저울 d개 ---------- */
      const scales = Array.from({ length: d }, () => {
        const plate = h('div', { class: 'sd-plate' });
        const meter = h('b', { class: 'sd-meter' }, '0');
        return h('div', { class: 'sd-scale' }, plate, h('div', { class: 'sd-stand' }, meter));
      });
      const table = h('div', { class: 'sd-table' });
      field.replaceChildren(h('div', { class: 'sd-scales' }, scales), table);
      side.replaceChildren();
      const plates = scales.map((s) => s.querySelector('.sd-plate'));
      const count = (i) => plates[i].children.length;
      const paint = () => scales.forEach((s, i) => { s.querySelector('.sd-meter').textContent = count(i); });
      const tallies = Array.from({ length: a }, () => {
        const t = h('button', { class: 'sd-tally', type: 'button', 'aria-label': '탈리' }, tallyUnit(1));
        draggable(t, {
          can: () => !ask.firstChild,
          onDrop: (pt) => {
            const i = scales.findIndex((s) => { const r = s.getBoundingClientRect(); return pt.x > r.left && pt.x < r.right && pt.y > r.top - 30 && pt.y < r.bottom; });
            if (i >= 0) put(t, i); else wiggle(t);
          },
        });
        // 누르면 가장 적게 올라간 저울로 (똑같이 나누기), 저울 위 탈리를 누르면 내려온다
        t.addEventListener('click', () => {
          if (ask.firstChild) return;
          if (t.parentElement !== table) { table.append(t); sfx.tap(); paint(); return; }
          let i = 0;
          plates.forEach((_, k) => { if (count(k) < count(i)) i = k; });
          put(t, i);
        });
        return t;
      });
      table.replaceChildren(...tallies);
      function put(t, i) {
        plates[i].append(t);
        sfx.pop();
        pop(scales[i]);
        paint();
        if (table.children.length) return;
        const c = plates.map((_, k) => count(k));
        if (c.every((x) => x === c[0])) { ctx.later(askAnswer, 500); return; }
        // 똑같지 않으면 흔들고 많은 저울을 반짝인다
        missed = true;
        speak('똑같이 나눠요!');
        const big = c.indexOf(Math.max(...c));
        wiggle(scales[big]);
        hinter.miss(plates[big].lastElementChild);
      }
      paint();
      ctx.prompt(`탈리 ${a}개를 저울 ${d}개에 똑같이 나눠 올려요! 탈리를 끌거나 누르고, 다 나누면 답을 넣어요.`, () => speak(['탈리를 똑같이 나눠요!']));
      return;
    }

    /* ---------- 젤리곰 나눗셈: d개씩 골라 봉지에 ---------- */
    const bears = Array.from({ length: a }, () => {
      return h('span', { class: 'sd-bear' }, '🐻');
    });
    const grid = h('div', { class: 'sd-grid' }, bears);
    const tag = h('b', { class: 'sd-tag' });
    field.replaceChildren(grid, tag);
    const bags = h('div', { class: 'sd-bags' }, Array.from({ length: 10 }, () => h('i', { class: 'sd-slot' })));
    side.replaceChildren(bags);
    let sel = [];
    let packed = 0;
    let dragging = false;
    const paintSel = () => {
      bears.forEach((b) => b.classList.toggle('sel', sel.includes(b)));
      tag.textContent = sel.length || '';
      const last = sel[sel.length - 1];
      if (last) { const r = last.getBoundingClientRect(); const o = field.getBoundingClientRect(); tag.style.left = `${r.left - o.left + r.width / 2}px`; tag.style.top = `${r.bottom - o.top + 4}px`; }
    };
    const bearAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el?.closest?.('.sd-bear:not(.gone)'); };
    const add = (b) => { if (b && !sel.includes(b) && !b.classList.contains('gone')) { sel.push(b); sfx.tap(); paintSel(); } };
    grid.onpointerdown = (e) => {
      const b = bearAt(e);
      if (!b) return;
      e.preventDefault();
      dragging = true;
      try { grid.setPointerCapture(e.pointerId); } catch {}
      // 고른 곰을 다시 누르면 빠진다
      if (sel.includes(b)) { sel = sel.filter((x) => x !== b); paintSel(); return; }
      add(b);
    };
    grid.onpointermove = (e) => { if (dragging) add(bearAt(e)); };
    grid.onpointerup = grid.onpointercancel = () => {
      if (!dragging) return;
      dragging = false;
      if (sel.length < d) return;
      if (sel.length > d) {
        missed = true;
        wiggle(grid);
        speak(`${d}개씩 선택하세요.`);
        hinter.miss(null);
        ctx.later(() => { sel = []; paintSel(); }, 400);
        return;
      }
      // 봉지에 담는다
      sel.forEach((b) => b.classList.add('gone'));
      sel = [];
      paintSel();
      const slot = bags.children[packed];
      slot.replaceChildren(h('span', { class: 'sd-bag' }, h('b', {}, d)));
      packed++;
      sfx.pop();
      pop(slot);
      speak(String(packed));
      if (packed === q) ctx.later(askAnswer, 500);
    };
    ctx.prompt(`${d}개씩 선택하세요. 젤리곰을 끌어서 ${d}개씩 고르면 봉지에 담겨요. 다 담으면 봉지 수를 답해요!`, () => speak(`${d}개씩 선택하세요.`));
  }

  round();
}
