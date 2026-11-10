// 개발용 자동 시험: 브라우저 콘솔에서 `await import('/tools/test/harness.js')` 후
// __batch([['sayAfter', { opts: { cast: 'koala' } }], ...], [1, 3, 5]) → 끝나면 __out에 결과가 쌓인다.
// 놀이를 화면 맨 위의 시험 칸에 띄우고, 정답을 골라 누르거나(말하기는 __speechMock으로 목표 말을 들은 것으로) 끝까지 푼다.
import { store } from '/js/store.js';
import { glyph, normStroke } from '/js/handwriting.js';
import { item as numItem } from '/js/games/numberTrace.js';
import { TRACE_SETS } from '/js/data.js';

store.state.sound = false;
window.__voiceLog = new Set();
window.__errs = [];
window.addEventListener('error', (e) => window.__errs.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => window.__errs.push(`rej ${e.reason?.stack || e.reason}`));
window.__speechMock = (expect) => expect;

const host = document.createElement('div');
host.id = '__test';
host.style.cssText = 'position:fixed;inset:0;z-index:50;background:#FFF5FA;overflow:auto';
document.body.append(host);

export async function runGame(name, level, { opts = {}, lang = 'ko', lesson = null, unit = null, checkSteps = null } = {}) {
  window.__st?.stop?.();
  const mod = await import(`/js/games/${name}.js`);
  host.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'player';
  root.dataset.subject = lang === 'en' ? 'english' : 'hangul';
  const stage = document.createElement('div');
  stage.className = 'stage';
  root.append(stage);
  host.append(root);
  const st = { prompts: [], finished: null, stage };
  const timers = new Set();
  const cleanups = [];
  let alive = true;
  const ctx = {
    subject: lang === 'en' ? 'english' : 'hangul', opts, level, lesson, unit, lang, checkSteps,
    get alive() { return alive; },
    prompt(t, say, { auto = true } = {}) { st.prompts.push(t); st.say = say; if (auto) ctx.later(() => say && say(), 300); },
    progress() {},
    later(fn, ms) { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; },
    onCleanup(fn) { cleanups.push(fn); },
    finish(r) { st.finished = r; },
  };
  st.stop = () => { alive = false; timers.forEach(clearTimeout); cleanups.forEach((f) => { try { f(); } catch {} }); };
  try { mod.mount(stage, ctx); } catch (e) { window.__errs.push(`${name}: ${e.stack}`); }
  window.__st = st;
  return st;
}

let tick = 0;
let hatTry = 0;
// 쓰기 칸: 본보기 획에 손떨림을 줘서 쓴다. 칸마다 한 번은 일부러 획순을 바꿔 써 본다
function write(pad) {
  const now = Date.now();
  if (now - Number(pad.dataset.w || 0) < 2600) return;
  pad.dataset.w = now;
  const cv = pad.querySelector('canvas');
  const g = glyph(cv.getAttribute('aria-label').split(' ')[0]);
  let st = g.strokes.map((s) => s.filter((_, i) => i % 3 === 0 || i === s.length - 1).map(([x, y]) => [x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 3]));
  if (!pad.dataset.bad && st.length >= 2) { pad.dataset.bad = 1; st = [st[1], st[0], ...st.slice(2)]; }
  const r = cv.getBoundingClientRect();
  const at = ([x, y]) => ({ clientX: r.left + (x / 100) * r.width, clientY: r.top + (y / 100) * r.height, pointerId: 7, bubbles: true });
  st.forEach((s) => {
    cv.dispatchEvent(new PointerEvent('pointerdown', at(s[0])));
    s.slice(1).forEach((q) => cv.dispatchEvent(new PointerEvent('pointermove', at(q))));
    cv.dispatchEvent(new PointerEvent('pointerup', at(s[s.length - 1])));
  });
}
// 따라쓰기 판: 본보기 획을 처음부터 끝까지 따라 긋는다
function trace(cv) {
  const now = Date.now();
  if (now - Number(cv.dataset.w || 0) < 2200) return;
  cv.dataset.w = now;
  const ch = document.querySelector('.trace-glyph')?.textContent;
  if (!ch) return;
  const latin = [...TRACE_SETS.alpha.items, ...TRACE_SETS.shapes.items, ...TRACE_SETS.latin.items, ...TRACE_SETS.lines.items].find((it) => it.ch === ch);
  const strokes = /^\d+$/.test(ch) ? numItem(Number(ch)).strokes.map(normStroke) : latin ? latin.strokes.map(normStroke) : glyph(ch).strokes;
  const r = cv.getBoundingClientRect();
  const at = ([x, y]) => ({ clientX: r.left + (x / 100) * r.width, clientY: r.top + (y / 100) * r.height, pointerId: 8, bubbles: true });
  strokes.forEach((s) => {
    cv.dispatchEvent(new PointerEvent('pointerdown', at(s[0])));
    s.forEach((q) => cv.dispatchEvent(new PointerEvent('pointermove', at(q))));
    cv.dispatchEvent(new PointerEvent('pointerup', at(s[s.length - 1])));
  });
}
const any = (list) => list[Math.floor(Math.random() * list.length)];

