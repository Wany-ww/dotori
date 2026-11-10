import { h, shuffle, pickN, wiggle, cheer, burst, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { VOCAB, VOCAB2, WORDS, WORDS2 } from '../data.js';

const R = 4;
// 단계별: 조각 판 (가로 × 세로), 맞춘 뒤 단어 고르기(보기 수, 0이면 없음), 그냥 눌러도 제자리에 들어가는지
const CFG = [
  { grid: [2, 1], pick: 0, tap: true },
  { grid: [3, 1], pick: 0, tap: true },
  { grid: [2, 2], pick: 0, tap: false },
  { grid: [2, 2], pick: 3, tap: false },
  { grid: [3, 2], pick: 3, tap: false },
];

// 조각 모양: 격자의 안쪽 경계마다 볼록한 혹(퍼즐 이음새)을 달아 polygon(%)으로 만든다
function jigsaw(cols, rows, rand) {
  const W = 100 / cols;
  const H = 100 / rows;
  const knob = Math.min(W, H) * 0.2;
  const sign = () => (rand() < 0.5 ? -1 : 1);
  const hb = Array.from({ length: rows + 1 }, (_, r) => Array.from({ length: cols }, () => (r === 0 || r === rows ? 0 : sign() * knob)));
  const vb = Array.from({ length: cols + 1 }, (_, c) => Array.from({ length: rows }, () => (c === 0 || c === cols ? 0 : sign() * knob)));
  // a→b 직선에 bump만큼 가운데가 부푼 이음새 (horiz: 가로선이면 y로, 세로선이면 x로 부푼다)
  const edge = (a, b, bump, horiz) => {
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const t = k / 16;
      const s = t > 0.32 && t < 0.68 ? Math.sin(Math.PI * (t - 0.32) / 0.36) ** 0.7 : 0;
      const x = a[0] + (b[0] - a[0]) * t + (horiz ? 0 : bump * s);
      const y = a[1] + (b[1] - a[1]) * t + (horiz ? bump * s : 0);
      pts.push([x, y]);
    }
    return pts;
  };
  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * W;
      const x1 = x0 + W;
      const y0 = r * H;
      const y1 = y0 + H;
      const pts = [
        ...edge([x0, y0], [x1, y0], hb[r][c], true),
        ...edge([x1, y0], [x1, y1], vb[c + 1][r], false),
        ...edge([x0, y1], [x1, y1], hb[r + 1][c], true).reverse(),
        ...edge([x0, y0], [x0, y1], vb[c][r], false).reverse(),
      ];
      pieces.push({
        clip: `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`,
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
      });
    }
  }
  return pieces;
}

