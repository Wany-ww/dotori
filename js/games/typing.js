import { h, shuffle, pickN, wiggle, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { TYPE_WORDS, LETTER_GALAXY, CHO, JUNG, SPELL_WORDS, EN_PHRASES } from '../data.js';
import { keysFor, composeKeys, keyboard } from '../hangul.js';

const R = 5;

// 영어 화면 자판 (QWERTY, 소문자). 실제 키보드로도 칠 수 있다
function qwerty(onKey) {
  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', [' ', '.', '!', '?']];
  const keys = [];
  const el = h('div', { class: 'kb en', role: 'group', 'aria-label': '영어 자판' }, rows.map((row) => h('div', { class: 'kb-row' }, [...row].map((k) => {
    const b = h('button', { class: `kb-key${k === ' ' ? ' space' : ''}${'asdfjkl'.includes(k) && k !== ' ' ? ' home' : ''}`, type: 'button', 'data-k': k, 'aria-label': k === ' ' ? 'space' : k }, k === ' ' ? 'space' : k);
    b.addEventListener('click', () => onKey(k));
    keys.push(b);
    return b;
  }))));
  const onDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : null;
    const b = keys.find((x) => x.dataset.k === k);
    if (!b) return;
    e.preventDefault();
    b.classList.add('down');
    setTimeout(() => b.classList.remove('down'), 120);
    onKey(k);
  };
  window.addEventListener('keydown', onDown);
  return { el, keyEl: (k) => keys.find((b) => b.dataset.k === k), destroy: () => window.removeEventListener('keydown', onDown) };
}

// 듣고 글자 만들기: 그 글자의 자모 + 헷갈리는 자모로 된 작은 자판
function jamoPad(target, onKey) {
  const need = [...new Set(keysFor(target))];
  const cons = need.filter((k) => CHO.includes(k));
  const vows = need.filter((k) => JUNG.includes(k));
  const more = [...pickN(['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'].filter((k) => !cons.includes(k)), 3), ...pickN(['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'].filter((k) => !vows.includes(k)), 2)];
  const all = shuffle([...need, ...more]);
  const keys = all.map((k) => {
    const b = h('button', { class: `kb-key${JUNG.includes(k) ? ' vowel' : ''}`, type: 'button', 'data-k': k }, k);
    b.addEventListener('click', () => onKey(k));
    return b;
  });
  return { el: h('div', { class: 'kb jamo-pad', role: 'group', 'aria-label': '자모 자판' }, keys), keyEl: (k) => keys.find((b) => b.dataset.k === k), destroy() {} };
}

