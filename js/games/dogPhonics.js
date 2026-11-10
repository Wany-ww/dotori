import { h, shuffle, pick, pickN, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { CVC_WORDS, STATION_WORDS, DOG_FINAL_WORDS, CHO, JUNG, CHO_SOUND, JUNG_SOUND, JONG_SOUND, decompose } from '../data.js';
import { draggable, hits } from './dragTap.js';

const R = 3;
// 단계별: 소리를 가르는 자리(첫소리 · 끝소리 · 가운데 모음), 강아지마다 뼈다귀 수, 그 자리 글자를 색으로 짚어 주는지
const CFG = [
  { pos: 0, per: 1, mark: true },
  { pos: 0, per: 2, mark: true },
  { pos: 0, per: 2, mark: false },
  { pos: 2, per: 2, mark: true },
  { pos: 1, per: 2, mark: true },
];
const POS_NAME = ['첫소리', '가운데 소리', '끝소리'];
const TAG = (pos, l) => ['_', '_', '_'].map((c, i) => (i === pos ? l : c)).join(' ');

// 한글판(강아지 먹이 주기): 첫 글자(1~2단계) → 첫소리(3) → 받침(4) → 첫 글자의 모음(5)
const KO_CFG = [
  { key: 'syl', per: 1, mark: true },
  { key: 'syl', per: 2, mark: false },
  { key: 'cho', per: 2, mark: true },
  { key: 'jong', per: 2, mark: true },
  { key: 'jung', per: 2, mark: true },
];
const KO_NAME = { syl: '첫 글자', cho: '첫소리', jung: '모음 소리', jong: '받침 소리' };
const KO = {
  syl: { of: (w) => w[0], say: (k) => k, tag: (k) => `${k} _` },
  cho: { of: (w) => CHO[decompose(w[0]).c], say: (k) => CHO_SOUND[k] || k, tag: (k) => `${k} _` },
  jung: { of: (w) => JUNG[decompose(w[0]).j], say: (k) => JUNG_SOUND[k] || k, tag: (k) => k },
  jong: { of: (w) => Object.keys(DOG_FINAL_WORDS).find((t) => DOG_FINAL_WORDS[t].some((x) => x[0] === w)), say: (k) => JONG_SOUND[k] || k, tag: (k) => `_ ${k}` },
};

// 앉아 있는 강아지 (오른쪽을 본다. 오른쪽 강아지는 뒤집어 왼쪽을 보게 한다)
const DOG = `
<path class="dg-tail" d="M34 104 C14 96 10 76 20 62" />
<ellipse class="dg-fur" cx="64" cy="106" rx="40" ry="30"/>
<ellipse class="dg-fur" cx="44" cy="120" rx="20" ry="22"/>
<rect class="dg-fur" x="84" y="88" width="13" height="50" rx="6"/>
<rect class="dg-fur" x="100" y="88" width="13" height="50" rx="6"/>
<ellipse class="dg-fur" cx="98" cy="88" rx="22" ry="26"/>
<circle class="dg-fur" cx="108" cy="52" r="29"/>
<ellipse class="dg-ear" cx="92" cy="54" rx="11" ry="21" transform="rotate(18 92 54)"/>
<ellipse class="dg-fur" cx="132" cy="64" rx="18" ry="13"/>
<g class="dg-jaw"><ellipse class="dg-fur" cx="128" cy="76" rx="13" ry="6"/></g>
<circle class="dg-dark" cx="148" cy="60" r="6"/>
<circle class="dg-dark" cx="115" cy="45" r="4.5"/>
<rect class="dg-collar" x="84" y="72" width="34" height="8" rx="4" transform="rotate(-14 101 76)"/>
`;

function dogSvg() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 20 160 124');
  s.setAttribute('class', 'dg-svg');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = DOG;
  return s;
}

