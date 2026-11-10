import { h, shuffle, wiggle, cheer, makeHinter, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CHO, JUNG, JONG, compose, decompose, objJosa } from '../data.js';

const R = 5;
// 글자판 칸 수 (손놀림 난이도): 첫소리 / 가운뎃소리 / 받침
const SIZE = { cho: [3, 4, 5, 5, 6], jung: [2, 3, 4, 4, 5], jong: [3, 3, 3, 4, 4] };
const KIND_LABEL = { cho: '첫소리', jung: '가운뎃소리', jong: '받침' };

// 차시마다 돌리는 글자판이 다르다:
//  모음 차시는 가운뎃소리판만, 자음 차시는 첫소리판만, 받침 차시는 받침판만 돌리고 나머지는 맞춰 둔다.
//  자음+모음·여러 받침 차시는 모든 판을 돌리고, 소리 듣고 찾기·넓게 읽기 차시는 글자를 보여 주지 않고 소리만 들려준다
function pickerMode(lesson) {
  const spin = lesson.slot ? [lesson.slot] : null;
  const soundOnly = lesson.find || lesson.wide || lesson.kind === 'mix' || lesson.kind === 'rule';
  return { spin, soundOnly };
}

function makeTargets(lesson) {
  const syls = lesson.syllables(R * 2);
  const words = lesson.words(40, { pic: true });
  return syls.slice(0, R).map((s) => {
    const d = decompose(s);
    const w = words.find((x) => x.word.includes(s));
    return { parts: [CHO[d.c], JUNG[d.j], d.t ? JONG[d.t] : ''], syl: s, word: w?.word, emoji: w?.emoji };
  });
}

