import { h, shuffle, pick, pickN, randInt, wiggle, pop, cheer, burst, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_KICK } from '../data.js';
import { EN_SENT, EN_CHUNKS, EN_NOTES } from '../content.js';

const say = (t) => speak(t, 'en-US');
const parse = ([e, s, pos, lv]) => {
  const m = s.match(/^(.*?)\{(.+?)\}(.*)$/);
  return { e, pos, lv, before: m[1].trim(), answer: m[2], after: m[3].trim(), text: s.replace(/[{}]/g, '') };
};
const SENT = EN_SENT.map(parse);
// 단계에 맞는 문장 (모자라면 한 단계 아래까지)
const sentFor = (L, k) => {
  const at = SENT.filter((x) => x.lv === L);
  return pickN(at.length >= k ? at : [...at, ...SENT.filter((x) => x.lv === Math.max(1, L - 1))], k);
};
const wrongFor = (it, k) => pickN([...new Set(SENT.filter((x) => x.pos === it.pos && x.answer !== it.answer).map((x) => x.answer))], k);
const blankEl = () => h('span', { class: 'sk-blank', 'aria-label': '빈칸' });
const line = (...parts) => h('p', { class: 'sk-line latin' }, ...parts.filter((x) => x !== '' && x != null));

const TELL = {
  bridge: ['낱말 판자를 문장 순서대로 눌러 다리를 놓아요. 친구가 다리를 건널 수 있게요!', "Let's build the bridge!"],
  maker: ['문장을 만들려면 어떤 단어가 필요할까요? 그림을 보고 빈칸을 채워요!', 'Fill in the blank!'],
  cookie: ['쿠키를 상자의 빈칸에 넣어 문장을 완성해요. 짜잔!', 'Put the cookies in the box!'],
  bricks: ['빈칸에 알맞은 단어 공을 골라 벽돌에 던지면 문장이 완성되고 벽돌이 깨져요!', 'Break the bricks!'],
  sticky: ['빈칸에 가장 잘 맞는 메모지를 붙여 문장을 완성해요!', 'Which note fits best?'],
  ice: ['펭귄이 생선을 먹으러 갈 수 있게, 빈 곳에 알맞은 얼음 조각을 맞춰요!', 'Help the penguin!'],
  ship: ['문장에 빠진 조각(낱말 · 구 · 절)을 끼워 배를 고쳐요!', "Let's fix the ship!"],
  missing: ['공책에서 글자가 사라졌어요! 빈칸에 사라진 글자를 채워 글을 완성해요.', 'Find the missing letters!'],
};

