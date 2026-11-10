import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { LABEL_SCENES } from '../content.js';
import { EN_WORDS } from '../enContent.js';
import { draggable, hits } from './dragTap.js';

const R = 2;
const SHOWN = 6;
// 단계별: 빈 이름표 수, 다른 장면에서 섞는 함정 이름표 수
const BLANKS = [3, 4, 5, 6, 6];
const TRAPS = [0, 0, 1, 1, 2];

// 영어판 공책 주제: 차시 주제(tag)의 그림 단어로 공책을 만든다 (제목 = 주제 이름)
const TOPIC = {
  animal: 'Animals', food: 'Food', fruit: 'Fruit', family: 'Family', school: 'School', toy: 'Toys', clothes: 'Clothes', job: 'Jobs',
  weather: 'Weather', feeling: 'Feelings', place: 'Places', sport: 'Sports', nature: 'Nature', house: 'House', ride: 'Rides', body: 'Body', bug: 'Bugs', veg: 'Vegetables',
};
const STICKER = ['#8EA6F5', '#F6E27A', '#F5B36B', '#F59BE0', '#F2738C', '#7FD6B4', '#B79BF2'];
function topicScenes(unit) {
  const tags = (unit?.tags || []).filter((t) => TOPIC[t]);
  return tags.map((t) => ({ en: TOPIC[t], things: EN_WORDS.filter((x) => x.e && x.tags.includes(t) && /^[a-z ]+$/.test(x.w)).map((x) => [x.e, x.ko, x.w]) }))
    .filter((sc) => sc.things.length >= 6);
}

// 이름표 붙이기(Labeling): 그림 속 물건의 빈 이름표 자리에 알맞은 이름표를 붙인다.
// 영어판은 공책에 그림 4 ~ 6장과 제목 칸이 있고, 오른쪽 스티커(낱말 이름표 · 제목 · 함정)를 끌어다 붙인다 (참고 영상: "Jobs")
export function mount(stage, ctx) {
  const en = ctx.lang === 'en';
  if (en) { notebook(stage, ctx); return; }
  const lang = en ? 'en-US' : 'ko-KR';
  const L = ctx.level;
  const hinter = makeHinter();
  const scenes = pickN(LABEL_SCENES, R);
  const board = h('div', { class: 'lb-scene' });
  const tray = h('div', { class: 'lb-tray' });
  const below = h('div', { class: 'lb-below' });
  stage.append(h('div', { class: `labeling${en ? ' en' : ''}` }, board, tray, below));
  const name = (t) => (en ? t[2] : t[1]);
  let s = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    below.replaceChildren();
    const sc = scenes[s];
    const things = pickN(sc.things, SHOWN);
    const blanks = new Set(pickN(things.map((_, i) => i), BLANKS[L - 1]));
    const slots = [];
    let sel = null;
    board.className = `lb-scene bg-${sc.bg}`;
    board.replaceChildren(...things.map((t, i) => {
      const blank = blanks.has(i);
      const slot = h('button', { class: `lb-label${blank ? ' empty' : ''}`, type: 'button', 'aria-label': blank ? '빈 이름표' : name(t) }, blank ? '' : name(t));
      slot.dataset.w = name(t);
      slot.addEventListener('click', () => {
        if (!slot.classList.contains('empty')) { sfx.tap(); speak(name(t), lang); return; }
        if (sel) stick(sel, slot);
      });
      if (blank) slots.push(slot);
      return h('div', {
        class: 'lb-thing',
        style: { left: `${8 + (i % 3) * 31 + randInt(0, 6)}%`, top: `${8 + Math.floor(i / 3) * 46 + randInt(0, 6)}%` },
      }, h('span', { class: 'lb-emoji', 'aria-hidden': 'true' }, t[0]), slot);
    }));
    const others = LABEL_SCENES.filter((x) => x !== sc).flatMap((x) => x.things).filter((t) => !things.some((u) => name(u) === name(t)));
    const words = shuffle([...[...blanks].map((i) => name(things[i])), ...pickN(others, TRAPS[L - 1]).map(name)]);
    tray.replaceChildren(...words.map((w, i) => {
      const tag = h('button', { class: 'lb-tag', type: 'button', style: { '--r': `${randInt(-5, 5)}deg`, animationDelay: `${i * 0.07}s` } }, w);
      tag.dataset.w = w;
      tag.dataset.miss = '0';
      draggable(tag, {
        onDrop: (pt) => {
          const slot = slots.find((x) => x.classList.contains('empty') && hits(x, pt, 8));
          if (slot) stick(tag, slot);
          else wiggle(tag);
        },
      });
      tag.addEventListener('click', () => {
        sfx.tap();
        speak(w, lang);
        if (sel === tag) { tag.classList.remove('sel'); sel = null; return; }
        sel?.classList.remove('sel');
        sel = tag;
        tag.classList.add('sel');
      });
      return tag;
    }));
    let left = slots.length;
    total += left;

    function stick(tag, slot) {
      if (tag.dataset.w !== slot.dataset.w) {
        tag.dataset.miss = '1';
        wiggle(tag);
        wiggle(slot);
        hinter.miss(slots.find((x) => x.classList.contains('empty') && x.dataset.w === tag.dataset.w) || null);
        return;
      }
      hinter.reset();
      if (sel === tag) sel = null;
      tag.remove();
      if (tag.dataset.miss === '0') firstTry++;
      slot.classList.remove('empty');
      slot.textContent = slot.dataset.w;
      slot.setAttribute('aria-label', slot.dataset.w);
      pop(slot);
      sfx.pop();
      speak(slot.dataset.w, lang);
      left--;
      ctx.progress(s + (slots.length - left) / (slots.length + (en ? 1 : 0)), R);
      if (left > 0) return;
      // 함정 이름표는 남겨 두지 않는다
      tray.replaceChildren();
      if (en) ctx.later(askTitle, 900);
      else ctx.later(sceneDone, 700);
    }

    // 영어판: 그림 전체의 제목 붙이기
    function askTitle() {
      const opts = shuffle([sc, ...pickN(LABEL_SCENES.filter((x) => x !== sc), 2)]);
      total++;
      below.replaceChildren(h('p', { class: 'lb-ask' }, '그림의 제목을 붙여요!'), choiceSet(opts, {
        answer: sc,
        hinter,
        cls: 'choice word latin lb-title',
        render: (o) => o.en,
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          board.dataset.title = sc.en;
          board.classList.add('titled');
          speak(sc.en, lang);
          sceneDone();
        },
      }));
      speak('What is the title?', lang);
    }

    function sceneDone() {
      sfx.correct();
      cheer(board, en ? 'en' : 'ko');
      ctx.later(() => {
        s++;
        if (s >= R) ctx.finish({ firstTry, total });
        else round();
      }, 2000);
    }

    ctx.progress(s, R);
    ctx.prompt(en ? '그림 속 빈 이름표 자리에 알맞은 영어 이름표를 붙여요. 다 붙이면 제목도 붙여요!' : '그림 속 빈칸에 알맞은 이름표를 붙여 주세요!',
      () => (en ? speak('Put the labels on the picture!', lang) : speak('알맞은 이름표를 붙여 주세요!')));
  }

  round();
}

