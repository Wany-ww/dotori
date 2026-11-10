import { h, pop, pick, shuffle, wiggle, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { BOOKS } from '../data.js';

// 오디오 픽처북(ReadAlongBook) · 이야기 독해(opts.mode 'quiz'): 영어 차시는 그 차시의 그림책을 읽는다.
// 독해는 다 읽은 뒤 장면을 순서대로 다시 놓거나(order) 이야기 질문에 답한다
export function mount(stage, ctx) {
  const L = ctx.level;
  const BOOK = ctx.unit ? ctx.unit.book() : pick(BOOKS.filter((b) => b.min <= L && L <= b.max));
  const pages = BOOK.pages;
  const quizMode = ctx.opts.mode === 'quiz';
  let showKo = L <= 3;
  let p = 0;
  let readToken = 0;
  let hlTimers = [];

  const art = h('div', { class: 'book-art', 'aria-hidden': 'true' });
  const text = h('p', { class: 'book-text' });
  const ko = h('p', { class: 'book-ko' });
  const pageNo = h('span', { class: 'page-no' });
  const prev = h('button', { class: 'btn btn-ghost', type: 'button', 'aria-label': '이전 쪽', onclick: () => go(p - 1) }, '◀');
  const readBtn = h('button', { class: 'btn btn-sun', type: 'button', onclick: () => read() }, '🔊 읽어 줘');
  const next = h('button', {
    class: 'btn',
    type: 'button',
    onclick: () => {
      if (p < pages.length - 1) go(p + 1);
      else if (quizMode) quiz();
      else ctx.finish({ firstTry: pages.length, total: pages.length });
    },
  });

  const koToggle = h('button', {
    class: 'ko-toggle',
    type: 'button',
    'aria-pressed': String(showKo),
    onclick: () => {
      showKo = !showKo;
      koToggle.setAttribute('aria-pressed', String(showKo));
      koToggle.textContent = showKo ? '우리말 숨기기' : '우리말 뜻 보기';
      ko.hidden = !showKo;
    },
  }, showKo ? '우리말 숨기기' : '우리말 뜻 보기');
  ko.hidden = !showKo;

  const article = h('article', { class: 'book' },
    h('h2', { class: 'book-title' }, BOOK.title),
    art, text, ko,
    h('div', { class: 'book-nav' }, prev, readBtn, next),
    h('div', { class: 'book-foot' }, pageNo, koToggle));
  stage.append(article);

  const clearHl = () => { hlTimers.forEach(clearTimeout); hlTimers = []; };
  ctx.onCleanup(clearHl);

  async function read() {
    clearHl();
    const token = ++readToken;
    const pg = pages[p];
    const ws = [...text.querySelectorAll('.w')];
    const offsets = [];
    let o = 0;
    pg.text.split(' ').forEach((w) => { offsets.push(o); o += w.length + 1; });
    let gotBoundary = false;
    const mark = (i) => ws.forEach((w, k) => { w.classList.toggle('on', k === i); w.classList.toggle('read', k < i); });
    ws.forEach((w) => w.classList.remove('on', 'read'));

    const done = speak(pg.text, 'en-US', {
      rate: 0.78,
      onboundary: (e) => {
        if (e.name && e.name !== 'word') return;
        gotBoundary = true;
        clearHl();
        let i = 0;
        offsets.forEach((off, k) => { if (off <= e.charIndex) i = k; });
        mark(i);
      },
    });
    let t = 200;
    ws.forEach((w, i) => {
      hlTimers.push(setTimeout(() => { if (!gotBoundary && token === readToken) mark(i); }, t));
      t += 280 + w.textContent.length * 85;
    });
    await done;
    if (!ctx.alive || token !== readToken) return;
    clearHl();
    ws.forEach((w) => { w.classList.remove('on'); w.classList.add('read'); });
  }

  function go(i) {
    p = Math.max(0, Math.min(pages.length - 1, i));
    readToken++;
    clearHl();
    const pg = pages[p];
    art.textContent = pg.art;
    art.style.background = pg.bg;
    pop(art);
    sfx.tap();
    const words = pg.text.split(' ');
    text.replaceChildren(...words.flatMap((w, k) => [
      h('span', {
        class: 'w',
        role: 'button',
        tabindex: '0',
        onclick: () => speak(w.replace(/[^A-Za-z']/g, ''), 'en-US'),
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speak(w.replace(/[^A-Za-z']/g, ''), 'en-US'); } },
      }, w),
      k < words.length - 1 ? ' ' : '',
    ]));
    ko.textContent = pg.ko;
    pageNo.textContent = `${p + 1} / ${pages.length}`;
    prev.disabled = p === 0;
    const last = p === pages.length - 1;
    next.textContent = last ? (quizMode ? '다 읽었어요! 문제 풀기 ▶' : '다 읽었어요! ✓') : '▶';
    next.setAttribute('aria-label', last ? '다 읽었어요' : '다음 쪽');
    ctx.progress(p, pages.length);
    ctx.prompt(`"${BOOK.title}" 그림책을 함께 읽어요. 단어를 누르면 소리가 나요!`, read);
  }

  // 독해: 장면 순서 맞추기 → 이야기 질문. 이야기에 질문이 없으면 "이 문장에 맞는 그림은?"을 낸다
  const say = (t) => speak(t, 'en-US');
  function quiz() {
    clearHl();
    const hinter = makeHinter();
    const qs = BOOK.quiz?.length ? BOOK.quiz.map((q) => ({ ...q, a: q.a }))
      : shuffle(pages).slice(0, 3).map((pg) => ({ q: pg.text, a: [pg.art, ...shuffle(pages.filter((x) => x !== pg)).slice(0, 2).map((x) => x.art)], pic: true }));
    const steps = [...(BOOK.order ? ['order'] : []), ...qs];
    const total = steps.reduce((a, st) => a + (st === 'order' ? pages.length : 1), 0);
    let k = 0;
    let firstTry = 0;
    const box = h('section', { class: 'book-quiz', 'aria-live': 'polite' });
    article.replaceChildren(h('h2', { class: 'book-title' }, BOOK.title), box);
    const next = () => ctx.later(() => { k++; if (k >= steps.length) ctx.finish({ firstTry, total }); else ask(); }, 1500);
    function ask() {
      hinter.reset();
      ctx.progress(k, steps.length);
      const st = steps[k];
      if (st === 'order') {
        // 장면 카드를 이야기 순서대로 누른다
        let at = 0;
        const line = h('div', { class: 'bq-line', 'aria-label': '놓은 순서' });
        const cards = shuffle(pages.map((pg, i) => ({ pg, i }))).map(({ pg, i }) => {
          const c = h('button', { class: 'bq-card', type: 'button' }, h('span', { class: 'bq-art', 'aria-hidden': 'true' }, pg.art), h('span', { class: 'latin' }, pg.text));
          c.dataset.i = i;
          c.dataset.miss = '0';
          c.addEventListener('click', () => {
            if (i !== at) {
              c.dataset.miss = '1';
              wiggle(c);
              hinter.miss(cards.find((x) => Number(x.dataset.i) === at));
              return;
            }
            hinter.reset();
            if (c.dataset.miss === '0') firstTry++;
            c.classList.add('placed');
            line.append(h('span', {}, Array.from(pg.art.replace(/\s/g, ''))[0], h('b', {}, at + 1)));
            say(pg.text);
            at++;
            if (at >= pages.length) { cheer(box, 'en'); next(); }
          });
          return c;
        });
        box.replaceChildren(h('p', { class: 'bq-q' }, '이야기 순서대로 장면을 눌러요!'), line, h('div', { class: 'bq-order' }, cards));
        ctx.prompt('이야기를 떠올리며 처음 장면부터 차례대로 눌러요.', () => say('Put the story in order!'));
        return;
      }
      const [answer] = st.a;
      box.replaceChildren(h('p', { class: 'bq-q latin' }, st.q), choiceSet(shuffle([...st.a]), {
        answer,
        hinter,
        cls: st.pic ? 'choice pic' : 'choice word latin',
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          cheer(box, 'en');
          if (!st.pic) say(answer);
          next();
        },
      }));
      ctx.prompt(st.pic ? '문장을 읽고 알맞은 그림을 골라요.' : '이야기를 떠올리며 질문에 알맞은 답을 골라요.', () => say(st.q));
    }
    ask();
  }

  go(0);
}