// 영어 문장 놀이 모음 (opts.mode): 문장 다리 만들기 · 빈칸 채우기 · 쿠키 박스 · 문장 벽돌 · 문장 메모 · 얼음 맞추기 · 배를 고치자 · 글자가 사라졌다
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const hinter = makeHinter();
  const scene = h('div', { class: 'sk-scene' });
  const play = h('div', { class: 'sk-play' });
  const below = h('div', { class: 'sk-below' });
  stage.append(h('div', { class: `sentence-kit mode-${mode}` }, scene, play, below));
  let n = 0;
  let firstTry = 0;
  let total = 0;
  let rounds = [];

  const next = (ms = 2000) => ctx.later(() => {
    n++;
    if (n >= rounds.length) ctx.finish({ firstTry, total });
    else run();
  }, ms);
  const win = (text, el) => {
    sfx.correct();
    cheer(el || play, 'en');
    say(text);
  };

  // 하나 고르기 (빈칸 채우기 · 문장 메모 · 얼음 맞추기 · 배를 고치자)
  function choose(q, { cls = '', onDone } = {}) {
    total++;
    const blank = blankEl();
    play.replaceChildren(h('div', { class: `sk-card ${cls}` }, q.e ? h('span', { class: 'sk-e', 'aria-hidden': 'true' }, q.e) : null, line(q.before, blank, q.after)));
    below.replaceChildren(choiceSet(shuffle([q.answer, ...q.wrong]), {
      answer: q.answer,
      hinter,
      cls: `choice word latin sk-opt ${cls}`,
      onCorrect: (b, miss) => {
        if (miss === 0) firstTry++;
        blank.textContent = q.answer;
        blank.classList.add('full');
        pop(blank);
        win(q.text, blank);
        onDone?.();
        next(2200);
      },
    }));
  }

  // 순서대로 누르기 (문장 다리 만들기)
  function order(it) {
    const words = it.text.split(' ');
    total++;
    let at = 0;
    let missed = false;
    const planks = words.map((w) => h('span', { class: 'sk-plank', 'data-w': w }));
    const walker = h('span', { class: 'sk-walker', 'aria-hidden': 'true' }, pick(['🐻', '🐰', '🦊', '🐼']));
    scene.replaceChildren(h('div', { class: 'sk-river' }, h('span', { class: 'sk-bank', 'aria-hidden': 'true' }), h('div', { class: 'sk-bridge' }, ...planks), h('span', { class: 'sk-bank far', 'aria-hidden': 'true' }, '🏠'), walker));
    play.replaceChildren(h('div', { class: 'sk-card' }, h('span', { class: 'sk-e', 'aria-hidden': 'true' }, it.e), h('button', { class: 'sk-ear', type: 'button', 'aria-label': '문장 듣기', onclick: () => say(it.text) }, '🔊')));
    const tiles = shuffle(words.map((w, i) => ({ w, i }))).map(({ w }) => {
      const t = h('button', { class: 'sk-tile latin', type: 'button' }, w);
      t.dataset.w = w;
      t.addEventListener('click', () => {
        if (w !== words[at]) {
          missed = true;
          wiggle(t);
          hinter.miss(tiles.find((x) => x.isConnected && x.dataset.w === words[at]));
          return;
        }
        hinter.reset();
        sfx.pop();
        t.remove();
        planks[at].textContent = w;
        planks[at].classList.add('full');
        pop(planks[at]);
        at++;
        walker.style.setProperty('--x', `${(at / words.length) * 100}%`);
        if (at < words.length) return;
        if (!missed) firstTry++;
        walker.classList.add('across');
        win(it.text, scene);
        next(2600);
      });
      return t;
    });
    below.replaceChildren(h('div', { class: 'sk-tiles' }, ...tiles));
  }

  // 여러 빈칸 채우기 (쿠키 박스 · 문장 벽돌): 조각을 고르고 빈칸을 누른다
  function multi(items, { cls, piece }) {
    const blanks = [];
    const rows = items.map((it) => {
      const parts = it.parts.map((p) => {
        if (typeof p === 'string') return p;
        const b = h('button', { class: 'sk-blank sk-slot', type: 'button', 'aria-label': '빈칸' });
        b.dataset.w = p.w;
        blanks.push(b);
        return b;
      });
      return h('div', { class: `sk-row ${cls}` }, it.e ? h('span', { class: 'sk-e', 'aria-hidden': 'true' }, it.e) : null, line(...parts.flatMap((p, i) => (i ? [' ', p] : [p]))));
    });
    total += blanks.length;
    play.replaceChildren(h('div', { class: `sk-board ${cls}` }, ...rows));
    let sel = null;
    const words = shuffle([...blanks.map((b) => b.dataset.w), ...items.flatMap((it) => it.traps || [])]);
    const pieces = words.map((w, i) => {
      const p = h('button', { class: `sk-piece latin ${piece}`, type: 'button', style: { '--r': `${randInt(-6, 6)}deg`, animationDelay: `${i * 0.06}s` } }, w);
      p.dataset.w = w;
      p.dataset.miss = '0';
      p.addEventListener('click', () => {
        sfx.tap();
        say(w);
        sel?.classList.remove('sel');
        sel = sel === p ? null : p;
        sel?.classList.add('sel');
      });
      return p;
    });
    below.replaceChildren(h('div', { class: 'sk-tiles' }, ...pieces));
    blanks.forEach((b) => b.addEventListener('click', () => {
      if (!sel || b.classList.contains('full')) return;
      if (sel.dataset.w !== b.dataset.w) {
        sel.dataset.miss = '1';
        wiggle(sel);
        wiggle(b);
        hinter.miss(pieces.find((x) => x.isConnected && x.dataset.w === b.dataset.w));
        return;
      }
      hinter.reset();
      if (sel.dataset.miss === '0') firstTry++;
      sel.remove();
      sel = null;
      b.textContent = b.dataset.w;
      b.classList.add('full');
      pop(b);
      sfx.pop();
      const row = b.closest('.sk-row');
      if (![...row.querySelectorAll('.sk-slot')].every((x) => x.classList.contains('full'))) return;
      const it = items[rows.indexOf(row)];
      row.classList.add('done');
      if (cls === 'brick') burst(row, ['💥', '✨', '🧱']);
      say(it.text);
      if (!blanks.every((x) => x.classList.contains('full'))) return;
      below.replaceChildren();
      ctx.later(() => { win(items.length > 1 ? 'Great job!' : it.text); next(2200); }, 1200);
    }));
  }

  // 글자가 사라졌다: 공책 글의 빈 글자를 하나씩 채운다
  function notes(text) {
    const k = [2, 3, 3, 4, 5][L - 1];
    const words = text.split(' ');
    const cand = words.map((w, i) => ({ w: w.replace(/[^a-zA-Z]/g, ''), i })).filter((x) => x.w.length >= 3);
    const picks = pickN(cand, Math.min(k, cand.length)).sort((a, b) => a.i - b.i).map((x) => {
      const letters = [...x.w];
      const vowels = letters.map((c, j) => ('aeiou'.includes(c) ? j : -1)).filter((j) => j >= 0);
      const j = L <= 2 && vowels.length ? pick(vowels) : randInt(1, letters.length - 1);
      return { ...x, j, ch: letters[j].toLowerCase() };
    });
    total += picks.length;
    const gaps = [];
    const paper = h('div', { class: 'sk-notebook latin' }, words.map((w, i) => {
      const p = picks.find((x) => x.i === i);
      if (!p) return h('span', {}, `${w} `);
      const g = h('span', { class: 'sk-gap' }, '_');
      gaps.push({ p, g });
      const letters = [...w];
      const at = w.indexOf(p.w) + p.j;
      return h('span', {}, letters.slice(0, at).join(''), g, letters.slice(at + 1).join(''), ' ');
    }));
    play.replaceChildren(paper);
    let gi = 0;
    const ask = () => {
      const { p, g } = gaps[gi];
      gaps.forEach((x) => x.g.classList.toggle('on', x === gaps[gi]));
      const wrong = pickN([...(L <= 2 ? 'aeiou' : 'abcdefghijklmnopqrstuvwxyz')].filter((c) => c !== p.ch), 2);
      below.replaceChildren(choiceSet(shuffle([p.ch, ...wrong]), {
        answer: p.ch,
        hinter,
        cls: 'choice latin sk-letter',
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          g.textContent = p.ch;
          g.classList.add('full');
          pop(g);
          say(p.w);
          gi++;
          if (gi < gaps.length) { ctx.later(ask, 700); return; }
          below.replaceChildren();
          ctx.later(() => { win(text, paper); next(3200); }, 900);
        },
      }));
    };
    ask();
  }

  // 영어 차시: 오늘 문장으로 판을 만든다 (빈칸의 보기는 문장마다 정해 둔 함정 말)
  const unit = ctx.unit;
  const us = (k) => unit.sentences(k);
  const wrongOf = (it, k) => (it.wrong ? it.wrong.slice(0, k) : wrongFor(it, k));
  // 판(라운드) 만들기
  if (unit) {
    // 다리는 낱말 판자를 하나씩 놓으니 짧은 문장부터
    if (mode === 'bridge') rounds = us(10).sort((a, b) => a.words.length - b.words.length).slice(0, 4);
    else if (mode === 'maker' || mode === 'sticky') rounds = us(5);
    else if (mode === 'cookie') rounds = us(4);
    else if (mode === 'bricks') rounds = [us(3), us(3)];
    else if (mode === 'ice' || mode === 'ship') rounds = us(4);
    else rounds = [0, 1].map(() => us(3).map((x) => x.text).join(' '));
  } else if (mode === 'bridge') rounds = sentFor(L, 4);
  else if (mode === 'maker') rounds = sentFor(L, 5);
  else if (mode === 'cookie') rounds = sentFor(Math.max(2, L), 4);
  else if (mode === 'bricks') rounds = [0, 1].map(() => sentFor(L, 3));
  else if (mode === 'sticky') {
    const kinds = [['aan'], ['aan', 'isare'], ['isare', 'pron'], ['pron', 'verb'], ['aan', 'isare', 'pron', 'verb']][L - 1];
    rounds = Array.from({ length: 5 }, () => { const k = pick(kinds); return { k, it: pick(EN_KICK[k].items) }; });
  } else if (mode === 'ice' || mode === 'ship') {
    const lv = mode === 'ice' ? [1, 2, 3, 3, 3][L - 1] : L;
    const at = EN_CHUNKS.filter((c) => c[5] === lv);
    rounds = pickN(at.length >= 4 ? at : [...at, ...EN_CHUNKS.filter((c) => c[5] === lv - 1)], 4);
  } else rounds = pickN(EN_NOTES, 2);

  function run() {
    hinter.reset();
    ctx.progress(n, rounds.length);
    const r = rounds[n];
    if (mode === 'bridge') order(r);
    else if (mode === 'maker' || (unit && mode === 'sticky')) choose({ ...r, wrong: wrongOf(r, L >= 4 ? 3 : 2) }, { cls: mode === 'sticky' ? 'memo' : '' });
    else if (mode === 'cookie') {
      // 정답 낱말과 다른 낱말 하나를 더 비운다
      const toks = `${r.before} ${r.answer} ${r.after}`.trim().split(' ');
      const ai = r.before ? r.before.split(' ').length : 0;
      const other = pick(toks.map((w, i) => ({ w, i })).filter((x) => x.i !== ai && /^[a-z]{3,}$/i.test(x.w)));
      const parts = toks.map((w, i) => (i === ai || i === other?.i ? { w } : w));
      scene.replaceChildren(h('div', { class: 'sk-cookie-box', 'aria-hidden': 'true' }, '🎁'));
      multi([{ e: r.e, parts, text: r.text, traps: wrongOf(r, L >= 3 ? 2 : 1) }], { cls: 'cookie', piece: 'cookie' });
    } else if (mode === 'bricks') {
      scene.replaceChildren(h('div', { class: 'sk-paddle', 'aria-hidden': 'true' }, '⚾'));
      multi(r.map((it) => {
        const before = it.before ? it.before.split(' ') : [];
        const after = it.after ? it.after.split(' ') : [];
        return { e: it.e, parts: [...before, { w: it.answer }, ...after], text: it.text, traps: L >= 3 ? wrongOf(it, 1) : [] };
      }), { cls: 'brick', piece: 'ball' });
    } else if (mode === 'sticky') {
      const [e, before, answer, after, other] = r.it;
      const opts = EN_KICK[r.k].opts || [answer, other];
      const extra = L >= 4 ? pickN(Object.values(EN_KICK).flatMap((k) => k.opts || []).filter((o) => !opts.includes(o)), 1) : [];
      choose({ e, before, answer, after, text: [before, answer, after].filter(Boolean).join(' '), wrong: [...opts.filter((o) => o !== answer), ...extra] }, { cls: 'memo' });
    } else if (unit && (mode === 'ice' || mode === 'ship')) {
      scene.replaceChildren(mode === 'ice'
        ? h('div', { class: 'sk-sea' }, h('span', { class: 'sk-peng', 'aria-hidden': 'true' }, '🐧'), h('span', { class: 'sk-floe gap' }), h('span', { class: 'sk-fish', 'aria-hidden': 'true' }, '🐟'))
        : h('div', { class: 'sk-dock' }, h('span', { class: 'sk-ship', 'aria-hidden': 'true' }, '🚢'), h('span', { class: 'sk-hole', 'aria-hidden': 'true' }, '🔧')));
      choose({ ...r, wrong: wrongOf(r, 2) }, { cls: mode, onDone: () => scene.firstChild.classList.add('fixed') });
    } else if (mode === 'ice' || mode === 'ship') {
      const [e, before, answer, after, traps] = r;
      scene.replaceChildren(mode === 'ice'
        ? h('div', { class: 'sk-sea' }, h('span', { class: 'sk-peng', 'aria-hidden': 'true' }, '🐧'), h('span', { class: 'sk-floe gap' }), h('span', { class: 'sk-fish', 'aria-hidden': 'true' }, '🐟'))
        : h('div', { class: 'sk-dock' }, h('span', { class: 'sk-ship', 'aria-hidden': 'true' }, '🚢'), h('span', { class: 'sk-hole', 'aria-hidden': 'true' }, '🔧')));
      choose({ e, before, answer, after: after === '.' ? '.' : after, text: `${before} ${answer}${after === '.' ? '.' : ` ${after}`}`, wrong: traps }, {
        cls: mode,
        onDone: () => scene.firstChild.classList.add('fixed'),
      });
    } else notes(r);
    // 다리 만들기만 문장을 먼저 들려준다 (빈칸 놀이는 정답을 말하지 않는다)
    ctx.prompt(TELL[mode][0], () => say(mode === 'bridge' ? r.text : TELL[mode][1]));
  }

  run();
}
