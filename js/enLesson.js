// 영어 차시(unit)에 맞는 놀이 내용을 골라 주는 곳.
// 영어 놀이는 ctx.unit의 함수로 글자 · 단어 · 문장 · 대화 · 그림책을 받아서, 같은 놀이라도 단계마다 다른 내용으로 놀게 된다.
import { EN_UNITS, EN_LEVELS } from './enCurriculum.js';
import { EN_WORDS, EN_BANK, EN_DIALOGS, EN_STORIES, storyBook } from './enContent.js';
import { shuffle } from './util.js';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const VOWELS = 'aeiou';
// 짧은 모음 세 글자 단어 (r · w · y로 끝나는 car · cow · boy는 짧은 소리가 아니라서 뺀다)
const isCVC = (w) => /^[bcdfghjklmnprstvwxyz][aeiou][bcdfgklmnpstxz]$/.test(w);
// 알파벳 · 소리 단계의 대표 단어는 그림으로 보여 주기 쉬운 이름 단어(동물 · 음식 · 물건 …)에서 고른다
const THING_TAGS = new Set(['animal', 'food', 'fruit', 'veg', 'drink', 'toy', 'ride', 'body', 'clothes', 'nature', 'house', 'school', 'bug', 'family']);
const isThing = (x) => x.tags.some((t) => THING_TAGS.has(t));
// 긴 모음: 끝 e(a_e · i_e · o_e · u_e)와 ee · ea
// 철자는 긴 모음 모양이지만 소리가 다른 단어
const NOT_LONG = new Set(['one', 'bread', 'heart', 'ear', 'pear', 'bear', 'have', 'give', 'some', 'come', 'love', 'done', 'gone', 'breakfast']);
const longOf = (w) => {
  if (NOT_LONG.has(w)) return null;
  const m = w.match(/^[^aeiou]*([aeiou])[^aeiou]e$/);
  if (m) return m[1];
  if (/ee|ea/.test(w)) return 'e';
  return null;
};
const plain = (w) => /^[a-z]+$/.test(w);
// 단어 앞 관사 (an apple · a ball)
export const article = (w) => (VOWELS.includes(w[0]) && !w.startsWith('u') ? 'an' : w === 'umbrella' || w === 'umbrellas' ? 'an' : 'a');

// 셀 수 있는 그림 이름 단어와 복수형 (그래머 챌린지: a cat · two cats · an apple)
const NOT_COUNT = new Set(['water', 'wash', 'sea', 'snow', 'rain', 'rice', 'milk', 'juice', 'soup', 'cheese', 'jam', 'noodles', 'popcorn', 'salad',
  'bread', 'meat', 'corn', 'broccoli', 'yarn', 'grapes', 'socks', 'jeans', 'gloves', 'shoes', 'scissors', 'teeth', 'feet', 'question', 'quarter',
  'sun', 'moon', 'globe', 'dice', 'candy', 'school', 'teacher', 'lake', 'mountain', 'volcano', 'rainbow', 'cloud', 'heart', 'chicken']);
