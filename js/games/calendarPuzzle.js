import { h, shuffle, pickN, randInt, wiggle, pop, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_DAYS, EN_MONTHS, EN_ORDINALS, numEn } from '../data.js';
import { draggable, hits } from './dragTap.js';

const svg = (body, w, hgt) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${hgt}' preserveAspectRatio='none'>${body}</svg>`)}")`;
// 요일 판: 일곱 조각을 이으면 한 장이 되는 가을 마을 그림
const DAYS_ART = svg(`<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FFE27A'/><stop offset='1' stop-color='#FFF3C4'/></linearGradient></defs>
<rect width='700' height='300' fill='url(#s)'/><circle cx='560' cy='70' r='34' fill='#FFC93C'/>
<path d='M0 170 L60 110 L120 160 L190 95 L260 170Z' fill='#E98A3B'/><path d='M150 170 L230 120 L300 170Z' fill='#C9632F'/>
<ellipse cx='330' cy='70' rx='40' ry='14' fill='#fff'/><ellipse cx='430' cy='95' rx='34' ry='12' fill='#fff'/>
<rect y='170' width='700' height='130' fill='#8BCB4A'/><path d='M0 200 Q180 180 360 205 T700 195 V215 Q520 230 360 222 T0 222Z' fill='#5BB7D9'/>
<rect x='70' y='140' width='46' height='34' fill='#C0392B'/><path d='M64 142 L93 118 L122 142Z' fill='#7B2E1E'/><rect x='86' y='154' width='12' height='20' fill='#FFE08A'/>
<circle cx='160' cy='160' r='14' fill='#F2A23A'/><rect x='157' y='166' width='6' height='14' fill='#7A4A22'/>
<circle cx='250' cy='250' r='18' fill='#E2552E'/><circle cx='275' cy='256' r='14' fill='#F2A23A'/>
<circle cx='420' cy='245' r='16' fill='#F5C842'/><rect x='417' y='252' width='6' height='16' fill='#7A4A22'/>
<path d='M500 175 L520 120 L540 175Z' fill='#6C4A2A'/><circle cx='520' cy='125' r='26' fill='#E07B39'/>
<rect x='560' y='110' width='90' height='70' fill='#B23A2A'/><path d='M548 114 L605 66 L662 114Z' fill='#3B2B2B'/>
<rect x='575' y='125' width='22' height='20' fill='#FFE08A'/><rect x='615' y='125' width='22' height='20' fill='#FFE08A'/><rect x='596' y='150' width='20' height='30' fill='#5B2A1A'/>
<circle cx='580' cy='190' r='8' fill='#F28C28'/><circle cx='640' cy='192' r='8' fill='#F28C28'/><rect x='670' y='120' width='4' height='60' fill='#333'/><circle cx='672' cy='118' r='6' fill='#FFE08A'/>`, 700, 300);
// 날짜 판: 해와 산이 있는 하늘빛 그림 (달력 칸마다 한 조각)
const DATES_ART = svg(`<defs><radialGradient id='g' cx='.45' cy='.4' r='.6'><stop offset='0' stop-color='#9FE3D2'/><stop offset='1' stop-color='#2FAFA0'/></radialGradient></defs>
<rect width='700' height='600' fill='url(#g)'/><circle cx='330' cy='260' r='110' fill='#F2C230' opacity='.85'/>
<path d='M-20 600 L170 330 L380 600Z' fill='#7FB13A'/><path d='M260 600 L470 380 L700 600Z' fill='#5E8F2A'/><path d='M430 600 L600 450 L760 600Z' fill='#8DBF45'/>`, 700, 600);
// 달 카드 그림
const MONTH_E = ['⛄', '💝', '🌱', '🌷', '🌼', '🍓', '🏖️', '🍉', '🍎', '🎃', '🍂', '🎄'];
const TINTS = ['#4A90E2', '#E2689F', '#58B45F', '#F28DB5', '#E3AE1F', '#E8574F', '#35A3B8', '#5DBB63', '#E8574F', '#F08A3A', '#B9763A', '#3E9B5A'];

// 단계별: 요일(이름 보임) → 요일(이름 없음) → 달 → 날짜(그림 조각) → 날짜(숫자만, 빈칸 많이)
const CFG = [
  { mode: 'days', label: true },
  { mode: 'days', label: false },
  { mode: 'months' },
  { mode: 'dates', holes: 6, art: true },
  { mode: 'dates', holes: 10, art: false },
];

