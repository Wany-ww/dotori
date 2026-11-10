import { h, pickN, wiggle, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { TYPE_WORDS, TYPE_SENTENCES } from '../data.js';
import { keysFor, composeKeys, keyboard } from '../hangul.js';
import { galaxyBar } from './galaxy.js';

// 타자 연습 은하 1(낱말) · 2(문장): 카드의 글을 두벌식 자판으로 똑같이 친다
export function mount(stage, ctx) {
  const L = ctx.level;
  const sentence = ctx.opts.mode === 'sentence';
  const R = sentence ? 3 : 5;
  const pool = sentence ? TYPE_SENTENCES[Math.max(0, Math.min(L, 5) - 2)] : TYPE_WORDS[L - 1];
  // 한글 차시: 그 차시의 낱말·문장을 친다
  const lesson = ctx.lesson;
  const lessonItems = () => {
    if (sentence) {
      const ss = lesson.sentences(R).map((s) => s.text);
      return ss.length >= R ? ss : [...ss, ...pickN(pool, R - ss.length)];
    }
    return lesson.words(R, { maxLen: 4 }).map((w) => w.word);
  };
  const items = lesson ? lessonItems() : pickN(pool, R);
  const hinter = makeHinter();
  const bar = galaxyBar(R);
  const card = h('div', { class: 'tw-card' });
  const screen = h('div', { class: 'tw-screen', 'aria-live': 'polite' });
  let n = 0;
  let firstTry = 0;
  let keys = [];
  let pos = 0;
  let roundMiss = 0;
  let busy = false;

  const kb = keyboard((k) => {
    if (busy) return;
    if (k !== keys[pos]) {
      roundMiss++;
      const b = kb.el.querySelector(`[data-k="${CSS.escape(k)}"]`);
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
    if (roundMiss === 0) firstTry++;
    bar.star();
    sfx.correct();
    cheer(screen);
    speak(items[n]);
    ctx.later(() => {
      n++;
      bar.progress(n);
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 1700);
  });
  ctx.onCleanup(() => kb.destroy());

  stage.append(h('div', { class: 'galaxy typer' }, bar.el,
    h('div', { class: 'typewriter' }, card, screen, kb.el)));

  function paint() {
    const typed = composeKeys(keys.slice(0, pos));
    screen.replaceChildren(h('span', { class: 'tw-typed' }, typed), h('span', { class: 'tw-caret', 'aria-hidden': 'true' }));
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    keys = keysFor(items[n]);
    pos = 0;
    roundMiss = 0;
    busy = false;
    card.textContent = items[n];
    card.classList.toggle('long', sentence);
    paint();
    ctx.prompt(
      sentence ? '카드의 문장을 자판으로 똑같이 쳐 봐요. 띄어쓰기와 마침표도 잊지 마요!' : '카드의 글자를 자판으로 똑같이 쳐 봐요. 쌍자음은 ⇧를 먼저 눌러요.',
      () => speak(items[n]),
    );
  }

  round();
}
