import { h, shuffle, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

// 단계(Lv)마다: 이야기 문장 수, 메모지 수
const LINES = [3, 4, 4, 5, 5];
const NOTES = [2, 3, 3, 3, 4];
const say = (t) => speak(t, 'en-US');

// 문장 메모(StickySentences): 게시판에 꽂힌 종이에 글이 한 문장씩 이어진다.
// 빈칸에 가장 잘 맞는 노란 메모지를 붙이면 다음 문장이 나타난다 (참고 영상: "Here is tomorrow's weather…")
export function mount(stage, ctx) {
  const L = ctx.level;
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= L)));
  const hinter = makeHinter();
  const lines = U.sentences(LINES[L - 1] + 2).filter((s) => /[A-Za-z]/.test(s.answer || '') && s.wrong?.length).slice(0, LINES[L - 1]);
  const paper = h('div', { class: 'ss-paper latin' });
  const notes = h('div', { class: 'ss-notes' });
  stage.append(h('div', { class: 'sticky-story' }, h('div', { class: 'ss-board' }, h('i', { class: 'ss-pin l' }), h('i', { class: 'ss-pin r' }), paper), notes));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, lines.length);
    const s = lines[n];
    paper.querySelectorAll('.ss-line.now').forEach((x) => x.classList.remove('now'));
    const slot = h('button', { class: 'ss-slot', type: 'button', 'aria-label': '빈칸' });
    slot.dataset.w = s.answer;
    const glue = /^[.,?!]/.test(s.after) ? '' : ' ';
    const row = h('p', { class: 'ss-line now' }, s.before ? `${s.before} ` : '', slot, s.after ? `${glue}${s.after}` : '');
    paper.append(row);
    pop(row);
    let sel = null;
    let miss = 0;
    const words = shuffle([s.answer, ...s.wrong.slice(0, NOTES[L - 1] - 1)]);
    const cards = words.map((w) => {
      const c = h('button', { class: 'ss-note', type: 'button' }, w);
      c.dataset.w = w;
      draggable(c, {
        onDrop: (pt) => {
          if (hits(slot, pt, 14)) put(c);
          else wiggle(c);
        },
      });
      c.addEventListener('click', () => {
        sfx.tap();
        // 누르면 바로 빈칸에 붙여 본다
        put(c);
      });
      return c;
    });
    slot.addEventListener('click', () => { if (sel) put(sel); });
    notes.replaceChildren(...cards);

    function put(c) {
      if (c.dataset.w !== s.answer) {
        miss++;
        sfx.wrong();
        wiggle(c);
        c.classList.add('nope');
        hinter.miss(cards.find((x) => x.dataset.w === s.answer));
        return;
      }
      hinter.reset();
      if (miss === 0) firstTry++;
      c.remove();
      slot.replaceWith(h('span', { class: 'ss-stuck' }, s.answer));
      row.classList.add('done');
      sfx.pop();
      say(s.text);
      notes.replaceChildren();
      n++;
      if (n < lines.length) { ctx.later(round, 1700); return; }
      ctx.later(() => {
        sfx.correct();
        paper.classList.add('done');
        cheer(paper, 'en');
      }, 1500);
      ctx.later(() => ctx.finish({ firstTry, total: lines.length }), 3600);
    }
    ctx.prompt('글을 읽고, 빈칸에 가장 잘 맞는 메모지를 붙여요. 붙이면 글이 이어져요!', () => say('Which note fits best?'));
  }

  round();
}