// 영어판: 공책 한 쪽에 그림 카드와 이름표 칸, 위에 제목 칸. 제목 스티커도 다른 이름표처럼 같이 붙인다
function notebook(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const topic = topicScenes(ctx.unit);
  const scenes = [...pickN(topic, R), ...pickN(LABEL_SCENES.filter((x) => !topic.some((t) => t.en === x.en)), R)].slice(0, R);
  const title = h('button', { class: 'lb-title-slot empty', type: 'button', 'aria-label': '제목 칸' });
  const grid = h('div', { class: 'lb-grid' });
  const tray = h('div', { class: 'lb-stickers' });
  stage.append(h('div', { class: 'labeling en notebook' }, h('div', { class: 'lb-book' }, title, grid), tray));
  let s = 0;
  let firstTry = 0;
  let total = 0;

  function round() {
    hinter.reset();
    const sc = scenes[s];
    const count = L <= 2 ? 4 : 6;
    const things = pickN(sc.things, count);
    let sel = null;
    title.className = 'lb-title-slot empty';
    title.textContent = '';
    title.dataset.w = sc.en;
    const slots = [title];
    grid.className = `lb-grid n${count}`;
    grid.replaceChildren(...things.map((t) => {
      const slot = h('button', { class: 'lb-label empty', type: 'button', 'aria-label': '빈 이름표' });
      slot.dataset.w = t[2];
      slots.push(slot);
      return h('figure', { class: 'lb-card' }, h('span', { class: 'lb-photo', 'aria-hidden': 'true' }, t[0]), slot);
    }));
    const others = [...LABEL_SCENES, ...topicScenes(ctx.unit)].filter((x) => x.en !== sc.en).flatMap((x) => x.things).map((t) => t[2])
      .filter((w) => !things.some((t) => t[2] === w));
    const words = shuffle([...things.map((t) => t[2]), sc.en, ...pickN([...new Set(others)], TRAPS[L - 1])]);
    tray.replaceChildren(...words.map((w, i) => {
      const tag = h('button', { class: `lb-sticker${w === sc.en ? ' title' : ''}`, type: 'button', style: { '--c': STICKER[i % STICKER.length], animationDelay: `${i * 0.06}s` } }, w);
      tag.dataset.w = w;
      tag.dataset.miss = '0';
      draggable(tag, {
        onDrop: (pt) => {
          const slot = slots.find((x) => x.classList.contains('empty') && hits(x, pt, 10));
          if (slot) stick(tag, slot);
          else wiggle(tag);
        },
      });
      tag.addEventListener('click', () => {
        sfx.tap();
        speak(w, 'en-US');
        if (sel === tag) { tag.classList.remove('sel'); sel = null; return; }
        sel?.classList.remove('sel');
        sel = tag;
        tag.classList.add('sel');
      });
      return tag;
    }));
    slots.forEach((slot) => { slot.onclick = () => { if (sel && slot.classList.contains('empty')) stick(sel, slot); }; });
    let left = slots.length;
    total += left;

    function stick(tag, slot) {
      if (tag.dataset.w !== slot.dataset.w) {
        tag.dataset.miss = '1';
        wiggle(tag);
        wiggle(slot);
        hinter.miss(slots.find((x) => x.classList.contains('empty') && x.dataset.w === tag.dataset.w) || null);
        return;
      }
      hinter.reset();
      if (sel === tag) sel = null;
      if (tag.dataset.miss === '0') firstTry++;
      slot.style.setProperty('--c', tag.style.getPropertyValue('--c'));
      tag.remove();
      slot.classList.remove('empty');
      slot.textContent = slot.dataset.w;
      pop(slot);
      sfx.pop();
      speak(slot.dataset.w, 'en-US');
      left--;
      ctx.progress(s + (slots.length - left) / slots.length, R);
      if (left > 0) return;
      tray.replaceChildren();
      sfx.correct();
      cheer(grid, 'en');
      ctx.later(() => {
        s++;
        if (s >= R) ctx.finish({ firstTry, total });
        else round();
      }, 2000);
    }
    ctx.progress(s, R);
    ctx.prompt('스티커를 그림 아래 이름표 칸에 붙여요. 공책 맨 위에는 그림 전체의 제목 스티커를 붙여요!', () => speak('Put the labels on the picture!', 'en-US'));
  }
  round();
}
