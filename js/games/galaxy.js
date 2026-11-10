import { h, pop } from '../ui.js';

// 은하 챌린지 공통 윗줄: 우주선이 길을 따라 날아가는 진행 막대 + 오른쪽 계수기(별·하트)
export function galaxyBar(total, { counter = 'stars', hearts = 3 } = {}) {
  const fill = h('i', { class: 'gx-fill' });
  const ufo = h('span', { class: 'gx-ufo', 'aria-hidden': 'true' }, '🛸');
  const count = h('span', { class: `gx-count ${counter}`, 'aria-live': 'polite' });
  const el = h('div', { class: 'gx-bar' },
    h('span', { class: 'gx-track', role: 'progressbar', 'aria-label': '은하 여행', 'aria-valuemin': 0, 'aria-valuemax': total }, fill, ufo),
    count);
  const track = el.firstChild;
  let stars = 0;
  let left = hearts;
  const paintCount = () => {
    count.textContent = counter === 'hearts' ? '♥'.repeat(left) + '♡'.repeat(hearts - left) : `⭐ ${stars}`;
    count.setAttribute('aria-label', counter === 'hearts' ? `보너스 하트 ${left}개` : `별 ${stars}개`);
  };
  const api = {
    el,
    progress(i) {
      const p = Math.min(1, i / total);
      fill.style.width = `${p * 100}%`;
      ufo.style.left = `${p * 100}%`;
      track.setAttribute('aria-valuenow', i);
    },
    star() { stars++; paintCount(); pop(count); },
    // 무벌점 원칙: 하트가 줄어도 게임은 끝나지 않고, 남은 하트만큼 보너스 도토리를 준다
    loseHeart() { if (left > 0) { left--; paintCount(); pop(count); } },
    get hearts() { return left; },
  };
  paintCount();
  api.progress(0);
  return api;
}