// 강아지 파닉스(DogPhonics): 두 강아지가 짖는 소리를 듣고, 그 소리가 든 단어 뼈다귀를 알맞은 강아지에게 준다
export function mount(stage, ctx) {
  const ko = ctx.lang === 'ko';
  const lesson = ctx.lesson;
  const cfg = { ...(ko ? KO_CFG : CFG)[ctx.level - 1] };
  // 한글 차시: 그 차시에서 배우는 자리(첫소리·모음·받침)로 나누고, 배우는 낱자를 먼저 고른다
  if (ko && lesson) {
    if (lesson.early) cfg.key = 'syl';
    else if (lesson.slot === 'jong' || lesson.kind === 'finals') cfg.key = 'jong';
    else if (lesson.slot) cfg.key = lesson.slot;
  }
  const lang = ko ? 'ko-KR' : 'en-US';
  const hinter = makeHinter();
  const dogs = [0, 1].map((i) => {
    const bubble = h('span', { class: 'dg-bubble latin' });
    const bowl = h('span', { class: 'dg-bowl', 'aria-hidden': 'true' });
    const el = h('button', { class: `dog dog-${i} dim`, type: 'button' }, bubble, dogSvg(), bowl);
    return { el, bubble, bowl };
  });
  const yard = h('div', { class: 'dg-yard' }, dogs.map((d) => d.el));
  const ground = h('div', { class: 'dg-ground' });
  stage.append(h('div', { class: 'dogphonics' }, yard, ground));

  // 소리를 가를 두 글자: 그 자리에 그 글자가 든 단어가 넉넉한 것만
  const emoji = new Map();
  let words = CVC_WORDS;
  if (ko) {
    const list = cfg.key === 'jong'
      ? Object.values(DOG_FINAL_WORDS).flat()
      : [...STATION_WORDS, ...(lesson ? lesson.words(40, { pic: true, maxLen: 3 }).map((x) => [x.word, x.emoji]) : [])];
    list.forEach(([w, e]) => emoji.set(w, e));
    words = [...emoji.keys()].filter((w) => decompose(w[0]));
  }
  // 영어 차시: 소리 단계는 오늘 글자의 첫소리, 단어 가족 · 모음 차시는 가운데 모음으로 가른다
  let unitKeys = [];
  if (!ko && ctx.unit) {
    const u = ctx.unit;
    const mid = u.vowels || u.kind === 'family' || u.kind === 'long';
    cfg.pos = mid ? 1 : 0;
    const mine = u.words(24, { spell: true, maxLen: 5 }).map((x) => x.w).filter((w) => !mid || w.length === 3);
    words = [...new Set([...mine, ...CVC_WORDS])];
    unitKeys = mid ? [...(u.vowels || !u.vowel || u.vowel === 'any' ? 'aeiou' : u.vowel)] : u.focus.length ? u.focus.map((L) => L.toLowerCase()) : [...new Set(mine.map((w) => w[0]))];
  }
  const at = ko ? KO[cfg.key].of : (w) => w[cfg.pos];
  const groups = {};
  words.forEach((w) => { const k = at(w); if (k) (groups[k] ||= []).push(w); });
  let keys = Object.keys(groups).filter((k) => groups[k].length >= cfg.per + 1);
  const focusKeys = ko && lesson ? keys.filter((k) => lesson.focus.includes(k)) : keys.filter((k) => unitKeys.includes(k));
  if (focusKeys.length) keys = [...new Set([...focusKeys, ...keys])];
  const rounds = [];
  const usedKeys = new Set();
  for (let r = 0; r < R; r++) {
    const free = keys.filter((k) => !usedKeys.has(k));
    const from = free.length >= 2 ? free : keys;
    // 차시에서 배우는 낱자가 있으면 한 마리는 그 소리로
    const lead = focusKeys.filter((k) => from.includes(k));
    let pair = pickN(from, 2);
    if (lead.length) {
      const a = pick(lead);
      const rest = from.filter((k) => k !== a);
      const plain = rest.filter((k) => !lead.includes(k));
      pair = shuffle([a, pick(plain.length ? plain : rest)]);
    }
    pair.forEach((k) => usedKeys.add(k));
    rounds.push(pair.map((k) => ({ key: k, words: pickN(groups[k], cfg.per) })));
  }
  let n = 0;
  let firstTry = 0;
  let total = 0;

  const bark = (d, key) => {
    d.el.classList.remove('dim');
    d.el.classList.add('barking');
    d.bubble.textContent = ko ? KO[cfg.key].tag(key) : TAG(cfg.pos, key);
    d.bubble.classList.add('show');
    sfx.bark();
    ctx.later(() => speak(ko ? KO[cfg.key].say(key) : key.toUpperCase(), lang), 260);
    ctx.later(() => d.el.classList.remove('barking'), 900);
  };

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const pair = rounds[n];
    let sel = null;
    let left = cfg.per * 2;
    ground.replaceChildren();
    dogs.forEach((d) => {
      d.el.classList.add('dim');
      d.el.classList.remove('happy', 'eat', 'no');
      d.bubble.classList.remove('show');
      d.el.setAttribute('aria-label', '강아지');
    });

    // 강아지가 하나씩 불을 켜고 자기 소리를 짖는다
    ctx.later(() => bark(dogs[0], pair[0].key), 500);
    ctx.later(() => bark(dogs[1], pair[1].key), 1700);
    ctx.later(() => {
      dogs.forEach((d, i) => d.el.setAttribute('aria-label', `${ko ? KO_NAME[cfg.key] : POS_NAME[cfg.pos]} ${pair[i].key} 강아지`));
      ground.replaceChildren(...bones);
    }, 2900);

    const bones = shuffle(pair.flatMap((g, i) => g.words.map((w) => ({ w, dog: i })))).map((it, k) => {
      // 한글은 짚어 줄 자리의 글자(첫 글자, 받침 낱말은 그 글자)를 굵게, 그림도 함께
      const markAt = ko ? (cfg.key === 'jong' ? [...it.w].length - 1 : 0) : cfg.pos;
      const letters = [...it.w].map((c, j) => (cfg.mark && j === markAt ? h('b', {}, c) : c));
      const el = h('button', {
        class: `bone${ko ? ' ko' : ' latin'}`,
        type: 'button',
        style: { animationDelay: `${k * 0.12}s` },
        'aria-label': `뼈다귀 ${it.w}`,
      }, ko ? h('i', { class: 'bone-pic', 'aria-hidden': 'true' }, emoji.get(it.w)) : null, h('span', {}, letters));
      el.dataset.miss = '0';
      draggable(el, {
        onMove: (p) => dogs.forEach((d) => d.el.classList.toggle('over', hits(d.el, p, 0))),
        onDrop: (p) => {
          dogs.forEach((d) => d.el.classList.remove('over'));
          const di = dogs.findIndex((d) => hits(d.el, p, 6));
          if (di >= 0) feed(el, it, di, p);
          else wiggle(el);
        },
      });
      el.addEventListener('click', () => {
        sfx.tap();
        speak(it.w, lang);
        bones.forEach((x) => x.classList.remove('sel'));
        if (sel?.el === el) {
          sel = null;
          return;
        }
        sel = { el, it };
        el.classList.add('sel');
      });
      return el;
    });

    dogs.forEach((d, i) => {
      d.el.onclick = () => {
        if (sel) {
          const s = sel;
          sel = null;
          s.el.classList.remove('sel');
          feed(s.el, s.it, i);
          return;
        }
        bark(d, pair[i].key);
      };
    });

    function feed(el, it, di, at) {
      const d = dogs[di];
      if (it.dog !== di) {
        el.dataset.miss = String(Number(el.dataset.miss) + 1);
        wiggle(el);
        d.el.classList.remove('no');
        void d.el.offsetWidth;
        d.el.classList.add('no');
        hinter.miss(dogs[it.dog].el);
        speak(it.w, lang);
        return;
      }
      hinter.reset();
      total++;
      if (el.dataset.miss === '0') firstTry++;
      // 뼈다귀가 밥그릇으로 날아가고, 강아지가 냠냠 먹는다
      const from = el.getBoundingClientRect();
      const home = { x: from.left + from.width / 2, y: from.top + from.height / 2 };
      const to = d.bowl.getBoundingClientRect();
      el.disabled = true;
      if (at) {
        // 끌어다 놓은 자리에서 바로 날아가도록
        el.style.transition = 'none';
        el.style.translate = `${at.x - home.x}px ${at.y - home.y}px`;
        void el.offsetWidth;
        el.style.transition = '';
      }
      el.style.translate = `${to.left + to.width / 2 - home.x}px ${to.top - home.y}px`;
      el.classList.add('fed');
      speak(it.w, lang);
      ctx.later(() => {
        el.style.visibility = 'hidden';
        d.el.classList.remove('eat');
        void d.el.offsetWidth;
        d.el.classList.add('eat');
        sfx.chomp();
        pop(d.bowl);
      }, 480);
      left--;
      ctx.progress(n + (cfg.per * 2 - left) / (cfg.per * 2), R);
      if (left > 0) return;
      ctx.later(() => {
        dogs.forEach((x) => x.el.classList.add('happy'));
        sfx.correct();
        cheer(yard, ko ? 'ko' : 'en');
      }, 1100);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total });
        else round();
      }, 3000);
    }

    ctx.prompt(
      ko
        ? `강아지가 짖는 ${KO_NAME[cfg.key]}를 듣고, 그 소리가 든 낱말 간식을 강아지에게 끌어다 줘요!`
        : `강아지가 짖는 ${POS_NAME[cfg.pos]}를 듣고, 그 소리가 든 단어 뼈다귀를 강아지에게 끌어다 줘요!`,
      () => {
        bark(dogs[0], pair[0].key);
        ctx.later(() => bark(dogs[1], pair[1].key), 1200);
      },
      { auto: false },
    );
  }

  round();
}
