import { store } from '../store.js';

// 아이가 틀린 셈 기록 ('7×8' · '5−3' · '28÷4' → 틀린 횟수). 곱셈구구 마스터와 맞춤 연습문제가 함께 쓴다.
// 틀리면 2씩 늘고, 첫 시도에 맞히면 1씩 줄어 0이 되면 지운다
const book = () => {
  const p = store.profile;
  if (!p) return null;
  p.mathMiss ||= {};
  return p.mathMiss;
};

export function noteMiss(key) {
  const b = book();
  if (!b) return;
  b[key] = Math.min(9, (b[key] || 0) + 2);
  store.save();
}

export function noteRight(key) {
  const b = book();
  if (!b?.[key]) return;
  if (--b[key] <= 0) delete b[key];
  store.save();
}

// 기호(×, ÷, +·−)가 든 셈 중 가장 많이 틀린 것부터 n개
export function topMisses(ops, n) {
  const b = book() || {};
  return Object.entries(b)
    .filter(([k]) => ops.some((op) => k.includes(op)))
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)
    .map(([k]) => k);
}
