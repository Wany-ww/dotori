import { h, pick, randInt, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { COUNT_ITEMS } from '../data.js';

const R = 5;
// 단계별: 그림(수만큼 물건)으로 보여 줄지 · 수의 범위. 참고 영상처럼 1단계부터 > = < 기호로 답한다
const CFG = [
  { group: true, max: 5 },
  { group: true, max: 10 },
  { group: false, max: 20 },
  { group: false, max: 50 },
  { group: false, max: 100 },
];

function pairFor(max, min = 1) {
  const a = randInt(min, max);
  if (Math.random() < 0.25) return [a, a];
  let b = randInt(min, max);
  while (b === a) b = randInt(min, max);
  return [a, b];
}

// 동물 밥주기 · 식사 시간(FrogorHippo): 양쪽 연잎의 먹이(또는 수)를 비교해 > = < 중 알맞은 기호를 고르면
// 숨어 있던 악어가 올라와 더 많은 쪽으로 입을 벌리고, 그림 밑에 수가 나타난다
export function mount(stage, ctx) {
  // 수학 상세 단계가 정한 내용(수 범위 등)이 있으면 단계 설정을 덮어쓴다
  const cfg = { ...CFG[ctx.level - 1], ...ctx.opts.cfg };
  const hinter = makeHinter();
  const root = h('div', { class: 'compare' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;
  // 같음(=)이 한 번은 나오게
  const eqAt = randInt(1, R - 1);

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    let [a, b] = pairFor(cfg.max, cfg.min);
    if (n === eqAt) b = a;
    const answer = a > b ? '>' : a < b ? '<' : '=';
    const item = pick(COUNT_ITEMS);
    const croc = h('div', { class: 'cmp-croc', 'aria-hidden': 'true' }, h('span', {}, '🐊'));
    const side = (v) => h('div', { class: 'cmp-pad' },
      cfg.group ? h('span', { class: 'cmp-group', 'aria-label': `${v}개` }, Array.from({ length: v }, () => h('span', {}, item.e))) : h('span', { class: 'cmp-num' }, v),
      cfg.group ? h('b', { class: 'cmp-count' }, v) : null);
    const slot = h('span', { class: 'cmp-slot' }, '?');
    const row = h('div', { class: 'cmp-row' }, side(a), slot, side(b));
    root.replaceChildren(
      croc,
      row,
      choiceSet(['>', '=', '<'], {
        answer,
        hinter,
        cls: 'choice cmp-sym',
        label: (s) => ({ '>': '왼쪽이 더 커요', '<': '오른쪽이 더 커요', '=': '같아요' })[s],
        onCorrect: (btn, miss) => {
          if (miss === 0) firstTry++;
          slot.textContent = answer;
          slot.classList.add('filled');
          row.classList.add('shown');
          // 악어가 더 많은 쪽으로 입을 벌린다 (같으면 가운데에서 둘 다 냠냠)
          croc.classList.add('eat', answer === '>' ? 'left' : answer === '<' ? 'right' : 'both');
          sfx.chomp();
          cheer(slot);
          if (cfg.group) speak(answer === '=' ? '양쪽이 똑같아요!' : answer === '>' ? '왼쪽이 더 많아요!' : '오른쪽이 더 많아요!');
          else speak(answer === '=' ? '두 수가 같아요!' : answer === '>' ? '왼쪽 수가 더 커요!' : '오른쪽 수가 더 커요!');
          ctx.later(() => { n++; if (n >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2200);
        },
      }),
    );
    const q = cfg.group ? '양쪽 먹이를 비교해서 알맞은 기호를 골라요!' : '두 수를 비교해서 알맞은 기호를 골라요!';
    ctx.prompt(`${q} 악어 입은 언제나 더 많은 쪽으로 크게 벌려요.`, () => speak(q));
  }

  round();
}
