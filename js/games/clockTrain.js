import { h, pick, randInt, shuffle, wiggle, pop, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { timeEn, timeHangul, HOUR_KO, SINO_KO, sinoMin, nativeMin } from '../data.js';

const R = 4;
const NS = 'http://www.w3.org/2000/svg';
// 단계별: 나오는 분, 긴바늘이 12에 고정인지
const CFG = [
  { mins: [0], lockMin: true },
  { mins: [0], lockMin: false },
  { mins: [0, 30], lockMin: false },
  { mins: [15, 30, 45], lockMin: false },
  { mins: [5, 10, 20, 25, 35, 40, 50, 55], lockMin: false },
];
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

// 시계 기차(TrainTime): 기차 시간표의 디지털 시각을 보고 아날로그 시계바늘을 돌려 맞추면 기차가 출발한다.
// 수학 "기차 시간표와 시계"의 영어판 — 시각을 영어로 읽어 준다
// 수학판(기차 시간표와 시계, ctx.lang 'ko'): 시각을 "3시 30분"처럼 한국어로
// 한글판(시계 기차, opts.hangul): 시각을 "세 시 삼십 분"처럼 한글로만 보여 주고, 시계를 보고 한글 시각을 고르는 판도 있다
const timeKo = (hh, mm) => [`${hh}시${mm ? ` ${mm}분` : ''}`];

// 한글판(시계 기차, opts.hangul): 시각을 한글로 읽는다. 시는 고유어(세 시), 분은 한자어(삼십 분)
const HOUR = HOUR_KO;
const SINO = SINO_KO;
// 헷갈리는 읽기: 시를 한자어로(삼 시), 분을 고유어로(서른 분), 이웃한 시
// 함정 두 개 중 하나는 꼭 한자어 시(삼 시)나 고유어 분(서른 분)이다
function misreads(hh, mm) {
  const min = mm ? ` ${sinoMin(mm)} 분` : '';
  const next = HOUR[(hh % 12) + 1];
  const prev = HOUR[hh === 1 ? 12 : hh - 1];
  const words = mm
    ? [`${SINO[hh]} 시${min}`, `${HOUR[hh]} 시 ${nativeMin(mm)} 분`]
    : [`${SINO[hh]} 시`];
  const near = shuffle([`${next} 시${min}`, `${prev} 시${min}`]);
  return [...shuffle(words).slice(0, 1), ...shuffle([...words.slice(1), ...near])].filter((t, i, a) => a.indexOf(t) === i && t !== timeHangul(hh, mm)).slice(0, 2);
}

export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const ko = ctx.lang !== 'en';
  const hangul = ko && ctx.opts.hangul;
  const en = (t) => speak(t, ko ? 'ko-KR' : 'en-US');
  const hinter = makeHinter();
  const board = h('div', { class: 'ct-board' });
  const face = svg('svg', { viewBox: '0 0 200 200', class: 'ct-clock', role: 'img', 'aria-label': '시계' });
  const go = h('button', { class: 'btn ct-go', type: 'button' }, ko ? '🚦 출발!' : '🚦 Go!');
  const train = h('div', { class: 'ct-train', 'aria-hidden': 'true' }, '🚂🚃🚃');
  // 한글판 읽기 칸: 시계를 보고 알맞은 한글 시각을 고른다
  const reads = h('div', { class: 'ct-reads' });
  stage.append(h('div', { class: `clock-train${hangul ? ' hangul' : ''}` }, h('div', { class: 'ct-station' }, board, train), h('div', { class: 'ct-play' }, face, go, reads)));
  let readRound = false;

  // 시계판: 숫자 12개, 눈금 60개, 짧은바늘 · 긴바늘(끝에 잡는 손잡이)
  face.append(svg('circle', { cx: 100, cy: 100, r: 94, class: 'ct-rim' }), svg('circle', { cx: 100, cy: 100, r: 86, class: 'ct-face' }));
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const r0 = i % 5 ? 80 : 75;
    face.append(svg('line', { x1: 100 + r0 * Math.sin(a), y1: 100 - r0 * Math.cos(a), x2: 100 + 84 * Math.sin(a), y2: 100 - 84 * Math.cos(a), class: i % 5 ? 'ct-tick' : 'ct-tick big' }));
  }
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const t = svg('text', { x: 100 + 62 * Math.sin(a), y: 100 - 62 * Math.cos(a) + 7, class: 'ct-num' });
    t.textContent = i;
    face.append(t);
  }
  const hand = (cls, len, w) => {
    const g = svg('g', { class: `ct-hand ${cls}` });
    g.append(svg('line', { x1: 100, y1: 108, x2: 100, y2: 100 - len, 'stroke-width': w }), svg('circle', { cx: 100, cy: 100 - len, r: 11, class: 'ct-knob' }));
    face.append(g);
    return g;
  };
  const hourHand = hand('hour', 44, 9);
  const minHand = hand('minute', 68, 6);
  face.append(svg('circle', { cx: 100, cy: 100, r: 6, class: 'ct-pin' }));

  let hh = 12;
  let mm = 0;
  function draw() {
    hourHand.setAttribute('transform', `rotate(${((hh % 12) + mm / 60) * 30} 100 100)`);
    minHand.setAttribute('transform', `rotate(${mm * 6} 100 100)`);
    face.setAttribute('aria-label', `시계: ${hh}시 ${mm}분`);
  }

  // 바늘 끌기: 시계 가운데에서 본 각도로 짧은바늘은 시, 긴바늘은 5분 단위로 맞춘다
  let drag = null;
  const angle = (e) => {
    const b = face.getBoundingClientRect();
    const x = e.clientX - (b.left + b.width / 2);
    const y = e.clientY - (b.top + b.height / 2);
    return (Math.atan2(x, -y) * 180) / Math.PI + 360;
  };
  [[hourHand, 'h'], [minHand, 'm']].forEach(([g, k]) => g.addEventListener('pointerdown', (e) => {
    if (readRound || (k === 'm' && cfg.lockMin)) { wiggle(g); return; }
    e.preventDefault();
    drag = k;
    g.classList.add('grab');
    try { face.setPointerCapture(e.pointerId); } catch {}
  }));
  face.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const a = angle(e) % 360;
    if (drag === 'h') hh = Math.round(a / 30) % 12 || 12;
    else mm = (Math.round(a / 30) % 12) * 5;
    draw();
  });
  const end = () => {
    if (!drag) return;
    sfx.tap();
    hourHand.classList.remove('grab');
    minHand.classList.remove('grab');
    drag = null;
  };
  face.addEventListener('pointerup', end);
  face.addEventListener('pointercancel', end);

  // 한글판은 6판: 한글 시각을 읽고 바늘 맞추기와, 시계를 보고 한글 시각 고르기를 번갈아 한다
  const rounds = hangul ? 6 : R;
  let n = 0;
  let firstTry = 0;
  let target = null;
  let lastH = 0;
  const depart = (words) => {
    if (hinter.count === 0) firstTry++;
    hinter.reset();
    sfx.correct();
    pop(board);
    cheer(face.parentElement, ko ? 'ko' : 'en');
    en(ko ? [...words, '기차 출발!'] : ['All aboard!', ...words]);
    ctx.later(() => train.classList.add('leave'), 900);
    ctx.later(() => {
      n++;
      if (n >= rounds) ctx.finish({ firstTry, total: rounds });
      else round();
    }, 2800);
  };
  function round() {
    hinter.reset();
    ctx.progress(n, rounds);
    do target = { h: randInt(1, 12), m: pick(cfg.mins) }; while (target.h === lastH);
    lastH = target.h;
    readRound = hangul && n % 2 === 1;
    // 처음 바늘 위치는 정답과 다르게 (읽기 판은 정답 시각을 보여 준다)
    if (readRound) {
      hh = target.h;
      mm = target.m;
    } else {
      do {
        hh = randInt(1, 12);
        mm = cfg.lockMin ? 0 : pick([0, 10, 20, 30, 40, 50]);
      } while (hh === target.h && mm === target.m);
    }
    draw();
    const words = hangul ? [timeHangul(target.h, target.m)] : ko ? timeKo(target.h, target.m) : timeEn(target.h, target.m);
    const digital = `${target.h}:${String(target.m).padStart(2, '0')}`;
    board.dataset.h = target.h;
    board.dataset.m = target.m;
    // 한글판은 시각을 숫자 없이 한글로만 보여 준다 (맞히면 숫자 시각이 나온다)
    board.replaceChildren(
      h('span', { class: 'ct-label' }, ko ? '출발 시각' : 'Departure'),
      hangul
        ? h('b', { class: 'ct-hangul' }, readRound ? '? 시 ? 분' : words[0])
        : h('b', { class: 'ct-digital' }, digital),
      h('span', { class: 'ct-words' }, hangul ? '' : words.join(' ')),
    );
    const reveal = () => {
      if (!hangul) return;
      board.querySelector('.ct-hangul').textContent = words[0];
      board.querySelector('.ct-words').textContent = digital;
    };
    train.classList.remove('leave');
    face.classList.toggle('locked', readRound);
    go.style.display = readRound ? 'none' : '';
    reads.replaceChildren();
    if (readRound) {
      reads.append(choiceSet(shuffle([words[0], ...misreads(target.h, target.m)]), {
        answer: words[0],
        hinter,
        cls: 'choice ct-read',
        onCorrect: () => { reveal(); depart(words); },
      }));
      ctx.prompt('시계를 보고 몇 시 몇 분인지 알맞은 글을 골라요.', () => en('시계를 보고 몇 시 몇 분인지 골라 보세요.'));
      return;
    }
    go.disabled = false;
    go.onclick = () => {
      if (hh === target.h && mm === target.m) {
        go.disabled = true;
        reveal();
        depart(words);
        return;
      }
      wiggle(go);
      // 틀린 바늘을 알려 준다
      hinter.miss(hh !== target.h ? hourHand : minHand);
      en(words);
    };
    ctx.prompt(
      hangul
        ? `출발 시각 글을 읽고, ${cfg.lockMin ? '짧은바늘' : '짧은바늘과 긴바늘'}을 끌어 시계를 맞춘 뒤 출발!을 눌러요.`
        : `기차 출발 시각을 보고, ${cfg.lockMin ? '짧은바늘' : '짧은바늘과 긴바늘'}을 끌어 시계를 맞춘 뒤 ${ko ? '출발' : 'Go'}!를 눌러요.`,
      () => en(ko ? ['기차는', ...words, '에 떠나요'] : ['What time does the train leave?', ...words]),
      // 한글판은 글을 스스로 읽도록, 3단계부터 시각을 저절로 읽어 주지 않는다
      { auto: !hangul || ctx.level <= 2 },
    );
  }

  round();
}
