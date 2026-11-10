import { sfx } from './audio.js';
import { pick } from './util.js';
import { WORD_ART_LIST } from './wordArtList.js';
export { shuffle, pick, pickN, randInt } from './util.js';

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) el.style.setProperty(sk, sv);
          else el.style[sk] = sv;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

function replayAnim(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}
export const wiggle = (el) => replayAnim(el, 'wiggle');
export const pop = (el) => replayAnim(el, 'pop');

export function burst(el, emojis = ['⭐', '✨', '🌰', '💛']) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 14; i++) {
    const s = h('span', { class: 'burst', 'aria-hidden': 'true' }, pick(emojis));
    const a = Math.random() * Math.PI * 2;
    const d = 70 + Math.random() * 90;
    s.style.left = `${cx}px`;
    s.style.top = `${cy}px`;
    s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
    document.body.append(s);
    setTimeout(() => s.remove(), 950);
  }
}

// 캐릭터 그림: assets/char/<이름>.webp가 있으면 그림을, 없으면 이모지를 보여 준다 (docs/asset-prompts.md)
export function charFace(name, emoji) {
  const img = h('img', { class: 'char-img', src: `assets/char/${name}.webp`, alt: '', draggable: 'false' });
  img.addEventListener('error', () => img.replaceWith(emoji), { once: true });
  return img;
}

// 낱말 그림: assets/words/<낱말>.webp. 그림이 있는 낱말은 wordArtList.js(그림 다듬는 스크립트가 만듦)에 있고,
// 한글 낱말이나 아래의 영어 낱말로 찾는다. 그림이 없으면 이모지를 그대로 쓴다
const WORD_ART = {
  고래: 'whale', 사과: 'apple', 나비: 'butterfly', 기차: 'train', 모자: 'hat', 우유: 'milk', 포도: 'grapes', 토끼: 'rabbit bunny',
  사자: 'lion', 오리: 'duck', 바나나: 'banana', 도토리: 'acorn', 피자: 'pizza', 하마: 'hippo', 거미: 'spider', 시계: 'clock',
  버스: 'bus', 자두: 'plum', 강아지: 'dog puppy', 고양이: 'cat kitten', 사슴: 'deer', 연필: 'pencil', 딸기: 'strawberry', 수박: 'watermelon',
  우산: 'umbrella', 기린: 'giraffe', 선물: 'gift present', 풍선: 'balloon', 눈사람: 'snowman', 자동차: 'car', 비행기: 'airplane plane',
  햄버거: 'hamburger burger', 코끼리: 'elephant', 원숭이: 'monkey', 병아리: 'chick', 달팽이: 'snail', 가방: 'bag backpack', 라면: 'ramen noodles',
  구름: 'cloud', 무지개: 'rainbow', 지구: 'earth', 거북이: 'turtle', 곰: 'bear', 달: 'moon', 별: 'star', 산: 'mountain', 문: 'door',
  밤: 'chestnut', 공: 'ball', 집: 'house', 손: 'hand', 물: 'water', 빵: 'bread', 책: 'book', 꽃: 'flower', 양말: 'socks',
};
// 같은 글자라도 뜻이 다른 낱말(밤 = 깜깜한 밤)은 그림 대신 이모지를 쓴다
const ART_ONLY_WITH = { 밤: '🌰', 별: '⭐🌟', 달: '🌙🌛🌜', 물: '💧', 눈: '❄️☃️🌨️', 다리: '🦵', 차: '🚗🚙', 말: '🐴🐎', 이: '🦷', 배: '🍐' };
const ART_FILE = new Map([...WORD_ART_LIST.map((ko) => [ko, ko]), ...Object.entries(WORD_ART).flatMap(([ko, en]) => (WORD_ART_LIST.includes(ko) ? en.split(' ').map((w) => [w, ko]) : []))]);
export function wordArt(word, emoji) {
  const key = String(word || '').trim();
  const ko = ART_FILE.get(key) || ART_FILE.get(key.toLowerCase());
  if (!ko || (emoji && ART_ONLY_WITH[ko] && !ART_ONLY_WITH[ko].includes(emoji))) return null;
  return `assets/words/${encodeURIComponent(ko)}.webp`;
}
export function wordPic(word, emoji) {
  const src = wordArt(word, emoji);
  if (!src) return emoji ?? '';
  const img = h('img', { class: 'word-img', src, alt: '', draggable: 'false' });
  img.addEventListener('error', () => img.replaceWith(emoji ?? ''), { once: true });
  return img;
}