export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  const mode = pickerMode(lesson);
  const targets = makeTargets(lesson);
  const CHO_POOL = lesson.known.cons.length >= 4 ? lesson.known.cons : ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
  const JUNG_POOL = lesson.known.vows.length >= 3 ? lesson.known.vows : ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ'];
  const JONG_POOL = lesson.known.fins.filter((x) => 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㅆ'.includes(x));
  const hinter = makeHinter();
  const root = h('div', { class: 'picker' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;
  let sayTimer = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const tg = targets[n];
    const [c, j, t] = tg.parts;
    // 받침을 배운 뒤에만 받침판이 나온다
    const kinds = JONG_POOL.length || t ? ['cho', 'jung', 'jong'] : ['cho', 'jung'];
    const need = { cho: c, jung: j, jong: t };
    const pools = {
      cho: [...new Set([...CHO_POOL, c])],
      jung: [...new Set([...JUNG_POOL, j])],
      jong: ['', ...new Set([...JONG_POOL, ...(t ? [t] : [])])],
    };
    const spins = (k) => !mode.spin || mode.spin.includes(k);
    const reels = kinds.map((k) => {
      // 돌리지 않는 판은 정답 한 칸만 놓고 잠가 둔다
      if (!spins(k)) return { kind: k, items: [need[k]], i: 0, locked: true };
      const size = SIZE[k][L - 1];
      const others = shuffle(pools[k].filter((x) => x !== need[k]));
      // 받침판에는 '받침 없음'이 항상 들어 있다
      const base = k === 'jong' && need[k] !== '' ? ['', ...others.filter((x) => x !== '')] : others;
      return { kind: k, items: shuffle([need[k], ...base.slice(0, size - 1)]), i: 0 };
    });
    reels.forEach((r) => { r.i = Math.floor(Math.random() * r.items.length); });
    // 처음부터 정답이 맞춰져 있지 않도록 돌리는 판 하나를 한 칸 돌려 둔다
    const free = reels.filter((r) => !r.locked && r.items.length > 1);
    if (reels.every((r) => r.items[r.i] === need[r.kind]) && free.length) free[0].i = (free[0].i + 1) % free[0].items.length;

    const current = () => {
      const v = Object.fromEntries(reels.map((r) => [r.kind, r.items[r.i]]));
      return compose(v.cho, v.jung, v.jong || 0);
    };
    const screen = h('div', { class: 'picker-screen', 'aria-live': 'polite' });
    const reelEls = reels.map((r) => {
      const win = h('button', { class: 'reel-window', type: 'button', 'aria-label': `${KIND_LABEL[r.kind]} 글자판 돌리기`, disabled: r.locked });
      const el = h('div', { class: `reel${r.locked ? ' locked' : ''}`, 'data-kind': r.kind },
        h('button', { class: 'reel-btn', type: 'button', 'aria-label': `${KIND_LABEL[r.kind]} 위로 돌리기`, disabled: r.locked, onclick: () => spin(r, -1) }, r.locked ? '🔒' : '▲'),
        win,
        h('button', { class: 'reel-btn', type: 'button', 'aria-label': `${KIND_LABEL[r.kind]} 아래로 돌리기`, disabled: r.locked, onclick: () => spin(r, 1) }, r.locked ? '' : '▼'),
        h('span', { class: 'reel-label' }, KIND_LABEL[r.kind]));
      win.addEventListener('click', () => { if (!r.locked) spin(r, 1); });
      r.el = el;
      r.win = win;
      return el;
    });
    let solved = false;

    const label = (v) => (v === '' ? '없음' : v);
    function paint(r, dir = 0) {
      const at = (d) => r.items[(r.i + d + r.items.length) % r.items.length];
      const cell = (d, on) => h('span', { class: `${on ? 'on' : ''}${at(d) === '' ? ' none' : ''}` }, label(at(d)));
      if (r.locked) { r.win.replaceChildren(h('span'), cell(0, true), h('span')); return; }
      r.win.replaceChildren(cell(-1), cell(0, true), cell(1));
      if (dir) r.win.animate([{ transform: `translateY(${dir * 18}px)` }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
    }
    function refresh() {
      screen.textContent = current();
    }
    function spin(r, dir) {
      if (solved) return;
      r.i = (r.i + dir + r.items.length) % r.items.length;
      sfx.tap();
      paint(r, dir);
      refresh();
      clearTimeout(sayTimer);
      sayTimer = ctx.later(() => speak(current()), 420);
    }

    const go = h('button', {
      class: 'picker-go',
      type: 'button',
      'aria-label': '다 만들었어요',
      onclick: () => {
        if (solved) return;
        const wrong = reels.find((r) => r.items[r.i] !== need[r.kind]);
        if (wrong) {
          wiggle(screen);
          hinter.miss(wrong.el);
          return;
        }
        solved = true;
        if (hinter.count === 0) firstTry++;
        hinter.reset();
        screen.classList.add('ok');
        plate.textContent = tg.syl;
        sfx.correct();
        cheer(screen);
        speak(tg.word ? [tg.syl, tg.word] : tg.syl);
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 1800);
      },
    }, '✔');

    // 소리만 차시는 글자를 보여 주지 않고 소리로만 알려 준다
    const soundOnly = mode.soundOnly;
    const plate = h('button', { class: 'picker-plate', type: 'button', 'aria-label': '만들 글자 듣기', onclick: () => speak(tg.syl) }, soundOnly ? '🔊 ?' : tg.syl);
    const pic = tg.word
      ? h('div', { class: 'word-card picker-word' }, h('span', { class: 'word-emoji', 'aria-hidden': 'true' }, wordPic(tg.word, tg.emoji)),
        h('span', { class: 'word-text' }, soundOnly ? [...tg.word].map((s) => (s === tg.syl ? '?' : s)).join('') : tg.word))
      : null;
    root.replaceChildren(
      ...(pic ? [pic] : []),
      h('div', { class: 'picker-machine' },
        plate,
        h('div', { class: 'picker-body' }, h('div', { class: 'picker-screen-wrap' }, screen, h('span', { class: 'picker-wave', 'aria-hidden': 'true' })), h('div', { class: 'reels' }, reelEls)),
        go),
    );
    reels.forEach((r) => paint(r));
    refresh();
    const josa = objJosa(tg.syl);
    const which = mode.spin ? `${KIND_LABEL[mode.spin[0]]}판을` : '글자판을';
    ctx.prompt(
      soundOnly ? `소리를 잘 듣고, ${which} 돌려 같은 글자를 만들어요.` : `'${tg.syl}'${josa} 만들어요! ${which} 돌려 보세요.`,
      () => speak(soundOnly ? [tg.syl, tg.word].filter(Boolean) : [tg.syl, '글자를 만들어 볼까요?']),
    );
  }

  ctx.onCleanup(() => clearTimeout(sayTimer));
  round();
}