// 그림 조각 맞추기(EasyPuzzle): 그림자 틀에 그림 조각을 끌어다 맞추면 단어가 나타나고 읽어 준다
// 한글판(그림 조각 맞추기, ctx.lang 'ko'): 한글 낱말 그림으로, 맞추면 그림이 움직이고 낱말을 읽어 준다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const ko = ctx.lang !== 'en';
  const lang = ko ? 'ko-KR' : 'en-US';
  const koPool = (list) => list.map((x) => ({ w: x.word, e: x.emoji }));
  const pool = ko ? (ctx.level >= 4 ? koPool([...WORDS, ...WORDS2]) : koPool(WORDS)) : ctx.unit ? ctx.unit.words(8) : ctx.level >= 4 ? [...VOCAB, ...VOCAB2] : VOCAB;
  const words = pickN(pool, R);
  const hinter = makeHinter();
  const frame = h('div', { class: 'ep-frame' });
  const label = h('div', { class: `ep-word${ko ? '' : ' latin'}`, 'aria-live': 'polite' });
  const below = h('div', { class: 'ep-below' });
  const card = h('div', { class: 'ep-card' }, frame);
  // 조각은 틀 아래 바닥(ep-zone)에 흩어져 있다가, 다 맞추면 그 자리에 단어가 나온다
  const wrap = h('div', { class: 'easy-puzzle' }, card, h('div', { class: 'ep-zone' }, label, below));
  stage.append(wrap);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const it = words[n];
    const [cols, rows] = cfg.grid;
    const shapes = jigsaw(cols, rows, Math.random);
    let left = shapes.length;
    let miss = 0;
    label.textContent = '';
    label.classList.remove('show');
    below.replaceChildren();
    card.classList.remove('done', 'react');

    const shadow = h('div', { class: 'ep-shadow', 'aria-hidden': 'true' }, it.e);
    // 조각은 틀과 같은 크기의 그림을 잘라 낸 것: 처음엔 틀 아래 바닥에 겹치지 않게 줄지어 흩어 둔다
    // (단위는 틀 크기의 %: 화면 폭이 허락하는 만큼 틀 바깥 양옆까지 펼친다)
    // (처음 그릴 때는 아직 자리가 잡히기 전이라, 틀과 무대 폭을 CSS와 같은 식으로 셈한다)
    const vw = innerWidth || document.documentElement.clientWidth || 1024;
    const vh = innerHeight || document.documentElement.clientHeight || 768;
    const fw = Math.min(250, vw * 0.48, vh * 0.34);
    const room = Math.max(1, (Math.min(920, vw) - 48) / fw);
    const pw = 100 / cols + 16;
    const ph = 100 / rows + 16;
    const perLine = Math.max(1, Math.min(shapes.length, Math.floor((room * 100) / pw)));
    const lines = Math.ceil(shapes.length / perLine);
    wrap.style.setProperty('--zh', ((lines * ph) / 100 + 0.1).toFixed(2));
    const spots = shuffle(shapes.map((_, i) => i));
    const pieces = shapes.map((s, i) => {
      const slot = spots[i];
      const line = Math.floor(slot / perLine);
      const inLine = Math.min(perLine, shapes.length - line * perLine);
      const k = slot % perLine;
      const home = {
        x: 50 + (k - (inLine - 1) / 2) * pw - s.cx + (Math.random() - 0.5) * 6,
        y: 108 + (line + 0.5) * ph - s.cy + Math.random() * 4,
      };
      const p = h('div', {
        class: 'ep-piece',
        role: 'button',
        tabindex: '0',
        'aria-label': `${it.w} 그림 조각 ${i + 1}`,
        style: { animationDelay: `${0.2 + i * 0.1}s` },
      }, h('span', { class: 'ep-cut', style: { clipPath: s.clip } }, it.e));
      p.style.translate = `${home.x}% ${home.y}%`;
      const ghost = h('div', { class: 'ep-ghost', style: { clipPath: s.clip }, 'aria-hidden': 'true' });
      let drag = null;
      let pos = { ...home };

      const set = (x, y) => {
        pos = { x, y };
        p.style.translate = `${x}% ${y}%`;
      };
      const snap = () => {
        p.classList.add('placed');
        p.style.translate = '0% 0%';
        p.removeAttribute('tabindex');
        hinter.reset();
        ghost.classList.remove('hint');
        sfx.pop();
        left--;
        ctx.progress(n + (shapes.length - left) / shapes.length * 0.8, R);
        if (left === 0) complete();
      };
      const wrong = () => {
        miss++;
        wiggle(p);
        ghost.classList.add('hint');
        hinter.miss(null);
      };

      p.addEventListener('pointerdown', (e) => {
        if (p.classList.contains('placed')) return;
        try { e.target.setPointerCapture(e.pointerId); } catch {}
        const fr = frame.getBoundingClientRect();
        drag = { sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y, w: fr.width, h: fr.height, moved: false };
        p.classList.add('lift');
      });
      p.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) < 8) return;
        drag.moved = true;
        set(drag.x + (dx / drag.w) * 100, drag.y + (dy / drag.h) * 100);
      });
      const up = () => {
        if (!drag) return;
        const { moved } = drag;
        drag = null;
        p.classList.remove('lift');
        if (!moved) {
          // 눌러서 맞추기: 쉬운 단계는 제자리로 쏙, 그 위로는 들어갈 자리를 반짝여 알려 준다
          if (cfg.tap) snap();
          else {
            sfx.tap();
            ghost.classList.add('hint');
            setTimeout(() => ghost.classList.remove('hint'), 900);
          }
          return;
        }
        if (Math.hypot(pos.x, pos.y) < 16) snap();
        else if (Math.abs(pos.x) < 40 && Math.abs(pos.y) < 40) wrong();
      };
      p.addEventListener('pointerup', up);
      p.addEventListener('pointercancel', up);
      p.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !p.classList.contains('placed')) {
          e.preventDefault();
          snap();
        }
      });
      return [ghost, p];
    });
    frame.replaceChildren(shadow, ...pieces.map(([g]) => g), ...pieces.map(([, p]) => p));

    function complete() {
      card.classList.add('done');
      sfx.correct();
      burst(frame);
      label.textContent = it.w;
      ctx.later(() => card.classList.add('react'), 450);
      // 높은 단계는 단어를 보여 주거나 읽어 주기 전에 먼저 골라 보게 한다
      if (cfg.pick) {
        ctx.later(askWord, 1300);
        return;
      }
      ctx.later(() => {
        label.classList.add('show');
        speak(it.w, lang);
      }, 450);
      if (miss === 0) firstTry++;
      ctx.later(() => cheer(label, ko ? 'ko' : 'en'), 700);
      next(2600);
    }

    // 높은 단계: 다 맞춘 뒤 그림에 맞는 단어 카드를 고른다
    function askWord() {
      const opts = shuffle([it, ...pickN(pool.filter((v) => v.w !== it.w), cfg.pick - 1)]);
      below.replaceChildren(choiceSet(opts, {
        answer: it,
        hinter,
        cls: `choice word${ko ? '' : ' latin'} ep-choice`,
        render: (o) => o.w,
        onCorrect: (btn, m) => {
          if (miss === 0 && m === 0) firstTry++;
          label.classList.add('show');
          cheer(btn, ko ? 'ko' : 'en');
          speak(it.w, lang);
          next(1800);
        },
      }));
      if (ko) speak('어떤 낱말일까요?');
      else speak('Which word is it?', 'en-US');
    }

    ctx.prompt(
      cfg.tap ? '그림 조각을 그림자 자리로 끌어다 놓아요. 눌러도 쏙 들어가요!' : '그림 조각을 그림자 자리에 꼭 맞게 끌어다 놓아요!',
      () => (ko ? speak('조각을 맞춰서 그림을 완성해요!') : speak('Put the pieces together!', 'en-US')),
    );
  }

  function next(ms) {
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, ms);
  }

  round();
}
