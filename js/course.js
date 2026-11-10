import { GAMES } from './data.js';
import { HANGUL_STEPS, PLAN_STAGES, PICTURE_GAMES, planFor } from './curriculum.js';
import { lessonOf } from './lesson.js';
import { EN_UNITS, planForUnit } from './enCurriculum.js';
import { MATH_UNITS, mathPlan } from './mathCurriculum.js';

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const seededRandom = (seed) => mulberry32(xmur3(seed)());

// 한글: 차시 종류에 맞는 놀이 후보에서 칸마다 하나씩 (그림 낱말이 적은 차시는 그림 놀이를 뺀다)
export function buildHangulCourse(stepIndex, seed) {
  const rand = seededRandom(seed);
  const step = HANGUL_STEPS[stepIndex];
  const lesson = lessonOf(stepIndex);
  const used = new Set();
  const ok = (k) => GAMES[k] && !used.has(k) && (lesson.picCount >= 4 || !PICTURE_GAMES.has(k));
  return planFor(step).map((pool, i) => {
    let cands = pool.filter(ok);
    if (!cands.length) cands = Object.values(planFor(step)).flat().filter(ok);
    if (!cands.length) cands = pool;
    const key = cands[Math.floor(rand() * cands.length)];
    used.add(key);
    return { key, stage: PLAN_STAGES[i] };
  });
}

// 영어: 차시의 단계 목표에 맞춘 칸별 후보에서 하나씩 (그림책 칸은 차시 그림책)
export function buildEnglishCourse(unitIndex, seed) {
  const rand = seededRandom(seed);
  const unit = EN_UNITS[Math.max(0, Math.min(EN_UNITS.length - 1, unitIndex))];
  const plan = planForUnit(unit);
  const used = new Set();
  const ok = (k) => GAMES[k] && !used.has(k);
  return plan.map((slot) => {
    let pool = slot.pool.filter(ok);
    // 같은 놀이가 두 번 들어갈 칸(그림책 · 독해)은 두 번째도 그대로 둔다
    if (!pool.length) pool = slot.pool.filter((k) => GAMES[k]);
    const key = pool[Math.floor(rand() * pool.length)];
    used.add(key);
    return { key, stage: slot.stage };
  });
}

// 수학: 상세 단계의 칸마다 후보 하나(놀이 + 그 단계의 난이도 · 내용), 모자란 칸은 앞 단계 복습.
// 며칠 하는 상세 단계는 아이마다 정해진 차례로 칸의 후보를 돌아가며 내서(day) 날마다 다른 놀이를 한다
export function buildMathCourse(unitIndex, seed, { day = 0, base = seed } = {}) {
  const rand = seededRandom(seed);
  const i = Math.max(0, Math.min(MATH_UNITS.length - 1, unitIndex));
  const turn = seededRandom(`${base}|${MATH_UNITS[i].id}`);
  const used = new Set();
  const picked = new Set();
  return mathPlan(i).map((slot) => {
    const ok = slot.pool.filter((e) => GAMES[e.key]);
    let e = null;
    if (slot.stage !== '복습') {
      // 오늘 차례의 후보부터: 오늘 아직 안 나온 놀이 → 같은 놀이라도 난이도 · 내용이 다른 것
      const start = Math.floor(turn() * ok.length);
      const ring = ok.map((_, k) => ok[(start + day + k) % ok.length]);
      e = ring.find((c) => !used.has(c.key)) || ring.find((c) => !picked.has(c)) || null;
    }
    if (!e) {
      let pool = ok.filter((c) => !used.has(c.key));
      if (!pool.length) pool = ok;
      e = pool[Math.floor(rand() * pool.length)];
    }
    used.add(e.key);
    picked.add(e);
    return { ...e, stage: slot.stage };
  });
}

const sameCourse = (a, b) => Boolean(a && b) && a.length === b.length && a.every((s, i) => s.key === b[i].key);

// 같은 아이·같은 날에는 항상 같은 수업, 날이 바뀌면 새 구성. 전날과 완전히 같으면 다시 뽑는다.
// level 자리에 차시(한글 · 영어) · 상세 단계(수학) 번호가 들어온다
// day: 며칠 하는 수학 상세 단계의 몇째 날 (0부터)
export function makeDailyCourse(profileId, subject, level, date, previous, day = 0) {
  let course = null;
  for (let i = 0; i < 8; i++) {
    const seed = `${profileId}|${subject}|${date}|${i}`;
    course = subject === 'hangul' ? buildHangulCourse(level, seed)
      : subject === 'english' ? buildEnglishCourse(level, seed) : buildMathCourse(level, seed, { day, base: profileId });
    if (!sameCourse(course, previous)) break;
  }
  return course;
}
