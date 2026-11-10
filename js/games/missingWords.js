import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';
import { enUnitOf } from '../enLesson.js';
import { EN_UNITS } from '../enCurriculum.js';

const PAGES = 2;
// 단계(Lv)마다: 한 쪽의 문장 수, 사라지는 낱말 수, 섞는 함정 낱말 수
const LINES = [3, 3, 4, 4, 5];
const BLANKS = [2, 3, 3, 4, 5];
const TRAPS = [0, 1, 2, 2, 3];
const say = (t) => speak(t, 'en-US');

// 글자가 사라졌다(MissingWords): 공책 글(사진 · 제목 · 문단)에서 낱말이 사라졌어요!
// 공책 옆에 둥둥 떠 있는 낱말(함정 낱말도 섞임)을 끌어다 빈칸에 넣어 글을 완성한다 (참고 영상: "People Who Play Music")
export function mount(stage, ctx) {
  const L = ctx.level;
  const U = ctx.unit || enUnitOf(Math.max(0, EN_UNITS.findIndex((u) => u.lv >= L)));
  const hinter = makeHinter();
  const page = h('div', { class: 'mw-page latin' });
  const float = h('div', { class: 'mw-float' });
  stage.append(h('div', { class: 'missing-words' }, page, float));
  const all = U.sentences(LINES[L - 1] * PAGES + 2);
  // 공책 제목: 차시 그림책의 영어 제목(낱말 두 개 이상)이 있으면 그것으로
  const bookTitle = U.book?.().title || '';
  const title = /^[A-Za-z][A-Za-z ,'!?-]*\s[A-Za-z]/.test(bookTitle) ? bookTitle : 'My Notebook';
  let n = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, PAGES);
    const lines = all.slice(n * LINES[L - 1], (n + 1) * LINES[L - 1]);
    // 사라지는 낱말: 문장마다 정해 둔 정답 낱말부터 (빈칸 놀이에 쓰려고 고른 낱말이라 뜻이 분명하다)
    const blanks = new Set(pickN(lines.map((s, i) => (/[A-Za-z]/.test(s.answer || '') ? i : -1)).filter((i) => i >= 0), Math.min(BLANKS[L - 1], lines.length)));
    const slots = [];
    const text = lines.map((s, i) => {
      if (!blanks.has(i) || !s.answer) return h('span', {}, `${s.text} `);
      const g = h('button', { class: 'mw-slot', type: 'button', 'aria-label': '빈칸' });
      g.dataset.w = s.answer;
      slots.push(g);
      const glue = (a, b) => (/^[.,?!]/.test(b) ? '' : ' ');
      return h('span', {}, s.before ? `${s.before} ` : '', g, s.after ? `${glue(s.answer, s.after)}${s.after}` : '', ' ');
    });
    total += slots.length;
    page.replaceChildren(
      h('div', { class: 'mw-photo', 'aria-hidden': 'true' }, [...new Set(lines.map((s) => s.e).filter(Boolean))].slice(0, 3).join(' ')),
      h('h3', { class: 'mw-title' }, title),
      h('p', { class: 'mw-text' }, text));
    const traps = pickN([...new Set(lines.flatMap((s) => s.wrong || []))].filter((w) => !slots.some((g) => g.dataset.w === w)), TRAPS[L - 1]);
    let sel = null;
    const chips = shuffle([...slots.map((g) => g.dataset.w), ...traps]).map((w, i) => {
      const c = h('button', { class: 'mw-chip', type: 'button', style: { '--y': `${6 + i * (88 / Math.max(1, slots.length + traps.length))}%`, '--x': `${randInt(4, 46)}%`, animationDelay: `${i * 0.3}s` } }, w);
      c.dataset.w = w;
      c.dataset.miss = '0';
      draggable(c, {
        onDrop: (pt) => {
          const g = slots.find((x) => !x.classList.contains('full') && hits(x, pt, 10));
          if (g) put(c, g);
          else wiggle(c);
        },
      });
      c.addEventListener('click', () => {
        sfx.tap();
        say(w);
        sel?.classList.remove('sel');
        sel = sel === c ? null : c;
        sel?.classList.add('sel');
      });
      return c;
    });
    slots.forEach((g) => g.addEventListener('click', () => { if (sel) put(sel, g); }));
    float.replaceChildren(...chips);

    function put(c, g) {
      if (c.dataset.w !== g.dataset.w) {
        c.dataset.miss = '1';
        wiggle(c);
        wiggle(g);
        hinter.miss(chips.find((x) => x.isConnected && x.dataset.w === g.dataset.w) || null);
        return;
      }
      hinter.reset();
      if (sel === c) sel = null;
      if (c.dataset.miss === '0') firstTry++;
      c.remove();
      g.textContent = g.dataset.w;
      g.classList.add('full');
      pop(g);
      sfx.pop();
      say(g.dataset.w);
      if (!slots.every((x) => x.classList.contains('full'))) return;
      float.replaceChildren();
      sfx.correct();
      cheer(page, 'en');
      say(lines.map((s) => s.text).join(' '));
      ctx.later(() => {
        n++;
        if (n < PAGES) round();
        else ctx.finish({ firstTry, total });
      }, 1800 + lines.length * 900);
    }
    ctx.prompt('공책 글에서 낱말이 사라졌어요! 옆에 떠 있는 낱말을 빈칸에 넣어 글을 완성해요. 필요 없는 낱말도 섞여 있어요.', () => say('Find the missing words!'));
  }

  round();
}