// 구름 타자치기(StarFall · sheep) · 듣고 글자 만들기(GraphemeTyper · build) · 듣고 타자치기(KeyboardTyper · blank) · 타자 연습(TypeTime · en)
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const en = mode === 'en';
  const lang = en ? 'en-US' : 'ko-KR';
  const hinter = makeHinter();

  // 문제: { show(화면에 보여 줄 것), target(칠 글자), say(읽어 줄 말) }
  const items = (() => {
    // 영어 차시(QWERTY 타이핑은 Level M부터): 1차시 자판 글자 자리와 단어 → 2차시 단어 → 3 · 4차시 짧은 문장
    if (en && ctx.unit) {
      const u = ctx.unit;
      const ws = u.words(R, { spell: true, maxLen: 6 }).map((w) => ({ target: w.w, say: w.w, e: w.e }));
      if (u.no === 1 || u.level <= 3) return [...pickN([...'asdfjkl'], 2).map((c) => ({ target: c, say: c })), ...ws.slice(0, 3)];
      if (u.no === 2) return ws;
      const ss = u.sentences(8).filter((x) => x.words.length <= 8).slice(0, 3);
      return ss.length >= 2 ? ss.map((x) => ({ target: x.text.toLowerCase().replace(/[’',]/g, ''), say: x.text, e: x.e })) : ws;
    }
    if (en) {
      const home = 'asdfjkl';
      if (L === 1) return pickN([...home], R).map((c) => ({ target: c, say: c }));
      if (L === 2) return pickN([...'abcdefghijklmnopqrstuvwxyz'], R).map((c) => ({ target: c, say: c }));
      if (L <= 4) return pickN(L === 3 ? SPELL_WORDS[3] : SPELL_WORDS[4], R).map((w) => ({ target: w.w, say: w.w, e: w.e }));
      return pickN(EN_PHRASES, 3).map(([t, e]) => ({ target: t.toLowerCase().replace(/[’']/g, ''), say: t, e }));
    }
    if (mode === 'sheep') return pickN(TYPE_WORDS[L - 1], R).map((w) => ({ target: w, say: w }));
    const pool = LETTER_GALAXY.filter((x) => (L <= 2 ? [...x.w].length === 2 : true));
    return pickN(pool, R).map((x) => {
      // 듣고 글자 만들기: 낱말 가운데 한 글자만 빈칸
      const k = mode === 'build' ? Math.floor(Math.random() * [...x.w].length) : -1;
      return { ...x, target: k >= 0 ? [...x.w][k] : x.w, k, say: `${x.w}${x.after}` };
    });
  })();
  const total = items.length;

  const scene = h('div', { class: 'ty-scene' });
  const screen = h('div', { class: 'ty-screen', 'aria-live': 'polite' });
  const padHost = h('div', { class: 'ty-pad' });
  stage.append(h('div', { class: `typing mode-${mode}` }, scene, screen, padHost));
  let n = 0;
  let firstTry = 0;
  let kb = null;
  ctx.onCleanup(() => kb?.destroy());

  function round() {
    hinter.reset();
    ctx.progress(n, total);
    const it = items[n];
    const keys = en ? [...it.target] : keysFor(it.target);
    let pos = 0;
    let miss = 0;
    let busy = false;

    // 장면
    if (mode === 'sheep') {
      scene.replaceChildren(h('div', { class: 'ty-sky' }, h('span', { class: 'ty-cloud', 'aria-hidden': 'true' }, '☁️'), h('div', { class: 'ty-sheep' }, h('span', { 'aria-hidden': 'true' }, '🐑'), h('b', {}, it.target))));
    } else if (en) {
      scene.replaceChildren(h('div', { class: 'ty-card latin' }, it.e ? h('span', { 'aria-hidden': 'true' }, it.e) : null, h('b', {}, it.target)));
    } else {
      const chars = [...it.w];
      const blank = (k) => h('span', { class: 'ty-blank' }, L <= 1 && mode === 'blank' ? h('i', {}, chars[k]) : '');
      const word = mode === 'build'
        ? chars.map((c, k) => (k === it.k ? blank(k) : h('span', {}, c)))
        : [h('span', { class: 'ty-blank wide' }, L <= 1 ? h('i', {}, it.w) : '')];
      scene.replaceChildren(h('div', { class: 'ty-sentence' }, h('span', { class: 'ty-e', 'aria-hidden': 'true' }, it.e), ...word, h('span', {}, it.after),
        h('button', { class: 'ty-ear', type: 'button', 'aria-label': '문장 다시 듣기', onclick: () => speak(it.say) }, '🔊')));
    }

    const paint = () => {
      padHost.dataset.next = keys[pos] || '';
      const typed = en ? keys.slice(0, pos).join('') : composeKeys(keys.slice(0, pos));
      screen.replaceChildren(h('span', { class: `ty-typed${en ? ' latin' : ''}` }, typed), h('span', { class: 'ty-caret', 'aria-hidden': 'true' }));
    };
    const onKey = (k) => {
      if (busy) return;
      if (k !== keys[pos]) {
        miss++;
        const b = kb.keyEl(k);
        if (b) wiggle(b);
        hinter.miss(kb.keyEl(keys[pos]));
        return;
      }
      hinter.reset();
      sfx.tap();
      pos++;
      paint();
      if (pos < keys.length) return;
      busy = true;
      if (miss === 0) firstTry++;
      sfx.correct();
      if (mode === 'sheep') scene.querySelector('.ty-sheep').classList.add('home');
      scene.querySelectorAll('.ty-blank').forEach((b) => { b.textContent = mode === 'build' ? it.target : it.w; b.classList.add('full'); });
      burst(scene, ['⭐', '✨']);
      cheer(screen, en ? 'en' : 'ko');
      speak(it.say, lang);
      ctx.later(() => {
        n++;
        if (n >= total) ctx.finish({ firstTry, total });
        else round();
      }, 1900);
    };
    kb?.destroy();
    kb = mode === 'build' ? jamoPad(it.target, onKey) : en ? qwerty(onKey) : keyboard(onKey);
    padHost.replaceChildren(kb.el);
    paint();
    const tell = {
      sheep: '양이 내려와요! 양에 쓰인 글자를 자판으로 똑같이 쳐 봐요.',
      build: '문장을 잘 듣고, 빈칸에 들어갈 글자를 자모 자판으로 만들어요.',
      blank: '문장을 잘 듣고, 빈칸에 들어갈 낱말을 자판으로 쳐요.',
      en: L <= 2 ? '화면의 글자 키를 찾아 눌러요. 손가락은 가운데 줄(asdf · jkl)에 올려 두어요!' : '카드의 단어를 영어 자판으로 똑같이 쳐 봐요!',
    }[mode];
    ctx.prompt(tell, () => speak(it.say, lang));
  }

  round();
}
