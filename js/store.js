import { pick } from './util.js';
import { MAX_LEVEL } from './data.js';
import { makeDailyCourse } from './course.js';
import { HANGUL_STEPS, startStepForAge, CHECK_EVERY, CHECK_PASS, CHECK_KEY, weakestStep } from './curriculum.js';
import { EN_UNITS, startUnitForAge } from './enCurriculum.js';
import { MATH_UNITS, startMathUnitForAge } from './mathCurriculum.js';
import { sync } from './sync.js';

const KEY = 'dotori-forest-v2';
const SUBJECT_IDS = ['hangul', 'math', 'english'];
const AUTO_WINDOW = 4;
const AUTO_AVG = 2.75;
export const CANDY_PER_DAY = 5;
const LOG_DAYS = 180;

export const today = () => new Date().toLocaleDateString('sv');
export const levelForAge = (age) => Math.min(MAX_LEVEL, Math.max(1, age - 3));
export const startLevels = (age) => {
  const lv = levelForAge(age);
  return { hangul: lv, math: lv, english: Math.max(1, lv - 1) };
};
const perSubject = (fn) => Object.fromEntries(SUBJECT_IDS.map((s) => [s, fn(s)]));

// 커리큘럼으로 나아가는 과목: 한글 14단계 차시 · 영어 24단계(A ~ Z) 차시 · 수학 8단계(A ~ H) 상세 단계. 하루에 하나씩
export const CURRICULA = {
  hangul: { key: 'hangulStep', done: 'hangulDoneOn', built: 'courseStep', count: HANGUL_STEPS.length },
  english: { key: 'englishUnit', done: 'englishDoneOn', built: 'courseUnit', count: EN_UNITS.length },
  // 수학은 상세 단계마다 며칠씩: 마지막 날을 마쳐야 다음 상세 단계로 (pos는 오늘의 할 일을 다시 짤지 가리는 자리)
  math: {
    key: 'mathUnit', done: 'mathDoneOn', built: 'courseMathUnit', count: MATH_UNITS.length,
    pos: (p) => `${p.mathUnit}:${p.mathDay}`,
    next(p) {
      if (p.mathDay + 1 < MATH_UNITS[p.mathUnit].days) p.mathDay++;
      else if (p.mathUnit < MATH_UNITS.length - 1) { p.mathUnit++; p.mathDay = 0; }
    },
  },
};
// 차시 · 상세 단계 이름 (기록용)
const unitId = (subject, p) => (subject === 'hangul' ? HANGUL_STEPS[p.hangulStep].id : subject === 'english' ? EN_UNITS[p.englishUnit].id : MATH_UNITS[p.mathUnit].id);
// 예전 기록(난이도 1~5)은 그에 맞는 차시에서 이어서 시작한다
const STEP_FOR_OLD_LEVEL = ['1-1', '2-1', '3-1', '5-1', '6-3'];
const UNIT_FOR_OLD_LEVEL = ['A-1', 'C-1', 'D-1', 'F-1', 'G-1'];
const MATH_FOR_OLD_LEVEL = ['A-1', 'B-1', 'C-1', 'E-1', 'G-1'];
function migrate(p) {
  // 빠진 칸이 있는 기록(예전 버전 · 가져온 기록)도 열리도록 기본값을 채운다
  const age = Number(p.age) || 5;
  p.levels ||= startLevels(age);
  p.history ||= perSubject(() => []);
  p.progress ||= perSubject(() => 0);
  p.courses ||= {};
  p.lastCourses ||= {};
  p.played ||= {};
  p.stickers ||= [];
  p.acorns ||= 0;
  p.day ||= today();
  p.stats ||= { games: 0, stars: 0, courses: 0, levelUps: 0, days: [] };
  if (!Array.isArray(p.stats.days)) p.stats.days = [];
  p.log ||= {};
  if (typeof p.hangulStep !== 'number') {
    const id = STEP_FOR_OLD_LEVEL[(p.levels?.hangul || 1) - 1];
    p.hangulStep = Math.max(0, HANGUL_STEPS.findIndex((s) => s.id === id));
  }
  if (typeof p.englishUnit !== 'number') {
    const id = UNIT_FOR_OLD_LEVEL[(p.levels?.english || 1) - 1];
    p.englishUnit = Math.max(0, EN_UNITS.findIndex((u) => u.id === id));
    p.englishDoneOn = null;
  }
  if (typeof p.mathUnit !== 'number') {
    const id = MATH_FOR_OLD_LEVEL[(p.levels?.math || 1) - 1];
    p.mathUnit = Math.max(0, MATH_UNITS.findIndex((u) => u.id === id));
    p.mathDoneOn = null;
  }
  if (!Array.isArray(p.hangulRecent)) p.hangulRecent = [];
  if (p.hangulReview === undefined) p.hangulReview = null;
  if (!Array.isArray(p.checks)) p.checks = [];
  if (!p.challenges) p.challenges = {};
  if (!p.candy) p.candy = { day: null, used: 0 };
  p.hangulStep = Math.max(0, Math.min(HANGUL_STEPS.length - 1, p.hangulStep));
  p.englishUnit = Math.max(0, Math.min(EN_UNITS.length - 1, p.englishUnit));
  p.mathUnit = Math.max(0, Math.min(MATH_UNITS.length - 1, p.mathUnit));
  p.mathDay = Math.max(0, Math.min(MATH_UNITS[p.mathUnit].days - 1, Number(p.mathDay) || 0));
  return p;
}

