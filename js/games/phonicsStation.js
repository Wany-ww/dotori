import { h, shuffle, pick, pickN, wiggle, pop, cheer, makeHinter, wordPic, charFace } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { STATION_WORDS, CHO, JAMO_NAME, decompose } from '../data.js';
import { LEXICON, isPicture } from '../lexicon.js';
import { draggable, hits } from './dragTap.js';

const ROUNDS = 3;
// 단계별: 무엇으로 고르나(첫 글자 syl · 첫소리 cho), 트럭 수, 트럭마다 실을 상자 수, 상자 수, 함정이 비슷한 글자인지, 상자에 낱말을 쓸지
const CFG = [
  { mode: 'syl', trucks: 1, want: 3, boxes: 5, alike: false, label: true },
  { mode: 'syl', trucks: 1, want: 3, boxes: 6, alike: true, label: false },
  { mode: 'cho', trucks: 1, want: 3, boxes: 6, alike: false, label: false },
  { mode: 'syl', trucks: 2, want: 2, boxes: 6, alike: true, label: false },
  { mode: 'cho', trucks: 2, want: 2, boxes: 6, alike: false, label: false },
];
const TRUCK_COLORS = ['#19C2A0', '#F59A3C'];

const first = (w) => w[0];
const choOf = (w) => CHO[decompose(w[0]).c];
const keyOf = (mode, w) => (mode === 'syl' ? first(w) : choOf(w));
// 가로 · 강으로 · 기역으로
const ro = (s) => {
  const d = decompose(s.slice(-1));
  return d && d.t && d.t !== 8 ? '으로' : '로';
};

// 상자 낱말: 말소리 정류장 낱말 + 낱말 사전의 그림 낱말
const ALL_WORDS = [...new Map([...STATION_WORDS, ...LEXICON.filter(isPicture).map((it) => [it.word, it.emoji])]).entries()];

// 이번 판 트럭들의 기준 글자: 상자가 충분한 것만. 두 대면 서로 비슷한 글자(가/고)를 짝짓기도 한다.
// 자음 차시는 그 차시에서 배우는 자음만 트럭의 기준이 된다
function pickKeys(cfg, focus) {
  const groups = {};
  ALL_WORDS.forEach((it) => { (groups[keyOf(cfg.mode, it[0])] ||= []).push(it); });
  let ok = Object.keys(groups).filter((k) => groups[k].length >= cfg.want);
  if (focus?.length && ok.some((k) => focus.includes(k))) ok = ok.filter((k) => focus.includes(k));
  const a = pick(ok);
  if (cfg.trucks === 1) return { keys: [a], groups };
  // 비슷한 글자 짝(가/고)은 첫 글자로 고를 때만
  const near = ok.filter((k) => k !== a && (!cfg.alike || cfg.mode !== 'syl' || choOf(k) === choOf(a)));
  const rest = Object.keys(groups).filter((k) => k !== a && groups[k].length >= cfg.want);
  const others = ok.filter((k) => k !== a);
  return { keys: [a, pick(near.length ? near : others.length ? others : rest)], groups };
}

