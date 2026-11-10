import { h, shuffle, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EXPLAIN_RIDDLES, hasBatchim } from '../data.js';

const ROUNDS = 4;
// 단계별: 보기 수, 그중 같은 갈래(동물·음식…) 보기 수, 보기에 그림을 붙일지, 설명을 읽어 줄지,
// 아이가 설명할 차례에 골라야 할 맞는 설명 수(0이면 고양이 차례만)
const CFG = [
  { choices: 6, same: 2, pics: true, voice: true, child: 0 },
  { choices: 6, same: 2, pics: false, voice: true, child: 0 },
  { choices: 9, same: 4, pics: false, voice: true, child: 0 },
  { choices: 9, same: 4, pics: false, voice: true, child: 2 },
  { choices: 9, same: 4, pics: false, voice: false, child: 3 },
];
// 고양이가 다음 설명을 하기까지 기다리는 시간
const CLUE_GAP = 5200;

const jiyo = (w) => `${w}${hasBatchim(w) ? '이지요' : '지요'}`;

// 설명해 주세요(ExplaintoMe): 고양이가 하나씩 주는 설명을 읽고 무엇인지 맞힌다.
// 4~5단계는 차례를 바꿔 아이가 내 낱말 카드에 맞는 설명을 골라 고양이에게 알려 준다
export function mount(stage, ctx) {
  const L = ctx.level;
  const cfg = CFG[L - 1];
  const hinter = makeHinter();
  const said = h('p', { class: 'ex-said', 'aria-live': 'polite' });
  const sayBtn = h('button', { class: 'ex-say', type: 'button', 'aria-label': '다시 듣기' }, '🔊');
  const cat = h('div', { class: 'ex-cat', 'aria-hidden': 'true' },
    h('i', { class: 'ex-ear l' }), h('i', { class: 'ex-ear r' }),
    h('span', { class: 'ex-head' }, h('i', { class: 'ex-eye l' }), h('i', { class: 'ex-eye r' }), h('i', { class: 'ex-nose' }), h('i', { class: 'ex-mouth' })),
    h('span', { class: 'ex-body' }), h('i', { class: 'ex-paw l' }), h('i', { class: 'ex-paw r' }),
    // 그림(assets/char/cat*.webp)이 있으면 그림으로: 가만히 · 말할 때 · 박수 칠 때
    ...['cat', 'cat-talk', 'cat-clap'].map((n) => h('img', { class: `ex-art ${n}`, src: `assets/char/${n}.webp`, alt: '', draggable: 'false' })));
  cat.querySelector('.ex-art').addEventListener('load', () => cat.classList.add('has-art'), { once: true });
  const bubble = h('div', { class: 'ex-bubble' }, sayBtn, said);
  const side = h('div', { class: 'ex-side' });
  const log = h('ol', { class: 'ex-log', 'aria-label': '지금까지 들은 설명' });
  const board = h('div', { class: 'ex-board' });
  const me = h('div', { class: 'ex-me', 'aria-live': 'polite' });
  stage.append(h('div', { class: 'explain' },
    h('div', { class: 'ex-top' }, cat, bubble),
    h('div', { class: 'ex-desk' }, h('div', { class: 'ex-left' }, side, log), board, me)));

  const riddles = pickN(EXPLAIN_RIDDLES, ROUNDS);
  let r = 0;
  let firstTry = 0;
  let missed = false;
  let busy = false;
  let turn = 0;
  let current = '';

  // 고양이가 말할 때는 말풍선을 바꾸고 입을 움직인다
  async function talk(text, { voice = true } = {}) {
    current = text;
    said.textContent = text;
    pop(bubble);
    if (!voice) return;
    cat.classList.add('talk');
    await speak(text);
    cat.classList.remove('talk');
  }
  sayBtn.addEventListener('click', () => talk(current));

  function addLog(text) {
    const b = h('button', { class: 'ex-chip', type: 'button' }, text);
    b.addEventListener('click', () => talk(text));
    log.prepend(h('li', {}, b));
  }

  // 아이 쪽 말풍선: 정답일 때는 그대로 남긴다
  function showMe(text, stay = false) {
    me.textContent = text;
    me.classList.toggle('stay', stay);
    me.classList.remove('on');
    void me.offsetWidth;
    me.classList.add('on');
  }

  function next() {
    ctx.later(() => {
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry, total: ROUNDS });
      else round();
    }, 2600);
  }

  function solved() {
    busy = true;
    turn++;
    if (!missed) firstTry++;
    hinter.reset();
    sfx.correct();
    cat.classList.add('happy');
    cheer(board);
    ctx.progress(r + 1, ROUNDS);
  }

  /* ---------- 고양이 차례: 설명을 듣고 맞히기 ---------- */
  function catTurn(it) {
    const others = EXPLAIN_RIDDLES.filter((o) => o !== it);
    const same = pickN(others.filter((o) => o.kind === it.kind), cfg.same);
    const rest = pickN(others.filter((o) => o.kind !== it.kind), cfg.choices - 1 - same.length);
    let given = 0;
    let target = null;

    const btns = shuffle([it, ...same, ...rest]).map((o) => {
      const b = h('button', { class: 'ex-pick', type: 'button' },
        cfg.pics ? h('span', { class: 'ex-pic', 'aria-hidden': 'true' }, o.e) : null, o.w);
      b.addEventListener('click', () => guess(o, b));
      if (o === it) target = b;
      return b;
    });
    board.className = 'ex-board picks';
    board.replaceChildren(...btns);

    // 설명은 하나씩 저절로 늘어나고, 틀리게 고르면 바로 다음 설명을 해 준다
    function clue() {
      if (busy || given >= it.yes.length) return;
      const text = it.yes[given++];
      addLog(text);
      talk(text, { voice: cfg.voice });
      const my = ++turn;
      if (given < it.yes.length) ctx.later(() => { if (my === turn) clue(); }, CLUE_GAP);
    }

    function guess(o, b) {
      if (busy || b.disabled) return;
      speak(o.w);
      if (o !== it) {
        missed = true;
        b.disabled = true;
        b.classList.add('no');
        wiggle(b);
        sfx.wrong();
        hinter.miss(target);
        if (given < it.yes.length) ctx.later(() => { if (!busy) clue(); }, 900);
        return;
      }
      solved();
      btns.forEach((x) => x.classList.add('out'));
      showMe(o.w, true);
      ctx.later(() => talk('정답이에요!'), 900);
      next();
    }

    ctx.prompt('고양이가 무엇을 생각하고 있을까요? 설명을 잘 읽고 알맞은 낱말을 눌러요.', () => talk(current), { auto: false });
    ctx.later(clue, 400);
  }

  /* ---------- 아이 차례: 내 낱말 카드를 설명하기 ---------- */
  function childTurn(it) {
    const yes = pickN(it.yes, cfg.child);
    const opts = shuffle([...yes, ...pickN(it.no, cfg.child)]);
    let told = 0;
    const card = h('button', { class: 'ex-card', type: 'button', 'aria-label': `내 낱말 ${it.w}` },
      h('small', {}, '내 낱말'), h('span', { class: 'ex-card-pic', 'aria-hidden': 'true' }, it.e), h('b', {}, it.w));
    card.addEventListener('click', () => speak(it.w));
    side.replaceChildren(card);

    const btns = opts.map((text) => {
      const b = h('button', { class: 'ex-pick line', type: 'button' }, text);
      b.addEventListener('click', () => tell(text, b));
      return b;
    });
    board.className = 'ex-board lines';
    board.replaceChildren(...btns);

    async function tell(text, b) {
      if (busy || b.disabled) return;
      if (!it.yes.includes(text)) {
        missed = true;
        b.disabled = true;
        b.classList.add('no');
        wiggle(b);
        wiggle(card);
        sfx.wrong();
        hinter.miss(btns.find((x) => !x.disabled && yes.includes(x.textContent)));
        talk('음? 그 설명은 카드와 안 맞는 것 같아요. 다시 골라 줘요.');
        return;
      }
      hinter.reset();
      b.disabled = true;
      b.classList.add('out');
      showMe(text);
      addLog(text);
      sfx.pop();
      told++;
      if (told < cfg.child) {
        await speak(text);
        if (busy) return;
        talk(told === 1 ? '음… 또 알려 주세요!' : '거의 알 것 같아요!');
        return;
      }
      busy = true;
      await speak(text);
      if (!stage.isConnected) return;
      await talk(`알았다! ${jiyo(it.w)}?`);
      if (!stage.isConnected) return;
      solved();
      card.classList.add('show');
      btns.forEach((x) => x.classList.add('out'));
      showMe('맞아요!', true);
      next();
    }

    ctx.prompt('이번엔 내가 설명할 차례예요! 내 낱말 카드에 맞는 설명을 골라 고양이에게 알려 줘요.', () => talk(current), { auto: false });
    // 아이가 벌써 하나 골랐으면 첫 인사가 그 대답을 덮지 않게 한다
    ctx.later(() => { if (!told && !missed) talk('무엇을 생각하고 있어요? 설명해 주세요!'); }, 400);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    busy = false;
    missed = false;
    turn++;
    cat.classList.remove('happy');
    me.classList.remove('on');
    side.replaceChildren();
    log.replaceChildren();
    const it = riddles[r];
    if (cfg.child && r % 2 === 1) childTurn(it);
    else catTurn(it);
  }

  round();
}