export function solve() {
  tick++;
  const p = document.querySelector('.mic-panel');
  if (p && (p.dataset.state === 'ready' || p.dataset.state === 'retry')) p.querySelector('.mic-btn').click();
  const ch = [...document.querySelectorAll('.lu-choice:not(.correct)')];
  if (ch.length && !document.querySelector('.lu-choice.correct')) (document.querySelector('.lu-choice.hint-glow') || any(ch)).click();
  document.querySelectorAll('.wp-pad:not(.ok)').forEach(write);
  const bone = [...document.querySelectorAll('.bone')].find((b) => !b.disabled && b.style.visibility !== 'hidden');
  const dogs = document.querySelectorAll('.dog');
  if (bone && dogs.length && tick % 2 === 0) {
    if (!bone.classList.contains('sel')) bone.click();
    dogs[(tick / 2) % 2].click();
  }
  const letters = [...document.querySelectorAll('.ip-letter:not([disabled])')];
  if (letters.length && tick % 3 === 0) any(letters).click();
  const stars = [...document.querySelectorAll('.ss-star.on')];
  if (stars.length && tick % 3 === 0) any(stars).click();
  document.querySelectorAll('.wa-spot:not([disabled])').forEach((s) => s.click());
  const hat = document.querySelector('.sh-hat');
  const fr = [...document.querySelectorAll('.sh-friend')];
  if (hat && fr.length && tick % 4 === 0) {
    if (!hat.classList.contains('lifted')) hat.click();
    else fr[hatTry++ % fr.length].click();
  }
  const tc = document.querySelector('.trace-canvas');
  if (tc) trace(tc);
  // 수 세기: 물건 수와 같은 카드 (가끔 일부러 틀린 카드도 눌러 본다)
  const cards = [...document.querySelectorAll('.ec-card:not(.right):not(.back)')];
  if (cards.length && !document.querySelector('.ec-card.right') && tick % 3 === 0) {
    const want = String(document.querySelectorAll('.ec-thing').length);
    (Math.random() < 0.2 ? any(cards) : cards.find((c) => c.querySelector('b').textContent === want))?.click();
  }
  // 조각 끼우기 (달력 · 매트릭스 · 숫자 퍼즐): 조각을 고르고 맞는 자리를 누른다
  if (tick % 2 === 0) {
    const cp = document.querySelector('.cp-piece');
    if (cp) { cp.click(); document.querySelector(`.cp-slot[data-key="${cp.dataset.key}"]`)?.click(); }
    const mp = document.querySelector('.mx-piece');
    if (mp) { mp.click(); [...document.querySelectorAll('.mx-cell:not(.filled)')].find((c) => `${c.dataset.say} 조각` === mp.getAttribute('aria-label'))?.click(); }
    const np = document.querySelector('.np-piece');
    if (np) { np.click(); document.querySelector(`.np-hole[aria-label="${np.dataset.n} 자리"]`)?.click(); }
  }
  // 보기 고르기 (패턴 기차 · 도형 · 단어 축구): 반짝이는 정답이 있으면 그것을, 없으면 아무거나
  const choices = [...document.querySelectorAll('.choice:not([disabled])')];
  if (choices.length && tick % 3 === 0) (document.querySelector('.choice.hint-glow') || any(choices)).click();
  // 소리 기차: 다음 객차에 들어갈 글자 상자
  const train = document.querySelector('.st-train:not(.go)');
  if (train && tick % 2 === 0) {
    const c = train.dataset.w[train.querySelectorAll('.st-car.full').length];
    [...document.querySelectorAll('.st-tile')].find((t) => t.dataset.c === c)?.click();
  }
  // 단어 맞히기: 단추를 누르고, 멈춘 단어와 같은 그림
  document.querySelector('.wm-lever.ready:not([disabled])')?.click();
  if (document.querySelector('.wm-reels.done') && tick % 3 === 0) {
    const w = [...document.querySelectorAll('.wm-reel')].map((r) => r.querySelector('.wm-strip span:last-child').textContent).join('').toLowerCase();
    document.querySelector(`.wm-card[data-w="${w}"]:not([disabled])`)?.click();
  }
  // 우주 정비소
  const scr = document.querySelector('.sr-screen');
  if (scr && tick % 3 === 0) document.querySelector(`.sr-tag[data-w="${scr.dataset.w}"]:not(.up)`)?.click();
  // 젤리 붙이기: 젤리와 맞는 줄
  if (tick % 2 === 0) {
    const rows = [...document.querySelectorAll('.jl-row:not(.whole)')];
    const drop = [...document.querySelectorAll('.jl-drop')].find((d) => rows.some((r) => r.dataset.a === d.dataset.a));
    if (drop) { drop.click(); rows.find((r) => r.dataset.a === drop.dataset.a).click(); }
  }
  // 시계 기차: 바늘을 출발 시각으로 끌고 Go!
  const board = document.querySelector('.ct-board');
  const goBtn = document.querySelector('.ct-go:not([disabled])');
  if (board && goBtn && tick % 4 === 0) {
    const face = document.querySelector('.ct-clock');
    const b = face.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const setHand = (cls, deg) => {
      const knob = face.querySelector(`.ct-hand.${cls} .ct-knob`);
      const k = knob.getBoundingClientRect();
      knob.dispatchEvent(new PointerEvent('pointerdown', { clientX: k.left + k.width / 2, clientY: k.top + k.height / 2, pointerId: 9, bubbles: true }));
      const a = (deg * Math.PI) / 180;
      face.dispatchEvent(new PointerEvent('pointermove', { clientX: cx + 60 * Math.sin(a), clientY: cy - 60 * Math.cos(a), pointerId: 9, bubbles: true }));
      face.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, bubbles: true }));
    };
    if (!document.querySelector('.ct-hand.minute.locked')) setHand('minute', Number(board.dataset.m) * 6);
    setHand('hour', (Number(board.dataset.h) % 12) * 30);
    goBtn.click();
  }
  // 이름표 붙이기: 첫 빈 이름표에 맞는 이름표
  const lbSlot = document.querySelector('.lb-label.empty');
  if (lbSlot && tick % 2 === 0) { const t = [...document.querySelectorAll('.lb-tag')].find((x) => x.dataset.w === lbSlot.dataset.w); if (t) { t.click(); lbSlot.click(); } }
  // 낱말 로켓: 실을 카드 (두 번 누르면 실린다)
  const rk = document.querySelector('.srk-card[data-ok="1"]:not([disabled])');
  if (rk && tick % 2 === 0) { rk.click(); rk.click(); }
  // 동물 마트: 주문서 줄마다 개수만큼 담고 다 담았어요
  const order = document.querySelector('.gr-order');
  const line1 = order?.querySelector('.gr-line');
  if (line1 && !line1.dataset.done && tick % 3 === 0) {
    line1.dataset.done = '1';
    order.querySelectorAll('.gr-line').forEach((l) => { const it = document.querySelector(`.gr-item[data-key="${l.dataset.key}"]`); for (let i = 0; i < Number(l.dataset.n); i++) it?.click(); });
    document.querySelector('.gr-done')?.click();
  }
  // 낱말 조각 맞추기 · 워드 노트
  const wcSlot = document.querySelector('.wc-slot:not(.full)');
  if (wcSlot && tick % 2 === 0) { const t = [...document.querySelectorAll('.wc-tile')].find((x) => x.dataset.c === wcSlot.dataset.c); if (t) { t.click(); wcSlot.click(); } }
  // 십자말풀이: 고른 낱말의 다음 빈칸 글자
  const cw = document.querySelector('.cw-cell.on:not(.full)');
  if (cw && tick % 2 === 0) [...document.querySelectorAll('.cw-tile')].find((x) => x.dataset.c === cw.dataset.c)?.click();
  // 타자 놀이: 다음 자모(쌍자음은 ⇧ 먼저)
  const pad = document.querySelector('.ty-pad');
  if (pad?.dataset.next && tick % 2 === 0) {
    const k = pad.dataset.next;
    const base = { ㅃ: 'ㅂ', ㅉ: 'ㅈ', ㄸ: 'ㄷ', ㄲ: 'ㄱ', ㅆ: 'ㅅ', ㅒ: 'ㅐ', ㅖ: 'ㅔ' }[k];
    const key = (x) => pad.querySelector(`.kb-key[data-k="${CSS.escape(x)}"]`);
    if (base && !key(k)) { key('⇧')?.click(); key(base)?.click(); } else key(k)?.click();
  }
  // 말소리 발표
  if (tick % 2 === 0) document.querySelector('.fa-card[data-ok="1"]:not(.got)')?.click();
  // 문장 다리: 다음 판자 낱말 / 쿠키 · 벽돌: 빈칸에 맞는 조각
  const plank = document.querySelector('.sk-plank:not(.full)');
  if (plank && tick % 2 === 0) [...document.querySelectorAll('.sk-tile')].find((x) => x.dataset.w === plank.dataset.w)?.click();
  const skSlot = document.querySelector('.sk-slot:not(.full)');
  if (skSlot && tick % 2 === 0) { const p = [...document.querySelectorAll('.sk-piece')].find((x) => x.dataset.w === skSlot.dataset.w); if (p) { if (!p.classList.contains('sel')) p.click(); skSlot.click(); } }
  // 떨어지는 글자 받기
  const sbw = document.querySelector('.sb-word');
  if (sbw?.dataset.w) { const c = sbw.dataset.w[sbw.querySelectorAll('.sb-slot.full').length]; document.querySelector(`.sb-ball[data-c="${c}"]`)?.click(); }
  // ---- 수학 놀이 ----
  const q$ = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const once = (el, fn) => { if (el && !el.dataset.solved) { el.dataset.solved = '1'; fn(); } };
  if (tick % 3 === 0) {
    // 작은 농장 · 관람차
    qa('.pn-pen').forEach((pen) => {
      const want = Number(pen.dataset.want);
      pen.click();
      while (pen.querySelectorAll('.pn-animal').length < want && q$('.pn-meadow .pn-animal')) q$('.pn-meadow .pn-animal').click();
    });
    if (q$('.pn-pen')) q$('.pn-go')?.click();
    // 애벌레 · 로켓
    const tiles = qa('.to-tile:not(.eaten)');
    if (tiles.length) {
      const vals = tiles.map((t) => Number(t.dataset.v));
      const v = tiles[0].classList.contains('rocket') ? Math.max(...vals) : Math.min(...vals);
      tiles.find((t) => Number(t.dataset.v) === v).click();
    }
    // 수직선
    const nl = q$('.nl-line');
    if (nl?.dataset.target) q$(`.nl-tick[data-v="${nl.dataset.target}"]`)?.click();
    // 100판 퍼즐
    const hb = q$('.hb-tile');
    if (hb) { hb.click(); q$(`.hb-cell.hole[data-v="${hb.dataset.v}"]`)?.click(); }
    // 자릿값 격자
    const hg = q$('.hg-grid');
    once(hg?.dataset.target ? hg.querySelector('.hg-row') : null, () => {
      const t = Number(hg.dataset.target);
      const rows = qa('.hg-row');
      for (let r = 0; r < Math.floor(t / 10); r++) rows[r].querySelector('.hg-ten').click();
      if (t % 10) rows[Math.floor(t / 10)].querySelectorAll('.hg-cell')[t % 10 - 1].click();
      q$('.place-grid .btn-primary').click();
    });
    // 가게: 큰 돈부터 거슬러 내기
    const tray = q$('.sh-tray');
    once(tray?.dataset.need && !tray.children.length ? q$('.sh-stall').firstElementChild : null, () => {
      let need = Number(tray.dataset.need);
      const coins = qa('.sh-take').map((b) => Number(b.dataset.v)).sort((a, b) => b - a);
      for (const c of coins) while (need >= c) { q$(`.sh-take[data-v="${c}"]`).click(); need -= c; }
      q$('.shop .btn-primary').click();
    });
    // 세로셈
    const sp = q$('.st-pad');
    if (sp?.dataset.next) {
      const n = sp.dataset.next;
      if (n.startsWith('b')) qa('.st-cell.top')[Number(n.slice(1))].click();
      else sp.children[Number(n)].click();
    }
    // 탈리 마크: 긋기 · 나누기 · 자르기
    const tlb = q$('.tl-board');
    once(tlb ? q$('.tl-target b') : null, () => { const t = Number(q$('.tl-target b').textContent); for (let i = 0; i < t; i++) tlb.click(); q$('.tally .btn-primary').click(); });
    const pile = q$('.tl-pile');
    once(pile ? q$('.tl-box') : null, () => { for (let i = 0; i < 60; i++) pile.click(); q$('.tally .btn-primary').click(); });
    const jelly = q$('.tl-jelly');
    once(jelly?.dataset.k ? jelly.firstElementChild : null, () => {
      const k = Number(jelly.dataset.k);
      const g = Number(jelly.dataset.g);
      for (let j = 1; j < g; j++) q$(`.tl-gap[data-i="${j * k - 1}"]`)?.click();
      q$('.tally .btn-primary').click();
    });
    // 분수
    const pz = q$('.fr-pizza');
    once(pz?.dataset.want ? pz.querySelector('.slice') : null, () => { qa('.fr-pizza .slice').slice(0, Number(pz.dataset.want)).forEach((s) => s.dispatchEvent(new MouseEvent('click', { bubbles: true }))); q$('.fraction .btn-primary').click(); });
    const cup = q$('.fr-cup');
    once(cup?.dataset.k ? cup.querySelector('.fr-mark') : null, () => { qa('.fr-mark')[Number(cup.dataset.k) - 1].click(); q$('.fraction .btn-primary').click(); });
    // 그림그래프
    const gi = q$('.gp-item');
    if (gi) { gi.click(); q$(`.gp-col[data-i="${gi.dataset.i}"]`)?.click(); }
    once(q$('.gp-table') && q$('.graph .btn-primary') ? q$('.gp-col') : null, () => {
      qa('.gp-col').forEach((c) => { const w = Number(c.dataset.want); const cells = [...c.querySelectorAll('.gp-cell')].reverse(); cells[w - 1]?.click(); });
      q$('.graph .btn-primary').click();
    });
    // 달걀
    const basket = q$('.eg-basket:not([hidden])');
    if (basket && !q$('.eg-q')) for (let i = 0; i < 70; i++) basket.click();
    // 수식 · 숫자 조합기
    const row = q$('.eq-row');
    once(row && !row.querySelector('.eq-slot[data-v]') ? row.querySelector('.eq-slot') : null, () => {
      let vals = JSON.parse(row.dataset.sol || '[]');
      if (row.closest('.mode-digits')) {
        const ask = q$('.eq-ask').textContent;
        const tiles = qa('.eq-tile').map((t) => t.dataset.v);
        const len = row.querySelectorAll('.eq-slot').length;
        const m = ask.match(/(\d+)을/);
        vals = m ? [...m[1]] : (ask.includes('큰') ? tiles.sort((a, b) => b - a) : tiles.sort((a, b) => a - b)).slice(0, len);
      }
      vals.forEach((v) => qa('.eq-tile').find((t) => t.dataset.v === v && !t.disabled)?.click());
      q$('.equation .btn-primary').click();
    });
    // 떨어지는 도형
    q$('.fs-shape[data-ok="1"]')?.click();
    // 물건 길이 측정: 자를 0에 맞춘다
    const rl = q$('.rl-ruler');
    if (rl && !rl.classList.contains('snap') && rl.dataset.need) { const d = Number(rl.dataset.need); if (d > 0) qa('.rl-move')[1].click(); else if (d < 0) qa('.rl-move')[0].click(); }
    // 데칼코마니
    once(q$('.sy-board .sy-cell:not(.given)'), () => {
      qa('.sy-cell:not(.given)').forEach((cell) => { if (!cell.dataset.want) return; q$(`.sy-color[data-c="${cell.dataset.want}"]`).click(); cell.click(); });
      q$('.symmetry .btn-primary').click();
    });
    // 스도쿠
    const hole = q$('.sd-cell.hole');
    if (hole) { hole.click(); q$(`.sd-key[data-v="${hole.dataset.v}"]`)?.click(); }
    // 길찾기
    const prog = q$('.pa-prog');
    once(prog?.dataset.moves && !prog.querySelector('.pa-slot.full') ? prog.firstElementChild : null, () => {
      [...prog.dataset.moves].forEach((d) => q$(`.pa-block[data-d="${d}"]`).click());
      q$('.track-path .btn-primary').click();
    });
    // 칠교 · 도형 조합
    const slot = q$('.tg-slot:not(.done)');
    if (slot) {
      const piece = qa('.tg-piece').find((p) => p.dataset.type === slot.dataset.type);
      if (piece) {
        piece.click();
        for (let i = 0; i < 4 && piece.dataset.shape !== slot.dataset.shape; i++) q$('.tg-turn').click();
        slot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
  }
  // 플래시 카드 · 그림 조각: choiceSet을 다른 이름으로 쓰는 보기
  const fc = [...document.querySelectorAll('.efc-pickcard:not([disabled]), .efc-bubble:not([disabled])')];
  if (fc.length && tick % 3 === 0) (fc.find((x) => x.classList.contains('hint-glow')) || any(fc)).click();
  // 그림 조각 맞추기(쉬운 단계): 조각을 눌렀다 떼면 제자리로 들어간다
  const ep = document.querySelector('.ep-piece:not(.placed)');
  if (ep && tick % 2 === 0) { ep.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9 })); ep.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 })); }
  // 선 긋기: 같은 짝(id)의 이웃 칸 둘을 차례로 누른다
  const lmBoard = document.querySelector('.lm-board');
  if (lmBoard && tick % 3 === 0) {
    if (window.__lmBoard !== lmBoard) { window.__lmBoard = lmBoard; window.__lmDone = new Set(); }
    const cols = lmBoard.querySelectorAll('.lm-col').length;
    const it = [...lmBoard.querySelectorAll('.lm-item')].find((x) => Number(x.dataset.col) < cols - 1 && !window.__lmDone.has(`${x.dataset.col}-${x.dataset.id}`));
    if (it) {
      window.__lmDone.add(`${it.dataset.col}-${it.dataset.id}`);
      const mate = lmBoard.querySelector(`.lm-item[data-col="${Number(it.dataset.col) + 1}"][data-id="${it.dataset.id}"]`);
      [it, mate].forEach((el) => { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 11 })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 11 })); });
    }
  }
  // 그 밖의 보기 묶음(choiceSet을 다른 이름으로 쓰는 놀이): 반짝이는 정답이 있으면 그것, 없으면 아무거나
  const chs = [...document.querySelectorAll('#__test .choices')].filter((c) => !c.querySelector('.correct') && !c.querySelector('.choice'));
  if (chs.length && tick % 3 === 1) { const bs = [...chs[0].querySelectorAll('button:not([disabled])')]; if (bs.length) (bs.find((b) => b.classList.contains('hint-glow')) || any(bs)).click(); }
  // 스펠링 거품: 반짝이는 거품(틀리면 알려 줌)이 있으면 그것, 없으면 아무거나
  const sbs = [...document.querySelectorAll('.spell-bubble:not([disabled])')];
  if (sbs.length && tick % 2 === 0) (sbs.find((b) => b.classList.contains('hint-glow')) || any(sbs)).click();
  // 카드 짝 찾기: 같은 짝(pid)의 두 장을 차례로 뒤집는다
  const mc = document.querySelector('.mcard:not(.matched):not(.flipped)');
  if (mc && tick % 4 === 0 && !document.querySelector('.mgrid .mcard.flipped:not(.matched)')) {
    mc.click();
    setTimeout(() => document.querySelector(`.mcard[data-pid="${mc.dataset.pid}"]:not(.matched):not(.flipped)`)?.click(), 250);
  }
  // 알파벳 퍼즐: 조각을 고르고 그 글자 자리(--i = 알파벳 순서)를 누른다
  const abp = document.querySelector('.ab-piece');
  if (abp && tick % 2 === 0) {
    if (!abp.classList.contains('sel')) abp.click();
    const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(abp.dataset.l);
    [...document.querySelectorAll('.ab-cell.hole')].find((c) => c.style.getPropertyValue('--i') === String(i))?.click();
  }
  // 그림책: 쪽 넘기기 · 장면 순서대로 누르기
  const bq = [...document.querySelectorAll('.bq-card:not(.placed)')];
  if (bq.length && tick % 2 === 0) bq.find((c) => Number(c.dataset.i) === document.querySelectorAll('.bq-card.placed').length)?.click();
  const pageNext = document.querySelector('.book-nav .btn:last-child');
  if (pageNext && tick % 3 === 0) pageNext.click();
  // 확인 퀴즈: __ckRate(기본 1)의 확률로 정답, 아니면 틀린 보기를 누른다
  const ck = document.querySelector('.ck-opts:not(.wait)');
  if (ck && !ck.querySelector('.ok, .miss') && tick % 3 === 0) {
    const right = Math.random() < (window.__ckRate ?? 1);
    ck.querySelector(`.ck-opt[data-a="${right ? 1 : 0}"]`)?.click();
  }
  // 영어 챌린지: 확인 퀴즈와 같은 방식(__ckRate)
  const ech = document.querySelector('.ech.go .ech-opts:not(.wait)');
  if (ech && !ech.querySelector('.ok, .miss') && tick % 3 === 0) {
    ech.querySelector(`.ech-opt[data-a="${Math.random() < (window.__ckRate ?? 1) ? 1 : 0}"]`)?.click();
  }
  // 영상 기준 읽기 놀이: 빈 곳(data-w)에 맞는 조각을 고르고 빈 곳을 누른다
  if (tick % 3 === 0) {
    const gap = document.querySelector('.ib-gap:not(.full), .mw-slot:not(.full), .fs-slot:not(.full), .ss-slot, .lb-title-slot.empty, .lb-book .lb-label.empty');
    if (gap) {
      const want = gap.dataset.w;
      const piece = [...document.querySelectorAll('.ib-ice, .mw-chip, .fs-plank, .ss-note, .lb-sticker')].find((x) => x.dataset.w === want);
      if (piece) { piece.click(); if (gap.isConnected && !gap.classList.contains('full')) gap.click(); }
    }
    const brick = document.querySelector('.sb-brick[data-ok="1"]:not(.broken)');
    if (brick) brick.click();
    const cell = document.querySelector('.bt-cell.now');
    if (cell) document.querySelector(`.bt-key[data-c="${CSS.escape(cell.dataset.c)}"]`)?.click();
    document.querySelector('.ech-next')?.click();
  }
  // 떨어지는 별: __ckRate의 확률로 맞는 보기
  const sfc = document.querySelector('.sf-choices');
  if (sfc && document.querySelector('.sf-star:not(.caught):not(.landed)') && tick % 4 === 0) sfc.querySelector(`.sf-choice[data-ok="${Math.random() < (window.__ckRate ?? 1) ? 1 : 0}"]`)?.click();
  // 메신저: 울리는 전화를 받는다
  document.querySelector('.msg-screen.ringing .msg-phone')?.click();
  // 낙하탑: __ckRate의 확률로 맞는 글자, 아니면 틀린 글자 (게임 오버면 끝내기)
  const tdk = document.querySelector('.td-keys');
  if (tdk && tick % 3 === 0) {
    const end = document.querySelector('.td-over:not([hidden]) .btn-ghost');
    if (end) end.click();
    else tdk.querySelector(`.td-key[data-ok="${Math.random() < (window.__ckRate ?? 1) ? 1 : 0}"]:not(:disabled)`)?.click();
  }
  const mon = document.querySelector('.tf-mon:not(.happy)');
  if (mon && tick % 2 === 0) {
    const toy = [...document.querySelectorAll('.tf-toy')].find((t) => t.dataset.word === mon.dataset.want);
    if (toy) { if (!toy.classList.contains('sel')) toy.click(); mon.querySelector('.tf-hold').click(); }
  }
}