// 달력 퍼즐(DaysandWeeks): 요일 · 달 · 날짜 조각을 제자리에 끼워 한 주, 한 해, 한 달을 완성한다
// 수학판(달력과 요일, ctx.lang 'ko'): 같은 놀이를 한국어 요일 · 달 이름으로
const KO_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const KO_MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
const KO_ORD = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
export function mount(stage, ctx) {
  const ko = ctx.lang !== 'en';
  const en = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  const DAYS = ko ? KO_DAYS : EN_DAYS;
  const MONTHS = ko ? KO_MONTHS : EN_MONTHS;
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const title = h('div', { class: 'cp-title' });
  const board = h('div', { class: `cp-board ${cfg.mode}` });
  const tray = h('div', { class: 'cp-tray' });
  const chant = h('div', { class: 'cp-chant', 'aria-live': 'polite' });
  const frame = h('div', { class: 'cp-frame' }, title, board);
  stage.append(h('div', { class: `cal-puzzle ${cfg.mode}` }, frame, tray, chant));

  let firstTry = 0;
  let sel = null;
  let queue = [];
  let total = 0;
  let placed = 0;
  const slots = new Map();

  // 판 위의 자리: key → 칸. 조각 하나 = { key, face(조각 모습), say }
  function piece(it, i) {
    const p = h('button', {
      class: `cp-piece ${cfg.mode}`,
      type: 'button',
      style: { ...it.style, '--r': `${randInt(-7, 7)}deg`, animationDelay: `${0.1 + i * 0.08}s` },
      'aria-label': `${it.say} 조각`,
    }, ...it.face());
    p.dataset.key = it.key;
    p.dataset.miss = '0';
    draggable(p, {
      onDrop: (pt) => {
        const slot = [...slots.values()].find((s) => !s.classList.contains('filled') && hits(s, pt, 4));
        if (slot) place(p, it, slot);
        else wiggle(p);
      },
    });
    p.addEventListener('click', () => {
      sfx.tap();
      en(it.say);
      if (sel?.el === p) { p.classList.remove('sel'); sel = null; return; }
      sel?.el.classList.remove('sel');
      sel = { el: p, it };
      p.classList.add('sel');
    });
    return p;
  }

  function slot(key, extra = {}, ...kids) {
    const s = h('button', { class: `cp-slot ${cfg.mode}`, type: 'button', 'aria-label': '빈 자리', ...extra }, ...kids);
    s.dataset.key = key;
    s.addEventListener('click', () => { if (sel && !s.classList.contains('filled')) place(sel.el, sel.it, s); });
    slots.set(key, s);
    return s;
  }

  function place(p, it, s) {
    const target = slots.get(it.key);
    if (s !== target) {
      p.dataset.miss = String(Number(p.dataset.miss) + 1);
      wiggle(p);
      wiggle(s);
      hinter.miss(target);
      return;
    }
    hinter.reset();
    if (sel?.el === p) sel = null;
    p.remove();
    if (p.dataset.miss === '0') firstTry++;
    s.classList.add('filled');
    Object.entries(it.style).forEach(([k, v]) => s.style.setProperty(k, v));
    s.setAttribute('aria-label', it.say);
    s.replaceChildren(...it.face());
    pop(s);
    sfx.pop();
    en(it.say);
    placed++;
    ctx.progress(placed, total);
    refill();
    if (placed >= total) ctx.later(done, 900);
  }

  // 받침대에 한 번에 보이는 조각 수 (달은 열두 장이라 다섯 장씩)
  const SHOW = cfg.mode === 'months' ? 5 : 12;
  function refill() {
    while (tray.children.length < SHOW && queue.length) tray.append(piece(queue.shift(), tray.children.length));
  }

  // 다 끼우면 차례로 읽어 준다 (요일 · 달 노래), 날짜는 그 달이 몇 번째 달인지
  function done() {
    sfx.correct();
    cheer(frame, ko ? 'ko' : 'en');
    if (cfg.mode === 'dates') {
      const line = ko ? `${KO_MONTHS[month]}은 한 해의 ${KO_ORD[month]} 번째 달이에요!` : `${EN_MONTHS[month]} is the ${EN_ORDINALS[month]} month of the year!`;
      chant.replaceChildren(h('p', { class: 'cp-say' }, line));
      en(line);
      ctx.later(() => ctx.finish({ firstTry, total }), 3600);
      return;
    }
    const names = cfg.mode === 'days' ? DAYS : MONTHS;
    const words = names.map((w) => h('span', { class: 'cp-word' }, w));
    chant.replaceChildren(...words);
    let i = 0;
    const next = () => {
      words.forEach((w, k) => w.classList.toggle('on', k === i));
      const s = [...slots.values()][i];
      s?.classList.add('sing');
      ctx.later(() => s?.classList.remove('sing'), 700);
      en(names[i]);
      i++;
      if (i < names.length) ctx.later(next, 900);
      else ctx.later(() => ctx.finish({ firstTry, total }), 1600);
    };
    ctx.later(next, 1200);
  }

  let month = 0;
  if (cfg.mode === 'days') {
    title.textContent = ko ? '요일' : 'Days of the week';
    const items = DAYS.map((d, i) => ({
      key: d,
      say: d,
      style: { '--art': DAYS_ART, '--x': `${(i / 6) * 100}%` },
      face: () => [h('span', { class: 'cp-tag' }, d)],
    }));
    board.replaceChildren(...items.map((it) => slot(it.key, {}, cfg.label ? h('span', { class: 'cp-ghost' }, it.say) : null)));
    queue = shuffle(items);
    ctx.prompt(cfg.label ? '요일 이름을 보고, 그림 조각을 제자리에 끼워 그림을 완성해요!' : `${DAYS[0]}부터 ${DAYS[6]}까지, 요일 순서대로 그림 조각을 끼워요!`,
      () => en(ko ? '요일을 차례대로 끼워요!' : "Let's put the days of the week in order!"));
  } else if (cfg.mode === 'months') {
    title.textContent = ko ? '열두 달' : 'Months of the year';
    const items = MONTHS.map((m, i) => ({
      key: m,
      say: m,
      style: { '--tint': TINTS[i] },
      face: () => [h('span', { class: 'cp-emoji', 'aria-hidden': 'true' }, MONTH_E[i]), h('span', { class: 'cp-tag' }, m)],
    }));
    // 1월과 7월은 미리 끼워 두어 줄의 시작을 알려 준다
    const given = new Set([0, 6]);
    board.replaceChildren(...items.map((it, i) => {
      const s = slot(it.key, { style: it.style }, h('span', { class: 'cp-num' }, i + 1));
      if (given.has(i)) { s.classList.add('filled'); s.replaceChildren(...it.face()); }
      return s;
    }));
    queue = shuffle(items.filter((_, i) => !given.has(i)));
    ctx.prompt(`${MONTHS[0]}부터 ${MONTHS[11]}까지, 달 카드를 순서대로 끼워요!`, () => en(ko ? '1월부터 12월까지 차례대로 끼워요!' : "Let's put the months in order!"));
  } else {
    month = randInt(0, 11);
    const year = new Date().getFullYear();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((first + days) / 7);
    title.textContent = ko ? KO_MONTHS[month] : EN_MONTHS[month].toUpperCase();
    const holes = new Set(pickN([...Array(days).keys()].map((i) => i + 1), cfg.holes));
    const tile = (d) => {
      const cell = first + d - 1;
      return {
        key: String(d),
        say: ko ? `${d}일` : numEn(d),
        style: cfg.art ? { '--art': DATES_ART, '--x': `${((cell % 7) / 6) * 100}%`, '--y': `${(Math.floor(cell / 7) / Math.max(1, rows - 1)) * 100}%`, '--rows': rows } : {},
        face: () => [h('b', {}, d)],
      };
    };
    board.style.setProperty('--rows', rows);
    board.classList.toggle('art', cfg.art);
    board.replaceChildren(
      ...(ko ? ['일', '월', '화', '수', '목', '금', '토'] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']).map((w, i) => h('span', { class: `cp-wd${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}` }, w)),
      ...Array.from({ length: first }, () => h('span', { class: 'cp-pad' })),
      ...Array.from({ length: days }, (_, k) => {
        const it = tile(k + 1);
        if (holes.has(k + 1)) return slot(it.key, { style: it.style });
        const c = h('button', { class: 'cp-date', type: 'button', style: it.style, 'aria-label': it.say }, ...it.face());
        c.addEventListener('click', () => { sfx.tap(); pop(c); en(it.say); });
        return c;
      }),
    );
    queue = shuffle([...holes].map(tile));
    ctx.prompt('달력에서 빠진 날짜를 찾아, 숫자 조각을 제자리에 끼워요!', () => en(ko ? `${KO_MONTHS[month]} 달력의 빠진 날짜를 찾아요!` : [EN_MONTHS[month], 'Find the missing dates!']));
  }
  total = queue.length;
  ctx.progress(0, total);
  refill();
}