// 말소리 정류장(PhonicsStation): 기사님 말을 듣고 첫 글자(첫소리)가 맞는 상자를 트럭에 싣는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const lesson = ctx.lesson;
  // 한글 차시: 자음을 배우는 차시는 첫소리(기역으로 시작하는), 그 밖에는 첫 글자(가로 시작하는)
  const cfg = { ...CFG[L - 1] };
  if (lesson) cfg.mode = lesson.kind === 'cons' ? 'cho' : 'syl';
  const focus = lesson?.kind === 'cons' ? lesson.focus : null;
  const hinter = makeHinter();
  const bubble = h('div', { class: 'st-bubble', 'aria-live': 'polite' });
  const street = h('div', { class: 'st-street' });
  const dock = h('div', { class: 'st-dock' });
  stage.append(h('div', { class: 'station' }, h('div', { class: 'st-host' }, h('span', { class: 'st-bear', 'aria-hidden': 'true' }, charFace('driver', '🐻')), bubble), street, dock));

  let r = 0;
  let misses = 0;
  let total = 0;
  let trucks = [];
  let boxes = [];
  let sel = null;
  let busy = false;

  const wait = (ms) => new Promise((res) => ctx.later(res, ms));
  const phrase = (k) => (cfg.mode === 'syl' ? k : `${k}(${JAMO_NAME[k]})`);
  const spoken = (k) => (cfg.mode === 'syl' ? `${k}${ro(k)}` : `${JAMO_NAME[k]}${ro(JAMO_NAME[k])}`);

  function makeTruck(key, i) {
    const load = h('div', { class: 'st-load' });
    const sign = h('span', { class: 'st-sign' }, key);
    const el = h('button', { class: 'st-truck enter', type: 'button', 'aria-label': `${key} 트럭`, style: { '--tc': TRUCK_COLORS[i] } },
      h('span', { class: 'st-bed' }), load,
      h('span', { class: 'st-cab' }, h('span', { class: 'st-win' }, h('i', { class: 'st-driver' }))),
      cfg.trucks > 1 ? sign : null,
      h('i', { class: 'st-wheel a' }), h('i', { class: 'st-wheel b' }));
    const t = { el, key, load, got: 0, done: false };
    el.addEventListener('click', () => {
      if (sel) place(sel, t);
      else if (!busy) ask(t);
    });
    return t;
  }

  async function ask(t) {
    t.el.classList.add('talk');
    await Promise.all([speak([spoken(t.key), '시작하는 상자를 실어 주세요.']), wait(900)]);
    t.el.classList.remove('talk');
  }

  async function askAll() {
    const my = r;
    for (const t of trucks) {
      if (my !== r || !stage.isConnected) return;
      if (!t.done) await ask(t);
    }
  }

  function makeBox(item) {
    const [word, e] = item;
    const el = h('button', { class: 'st-box', type: 'button', 'aria-label': word },
      h('span', { class: 'st-pic', 'aria-hidden': 'true' }, wordPic(word, e)),
      cfg.label ? h('span', { class: 'st-word' }, word) : null);
    const b = { el, word, e, used: false };
    el.addEventListener('click', () => select(b));
    draggable(el, {
      can: () => !busy && !b.used,
      onMove: (p) => trucks.forEach((t) => t.el.classList.toggle('over', !t.done && hits(t.el, p))),
      onDrop: (p) => {
        trucks.forEach((t) => t.el.classList.remove('over'));
        const t = trucks.find((o) => !o.done && hits(o.el, p));
        if (t) place(b, t);
      },
    });
    return b;
  }

  function select(b) {
    if (busy || b.used) return;
    speak(b.word);
    if (sel === b) { b.el.classList.remove('sel'); sel = null; return; }
    sel?.el.classList.remove('sel');
    sel = b;
    b.el.classList.add('sel');
  }

  function place(b, t) {
    if (busy || t.done || b.used) return;
    b.el.classList.remove('sel');
    sel = null;
    if (keyOf(cfg.mode, b.word) !== t.key) {
      misses++;
      wiggle(b.el);
      speak(b.word);
      hinter.miss(boxes.find((o) => !o.used && keyOf(cfg.mode, o.word) === t.key)?.el);
      return;
    }
    hinter.reset();
    b.used = true;
    b.el.classList.add('gone');
    t.load.append(h('span', { class: 'st-cargo' }, b.e));
    t.got++;
    t.el.classList.remove('glow');
    void t.el.offsetWidth;
    t.el.classList.add('glow');
    sfx.pop();
    speak(b.word);
    const all = trucks.reduce((a, o) => a + o.got, 0);
    ctx.progress(r + all / (cfg.want * trucks.length), ROUNDS);
    if (t.got >= cfg.want) leave(t);
  }

  // 다 실은 트럭은 부릉 떠나고, 모두 떠나면 다음 판
  // (두 트럭이 잇달아 다 차도 판이 한 번만 넘어가도록 기다리기 전에 판단한다)
  function leave(t) {
    t.done = true;
    sfx.correct();
    ctx.later(() => t.el.classList.add('go'), 900);
    if (trucks.some((o) => !o.done)) return;
    busy = true;
    ctx.later(() => cheer(dock), 900);
    ctx.later(() => {
      r++;
      if (r >= ROUNDS) ctx.finish({ firstTry: Math.max(0, total - misses), total });
      else round();
    }, 2400);
  }

  function round() {
    hinter.reset();
    ctx.progress(r, ROUNDS);
    sel = null;
    busy = false;
    const { keys, groups } = pickKeys(cfg, focus);
    trucks = keys.map(makeTruck);
    street.replaceChildren(...trucks.map((t) => t.el));
    street.dataset.n = trucks.length;
    ctx.later(() => trucks.forEach((t) => t.el.classList.remove('enter')), 900);

    // 실을 상자 + 어느 트럭에도 맞지 않는 함정 상자
    const need = keys.flatMap((k) => pickN(groups[k], cfg.want));
    total += need.length;
    const rest = ALL_WORDS.filter((it) => !keys.includes(keyOf(cfg.mode, it[0])));
    const near = rest.filter((it) => keys.some((k) => (cfg.mode === 'syl' ? choOf(it[0]) === choOf(k) : false)));
    const trapPool = cfg.alike && near.length ? [...shuffle(near), ...shuffle(rest)] : shuffle(rest);
    const traps = [...new Set(trapPool)].slice(0, cfg.boxes - need.length);
    boxes = shuffle([...need, ...traps]).map(makeBox);
    dock.replaceChildren(...boxes.map((b) => b.el));

    if (cfg.trucks === 1) {
      const k = keys[0];
      bubble.replaceChildren(h('b', {}, phrase(k)), `${cfg.mode === 'syl' ? ro(k) : ro(JAMO_NAME[k])} 시작하는`, h('br'), '상자를 실어 주세요.');
    } else {
      bubble.replaceChildren('트럭에 쓰인 글자로', h('br'), '시작하는 상자를 실어 주세요.');
    }
    ctx.prompt(
      cfg.trucks === 1
        ? '기사님 말을 잘 듣고 알맞은 상자를 트럭에 실어요! 상자를 누르면 이름을 들려줘요.'
        : '트럭마다 실을 상자가 달라요. 첫 글자에 맞는 트럭에 상자를 실어요!',
      () => askAll(),
    );
  }

  round();
}
