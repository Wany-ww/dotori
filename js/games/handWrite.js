import { h, pickN, cheer, burst, pop, charFace, wordPic } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { JAMO_NAME, WORDS, WORDS2, PUZZLE_BATCHIM, LETTER_GALAXY, QUIZ_SYLLABLES, QUIZ_BATCHIM, objJosa } from '../data.js';
import { canWrite, advice } from '../handwriting.js';
import { makePad, strokesSvg } from './writeKit.js';

const writable = (w) => [...w].every(canWrite);
const nameOf = (c) => JAMO_NAME[c] || c;
const INKS = ['#E8484F', '#2C9BE0', '#3BAE8A', '#F28C48', '#8B5CF6', '#E8A400', '#D2386A'];
const EASY_JAMO = ['ㄱ', 'ㄴ', 'ㅅ', 'ㅇ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'];
const MORE_JAMO = ['ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'];
// 단계별 본보기: 칸 안 흐린 본보기+획순 번호 → 흐린 본보기 → 옆에만 → 없음
const MODEL = ['faint', 'ghost', 'none', 'none', 'none'];

// 글자를 써보자(SimpleWriting · letter) / 손글씨 낱말 카드(WordDictation · word) / 듣고 손으로 쓰기(HandwritingTyper · blank)
// 쓴 글씨는 획 수 · 획순 · 쓰는 방향 · 모양을 본보기와 비교해서 판정한다
export function mount(stage, ctx) {
  const mode = ctx.opts.mode;
  const L = ctx.level;
  const lesson = ctx.lesson;
  const top = h('div', { class: 'hw-top' });
  const show = h('div', { class: 'hw-show' });
  const row = h('div', { class: 'hw-row' });
  const tip = h('p', { class: 'hw-tip', 'aria-live': 'polite' });
  const undo = h('button', { class: 'btn btn-ghost hw-tool', type: 'button' }, '↩ 한 획 지우기');
  const howBtn = h('button', { class: 'btn btn-ghost hw-tool', type: 'button' }, '👀 쓰는 순서 보기');
  const skip = h('button', { class: 'btn btn-ghost hw-tool', type: 'button', hidden: true }, '다음으로 ▶');
  const tools = h('div', { class: 'hw-tools' }, undo, howBtn, skip);
  stage.append(h('div', { class: `handwrite mode-${mode}` }, top, show, row, tip, tools));

  let pads = [];
  let focus = null;
  let firstTry = 0;
  let n = 0;
  const lastPad = () => focus && !focus.ok ? focus : pads.find((p) => !p.ok);
  undo.addEventListener('click', () => { sfx.tap(); lastPad()?.undo(); });
  howBtn.addEventListener('click', () => { sfx.tap(); lastPad()?.showDemo(); });

  // 쓰기 칸들을 만들고, 모두 바르게 쓰면 done()을 부른다
  function makePads(chars, model, done) {
    let misses = 0;
    skip.hidden = true;
    tip.textContent = '';
    pads = chars.map((ch) => {
      const pad = makePad(ctx, {
        ch, model, level: L,
        onJudge: (r, p) => {
          if (r.ok) {
            sfx.pop();
            pop(p.el);
            tip.textContent = '';
            if (pads.every((x) => x.ok)) done(misses === 0);
            return;
          }
          misses++;
          sfx.wrong();
          const say = advice(r);
          tip.textContent = say;
          speak(say);
          if (p.fails >= 3) skip.hidden = false;
        },
      });
      pad.el.addEventListener('pointerdown', () => { focus = pad; });
      return pad;
    });
    skip.onclick = () => {
      sfx.tap();
      skip.hidden = true;
      pads.forEach((p) => { if (!p.ok) p.give(); });
      done(false);
    };
    return pads;
  }

  /* ---------- 글자를 써보자: 바르게 쓴 글자가 옷에 무늬로 찍힌다 ---------- */
  function letterItems(k) {
    if (lesson) {
      const jamoKinds = ['vocab', 'jamoShape', 'theme', 'vowel', 'cons', 'diph'];
      const list = (jamoKinds.includes(lesson.kind) ? lesson.jamo(k * 3) : lesson.syllables(k * 3)).filter(canWrite);
      if (list.length >= k) return list.slice(0, k);
    }
    const pool = [EASY_JAMO, [...EASY_JAMO, ...MORE_JAMO], QUIZ_SYLLABLES, QUIZ_SYLLABLES, QUIZ_BATCHIM][L - 1].filter(canWrite);
    return pickN(pool, k);
  }

  function letterGame() {
    const R = 5;
    const items = letterItems(R);
    const shirt = h('div', { class: 'hw-shirt', 'aria-label': '내가 꾸미는 옷' }, h('span', { class: 'hw-shirt-cloth', 'aria-hidden': 'true' }), h('div', { class: 'hw-prints' }));
    top.replaceChildren(shirt);
    const prints = shirt.querySelector('.hw-prints');

    function round() {
      ctx.progress(n, R);
      const ch = items[n];
      const sample = h('div', { class: 'hw-sample' }, h('span', { class: 'hw-sample-ch' }, ch), h('span', { class: 'hw-sample-name' }, nameOf(ch)));
      show.replaceChildren(MODEL[L - 1] === 'none' && L <= 4 ? sample : h('div', { class: 'hw-sample small' }, h('span', { class: 'hw-sample-name' }, nameOf(ch))));
      const [pad] = makePads([ch], MODEL[L - 1], (clean) => {
        if (clean) firstTry++;
        const print = h('span', { class: 'hw-print', style: { '--r': `${Math.round(Math.random() * 30 - 15)}deg` } }, strokesSvg(pad.strokes, INKS[n % INKS.length], 9));
        prints.append(print);
        sfx.correct();
        burst(shirt, ['✨', '⭐', '🎨']);
        speak(nameOf(ch));
        ctx.later(() => {
          n++;
          if (n < R) return round();
          // 다 쓰면 토리가 내 글씨 무늬 옷을 입고 뽐낸다
          row.replaceChildren(h('div', { class: 'hw-wear' }, h('span', { class: 'hw-tori' }, charFace('tori-cheer', '🐿️')), shirt));
          show.replaceChildren(h('p', { class: 'hw-done' }, '나만의 특별한 옷이 완성됐어요!'));
          tools.hidden = true;
          top.replaceChildren();
          cheer(shirt);
          speak('나만의 특별한 옷이 완성됐어요!');
          ctx.later(() => ctx.finish({ firstTry, total: R }), 2600);
        }, 1300);
      });
      row.replaceChildren(pad.el);
      focus = pad;
      const said = nameOf(ch);
      ctx.prompt(`'${ch}'${said !== ch ? `(${said})` : ''}${objJosa(said)} 바른 획순으로 써 봐요. 다 쓰면 옷에 무늬로 찍혀요!`, () => speak(said));
      if (MODEL[L - 1] !== 'faint') ctx.later(() => pad.showDemo(), 900);
    }
    round();
  }

  /* ---------- 손글씨 낱말 카드 ---------- */
  function wordItems(k) {
    const pic = L <= 4;
    if (lesson) {
      const list = lesson.words(k * 4, { pic: true, maxLen: L >= 3 ? 3 : 2 }).filter((w) => writable(w.word));
      if (list.length >= k) return list.slice(0, k).map((w) => ({ w: w.word, e: w.emoji, pic }));
    }
    const len = (x) => [...x.word].length;
    const pool = [
      WORDS.filter((x) => len(x) === 2),
      WORDS.filter((x) => len(x) === 2),
      [...WORDS, ...WORDS2.filter((x) => !PUZZLE_BATCHIM.some((b) => b.word === x.word))].filter((x) => len(x) <= 3),
      [...PUZZLE_BATCHIM, ...WORDS2].filter((x) => len(x) <= 3),
      [...PUZZLE_BATCHIM, ...WORDS2].filter((x) => len(x) <= 3),
    ][L - 1].filter((x) => writable(x.word));
    return pickN(pool, k).map((x) => ({ w: x.word, e: x.emoji, pic }));
  }

  function wordGame() {
    const R = 4;
    const items = wordItems(R);
    const deck = h('div', { class: 'hw-deck', 'aria-label': '완성한 낱말 카드' });
    top.replaceChildren(deck);

    function round() {
      ctx.progress(n, R);
      const it = items[n];
      const say = () => speak(it.w);
      const ear = h('button', { class: 'hw-ear', type: 'button', 'aria-label': '낱말 다시 듣기', onclick: () => { sfx.tap(); say(); } }, '🔊');
      show.replaceChildren(h('div', { class: 'hw-card' }, it.pic ? h('span', { class: 'hw-pic', 'aria-hidden': 'true' }, wordPic(it.w, it.e)) : null, ear));
      const list = makePads([...it.w], MODEL[L - 1], (clean) => {
        if (clean) firstTry++;
        sfx.correct();
        // 내 손글씨로 된 낱말 카드가 완성된다
        const card = h('div', { class: 'hw-mini' }, h('span', { class: 'hw-mini-pic', 'aria-hidden': 'true' }, wordPic(it.w, it.e)),
          h('span', { class: 'hw-mini-word', 'aria-label': it.w }, list.map((p) => strokesSvg(p.strokes, '#3B2A1A', 8))));
        deck.append(card);
        pop(card);
        cheer(row);
        say();
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 1700);
      });
      row.replaceChildren(h('div', { class: 'hw-grid' }, list.map((p) => p.el)));
      focus = list[0];
      ctx.prompt(it.pic ? '낱말을 잘 듣고 칸에 한 글자씩 바르게 써요!' : '그림 없이 소리만 들어요. 낱말을 듣고 한 글자씩 써요!', say);
    }
    round();
  }

  /* ---------- 듣고 손으로 쓰기: 문장의 빈칸에 들어갈 낱말을 쓴다 ---------- */
  function blankItems(k) {
    const len = [2, 2, 2, 3, 3][L - 1];
    const fromLesson = lesson?.sentences(k * 2)
      .filter((s) => s.blank && writable(s.blank.answer) && [...s.blank.answer].length <= 3)
      .map((s) => ({ before: s.blank.before, w: s.blank.answer, after: s.blank.after, e: s.e })) || [];
    if (fromLesson.length >= k) return fromLesson.slice(0, k);
    const pool = LETTER_GALAXY.filter((x) => [...x.w].length === len && writable(x.w));
    return [...fromLesson, ...pickN(pool, k)].slice(0, k);
  }

  function blankGame() {
    const R = 4;
    const items = blankItems(R);

    function round() {
      ctx.progress(n, R);
      const it = items[n];
      const full = `${it.before || ''}${it.w}${it.after}`;
      const say = () => speak(full);
      const list = makePads([...it.w], MODEL[L - 1], (clean) => {
        if (clean) firstTry++;
        sfx.correct();
        cheer(row);
        sentence.classList.add('done');
        say();
        ctx.later(() => {
          n++;
          if (n >= R) ctx.finish({ firstTry, total: R });
          else round();
        }, 2000);
      });
      const sentence = h('p', { class: 'hw-sentence' },
        it.before ? h('span', {}, it.before) : null,
        h('span', { class: 'hw-blank' }, list.map((p) => p.el)),
        h('span', {}, it.after));
      show.replaceChildren(L <= 4 && it.e ? h('span', { class: 'hw-pic', 'aria-hidden': 'true' }, wordPic(it.w, it.e)) : h('span'));
      row.replaceChildren(sentence);
      top.replaceChildren();
      focus = list[0];
      ctx.prompt('문장을 잘 듣고, 빈칸에 들어갈 낱말을 손으로 써 봐요!', say);
    }
    round();
  }

  if (mode === 'letter') letterGame();
  else if (mode === 'word') wordGame();
  else blankGame();
}
