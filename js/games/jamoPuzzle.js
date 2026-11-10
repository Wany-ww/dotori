import { h, shuffle, wiggle, pop, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO, JUNG, JONG, CHO_SOUND, JUNG_SOUND, JONG_SOUND, JAMO_NAME, compose, decompose, objJosa } from '../data.js';

const VERTICAL = new Set(['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅒ', 'ㅖ']);
const R = 5;
const soundOf = (k, x) => ({ cho: CHO_SOUND, jung: JUNG_SOUND, jong: JONG_SOUND })[k][x] || JAMO_NAME[x] || x;

// 낱말에서 블록으로 만들 글자: 이 차시에서 배우는 낱자가 들어간 글자 (없으면 첫 글자)
function puzzleWords(lesson) {
  const key = { cho: 'c', jung: 'j', jong: 't' }[lesson.slot];
  return lesson.words(R * 3, { pic: true, maxLen: 3 }).map((w) => {
    const syls = [...w.word];
    let at = syls.findIndex((s) => {
      const d = decompose(s);
      if (!d) return false;
      const p = { c: CHO[d.c], j: JUNG[d.j], t: d.t ? JONG[d.t] : '' };
      return key ? lesson.focus.includes(p[key]) : lesson.batchim ? Boolean(p.t) : true;
    });
    if (at < 0) at = 0;
    const d = decompose(syls[at]);
    return d && { word: w.word, emoji: w.emoji, at, parts: [CHO[d.c], JUNG[d.j], d.t ? JONG[d.t] : ''] };
  }).filter(Boolean).slice(0, R);
}

