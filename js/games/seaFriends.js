import { h, pick, pickN, shuffle, wiggle, burst, cheer } from '../ui.js';
import { sfx, speak } from '../audio.js';

const SEA = { '돌고래': '🐬', '거북': '🐢', '상어': '🦈', '문어': '🐙', '물고기': '🐠', '게': '🦀', '복어': '🐡', '고래': '🐳', '오징어': '🦑' };
const ONLY = {
  '돌고래': '돌고래만 눌러요!', '거북': '거북만 눌러요!', '상어': '상어만 눌러요!', '문어': '문어만 눌러요!', '물고기': '물고기만 눌러요!',
  '게': '게만 눌러요!', '복어': '복어만 눌러요!', '고래': '고래만 눌러요!', '오징어': '오징어만 눌러요!',
};
// 헷갈리기 쉬운 짝 (4단계부터)
const LOOK = [['돌고래', '상어'], ['돌고래', '고래'], ['물고기', '복어'], ['문어', '오징어']];
// 단계별: 나오는 생물 수, 다른 생물 가짓수, 헤엄 시간(초), 나오는 간격(초)
const CFG = { 1: [8, 1, 5, 1.7], 2: [10, 1, 4.5, 1.4], 3: [12, 2, 4, 1.15], 4: [12, 2, 3.6, 1], 5: [14, 3, 3.2, 0.9] };

// 바닷속 친구들(UnderWater): 처음에 동그라미 친 친구를 기억하고, 헤엄쳐 지나가는 생물 중 그 친구만 누른다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const [count, others, swim, gap] = CFG[L];
  const sea = h('div', { class: 'sea-friends' });
  const bar = h('div', { class: 'sf-bar', 'aria-hidden': 'true' }, h('i', { class: 'sf-mark' }), h('b', {}, '🏁'));
  stage.append(h('div', { class: 'sf-wrap' }, sea, bar));
  let goal;
  let rest;
  if (L >= 4) {
    const pair = pick(LOOK);
    goal = pair[0];
    rest = [pair[1], ...pickN(Object.keys(SEA).filter((k) => !pair.includes(k)), others - 1)];
  } else {
    goal = pick(Object.keys(SEA));
    rest = pickN(Object.keys(SEA).filter((k) => k !== goal), others);
  }
  // 친구가 절반쯤 나오고, 처음 두 마리 안에 꼭 한 번 나온다
  const queue = shuffle(Array.from({ length: count }, (_, i) => (i < Math.ceil(count / 2) ? goal : rest[i % rest.length])));
  if (queue.slice(0, 2).every((k) => k !== goal)) queue.unshift(queue.splice(queue.indexOf(goal), 1)[0]);
  const targets = queue.filter((k) => k === goal).length;
  let caught = 0;
  let wrong = 0;
  let gone = 0;
  let live = false;

  // 처음: 어두운 바다에 동그라미 친 친구와 다른 친구를 보여 준다
  const go = h('button', { class: 'btn sf-go', type: 'button' }, '시작');
  sea.classList.add('dark');
  sea.replaceChildren(h('div', { class: 'sf-intro' },
    h('div', { class: 'sf-pair' }, h('span', { class: 'sf-pick circled', 'aria-label': `${goal} (동그라미)` }, SEA[goal]), ...rest.map((k) => h('span', { class: 'sf-pick', 'aria-label': k }, SEA[k]))),
    h('p', { class: 'sf-rule' }, ONLY[goal]), go));
  speak(['동그라미 친구만 눌러야 해요.', ONLY[goal]]);
  go.addEventListener('click', start);

  function start() {
    sfx.tap();
    sea.classList.remove('dark');
    sea.replaceChildren();
    live = true;
    speak(ONLY[goal]);
    queue.forEach((k, i) => ctx.later(() => spawn(k), 600 + i * gap * 1000));
  }

  function spawn(k) {
    const fromLeft = Math.random() < 0.5;
    const el = h('button', {
      class: `sf-swim${fromLeft ? '' : ' rtl'}`,
      type: 'button',
      style: { top: `${10 + Math.random() * 62}%`, animationDuration: `${swim}s` },
      'aria-label': k,
    }, h('span', {}, SEA[k]));
    let done = false;
    el.addEventListener('click', () => {
      if (done || !live) return;
      if (k === goal) {
        done = true;
        caught++;
        el.classList.add('happy');
        burst(el, ['💖', '💗', '✨']);
        sfx.pop();
        ctx.progress(caught, targets);
      } else {
        wrong++;
        wiggle(el);
        sfx.wrong();
      }
    });
    sea.append(el);
    ctx.later(() => {
      el.remove();
      gone++;
      bar.style.setProperty('--p', gone / count);
      if (gone === count) end();
    }, swim * 1000);
  }

  function end() {
    live = false;
    sfx.correct();
    cheer(sea);
    speak('끝까지 잘 찾았어요!');
    ctx.later(() => ctx.finish({ firstTry: Math.max(0, caught - wrong), total: targets }), 1500);
  }

  ctx.prompt('처음에 동그라미 친 친구를 기억해요. 헤엄쳐 지나가는 바다 생물 중에서 그 친구만 눌러요!', () => speak(ONLY[goal]));
  ctx.progress(0, targets);
}
