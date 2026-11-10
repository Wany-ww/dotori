// 영어 챌린지 지도: 챌린지(워드 · 파닉스 · 리스닝 · 그래머)마다 20단계 길.
// 단계마다 정해 둔 차시 내용으로 5문제를 풀고, 3문제 이상 맞히면 다음 단계가 열린다.
// 4 · 8 · 12 · 16 · 20단계는 친구가 기다리는 선물 단계. 지도에서 도전할 때마다 오늘의 사탕을 하나 쓴다
import { h } from './ui.js';
import { store, CANDY_PER_DAY } from './store.js';
import { sfx, speak } from './audio.js';
import { EN_UNITS, EN_LEVELS } from './enCurriculum.js';

export const STAGES = 20;
const ROW = 5;

// 단계마다 쓰는 차시: 워드 · 파닉스는 단계 4차시를 차례로, 리스닝 · 그래머는 단계마다 한 차시씩 올라간다
const unitsOf = (codes) => codes.flatMap((c) => EN_UNITS.filter((u) => u.code === c).map((u) => u.id));
const onePerLevel = (codes) => codes.map((c, i) => `${c}-${(i % 4) + 1}`);
const SENTENCE_LEVELS = EN_LEVELS.map((l) => l.code).filter((c) => !'ABCDF'.includes(c));

export const CHALLENGES = {
  word: {
    key: 'e-wchal', name: '단어 챌린지', title: 'WORD CHALLENGE',
    units: unitsOf(['A', 'B', 'C', 'D', 'F']),
    // 아래에서 위로: 숲 → 강 → 바위산
    bands: [
      { bg: 'linear-gradient(#7ED957, #49B95E)', deco: ['🌲', '🌲', '🌳', '🌼', '🦋', '🌲', '🍄'] },
      { bg: 'linear-gradient(#5ED7F2, #3CC0E6)', deco: ['🐊', '🐟', '🪵', '💦', '🦆'] },
      { bg: 'linear-gradient(#D9C79C, #C2AD80)', deco: ['🪨', '🚩', '⛰️', '🐐', '🪨'] },
    ],
    friends: ['🐶', '🐻', '🐱', '🦊', '🐰'],
    side: '#1F4D35',
  },
  phonics: {
    key: 'e-pchal', name: '파닉스 챌린지', title: 'PHONICS CHALLENGE',
    units: unitsOf(['B', 'C', 'D', 'F', 'J']),
    // 박물관 → 화석 발굴지 → 공룡 숲
    bands: [
      { bg: 'linear-gradient(#BEE6F7, #8FD3F0)', deco: ['🏛️', '🌳', '🖼️', '🌳', '🗿'] },
      { bg: 'linear-gradient(#A8754C, #8A5A36)', deco: ['🦴', '🐚', '⛏️', '🦴', '🪨'] },
      { bg: 'linear-gradient(#3E9E5C, #2C7D47)', deco: ['🦖', '🌿', '🌴', '🦕', '🌿'] },
    ],
    friends: ['🐱', '🐼', '🦉', '🐯', '🐨'],
    side: '#2B2F48',
  },
  listening: {
    key: 'e-lchal', name: '리스닝 챌린지', title: 'LISTENING CHALLENGE',
    units: [...onePerLevel(SENTENCE_LEVELS), 'Z-4'].slice(0, STAGES),
    // 수족관 → 바닷속 → 동굴
    bands: [
      { bg: 'linear-gradient(#3B6FD6, #2850B3)', deco: ['🐬', '🐬', '🪸', '🐳', '🫧'] },
      { bg: 'linear-gradient(#8FF0CF, #5FD9B4)', deco: ['🐢', '🐠', '🌿', '🐡', '🪼'] },
      { bg: 'linear-gradient(#A88A78, #8B6F5E)', deco: ['🦇', '🪨', '🐧', '💎', '🦇'] },
    ],
    friends: ['🐷', '🐸', '🐧', '🐙', '🦁'],
    side: '#2A2448',
  },
  grammar: {
    key: 'e-gchal', name: '그래머 챌린지', title: 'GRAMMAR CHALLENGE',
    units: onePerLevel(EN_LEVELS.map((l) => l.code)).slice(0, STAGES),
    // 런던 → 파리 → 열기구 하늘
    bands: [
      { bg: 'linear-gradient(#4A7BDB, #3062C4)', deco: ['🌉', '🚌', '💂', '🏰', '☂️'] },
      { bg: 'linear-gradient(#8B5FDB, #6E44C4)', deco: ['🗼', '🥐', '🎨', '⛲', '🥖'] },
      { bg: 'linear-gradient(#F7A3C4, #EE84AE)', deco: ['🎈', '☁️', '🎈', '🏔️', '🐦'] },
    ],
    friends: ['🐶', '🐵', '🐔', '🐧', '🦄'],
    side: '#22263A',
  },
};
export const kindOfGame = (key) => Object.keys(CHALLENGES).find((k) => CHALLENGES[k].key === key) || null;
export const stageUnitIndex = (kind, stage) => EN_UNITS.findIndex((u) => u.id === CHALLENGES[kind].units[stage - 1]);

