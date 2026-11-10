import { h, shuffle, pick, wiggle, pop, burst, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { TOY_WORDS, TOY_WORDS2, TOY_ALIKE, EN_TOY_WORDS, EN_TOY_ALIKE } from '../data.js';

const ROUNDS = 3;
// 단계별: 몬스터 수, 벨트에 섞는 다른 물건 수, 말풍선(그림+낱말 → 낱말 → 소리만), 벨트 속도(px/s)
const CFG = [
  { mons: 2, extra: 1, show: 'pic', pool: TOY_WORDS, speed: 34 },
  { mons: 2, extra: 2, show: 'word', pool: TOY_WORDS, speed: 38 },
  { mons: 3, extra: 2, show: 'word', pool: [...TOY_WORDS, ...TOY_WORDS2], speed: 42 },
  { mons: 2, extra: 2, show: 'sound', alike: true, speed: 42 },
  { mons: 3, extra: 3, show: 'sound', alike: true, speed: 48 },
];
// 몬스터마다 몸 색, 모자 색, 목소리 높이가 달라요
const CREW = [
  { name: '초록', mc: '#8BD45E', hc: '#F0607A', pitch: 1.0 },
  { name: '주황', mc: '#F29A6B', hc: '#4AAEFF', pitch: 1.35 },
  { name: '보라', mc: '#B497F2', hc: '#FFCB3D', pitch: 0.8 },
];
const ALL = [...TOY_WORDS, ...TOY_WORDS2, ...TOY_ALIKE.flat(), ...EN_TOY_WORDS, ...EN_TOY_ALIKE.flat()];
const EMOJI = new Map(ALL);
const emojiOf = (w) => EMOJI.get(w) || '🎁';

// 한 판의 낱말: 몬스터가 달라는 것(wants)과 벨트에 섞는 다른 물건(others).
// 앞 판에서 달라고 한 낱말(asked)은 되도록 다시 고르지 않는다
function roundWords(cfg, asked, alikeSets = TOY_ALIKE) {
  const fresh = (list, has) => [...shuffle(list.filter((x) => !has(x))), ...shuffle(list.filter(has))];
  if (!cfg.alike) {
    const w = fresh(cfg.pool, (x) => asked.has(x[0])).slice(0, cfg.mons + cfg.extra).map((x) => x[0]);
    return { wants: w.slice(0, cfg.mons), others: shuffle(w.slice(cfg.mons)) };
  }
  // 소리가 비슷한 낱말(곰/공)을 두 몬스터가 나눠 갖거나, 짝꿍 낱말을 벨트에 함께 올린다
  const wants = [];
  const others = [];
  for (const g of fresh(alikeSets, (g) => g.some((x) => asked.has(x[0])))) {
    const need = cfg.mons - wants.length;
    if (need <= 0) break;
    const s = shuffle(g.map((x) => x[0])).filter((w) => !wants.includes(w) && !others.includes(w));
    if (s.length < 2) continue;
    const take = Math.min(2, need);
    wants.push(...s.slice(0, take));
    others.push(...s.slice(take));
  }
  return { wants, others: others.slice(0, cfg.extra) };
}

// 장난감 공장(ToyFactory): 몬스터의 말을 듣고 컨베이어 벨트 위 물건을 알맞은 상자에 담는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const lang = en ? 'en-US' : 'ko-KR';
  const cfg = { ...CFG[L - 1] };
  if (en && cfg.pool) cfg.pool = EN_TOY_WORDS;
  // 한글 차시: 그 차시의 그림 낱말을 벨트에 올린다. 비슷한 소리 묶음(곰/공)은 받침을 배운 뒤에만
  const lesson = ctx.lesson;
  if (lesson) {
    cfg.pool = lesson.words(12, { pic: true }).map((w) => [w.word, w.emoji]);
    cfg.pool.forEach(([w, e]) => EMOJI.set(w, e));
    if (cfg.alike && !lesson.batchim) { cfg.alike = false; cfg.show = 'word'; }
    if (lesson.early) cfg.show = lesson.kind === 'vocab' ? 'pic' : cfg.show === 'sound' ? 'word' : cfg.show;
  }
  // 영어 차시: 오늘 단어를 벨트에 올린다 (비슷한 소리 묶음 대신 오늘 단어끼리)
  if (ctx.unit) {
    cfg.pool = ctx.unit.words(12).map((w) => [w.w, w.e]);
    cfg.pool.forEach(([w, e]) => EMOJI.set(w, e));
    cfg.alike = false;
    if (cfg.show === 'sound' && ctx.unit.level <= 2) cfg.show = 'word';
  }
  const hinter = makeHinter();
  const crew = h('div', { class: 'tf-crew' });
  const belt = h('div', { class: 'tf-belt' });
  stage.append(h('div', { class: 'factory' }, crew, belt));

  const asked = new Set();
  let r = 0;
  let misses = 0;
  let total = 0;
  let mons = [];
  let toys = [];
  let others = [];
  let lastWord = '';
  let running = false;
  let sel = null;
  let offset = 0;
  let raf = 0;
  let last = 0;

  const request = (w) => (en ? [w, 'please!'] : [w, '주세요!']);

  // 몬스터가 말할 때는 머리 위 전등이 켜지고 입이 움직인다
  async function talk(m) {
    mons.forEach((o) => o.el.classList.remove('talk'));
    m.el.classList.add('talk');
    // 소리를 꺼 두어도 누가 말하는지 보이도록 잠깐은 전등을 켜 둔다
    await Promise.all([
      speak(request(m.want), lang, { pitch: m.crew.pitch }),
      new Promise((res) => ctx.later(res, 1100)),
    ]);
    m.el.classList.remove('talk');
  }
  async function talkAll() {
    const my = r;
    for (const m of mons) {
      if (my !== r || !stage.isConnected) return;
      if (!m.done) await talk(m);
    }
  }

  function makeMon(c, want) {
    const bubble = h('button', { class: 'tf-bubble', type: 'button', 'aria-label': `${c.name} 몬스터의 말 다시 듣기` },
      cfg.show === 'sound' ? '🔊' : cfg.show === 'pic' ? [h('span', { 'aria-hidden': 'true' }, emojiOf(want)), ` ${want}`] : want);
    if (en) bubble.classList.add('latin');
    const got = h('span', { class: 'tf-got', 'aria-hidden': 'true' });
    const hold = h('button', { class: 'tf-hold', type: 'button', 'aria-label': `${c.name} 몬스터의 상자` }, h('span', { class: 'tf-box' }), got, h('span', { class: 'tf-front' }));
    const el = h('div', { class: 'tf-mon', style: { '--mc': c.mc, '--hc': c.hc } },
      h('span', { class: 'tf-lamp', 'aria-hidden': 'true' }),
      bubble,
      h('span', { class: 'tf-body', 'aria-hidden': 'true' },
        h('i', { class: 'tf-hat' }), h('i', { class: 'tf-eyes' }), h('i', { class: 'tf-mouth' })),
      hold);
    const m = { el, hold, got, want, crew: c, done: false };
    el.dataset.want = want;
    bubble.addEventListener('click', () => talk(m));
    hold.addEventListener('click', () => {
      if (sel) attempt(sel, m);
      else talk(m);
    });
    return m;
  }

  /* ---------- 컨베이어 벨트 ---------- */
  const size = () => toys[0]?.el.offsetWidth || 84;
  const step = () => size() * 1.85;

  // 벨트에 올릴 다음 물건: 아직 못 받은 몬스터의 물건이 벨트에 없으면 꼭 넣어 준다
  function nextWord() {
    const need = mons.filter((m) => !m.done).map((m) => m.want);
    const onBelt = toys.map((t) => t.word);
    const missing = need.filter((w) => !onBelt.includes(w));
    let w;
    if (missing.length) w = pick(missing);
    else {
      const pool = Math.random() < 0.5 && need.length ? need : [...others, ...mons.filter((m) => m.done).map((m) => m.want)];
      const fresh = pool.filter((x) => x !== lastWord);
      w = pick(fresh.length ? fresh : pool.length ? pool : need);
    }
    lastWord = w;
    return w;
  }

  function makeToy(word, x) {
    const el = h('button', { class: 'tf-toy', type: 'button', 'aria-label': `${word} 물건` }, h('span', { class: 'tf-toy-face' }, emojiOf(word)));
    el.dataset.word = word;
    const t = { el, word, x, dx: 0, dy: 0, held: false };
    let drag = null;
    el.addEventListener('pointerdown', (e) => {
      if (!running) return;
      try { el.setPointerCapture(e.pointerId); } catch {}
      drag = { sx: e.clientX, sy: e.clientY, moved: false };
    });
    el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 8) return;
      if (!drag.moved) {
        drag.moved = true;
        select(t);
        el.classList.add('dragging');
      }
      t.dx = dx;
      t.dy = dy;
      place(t);
      const over = monAt(el);
      mons.forEach((m) => m.hold.classList.toggle('over', m === over));
    });
    const up = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      el.classList.remove('dragging');
      if (!moved) return;
      t.justDragged = true;
      const over = monAt(el);
      mons.forEach((m) => m.hold.classList.remove('over'));
      if (over) attempt(t, over);
      else drop(t);
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    // 누르기만 하면 집어 들고, 상자를 누르면 넣는다
    el.addEventListener('click', () => {
      if (t.justDragged) { t.justDragged = false; return; }
      if (!running) return;
      if (sel === t) drop(t);
      else select(t);
    });
    belt.append(el);
    place(t);
    return t;
  }

  function place(t) {
    t.el.style.transform = `translate(${t.x + t.dx}px, ${t.dy}px)`;
  }

  function select(t) {
    if (sel && sel !== t) drop(sel);
    sel = t;
    t.held = true;
    t.el.classList.add('sel');
    sfx.tap();
    speak(t.word, lang);
  }

  // 다시 벨트 위로
  function drop(t) {
    t.held = false;
    t.dx = 0;
    t.dy = 0;
    t.el.classList.remove('sel');
    if (sel === t) sel = null;
    place(t);
  }

  function monAt(el) {
    const b = el.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    return mons.find((m) => {
      const q = m.hold.getBoundingClientRect();
      return x > q.left - 24 && x < q.right + 24 && y > q.top - 40 && y < q.bottom + 24;
    });
  }

  function spawn() {
    const left = Math.min(0, ...toys.map((t) => t.x));
    toys.push(makeToy(nextWord(), left - step()));
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    // 물건을 들고 있는 동안은 벨트가 멈춰서 천천히 고를 수 있다
    if (running && !sel) {
      const W = belt.clientWidth;
      const d = cfg.speed * dt;
      offset += d;
      belt.style.setProperty('--belt', `${offset}px`);
      toys.forEach((t) => { t.x += d; place(t); });
      toys.filter((t) => t.x > W).forEach((t) => {
        t.el.remove();
        toys = toys.filter((o) => o !== t);
        spawn();
      });
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  ctx.onCleanup(() => cancelAnimationFrame(raf));

  /* ---------- 상자에 담기 ---------- */
  function attempt(t, m) {
    if (m.done || t.word !== m.want) {
      misses++;
      // 벨트 위치는 transform으로 잡혀 있어서 겉이 아니라 그림만 흔든다
      wiggle(t.el.firstChild);
      wiggle(m.el.querySelector('.tf-body'));
      drop(t);
      // 이 몬스터가 원하는 물건을 벨트에서 반짝여 알려 준다
      hinter.miss(m.done ? null : toys.find((o) => o.word === m.want)?.el);
      if (!m.done) ctx.later(() => talk(m), 500);
      return;
    }
    hinter.reset();
    sel = null;
    t.el.remove();
    toys = toys.filter((o) => o !== t);
    m.done = true;
    m.got.textContent = emojiOf(t.word);
    m.el.classList.add('happy');
    pop(m.hold);
    burst(m.hold);
    sfx.correct();
    speak(t.word, lang, { pitch: m.crew.pitch });
    ctx.progress(r + mons.filter((o) => o.done).length / mons.length, ROUNDS);
    if (mons.some((o) => !o.done)) {
      spawn();
      return;
    }
    running = false;
    cheer(crew, en ? 'en' : 'ko');
    ctx.later(() => {
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
      else round();
    }, 1700);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    const words = roundWords(cfg, asked, en ? EN_TOY_ALIKE : TOY_ALIKE);
    words.wants.forEach((w) => asked.add(w));
    others = words.others;
    total += words.wants.length;
    mons = words.wants.map((w, i) => makeMon(CREW[i], w));
    crew.replaceChildren(...mons.map((m) => m.el));
    crew.dataset.n = mons.length;
    belt.replaceChildren();
    toys = [];
    sel = null;
    lastWord = '';
    // 처음부터 벨트 위에 물건이 놓여 있고, 원하는 물건이 모두 한 번씩은 보이게 한다
    const first = shuffle([...words.wants, ...others]);
    toys.push(makeToy(first[0], 0));
    const W = belt.clientWidth;
    const n = Math.max(first.length, Math.ceil(W / step()) + 1);
    toys[0].x = W - size() - step() * 0.4;
    place(toys[0]);
    for (let i = 1; i < n; i++) {
      const word = first[i] || nextWord();
      toys.push(makeToy(word, toys[0].x - step() * i));
    }
    running = true;
    ctx.prompt(
      cfg.show === 'sound'
        ? `몬스터 친구의 ${en ? '영어 ' : ''}말을 잘 듣고 알맞은 물건을 상자에 넣어요! 말풍선을 누르면 다시 들려요.`
        : `몬스터 친구가 달라는 물건을 벨트에서 골라 상자에 넣어 주세요!`,
      () => talkAll(),
    );
  }

  round();
}