const IRREGULAR = { mouse: 'mice', sheep: 'sheep', fish: 'fish', leaf: 'leaves', wolf: 'wolves', ox: 'oxen', potato: 'potatoes', tomato: 'tomatoes', mango: 'mangoes' };
export const pluralOf = (w) => IRREGULAR[w] || (/(s|x|z|ch|sh)$/.test(w) ? `${w}es` : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ies` : `${w}s`);
const countable = (x) => x.e && plain(x.w) && isThing(x) && !NOT_COUNT.has(x.w) && !x.tags.includes('drink');
export const COUNT_NOUNS = EN_WORDS.filter(countable);
// 그래머 챌린지 말: a cat · an apple · two cats · a big dog · two small dogs
const NUM = ['', 'a', 'two', 'three'];
export function grammarPhrase(w, n, size = '') {
  const adj = size ? `${size} ` : '';
  return n === 1 ? `${article(adj || w)} ${adj}${w}` : `${NUM[n]} ${adj}${pluralOf(w)}`;
}
// 단계(Lv)마다 나오는 말: 1~2 a · two, 3 three까지, 4~5 big · small까지
export const grammarForms = (L) => ({ counts: L >= 3 ? [1, 2, 3] : [1, 2], sizes: L >= 4 ? ['', 'big', 'small'] : [''] });

// '{정답|함정|함정}' 문장 → 놀이가 쓰는 모양 (앞 · 정답 · 뒤 · 함정 · 전체 문장 · 낱말 조각)
export function parseEn([e, s, ko]) {
  const m = s.match(/^(.*?)\{([^}]+)\}(.*)$/);
  if (!m) return { e, ko, text: s, before: s, answer: '', after: '', wrong: [], words: s.split(' ') };
  const [answer, ...wrong] = m[2].split('|');
  const before = m[1].trimEnd();
  const after = m[3].trimStart();
  const glue = (a, b) => (!a ? b : !b ? a : /^[.,?!]/.test(b) ? a + b : `${a} ${b}`);
  const text = glue(glue(before, answer), after);
  return { e, ko, text, before, answer, after, wrong, words: text.split(' ') };
}

// 단계 안에서 지금까지 배운 글자 (A · B 단계). 그 뒤로는 26자 모두
function knownLetters(unit) {
  if (unit.track !== 'alpha') return ABC;
  const upto = EN_UNITS.slice(0, EN_UNITS.indexOf(unit) + 1);
  const got = new Set(upto.flatMap((u) => u.letters || []));
  return unit.review ? ABC : ABC.filter((L) => got.has(L));
}

// "A is for apple" — 대표 단어가 그 글자로 시작하지 않으면(X → box) "X is in"
const forLine = (L, x) => (x.w[0].toUpperCase() === L ? `${L} is for` : `${L} is in`);

/* ---------- 차시 ---------- */
export function enUnitOf(index) {
  const i = Math.max(0, Math.min(EN_UNITS.length - 1, index));
  const unit = EN_UNITS[i];
  const level = EN_LEVELS[unit.levelIndex];
  const known = knownLetters(unit);
  const focus = unit.letters?.length ? unit.letters : unit.review ? ABC : [];

  // 이 차시의 단어인지 (차시 kind마다 다르게 고른다)
  function fits(x) {
    const w = x.w.toLowerCase();
    switch (unit.kind) {
      case 'alpha':
        return focus.includes(w[0].toUpperCase()) && isThing(x);
      case 'sound':
        if (unit.vowels) return isCVC(w);
        return focus.includes(w[0].toUpperCase()) && plain(w) && w.length <= 6 && isThing(x);
      case 'initial':
        return x.tags.some((t) => unit.tags.includes(t));
      case 'family': {
        if (unit.tags && x.tags.some((t) => unit.tags.includes(t))) return true;
        if (!isCVC(w)) return false;
        return unit.vowel === 'any' || unit.vowel.includes(w[1]);
      }
      case 'long': {
        const lv = longOf(w);
        // 긴 모음 단어와, 같은 모음의 짧은 소리 단어(cat ↔ cake)를 함께
        return Boolean(lv && unit.vowel.includes(lv)) || (isCVC(w) && unit.vowel.includes(w[1]));
      }
      default:
        return Boolean(unit.tags && x.tags.some((t) => unit.tags.includes(t)));
    }
  }
  // 모자랄 때 채우는 단어: 이 단계의 다른 차시 → 아는 글자로 시작하는 쉬운 단어
  const levelPool = () => EN_WORDS.filter((x) => level.units.some((u) => u.tags && x.tags.some((t) => u.tags.includes(t))));
  const easyPool = () => EN_WORDS.filter((x) => known.includes(x.w[0].toUpperCase()) && plain(x.w) && x.w.length <= 5);

  // n개의 단어 { w, e, ko }: pic이면 그림 있는 것만, spell이면 철자 놀이에 쓸 수 있는 것만(띄어쓰기 · 붙임표 없음)
  function words(n, { pic = true, spell = false, minLen = 1, maxLen = 12 } = {}) {
    const ok = (x) => (!pic || x.e) && (!spell || plain(x.w)) && x.w.length >= minLen && x.w.length <= maxLen;
    const seen = new Set();
    const out = [];
    const take = (list, limit = Infinity) => {
      let got = 0;
      shuffle(list).forEach((x) => {
        // 같은 그림 · 같은 단어는 한 번만 (ball ⚽ / soccer ⚽)
        if (got >= limit || out.length >= n || !ok(x) || seen.has(x.w) || (x.e && seen.has(x.e))) return;
        seen.add(x.w);
        if (x.e) seen.add(x.e);
        out.push(x);
        got++;
      });
    };
    // 알파벳 · 소리 차시는 글자마다 고루: 글자마다 대표 단어(A is for apple)를 먼저
    if (unit.kind === 'alpha' || (unit.kind === 'sound' && !unit.vowels)) {
      shuffle(focus).forEach((L) => take([wordFor(L)].filter(Boolean), 1));
      shuffle(focus).forEach((L) => take(EN_WORDS.filter((x) => x.w[0].toUpperCase() === L && fits(x)), 1));
    }
    // 주제가 있는 차시는 주제 단어를, 장모음 차시는 긴 소리 단어를 먼저 (짧은 소리 단어는 비교용으로 조금)
    if (unit.tags && unit.kind !== 'initial') take(EN_WORDS.filter((x) => x.tags.some((t) => unit.tags.includes(t))));
    if (unit.kind === 'long') take(EN_WORDS.filter((x) => longOf(x.w) && unit.vowel.includes(longOf(x.w))), Math.ceil(n * 0.6));
    take(EN_WORDS.filter(fits));
    if (out.length < n) take(levelPool());
    if (out.length < n) take(easyPool());
    if (out.length < n) take(EN_WORDS);
    return out.slice(0, n).map(({ w, e, ko }) => ({ w, e, ko }));
  }

  // 글자: 배우는 글자를 먼저, 그다음 지금까지 배운 글자 (대문자)
  function letters(n, { review = true } = {}) {
    const main = shuffle(focus);
    const rest = review ? shuffle(known.filter((L) => !focus.includes(L))) : [];
    const extra = shuffle(ABC.filter((L) => !main.includes(L) && !rest.includes(L)));
    return [...main, ...rest, ...extra].slice(0, n);
  }
  // 글자의 대표 단어 (A is for apple)
  function wordFor(L) {
    const pref = EN_WORDS.filter((x) => x.w[0].toUpperCase() === L && x.e && plain(x.w));
    const key = { A: 'apple', B: 'ball', C: 'cat', D: 'dog', E: 'egg', F: 'fish', G: 'goat', H: 'hat', I: 'insect', J: 'juice', K: 'kite', L: 'lion', M: 'moon', N: 'nose', O: 'octopus', P: 'pig', Q: 'queen', R: 'rabbit', S: 'sun', T: 'tiger', U: 'umbrella', V: 'van', W: 'whale', X: 'box', Y: 'yarn', Z: 'zebra' }[L];
    return EN_WORDS.find((x) => x.w === key) || pref[0];
  }

  // 문장: D 단계부터는 차시 문장, A ~ C는 차시 단어로 만든 쉬운 문장
  const bank = EN_BANK[unit.id];
  function sentences(n) {
    if (bank) {
      const list = shuffle(bank.map(parseEn));
      while (list.length < n) list.push(...shuffle(bank.map(parseEn)));
      return list.slice(0, n);
    }
    // 알파벳 차시: 글자마다 대표 단어 문장 (A is for apple. · X is in box.)
    if (unit.kind === 'alpha') {
      const pool = words(8);
      return letters(n).map((L) => {
        const x = wordFor(L);
        const wrong = shuffle(pool.filter((y) => y.w !== x.w)).slice(0, 2).map((y) => y.w);
        return parseEn([x.e, `${forLine(L, x)} {${x.w}|${wrong.join('|')}}.`, `${L}는 ${x.ko}(${x.w})의 ${L}예요.`]);
      });
    }
    const ws = words(Math.max(n, 4), { spell: false });
    return ws.slice(0, n).map((x, k) => {
      const others = ws.filter((y) => y !== x).map((y) => y.w);
      const wrong = others.slice(0, 2);
      const art = article(x.w);
      return parseEn([x.e, k % 2 ? `I see ${art} {${x.w}|${wrong.join('|')}}.` : `It is ${art} {${x.w}|${wrong.join('|')}}.`,
        k % 2 ? `${x.ko}이(가) 보여요.` : `${x.ko}예요.`]);
    });
  }

  // 셀 수 있는 그림 이름 단어 n개: 이 차시 단어를 먼저, 모자라면 다른 쉬운 이름 단어
  function things(n) {
    const mine = words(16).map((x) => EN_WORDS.find((y) => y.w === x.w)).filter((x) => x && countable(x));
    const seen = new Set(mine.map((x) => x.e));
    const more = shuffle(COUNT_NOUNS.filter((x) => !seen.has(x.e) && x.w.length <= 6));
    return [...mine, ...more].slice(0, n).map(({ w, e, ko }) => ({ w, e, ko }));
  }

  // 외계인 챗 질문 (단계 대화가 없으면 null → 놀이의 기본 대화)
  const dialogs = EN_DIALOGS[unit.code] || null;

  // 그림책: 이야기가 있는 차시는 그 이야기, 알파벳 · 소리 차시는 알파벳 책, 나머지는 차시 문장으로 만든 책
  function book() {
    if (EN_STORIES[unit.id]) return EN_STORIES[unit.id];
    if (unit.kind === 'alpha' || unit.kind === 'sound') {
      const ls = unit.vowels ? null : (unit.review ? shuffle(ABC).slice(0, 6).sort() : focus);
      if (ls) {
        return storyBook(unit.review ? 'My ABC Book' : `${ls.join(' ')} Book`, ls.map((L) => {
          const x = wordFor(L);
          return [`${L}${L.toLowerCase()} ${x.e}`, `${forLine(L, x)} ${x.w}.`, `${L}는 ${x.ko}(${x.w})의 ${L}예요.`];
        }));
      }
      const ws = words(5, { spell: true });
      return storyBook('Short Vowel Friends', ws.map((x) => [x.e, `I see ${article(x.w)} ${x.w}.`, `${x.ko}이(가) 보여요.`]));
    }
    const list = sentences(Math.min(6, bank?.length || 5));
    return storyBook(`${unit.show || level.title}`, list.map((s) => [s.e, s.text, s.ko]));
  }

  return {
    index: i,
    id: unit.id,
    code: unit.code,
    no: unit.no,
    kind: unit.kind,
    track: unit.track,
    title: unit.levelTitle,
    goal: unit.goal,
    levelGoal: unit.levelGoal,
    level: unit.lv,
    show: unit.show || (focus.length ? focus.join(' ') : ''),
    letters, focus, known, wordFor,
    // 글자 소개 말: "B is for ball." (X는 "X is in box.")
    sayFor: (L) => `${forLine(L, wordFor(L))} ${wordFor(L).w}.`,
    words, sentences, dialogs, book, things,
    // 차시 주제 (animal · food · job …)
    tags: unit.tags || [],
    // 소문자도 함께 보여 줄지 (A · B 단계는 대 · 소문자를 같이 배운다)
    lower: true,
    // 젤리 붙이기에 쓸 묶음 (복수형 -s · -es, 비교급, 과거형)
    jelly: unit.jelly ?? null,
    vowel: unit.vowel || null,
    vowels: Boolean(unit.vowels),
    sentenceUnit: Boolean(bank),
  };
}

export const unitCount = EN_UNITS.length;