const normalize = (s) => (s && Array.isArray(s.profiles)
  ? { profiles: s.profiles.map(migrate), currentId: s.currentId ?? null, sound: s.sound ?? true }
  : { profiles: [], currentId: null, sound: true });
function load(key = KEY) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return normalize(JSON.parse(raw));
  } catch {}
  return normalize(null);
}
// 서버 계정 모드에서는 계정마다 이 기기의 사본을 따로 둔다 (다른 보호자의 기록과 섞이지 않게)
const keyFor = () => (sync.user ? `${KEY}:u:${sync.user.id}` : KEY);

export const store = {
  state: load(),
  save() {
    if (sync.server && !sync.user) return;
    try { localStorage.setItem(keyFor(), JSON.stringify(this.state)); } catch {}
    sync.saveState(this.state);
  },
  // 계정에 로그인하면 그 계정의 학습 상태로 바꾼다 (서버에 없으면 빈 상태)
  replaceState(state) {
    this.state = normalize(state || null);
  },
  // 관리자 화면 등에서 받은 프로필도 같은 모양으로 (빠진 칸 채우기)
  normalizeProfile: (p) => migrate(p),
  // 계정 없이 이 기기에 남아 있던 기록 (처음 로그인한 계정으로 가져오기)
  deviceState: () => load(KEY),

  get profile() {
    return this.state.profiles.find((p) => p.id === this.state.currentId) || null;
  },
  addProfile({ name, age, avatar }) {
    const p = {
      id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name, age, avatar,
      createdAt: today(),
      levels: startLevels(age),
      hangulStep: startStepForAge(age),
      hangulDoneOn: null,
      hangulRecent: [],
      hangulReview: null,
      checks: [],
      challenges: {},
      candy: { day: null, used: 0 },
      englishUnit: startUnitForAge(age),
      englishDoneOn: null,
      mathUnit: startMathUnitForAge(age),
      mathDay: 0,
      mathDoneOn: null,
      history: perSubject(() => []),
      acorns: 0,
      stickers: [],
      played: {},
      day: today(),
      progress: perSubject(() => 0),
      courses: {},
      lastCourses: {},
      stats: { games: 0, stars: 0, courses: 0, levelUps: 0, days: [] },
      log: {},
    };
    this.state.profiles.push(p);
    this.state.currentId = p.id;
    this.save();
    sync.log('kid-add', { kid: p.id, name, age });
    return p;
  },
  updateProfile(patch) {
    Object.assign(this.profile, patch);
    this.save();
  },
  removeProfile(id) {
    sync.log('kid-remove', { kid: id, name: this.state.profiles.find((p) => p.id === id)?.name });
    this.state.profiles = this.state.profiles.filter((p) => p.id !== id);
    if (this.state.currentId === id) this.state.currentId = null;
    this.save();
  },
  select(id) {
    this.state.currentId = id;
    this.ensureToday();
    this.save();
    sync.log('select', { kid: id, name: this.profile?.name });
  },
  logout() {
    this.state.currentId = null;
    this.save();
  },

  // 날이 바뀌면 새 수업. 어제 오늘의 할 일을 다 끝냈으면 다음 차시 · 상세 단계로 넘어간다 (하루에 하나)
  ensureToday() {
    const p = this.profile;
    if (!p || p.day === today()) return;
    p.lastCourses = { ...p.lastCourses, ...p.courses };
    p.courses = {};
    p.progress = perSubject(() => 0);
    Object.values(CURRICULA).forEach((c) => {
      if (p[c.done] && p[c.done] !== today()) {
        if (c.next) c.next(p);
        else p[c.key] = Math.min(c.count - 1, p[c.key] + 1);
        p[c.done] = null;
        // 한글 확인 퀴즈에서 70%를 넘지 못했으면 다음 차시 대신 가장 약한 차시로 돌아간다
        if (c.key === 'hangulStep' && p.hangulReview != null) {
          p.hangulStep = p.hangulReview;
          p.hangulReview = null;
        }
      }
    });
    p.day = today();
    this.save();
  },
  getCourse(subject) {
    this.ensureToday();
    const p = this.profile;
    const cur = CURRICULA[subject];
    const level = cur ? p[cur.key] : p.levels[subject];
    const pos = cur ? (cur.pos ? cur.pos(p) : p[cur.key]) : null;
    // 부모님이 차시를 바꾸면 그 차시의 수업으로 다시 짠다
    if (p.courses[subject] && cur && p[cur.built] !== pos) {
      p.courses[subject] = null;
      p.progress[subject] = 0;
    }
    if (!p.courses[subject]) {
      p.courses[subject] = makeDailyCourse(p.id, subject, level, p.day, p.lastCourses[subject], subject === 'math' ? p.mathDay : 0);
      // 한글: 오늘의 할 일을 5번째 하는 날에는 마지막에 확인 퀴즈가 붙는다
      if (subject === 'hangul' && p.hangulRecent.length >= CHECK_EVERY - 1) p.courses[subject].push({ key: CHECK_KEY, stage: '확인' });
      if (cur) p[cur.built] = pos;
      this.save();
    }
    return p.courses[subject];
  },
  completeStep(subject, step) {
    const p = this.profile;
    if (p.progress[subject] !== step) return false;
    p.progress[subject] = step + 1;
    const course = this.getCourse(subject);
    if (p.progress[subject] >= course.length) {
      p.stats.courses++;
      if (CURRICULA[subject]) p[CURRICULA[subject].done] = today();
      // 한글: 확인 퀴즈를 본 날은 횟수를 새로 세고, 아니면 오늘 차시를 쌓아 둔다
      if (subject === 'hangul') {
        p.hangulRecent = course.some((s) => s.key === CHECK_KEY) ? [] : [...p.hangulRecent, p.hangulStep].slice(-(CHECK_EVERY - 1));
      }
      ((p.log ||= {})[today()] ||= { plays: [], courses: [] }).courses.push(subject);
      sync.log('course', { kid: p.id, subject, unit: unitId(subject, p) });
    }
    this.save();
    return true;
  },
  // 확인 퀴즈 결과: 최근 차시들과 점수를 남기고, 70%가 안 되면 가장 약한 차시를 다음 날 다시 한다
  recordCheck({ score, total, results, steps }) {
    const p = this.profile;
    const pass = score / total >= CHECK_PASS;
    const review = pass ? null : weakestStep(results);
    p.hangulReview = review;
    p.checks = [...p.checks, { date: today(), steps, score, total, pass, review }].slice(-20);
    this.save();
    sync.log('check', { kid: p.id, score, total, pass, review: review == null ? '' : HANGUL_STEPS[review].id });
    return { pass, review };
  },
  // 부모님이 차시 · 상세 단계를 직접 고른다
  setUnit(subject, i) {
    const p = this.profile;
    const c = CURRICULA[subject];
    p[c.key] = Math.max(0, Math.min(c.count - 1, i));
    p[c.done] = null;
    if (subject === 'hangul') p.hangulReview = null;
    if (subject === 'math') p.mathDay = 0;
    this.save();
    sync.log('unit', { kid: p.id, subject, unit: unitId(subject, p) });
  },
  setHangulStep(i) { this.setUnit('hangul', i); },

  // 영어 챌린지 지도: 단계(stage)마다 별, 지금 열린 단계. 오늘의 사탕(하루 CANDY_PER_DAY번)으로 도전한다
  challenge(kind) {
    const p = this.profile;
    if (!p.challenges[kind]) p.challenges[kind] = { stage: 1, stars: {}, gifts: [] };
    return p.challenges[kind];
  },
  candiesLeft() {
    const p = this.profile;
    return p.candy.day === today() ? Math.max(0, CANDY_PER_DAY - p.candy.used) : CANDY_PER_DAY;
  },
  useCandy() {
    const p = this.profile;
    if (p.candy.day !== today()) p.candy = { day: today(), used: 0 };
    if (p.candy.used >= CANDY_PER_DAY) return false;
    p.candy.used++;
    this.save();
    return true;
  },
  // 단계 결과: 5문제 중 3문제 이상이면 통과 → 다음 단계가 열린다. 선물 단계(4 · 8 · 12 …)는 처음 통과할 때 선물
  recordChallenge(kind, stage, { score, total, stars, last }) {
    const c = this.challenge(kind);
    const pass = score >= Math.ceil(total * 0.6);
    c.stars[stage] = Math.max(c.stars[stage] || 0, pass ? stars : 0);
    const opened = pass && c.stage === stage && stage < last;
    if (opened) c.stage = stage + 1;
    const gift = pass && stage % 4 === 0 && !c.gifts.includes(stage);
    if (gift) c.gifts.push(stage);
    this.save();
    sync.log('challenge', { kid: this.profile.id, kind, stage, score, total, pass });
    return { pass, opened, gift };
  },

  // 리포트용 하루 기록: 날짜마다 한 놀이(과목 · 차시 · 별 · 맞힌 수 · 걸린 시간)와 마친 오늘의 할 일.
  // 과목별 누적(놀이 수 · 맞힌 수 · 문제 수 · 시간)은 stats.subj에 쌓는다. 하루 기록은 최근 LOG_DAYS일만 남긴다
  recordPlay({ key, subject, stars, correct, total, unit, ms }) {
    const p = this.profile;
    const d = today();
    const time = Math.max(0, Math.min(ms || 0, 30 * 60e3));
    p.log ||= {};
    (p.log[d] ||= { plays: [], courses: [] }).plays.push({
      g: key, s: subject, st: stars, c: correct || 0, n: total || 0, u: unit || '', ms: time, t: new Date().toTimeString().slice(0, 5),
    });
    p.stats.ms = (p.stats.ms || 0) + time;
    p.stats.subj ||= {};
    const sj = (p.stats.subj[subject] ||= { plays: 0, c: 0, n: 0, ms: 0 });
    sj.plays++;
    sj.c += correct || 0;
    sj.n += total || 0;
    sj.ms += time;
    const days = Object.keys(p.log).sort();
    days.slice(0, Math.max(0, days.length - LOG_DAYS)).forEach((k) => delete p.log[k]);
    this.save();
  },

  addAcorns(n) {
    this.profile.acorns += n;
    this.save();
  },
  markPlayed(key) {
    const p = this.profile;
    p.played[key] = (p.played[key] || 0) + 1;
    if (!p.stats.days.includes(today())) p.stats.days.push(today());
    this.save();
  },
  awardSticker(pool) {
    const p = this.profile;
    const left = pool.filter((s) => !p.stickers.includes(s));
    if (!left.length) return null;
    const s = pick(left);
    p.stickers.push(s);
    this.save();
    return s;
  },

  setLevel(subject, lv) {
    const p = this.profile;
    p.levels[subject] = Math.max(1, Math.min(MAX_LEVEL, lv));
    p.history[subject] = [];
    this.save();
    sync.log('level', { kid: p.id, subject, level: p.levels[subject] });
  },
  // 자동 레벨 업: 현재 레벨 이상에서 한 최근 4번의 평균 별 2.75개 이상.
  // 도전 모드: 한 단계 위 문제에서 별 3개면 바로 레벨 업. 더 쉬운 레벨로 한 놀이는 반영하지 않는다.
  recordResult(subject, stars, { level, challenge = false }) {
    const p = this.profile;
    p.stats.games++;
    p.stats.stars += stars;
    let levelUp = null;
    // 커리큘럼 과목은 레벨 대신 차시 · 상세 단계로 나아간다
    if (CURRICULA[subject]) {
      this.save();
      return { levelUp };
    }
    if (challenge) {
      if (level > p.levels[subject] && stars === 3) levelUp = level;
    } else if (level >= p.levels[subject]) {
      const h = p.history[subject];
      h.push(stars);
      if (h.length > AUTO_WINDOW) h.shift();
      const avg = h.reduce((a, b) => a + b, 0) / h.length;
      if (p.levels[subject] < MAX_LEVEL && h.length >= AUTO_WINDOW && avg >= AUTO_AVG) levelUp = p.levels[subject] + 1;
    }
    if (levelUp) {
      p.levels[subject] = levelUp;
      p.history[subject] = [];
      p.stats.levelUps++;
    }
    this.save();
    return { levelUp };
  },

  toggleSound() {
    this.state.sound = !this.state.sound;
    this.save();
  },
};

export const AUTO_RULE = { window: AUTO_WINDOW, avg: AUTO_AVG };