// 단계 자리: 1 ~ 5 오른쪽 위로 비스듬히, 6 ~ 10 왼쪽으로, 11 ~ 15 다시 비스듬히 … (x는 %, y는 아래에서 px)
function spot(i) {
  const row = Math.floor(i / ROW);
  const col = i % ROW;
  const diag = row % 2 === 0;
  const base = 70 + Math.floor(row / 2) * 330 + (diag ? 0 : 240);
  return { x: diag ? 12 + col * 19 : 88 - col * 19, y: diag ? base + col * 42 : base };
}
const HEIGHT = spot(STAGES - 1).y + 120;

export function viewChallenge(kind) {
  const C = CHALLENGES[kind];
  const c = store.challenge(kind);
  const stars = Object.values(c.stars).reduce((a, b) => a + b, 0);
  const note = h('p', { class: 'cm-note', 'aria-live': 'polite' });
  const candies = Array.from({ length: CANDY_PER_DAY }, (_, i) => h('i', { class: i < store.candiesLeft() ? 'on' : '' }, '🍬'));

  // 띠 배경 세 개 (경계는 비스듬히)
  const bandH = HEIGHT / 3;
  const bands = C.bands.map((b, k) => h('div', {
    class: 'cm-band',
    style: { bottom: `${k * bandH - 30}px`, height: `${bandH + 60}px`, background: b.bg, zIndex: 3 - k },
  }, b.deco.map((d, j) => h('span', { class: 'cm-deco', 'aria-hidden': 'true', style: { left: `${(j * 37 + k * 23) % 90 + 3}%`, top: `${(j * 29 + 17) % 70 + 10}%` } }, d))));
  // 단계를 잇는 점선
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'cm-path');
  svg.setAttribute('viewBox', `0 0 100 ${HEIGHT}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const line = document.createElementNS(ns, 'polyline');
  line.setAttribute('points', Array.from({ length: STAGES }, (_, i) => `${spot(i).x},${HEIGHT - spot(i).y}`).join(' '));
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(line);

  const stops = Array.from({ length: STAGES }, (_, i) => {
    const n = i + 1;
    const { x, y } = spot(i);
    const gift = n % 4 === 0;
    const state = n < c.stage || c.stars[n] ? 'done' : n === c.stage ? 'now' : 'locked';
    const got = c.stars[n] || 0;
    const b = h('button', {
      class: `cm-stop ${state}${gift ? ' gift' : ''}`, type: 'button', style: { left: `${x}%`, bottom: `${y}px` },
      'aria-label': `${n}단계${gift ? ' 선물' : ''}, ${state === 'done' ? `별 ${got}개, 다시 하기` : state === 'now' ? '도전하기' : '아직 잠겨 있어요'}`,
      disabled: state === 'locked' ? true : null,
    },
    gift ? h('span', { class: 'cm-friend', 'aria-hidden': 'true' }, C.friends[n / 4 - 1]) : h('b', {}, n),
    gift && !c.gifts.includes(n) ? h('span', { class: 'cm-gift', 'aria-hidden': 'true' }, '🎁') : null,
    got ? h('span', { class: 'cm-stars', 'aria-hidden': 'true' }, '★'.repeat(got)) : null);
    b.addEventListener('click', () => start(n, b));
    return b;
  });
  const here = spot(c.stage - 1);
  const dog = h('div', { class: 'cm-dog', style: { left: `${here.x}%`, bottom: `${here.y + 34}px` }, 'aria-hidden': 'true' },
    h('span', {}, '🐶'), h('em', {}, c.stage === 1 && !c.stars[1] ? '시작' : '도전!'));
  const map = h('div', { class: 'cm-map', style: { height: `${HEIGHT}px` } }, bands, svg, stops, dog);
  const scroller = h('div', { class: 'cm-scroll' }, map);

  function start(n, b) {
    if (!store.useCandy()) {
      sfx.wrong();
      note.textContent = '오늘의 사탕을 다 썼어요. 내일 또 도전해요!';
      speak('오늘의 사탕을 다 썼어요. 내일 또 도전해요!');
      return;
    }
    sfx.pop();
    const left = store.candiesLeft();
    candies.forEach((el, i) => el.classList.toggle('on', i < left));
    candies[left]?.classList.add('used');
    dog.style.left = b.style.left;
    dog.style.bottom = `calc(${b.style.bottom} + 34px)`;
    dog.classList.add('hop');
    setTimeout(() => { location.hash = `#/play/${C.key}?stage=${n}`; }, 700);
  }

  const view = h('main', { class: 'page cm', 'data-subject': 'english', style: { '--side': C.side } },
    h('div', { class: 'cm-top' },
      h('a', { class: 'icon-btn', href: '#/challenges', 'aria-label': '챌린지 고르기로' }, '←'),
      h('div', { class: 'cm-banner' }, h('span', { 'aria-hidden': 'true' }, '👑'), h('b', {}, C.name)),
      h('div', { class: 'cm-side' },
        h('span', { class: 'cm-total', 'aria-label': `모은 별 ${stars}개` }, `${stars}`, h('i', { 'aria-hidden': 'true' }, '★')),
        h('div', { class: 'cm-candy', 'aria-label': `오늘의 사탕 ${store.candiesLeft()}개` }, h('small', {}, "Today's Candy"), h('span', {}, candies)))),
    scroller,
    note);
  view.mount = () => {
    // 지금 단계가 보이게 지도를 내린다
    scroller.scrollTop = Math.max(0, HEIGHT - here.y - scroller.clientHeight / 2);
    speak('도전할 단계를 눌러 보세요!');
  };
  return view;
}

// 챌린지 고르기: 지도 네 개
export function viewChallenges() {
  return h('main', { class: 'page', 'data-subject': 'english' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/extra/english', 'aria-label': '추가 학습으로' }, '←'),
      h('div', {}, h('h1', {}, '🗺️ 영어 챌린지'), h('p', { class: 'muted' }, `단계마다 5문제! 3문제 이상 맞히면 다음 단계가 열려요. 지도에서는 하루에 ${CANDY_PER_DAY}번 도전할 수 있어요.`))),
    h('div', { class: 'cm-pick' }, Object.entries(CHALLENGES).map(([k, C]) => {
      const c = store.challenge(k);
      // 흰 글씨가 잘 보이도록 진한 띠 색으로 (파닉스는 밝은 박물관 대신 화석 땅)
      return h('a', { class: `cm-card ${k}`, href: `#/challenge/${k}`, style: { background: C.bands[k === 'phonics' ? 1 : 0].bg } },
        h('span', { class: 'cm-card-deco', 'aria-hidden': 'true' }, C.bands.map((b) => b.deco[0]).join('')),
        h('b', {}, C.title),
        h('span', {}, `${C.name} · ${Math.min(c.stage, STAGES)} / ${STAGES}단계`));
    })));
}