// 스티커: data.js의 STICKERS(이모지) 순서와 같은 그림 이름. 그림이 없으면 이모지
const STICKER_ART = { '🐰': 'bunny', '🦊': 'fox', '🐻': 'bear', '🐼': 'panda', '🐨': 'koala', '🐯': 'tiger', '🦁': 'lion', '🐸': 'frog', '🐵': 'monkey', '🦄': 'unicorn', '🐙': 'octopus', '🦋': 'butterfly', '🐳': 'whale', '🦉': 'owl', '🐧': 'penguin', '🐢': 'turtle', '🦔': 'hedgehog', '🦩': 'flamingo', '🐞': 'ladybug', '🐝': 'bee', '🦕': 'baby-dinosaur', '🐬': 'dolphin', '🦜': 'parrot', '🐹': 'hamster' };
export function stickerPic(emoji) {
  const name = STICKER_ART[emoji];
  if (!name) return emoji;
  const img = h('img', { class: 'sticker-img', src: `assets/stickers/${name}.webp`, alt: '', draggable: 'false' });
  img.addEventListener('error', () => img.replaceWith(emoji), { once: true });
  return img;
}

const PRAISE = {
  ko: ['잘했어요!', '최고예요!', '멋져요!', '정답이에요!', '우와, 대단해요!'],
  en: ['Great job!', 'Awesome!', 'Well done!', 'You got it!'],
};
const CHEER_UP = ['괜찮아, 다시 해 보자!', '천천히 해도 돼요!', '거의 다 왔어요!'];

// 토리가 화면 아래에서 고개를 내밀고 한마디 한다
function peek(text, soft) {
  document.querySelectorAll('.cheer').forEach((c) => c.remove());
  const t = h('div', { class: `cheer${soft ? ' soft' : ''}`, 'aria-hidden': 'true' },
    h('span', { class: 'cheer-tori' }, charFace(soft ? 'tori-think' : 'tori-cheer', '🐿️')),
    h('span', { class: 'cheer-say' }, text));
  document.body.append(t);
  setTimeout(() => t.remove(), 1450);
}
export function cheer(el, lang = 'ko') {
  burst(el);
  peek(pick(PRAISE[lang] || PRAISE.ko), false);
}
export const encourage = () => peek(pick(CHEER_UP), true);

// 무벌점 원칙 + 단계적 힌트: 1회 오답 소리, 2회 정답 반짝임, 3회 가이드 손가락
export function makeHinter() {
  let wrong = 0;
  let hand = null;
  let glowEl = null;
  let hostEl = null;
  return {
    get count() { return wrong; },
    miss(target) {
      wrong++;
      sfx.wrong();
      if (wrong === 2) encourage();
      if (!target) return;
      if (wrong >= 2 && !glowEl?.isConnected) {
        glowEl = target;
        target.classList.add('hint-glow');
      }
      if (wrong >= 3 && !hand?.isConnected) {
        if (getComputedStyle(target).position === 'static') {
          hostEl = target;
          target.classList.add('hint-host');
        }
        hand = h('span', { class: 'guide-hand', 'aria-hidden': 'true' }, '👆');
        target.append(hand);
      }
    },
    reset() {
      wrong = 0;
      hand?.remove();
      hand = null;
      glowEl?.classList.remove('hint-glow');
      glowEl = null;
      hostEl?.classList.remove('hint-host');
      hostEl = null;
    },
  };
}

// 보기 버튼 묶음. 정답이면 onCorrect(button, 오답 횟수), 오답이면 흔들고 힌트 단계 진행
export function choiceSet(options, { answer, hinter, onCorrect, render = (o) => o, cls = 'choice', label }) {
  let locked = false;
  const buttons = options.map((o) =>
    h('button', { class: cls, type: 'button', 'aria-label': label ? label(o) : null }, render(o)),
  );
  const answerBtn = buttons[options.indexOf(answer)];
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => {
      if (locked) return;
      if (options[i] === answer) {
        locked = true;
        b.querySelector('.guide-hand')?.remove();
        b.classList.remove('hint-glow');
        b.classList.add('correct');
        sfx.correct();
        onCorrect(b, hinter.count);
      } else {
        wiggle(b);
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 700);
        hinter.miss(answerBtn);
      }
    });
  });
  return h('div', { class: 'choices' }, buttons);
}