export const play = (name, level, conf = {}, limit = 120000) => new Promise((res) => {
  runGame(name, level, conf).then(() => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      try { solve(); } catch (e) { window.__errs.push(`solver ${e.message}`); }
      if (window.__st.finished || Date.now() - t0 > limit || window.__errs.length) {
        clearInterval(iv);
        res({ finished: window.__st.finished, ms: Date.now() - t0, errs: window.__errs.splice(0) });
      }
    }, 150);
  });
});

// 영어 차시 시험: 차시마다 오늘의 할 일 후보 놀이를 모두 그 차시 내용으로 끝까지 푼다
// __enBatch(['A-1', 'G-2']) 또는 __enBatch() (96차시 모두). 결과는 __out
window.__enBatch = async (ids = null, { only = null } = {}) => {
  if (window.__busy) return 'busy';
  const { EN_UNITS, planForUnit } = await import('/js/enCurriculum.js');
  const { enUnitOf } = await import('/js/enLesson.js');
  const { GAMES } = await import('/js/data.js');
  window.__out = [];
  window.__busy = true;
  (async () => {
    for (const u of EN_UNITS.filter((x) => !ids || ids.includes(x.id))) {
      const keys = [...new Set(planForUnit(u).flatMap((sl) => sl.pool))].filter((k) => !only || only.includes(k));
      for (const key of keys) {
        const g = GAMES[key];
        const unit = enUnitOf(EN_UNITS.indexOf(u));
        const r = await play(g.module, unit.level, { opts: g.opts || {}, lang: 'en', unit }, 90000);
        window.__out.push(`${u.id} ${key} L${unit.level}: ${r.finished ? `${r.finished.firstTry}/${r.finished.total}` : 'NOT FINISHED'} ${Math.round(r.ms / 1000)}s ${r.errs.join(' | ')}`);
      }
    }
    window.__busy = false;
  })();
  return 'started';
};

