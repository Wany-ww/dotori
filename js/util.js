export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const pickN = (arr, n) => shuffle(arr).slice(0, n);
export const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