export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const rounds = puzzleWords(lesson);
  const extra = { cho: [1, 1, 2, 2, 3][L - 1], jung: [0, 1, 1, 2, 2][L - 1], jong: L >= 5 ? 2 : 1 };
  // 함정 블록은 지금까지 배운 낱자에서
  const CHO_POOL = lesson.known.cons.length > 3 ? lesson.known.cons : ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
  const JUNG_POOL = lesson.known.vows.length > 3 ? lesson.known.vows : ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'];
  const singles = lesson.known.fins.filter((x) => 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㅆ'.includes(x));
  const JONG_POOL = singles.length > 2 ? singles : ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
  const hinter = makeHinter();
  const root = h('div', { class: 'puzzle' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const w = rounds[n];
    const [c, j, t] = w.parts;
    const syl = compose(c, j, t || 0);
    const cv = compose(c, j);
    let filled = 0;
    let roundMiss = 0;

    const mkSlot = (need, kind, label) => h('div', { class: 'slot', 'data-need': need, 'data-kind': kind, 'aria-label': label }, h('span', { class: 'ghost' }, need));
    const slots = [mkSlot(c, 'cho', '첫소리 자리'), mkSlot(j, 'jung', '가운뎃소리 자리')];
    if (t) slots.push(mkSlot(t, 'jong', '받침 자리'));
    const frame = h('div', { class: `syll-frame ${VERTICAL.has(j) ? 'lr' : 'tb'}${t ? ' has-jong' : ''}` }, slots);

    const pieces = [{ t: c, k: 'cho' }, { t: j, k: 'jung' }];
    if (t) pieces.push({ t, k: 'jong' });
    shuffle(CHO_POOL.filter((x) => x !== c && x !== t)).slice(0, extra.cho).forEach((x) => pieces.push({ t: x, k: 'cho' }));
    shuffle(JUNG_POOL.filter((x) => x !== j)).slice(0, extra.jung).forEach((x) => pieces.push({ t: x, k: 'jung' }));
    if (t) shuffle(JONG_POOL.filter((x) => x !== t && x !== c)).slice(0, extra.jong).forEach((x) => pieces.push({ t: x, k: 'jong' }));
    const tiles = shuffle(pieces).map((o) => h('button', { class: 'tile', type: 'button', 'data-jamo': o.t, 'data-kind': o.k, 'aria-label': `${o.t} 블록` }, o.t));

    const syls = [...w.word];
    const wordText = h('span', { class: 'word-text' }, syls.map((s, i) => (i === w.at ? h('u', {}, s) : s)));
    root.replaceChildren(
      h('div', { class: 'word-card' }, h('span', { class: 'word-emoji', 'aria-hidden': 'true' }, wordPic(w.word, w.emoji)), wordText),
      frame,
      h('div', { class: 'tile-tray' }, tiles),
    );
    const josa = objJosa(syl);
    ctx.prompt(
      t ? `받침 글자 '${syl}'${josa} 만들어요! 받침은 아래 칸에 넣어요.` : `'${syl}'${josa} 만들어요! 나무 블록을 끌어서 틀에 끼워 보세요.`,
      () => speak([w.word, syl, '글자를 만들어 볼까요?']),
    );

    const slideBack = (tile) => {
      tile.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      tile.style.transform = '';
      setTimeout(() => { tile.style.transition = ''; }, 420);
    };
    const neededTileFor = (slot) => tiles.find((x) => x.dataset.jamo === slot.dataset.need && !x.disabled);
    const slotSound = (slot) => soundOf(slot.dataset.kind, slot.dataset.need);

    function place(tile, slot) {
      tile.classList.add('used');
      tile.disabled = true;
      tile.style.transform = '';
      slot.dataset.filled = '1';
      slot.replaceChildren(tile.dataset.jamo);
      pop(slot);
      sfx.pop();
      hinter.reset();
      filled++;
      if (filled < slots.length) {
        speak(slotSound(slot));
        return;
      }
      ctx.later(async () => {
        frame.classList.add('merged');
        frame.replaceChildren(h('span', { class: 'syll-big' }, syl));
        wordText.replaceChildren(...syls.map((s, i) => (i === w.at ? h('b', {}, s) : s)));
        sfx.correct();
        cheer(frame);
        if (roundMiss === 0) firstTry++;
        // 낱자 소리를 차례로 이어 읽고, 글자와 낱말을 읽어 준다 (그, 아, 가, 응 → 강)
        const parts = t ? [soundOf('cho', c), soundOf('jung', j), cv, soundOf('jong', t)] : [soundOf('cho', c), soundOf('jung', j)];
        await speak([...parts, syl, w.word]);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 500);
      }, 300);
    }

    function attempt(tile, slot, moved) {
      slots.forEach((s) => s.classList.remove('over'));
      if (!slot) {
        if (moved) slideBack(tile);
        return;
      }
      if (!slot.dataset.filled && slot.dataset.need === tile.dataset.jamo) {
        place(tile, slot);
        return;
      }
      roundMiss++;
      wiggle(tile);
      slideBack(tile);
      if (!slot.dataset.filled) hinter.miss(neededTileFor(slot));
      else sfx.wrong();
    }

    const slotAt = (x, y) => slots.find((s) => {
      const r = s.getBoundingClientRect();
      return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
    });

    tiles.forEach((tile) => {
      tile.addEventListener('pointerdown', (e) => {
        if (tile.disabled) return;
        e.preventDefault();
        try { tile.setPointerCapture(e.pointerId); } catch {}
        const sx = e.clientX;
        const sy = e.clientY;
        let moved = false;
        tile.classList.add('dragging');
        sfx.tap();
        const move = (ev) => {
          const dx = ev.clientX - sx;
          const dy = ev.clientY - sy;
          if (Math.hypot(dx, dy) > 8) moved = true;
          tile.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
          const r = tile.getBoundingClientRect();
          const over = slotAt(r.left + r.width / 2, r.top + r.height / 2);
          slots.forEach((s) => s.classList.toggle('over', s === over && !s.dataset.filled));
        };
        const up = () => {
          tile.removeEventListener('pointermove', move);
          tile.removeEventListener('pointerup', up);
          tile.removeEventListener('pointercancel', up);
          tile.classList.remove('dragging');
          if (!moved) {
            tile.style.transform = '';
            const target = slots.find((s) => s.dataset.kind === tile.dataset.kind && !s.dataset.filled)
              || slots.find((s) => s.dataset.kind === tile.dataset.kind);
            attempt(tile, target, false);
            return;
          }
          const r = tile.getBoundingClientRect();
          attempt(tile, slotAt(r.left + r.width / 2, r.top + r.height / 2), true);
        };
        tile.addEventListener('pointermove', move);
        tile.addEventListener('pointerup', up);
        tile.addEventListener('pointercancel', up);
      });
    });
  }

  round();
}