// 영어 차시 빠른 점검: 차시마다 후보 놀이를 그 차시 내용으로 띄워 보기만 한다 (오류 · 빈 화면 · undefined 글자)
window.__enSmoke = async (ids = null) => {
  if (window.__busy) return 'busy';
  const { EN_UNITS, planForUnit } = await import('/js/enCurriculum.js');
  const { enUnitOf } = await import('/js/enLesson.js');
  const { GAMES } = await import('/js/data.js');
  window.__out = [];
  window.__busy = true;
  window.__smokeN = 0;
  (async () => {
    for (const u of EN_UNITS.filter((x) => !ids || ids.includes(x.id))) {
      for (const key of [...new Set(planForUnit(u).flatMap((sl) => sl.pool))]) {
        const g = GAMES[key];
        const unit = enUnitOf(EN_UNITS.indexOf(u));
        const st = await runGame(g.module, unit.level, { opts: g.opts || {}, lang: 'en', unit });
        await new Promise((r) => setTimeout(r, 700));
        const txt = st.stage.textContent;
        const bad = [];
        if (!st.stage.children.length) bad.push('empty');
        if (/undefined|NaN|\[object/.test(txt)) bad.push(`text: ${txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/)?.[0]}`);
        const errs = window.__errs.splice(0);
        if (bad.length || errs.length) window.__out.push(`${u.id} ${key}: ${[...bad, ...errs].join(' | ')}`);
        st.stop();
        window.__smokeN++;
      }
    }
    window.__busy = false;
  })();
  return 'started';
};

window.__batch = (jobs, levels = [1, 3, 5]) => {
  if (window.__busy) return 'busy';
  window.__out = [];
  window.__busy = true;
  (async () => {
    for (const [name, conf] of jobs) {
      for (const L of conf.levels || levels) {
        const r = await play(name, L, conf);
        const tag = `${name}${conf.opts ? JSON.stringify(conf.opts) : ''}${conf.lang ? ` ${conf.lang}` : ''}${conf.lesson ? ` 차시${conf.lesson.index}(${conf.lesson.kind})` : ''}`;
        window.__out.push(`${tag} L${L}: ${r.finished ? `${r.finished.firstTry}/${r.finished.total}` : 'NOT FINISHED'} ${Math.round(r.ms / 1000)}s ${r.errs.join(' | ')}`);
      }
    }
    window.__busy = false;
  })();
  return 'started';
};
