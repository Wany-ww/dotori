// 수학 8단계(Level A ~ H) 커리큘럼. 단계마다 상세 단계(A-1, A-2 …)가 있고, 상세 단계 하나를 며칠(days) 동안 한다.
// 배울 것이 많은 상세 단계일수록 날이 길다 (2 ~ 4일, 모두 99일).
// 상세 단계마다 칸(slots)별 놀이 후보를 정해 두고, 놀이마다 그 단계에 맞는 손놀림 난이도(lv)와
// 내용(cfg: 놀이의 단계 설정을 덮어쓰는 값, opts: 놀이 방식)을 붙인다. 칸이 6개보다 적으면 앞 단계 놀이로 복습 칸을 채운다.

const g = (key, lv, cfg, opts) => ({ key, lv, ...(cfg ? { cfg } : {}), ...(opts ? { opts } : {}) });
// 놀이 방식을 바꾼 것은 이름도 바꿔 보여 준다
const TENS = { mode: 'tens', title: '몇십 더하기와 빼기' };
const NO_CARRY = { mode: 'add1', title: '받아올림 없는 세로셈 덧셈' };

export const MATH_LEVELS = [
  {
    code: 'A', title: '10까지 수 · 기본 도형 · 규칙', lv: 1,
    units: [
      {
        title: '10까지 수 배우기', days: 3, show: '1 ~ 10',
        goal: '10까지 수를 배우고 사물의 수를 세어봅니다. 또한, 10 이하의 수를 인지하여, 주어진 수에 해당하는 사물을 연결해 봅니다.',
        slots: [
          ['탐색', [g('m-basic', 3, { min: 1, max: 10 }), g('m-count', 2, { groups: [1, 10] })]],
          ['탐색', [g('m-farm', 2), g('m-rocket', 1), g('m-tally', 2)]],
          ['기호화', [g('m-trace', 2), g('m-trace', 3), g('m-numpuz', 2)]],
          ['숙달', [g('m-line', 2), g('m-line', 4)]],
          ['숙달', [g('m-domino', 1), g('m-basic', 4, { min: 1, max: 10 }), g('m-same', 1)]],
          ['응용', [g('m-tallylab', 2), g('m-memory', 1)]],
        ],
      },
      {
        title: '기본 도형 배우기', days: 3, show: '○ △ □',
        goal: '도형의 이름과 특징을 배우고, 특징에 따라 도형을 구별해 봅니다.',
        slots: [
          ['탐색', [g('m-falling', 1), g('m-falling', 2)]],
          ['탐색', [g('m-shapes', 1), g('m-shapes', 2)]],
          ['기호화', [g('m-shapetrace', 1), g('m-shapetrace', 2), g('m-tutor', 2)]],
          ['숙달', [g('m-classify', 2), g('m-line', 3), g('m-grocery', 1)]],
          ['응용', [g('m-create', 1), g('m-tangram', 1)]],
        ],
      },
      {
        title: '규칙 알아보기', days: 2, show: 'AB AB',
        goal: 'AB 패턴의 규칙성을 이해하고 그 규칙을 따라 합니다.',
        slots: [
          ['탐색', [g('m-pattern', 1)]],
          ['기호화', [g('m-pattern', 1, { end: false })]],
          ['숙달', [g('m-pattern', 2, { types: ['AB'], extra: 1 })]],
          ['응용', [g('m-flowers', 1), g('m-matrix', 1), g('m-icecream', 1), g('m-sea', 1)]],
        ],
      },
    ],
  },
  {
    code: 'B', title: '20까지 수 · 5 이하 덧셈과 뺄셈 · 비교', lv: 1,
    units: [
      {
        title: '20까지 수 배우기', days: 3, show: '11 ~ 20',
        goal: '20까지 수를 배우고 사물의 수를 세어봅니다. 또한, 11부터 20 사이의 수를 인지하여, 주어진 수에 해당하는 사물을 연결해 봅니다.',
        slots: [
          ['탐색', [g('m-basic', 5), g('m-count', 5, { groups: [1, 1], ones: [1, 9] })]],
          ['탐색', [g('m-tally', 3), g('m-rocket', 2)]],
          ['기호화', [g('m-trace', 4), g('m-numpuz', 3)]],
          ['숙달', [g('m-hquiz', 1), g('m-placegrid', 1)]],
          ['응용', [g('m-tallycatch', 3), g('m-count', 3, { groups: [6, 10] })]],
        ],
      },
      {
        title: '5 이하의 수 덧셈과 뺄셈', days: 3, show: '5 = 2 + 3',
        goal: '5 이하 수의 범위에서 가르기와 모으기 활동을 통해 덧셈, 뺄셈을 합니다.',
        slots: [
          ['탐색', [g('m-tallylab', 1), g('m-tally', 1)]],
          ['탐색', [g('m-fish', 1), g('m-farm', 3)]],
          ['기호화', [g('m-cookies', 1), g('m-fallblocks', 1)]],
          ['숙달', [g('m-quick', 1), g('m-quicksub', 1)]],
          ['응용', [g('m-windows', 1), g('m-wordeq', 1)]],
        ],
      },
      {
        title: '두 수의 크기 비교', days: 2, show: '3 < 7',
        goal: '10 이하 수의 범위에서 두 수의 크기를 비교합니다.',
        slots: [
          ['탐색', [g('m-compare', 1), g('m-compare', 2)]],
          ['기호화', [g('m-compare', 3, { max: 10 })]],
          ['숙달', [g('m-circus', 2)]],
          ['응용', [g('m-windows', 4, { kinds: ['cmp'], top: 10 }), g('m-graph1', 1)]],
        ],
      },
      {
        title: '규칙 알아보기', days: 2, show: 'ABC ABC',
        goal: 'ABC 패턴의 규칙성을 이해하고, 그 규칙을 따라 합니다.',
        slots: [
          ['탐색', [g('m-pattern', 3)]],
          ['기호화', [g('m-pattern', 3, { end: false })]],
          ['숙달', [g('m-pattern', 4, { types: ['ABC'] })]],
          ['응용', [g('m-matrix', 2), g('m-flowers', 2), g('m-sudoku', 1), g('m-path', 1)]],
        ],
      },
    ],
  },
  {
    code: 'C', title: '수의 순서 · 10 이하 덧셈과 뺄셈 · 시계', lv: 2,
    units: [
      {
        title: '20까지 수의 순서 알기', days: 2, show: '1 → 20',
        goal: '1부터 20까지 수의 크기를 비교하여 순서대로 나열해 봅니다.',
        slots: [
          ['탐색', [g('m-caterpillar', 2), g('m-caterpillar', 3)]],
          ['기호화', [g('m-circus', 3)]],
          ['숙달', [g('m-numpuz', 3), g('m-missing', 2), g('m-same', 2)]],
          ['응용', [g('m-tallycatch', 3), g('m-ferris', 2)]],
        ],
      },
      {
        title: '10 이하의 수 덧셈과 뺄셈', days: 4, show: '7 + 3 = 10',
        goal: '10 이하 수의 범위에서 덧셈, 뺄셈을 합니다. 더하여 10을 만들 수 있는 두 수의 조합도 배웁니다.',
        slots: [
          ['탐색', [g('m-cookies', 3), g('m-fish', 2), g('m-fish', 3)]],
          ['기호화', [g('m-light', 2), g('m-light', 3)]],
          ['숙달', [g('m-facts', 3), g('m-facts', 1)]],
          ['숙달', [g('m-quick', 2), g('m-quicksub', 2), g('m-fallblocks', 3)]],
          ['응용', [g('m-windows', 2), g('m-windows', 3), g('m-equation', 2)]],
        ],
      },
      {
        title: '10씩 뛰어 세기', days: 2, show: '10 20 30',
        goal: '100 이하의 수의 범위에서 10씩 뛰어 세기를 합니다.',
        slots: [
          ['탐색', [g('m-count', 5, { groups: [2, 6], ones: [0, 0] })]],
          ['기호화', [g('m-missing', 3, { steps: [10] }), g('m-numpuz', 4)]],
          ['숙달', [g('m-missing', 4, { steps: [10] }), g('m-hquiz', 4)]],
          ['응용', [g('m-tallycatch', 4), g('m-rocket', 3), g('m-change', 2)]],
        ],
      },
      {
        title: '시계 읽기', days: 2, show: '🕒 정각',
        goal: '시계를 보고 정각을 읽어봅니다.',
        slots: [
          ['탐색', [g('m-ferris', 1), g('m-cuckoo', 1)]],
          ['기호화', [g('m-clock', 1)]],
          ['숙달', [g('m-clock', 2)]],
          ['응용', [g('m-cuckoo', 2)]],
        ],
      },
    ],
  },
  {
    code: 'D', title: '100까지 수 · 자릿값 · 평면도형 · 시계', lv: 2,
    units: [
      {
        title: '100 이하의 수 배우기', days: 3, show: '2씩 · 5씩',
        goal: '100까지 수를 배우고, 2씩 뛰어 세기와 5씩 뛰어 세기를 합니다.',
        slots: [
          ['탐색', [g('m-count', 3), g('m-count', 4)]],
          ['기호화', [g('m-missing', 3, { steps: [2, 5] }), g('m-ferris', 4)]],
          ['숙달', [g('m-missing', 5, { steps: [2, 5] }), g('m-ferris', 5)]],
          ['숙달', [g('m-hpuzzle', 2), g('m-rocket', 4)]],
          ['응용', [g('m-caterpillar', 4), g('m-tallycatch', 4)]],
        ],
      },
      {
        title: '두 자리 수 배우기', days: 3, show: '십 · 낱개',
        goal: '두 자리 수를 십과 낱개로 나타내어 자릿값의 기본 개념을 배우고, 두 자리 두 수의 크기를 비교합니다.',
        slots: [
          ['탐색', [g('m-rocket', 3), g('m-rocket', 4)]],
          ['기호화', [g('m-placegrid', 2), g('m-placegrid', 5)]],
          ['숙달', [g('m-blocks', 1), g('m-blocks', 2), g('m-tally', 4)]],
          ['응용', [g('m-compare', 4, { min: 10, max: 99 }), g('m-compare', 5, { min: 10, max: 99 }), g('m-digits', 2)]],
        ],
      },
      {
        title: '10 이하 수 빠른 덧셈과 뺄셈', days: 3, show: '⚡ + −',
        goal: '10 이하 수의 범위에서 덧셈과 뺄셈을 능숙하게 합니다.',
        slots: [
          ['탐색', [g('m-facts', 1), g('m-facts', 2)]],
          ['숙달', [g('m-quick', 3), g('m-quick', 2)]],
          ['숙달', [g('m-quicksub', 3), g('m-quicksub', 2)]],
          ['숙달', [g('m-fallblocks', 2), g('m-fallblocks', 3)]],
          ['응용', [g('m-aias', 1), g('m-aias', 2)]],
        ],
      },
      {
        title: '평면도형', days: 3, show: '변 · 반으로',
        goal: '평면도형에서 변의 뜻을 배우고, 도형의 변의 수를 구합니다. 또한, 평면도형을 똑같이 반으로 나눕니다.',
        slots: [
          ['탐색', [g('m-falling', 3), g('m-shapetrace', 3)]],
          ['기호화', [g('m-draw', 1), g('m-draw', 2)]],
          ['숙달', [g('m-pizza', 1), g('m-origami', 1)]],
          ['응용', [g('m-decal', 1), g('m-shapes', 3)]],
        ],
      },
      {
        title: '시계 읽기', days: 2, show: '🕧 30분',
        goal: '시계를 보고 몇 시 30분을 읽어봅니다.',
        slots: [
          ['탐색', [g('m-clock', 2)]],
          ['숙달', [g('m-clock', 3)]],
          ['응용', [g('m-cuckoo', 3), g('m-cuckoo', 2)]],
        ],
      },
    ],
  },
  {
    code: 'E', title: '두 자리 수의 순서 · 받아올림 덧셈 · 도형 · 길이', lv: 3,
    units: [
      {
        title: '두 자리 수의 순서 배우기', days: 3, show: '47 < 74',
        goal: '100 이하 수의 순서를 배웁니다. 자릿값에 대한 이해를 바탕으로 두 자리 수의 크기를 비교하여 순서대로 나열합니다.',
        slots: [
          ['탐색', [g('m-hpuzzle', 3), g('m-hpuzzle', 4)]],
          ['기호화', [g('m-hquiz', 3), g('m-hquiz', 5)]],
          ['숙달', [g('m-circus', 4), g('m-circus', 5)]],
          ['숙달', [g('m-caterpillar', 5), g('m-missing', 4)]],
          ['응용', [g('m-digits', 3), g('m-compare', 5, { min: 10, max: 99 })]],
        ],
      },
      {
        title: '덧셈과 뺄셈', days: 4, show: '8 + 5 · 30 + 20',
        goal: '받아올림이 있는 한 자리 두 수의 덧셈을 하고, 20 미만의 수의 범위에서 받아내림이 있는 두 수의 뺄셈을 합니다. 또, 10 이하의 덧셈과 뺄셈이 포함된 문장제를 해결하고, 몇십 더하기와 빼기를 합니다.',
        slots: [
          ['탐색', [g('m-mango', 2), g('m-mango', 3), g('m-mango', 4)]],
          ['기호화', [g('m-quick', 4), g('m-quicksub', 4), g('m-fallblocks', 5)]],
          ['숙달', [g('m-quick', 3, null, TENS), g('m-quick', 4, null, TENS)]],
          ['숙달', [g('m-multidigit', 1), g('m-fallblocks', 4)]],
          ['응용', [g('m-wordeq', 2), g('m-wordeq', 3), g('m-windows', 3)]],
        ],
      },
      {
        title: '평면도형', days: 3, show: '2등분 · 4등분',
        goal: '기본적인 평면도형의 특징을 알고 구분합니다. 또한, 평면도형을 2등분, 4등분 합니다.',
        slots: [
          ['탐색', [g('m-falling', 4), g('m-classify', 4)]],
          ['기호화', [g('m-draw', 2), g('m-draw', 3)]],
          ['숙달', [g('m-pizza', 2), g('m-pizza', 3)]],
          ['응용', [g('m-tangram', 2), g('m-shapes', 4)]],
        ],
      },
      {
        title: '길이 재기', days: 2, show: '📎 몇 번',
        goal: '단위 길이를 이용하여 사물의 길이를 재어 봅니다.',
        slots: [
          ['탐색', [g('m-rulercount', 1)]],
          ['기호화', [g('m-rulercount', 2)]],
          ['숙달', [g('m-rulercount', 3), g('m-rulercount', 4)]],
          ['응용', [g('m-rulercount', 5)]],
        ],
      },
    ],
  },
  {
    code: 'F', title: '세 자리 수 · 곱셈 · 입체도형 · 자 · 그래프', lv: 3,
    units: [
      {
        title: '999까지 수 세기', days: 2, show: '백 · 십 · 일',
        goal: '백, 십, 일의 모형으로 나타낸 세 자리 수를 읽고 씁니다.',
        slots: [
          ['탐색', [g('m-blocks', 4)]],
          ['기호화', [g('m-blocks', 5)]],
          ['숙달', [g('m-missing', 4, { steps: [1, 10, 100], start: [100, 600], top: 999 })]],
          ['응용', [g('m-compare', 5, { min: 100, max: 999 }), g('m-digits', 4)]],
        ],
      },
      {
        title: '덧셈과 뺄셈', days: 3, show: '34 + 25 · □ + 5',
        goal: '두 자리 수의 범위에서 받아올림이 없는 덧셈과 받아내림이 없는 뺄셈을 합니다. 덧셈식과 뺄셈식에서 모르는 수를 구합니다.',
        slots: [
          ['탐색', [g('m-add1', 2)]],
          ['기호화', [g('m-sub1', 2), g('m-sub1', 3)]],
          ['숙달', [g('m-add2', 2, null, NO_CARRY), g('m-kicker', 4)]],
          ['숙달', [g('m-balance', 2), g('m-balance', 3)]],
          ['응용', [g('m-light', 4), g('m-equation', 3)]],
        ],
      },
      {
        title: '곱셈', days: 3, show: '2 + 2 + 2 = 2 × 3',
        goal: '연속된 수의 덧셈을 곱셈으로 나타내고, 곱셈의 의미를 이해합니다.',
        slots: [
          ['탐색', [g('m-count', 3), g('m-count', 4)]],
          ['기호화', [g('m-eggs', 3), g('m-eggs', 4)]],
          ['숙달', [g('m-beads', 1), g('m-beads', 2), g('m-frog', 2)]],
          ['응용', [g('m-bakery', 1), g('m-bakery', 2), g('m-frog', 3)]],
        ],
      },
      {
        title: '입체도형', days: 2, show: '상자 · 기둥 · 공',
        goal: '기본적인 입체도형의 특징을 알고 이름을 말해 봅니다.',
        slots: [
          ['탐색', [g('m-observe', 1), g('m-observe', 2)]],
          ['기호화', [g('m-observe', 3), g('m-observe', 4)]],
          ['숙달', [g('m-line', 5)]],
          ['응용', [g('m-cubes', 1), g('m-cubes', 2)]],
        ],
      },
      {
        title: '길이 재기', days: 2, show: '📏 cm',
        goal: '자를 이용하여 사물의 길이를 재어 봅니다.',
        slots: [
          ['탐색', [g('m-ruler', 1)]],
          ['기호화', [g('m-ruler', 2)]],
          ['숙달', [g('m-ruler', 3), g('m-ruler', 4)]],
          ['응용', [g('m-ruler', 5)]],
        ],
      },
      {
        title: '그래프', days: 3, show: '📊',
        goal: '자료를 그래프로 나타내어 봅니다. 그리고 그래프에 나타난 자료를 해석합니다.',
        slots: [
          ['탐색', [g('m-graph1', 2), g('m-graph1', 3)]],
          ['기호화', [g('m-graph2', 1), g('m-graph2', 2)]],
          ['숙달', [g('m-graph1', 4), g('m-graph2', 3)]],
          ['응용', [g('m-graph1', 5), g('m-graph2', 4)]],
        ],
      },
    ],
  },
  {
    code: 'G', title: '세 자리 수 · 받아올림 덧셈 · 곱셈구구 · 시계', lv: 4,
    units: [
      {
        title: '세 자리 수 배우기', days: 3, show: '352 = 300 + 50 + 2',
        goal: '세 자리 수를 백의 자리, 십의 자리, 일의 자리 수의 합으로 나타냅니다. 1000까지 10씩 뛰어 세기를 하고, 세 자리 수를 순서에 따라 나열합니다.',
        slots: [
          ['탐색', [g('m-blocks', 4), g('m-blocks', 5)]],
          ['기호화', [g('m-missing', 4, { steps: [10], start: [100, 960], top: 1000 })]],
          ['숙달', [g('m-missing', 5, { steps: [10, 100], start: [100, 960], top: 1000 })]],
          ['숙달', [g('m-circus', 4, { nums: [100, 999] })]],
          ['응용', [g('m-compare', 5, { min: 100, max: 999 }), g('m-digits', 5), g('m-change', 4), g('m-change', 5)]],
        ],
      },
      {
        title: '두 자리 수의 덧셈과 뺄셈', days: 3, show: '받아올림 · 받아내림',
        goal: '두 자리 수의 범위에서 받아올림이 있는 덧셈과 받아내림이 있는 뺄셈을 합니다.',
        slots: [
          ['탐색', [g('m-add2', 2), g('m-add2', 3)]],
          ['기호화', [g('m-sub2', 2), g('m-sub2', 3)]],
          ['숙달', [g('m-multidigit', 3), g('m-multidigit', 4)]],
          ['숙달', [g('m-kicker', 5), g('m-add1', 3)]],
          ['응용', [g('m-aias', 5)]],
        ],
      },
      {
        title: '곱셈', days: 4, show: '2단 ~ 9단',
        goal: '곱셈구구 2단부터 9단까지 합니다.',
        slots: [
          ['탐색', [g('m-gugu', 2), g('m-gugu', 3), g('m-gugu', 4)]],
          ['기호화', [g('m-beads', 4), g('m-beads', 5), g('m-frog', 4), g('m-frog', 5)]],
          ['숙달', [g('m-gugumaster', 4), g('m-gugumaster', 5)]],
          ['숙달', [g('m-quickmul', 3), g('m-quickmul', 4), g('m-quickmul', 5)]],
          ['응용', [g('m-aimul', 3), g('m-aimul', 4), g('m-bakery', 4)]],
        ],
      },
      {
        title: '시계 읽기', days: 2, show: '🕓 몇 시 몇 분',
        goal: '시계를 보고 몇 시 몇 분을 읽어 봅니다.',
        slots: [
          ['탐색', [g('m-clock', 4)]],
          ['숙달', [g('m-clock', 5)]],
          ['응용', [g('m-cuckoo', 4), g('m-cuckoo', 5), g('m-days', 3)]],
        ],
      },
    ],
  },
  {
    code: 'H', title: '세 자리 수의 계산 · 나눗셈 · 분수 · 입체도형', lv: 5,
    units: [
      {
        title: '세 자리 수의 자릿값', days: 2, show: '3 → 300',
        goal: '자릿값의 원리를 알고 세 자리 수에서 각 자리의 숫자가 나타내는 정확한 값을 압니다.',
        slots: [
          ['탐색', [g('m-blocks', 5)]],
          ['기호화', [g('m-digits', 4), g('m-digits', 5)]],
          ['숙달', [g('m-missing', 5, { steps: [1, 10, 100], start: [100, 600], top: 999 })]],
          ['응용', [g('m-compare', 5, { min: 100, max: 999 }), g('m-circus', 5, { nums: [100, 999] })]],
        ],
      },
      {
        title: '세 수의 덧셈과 뺄셈', days: 3, show: '34 + 17 + 28',
        goal: '두 자리 수의 범위에서 세 수의 덧셈, 뺄셈, 덧셈과 뺄셈을 계산할 수 있으며, 세 수의 덧셈과 뺄셈이 포함된 문장제를 해결합니다.',
        slots: [
          ['탐색', [g('m-studyas', 1)]],
          ['기호화', [g('m-studyas', 2)]],
          ['숙달', [g('m-studyas', 3), g('m-studyas', 4)]],
          ['응용', [g('m-wordeq', 5), g('m-windows', 5)]],
        ],
      },
      {
        title: '세 자리 수의 덧셈', days: 3, show: '352 + 124',
        goal: '세 자리 수의 범위에서 받아올림이 없는 덧셈, 받아내림이 없는 뺄셈을 계산합니다.',
        slots: [
          ['탐색', [g('m-add1', 4), g('m-add1', 5)]],
          ['기호화', [g('m-add2', 4, null, NO_CARRY), g('m-add2', 5, null, NO_CARRY)]],
          ['숙달', [g('m-sub1', 4), g('m-sub1', 5)]],
          ['응용', [g('m-multidigit', 5)]],
        ],
      },
      {
        title: '나눗셈', days: 4, show: '12 ÷ 3',
        goal: '나눗셈의 원리를 이해하고, 나머지가 없는 간단한 나눗셈 계산을 합니다.',
        slots: [
          ['탐색', [g('m-jellydiv', 1), g('m-jellydiv', 2), g('m-tallydiv', 1)]],
          ['기호화', [g('m-studydiv', 1), g('m-studydiv', 2), g('m-tallydiv', 3)]],
          ['숙달', [g('m-studydiv', 3), g('m-studydiv', 4)]],
          ['숙달', [g('m-div', 1), g('m-div', 2), g('m-div', 3)]],
          ['응용', [g('m-aidiv', 2), g('m-aidiv', 3)]],
        ],
      },
      {
        title: '분수 배우기', days: 3, show: '½ · ¼',
        goal: '전체와 부분의 관계를 이해하여 분수로 나타낼 수 있습니다.',
        slots: [
          ['탐색', [g('m-pizza', 2), g('m-pizza', 3)]],
          ['기호화', [g('m-drink', 1), g('m-drink', 2)]],
          ['숙달', [g('m-pizza', 4), g('m-drink', 3)]],
          ['응용', [g('m-pizza', 5), g('m-drink', 4)]],
        ],
      },
      {
        title: '입체도형의 구성 요소', days: 3, show: '면 · 모서리 · 꼭짓점',
        goal: '정육면체, 사각뿔과 같은 입체도형의 구성 요소를 알고, 도형의 면, 모서리, 꼭짓점의 개수를 구합니다.',
        slots: [
          ['탐색', [g('m-studyshape', 1), g('m-studyshape', 2)]],
          ['기호화', [g('m-studyshape', 3)]],
          ['숙달', [g('m-studyshape', 4)]],
          ['응용', [g('m-studyshape', 5), g('m-observe', 5), g('m-cubes2', 1)]],
        ],
      },
    ],
  },
];

// 8단계, 상세 단계 36개 (상세 단계마다 days일)
export const MATH_UNITS = MATH_LEVELS.flatMap((lv, li) => lv.units.map((u, i) => ({
  ...u, id: `${lv.code}-${i + 1}`, code: lv.code, levelIndex: li, no: i + 1, levelTitle: lv.title, lv: lv.lv,
})));

export const COURSE_LEN = 6;
const REVIEW_UNITS = 3;

// 오늘의 할 일 칸: 상세 단계의 칸을 모두 넣고, 6칸이 안 되면 바로 앞 상세 단계들의 놀이로 복습 칸을 채운다.
// 며칠 하는 상세 단계는 날마다 칸의 다음 후보가 나온다 (course.js)
export function mathPlan(index) {
  const unit = MATH_UNITS[index];
  const plan = unit.slots.map(([stage, pool]) => ({ stage, pool }));
  const before = MATH_UNITS.slice(Math.max(0, index - REVIEW_UNITS), index).flatMap((u) => u.slots.flatMap(([, pool]) => pool));
  while (plan.length < COURSE_LEN && before.length) plan.push({ stage: '복습', pool: before });
  return plan;
}

// 오늘의 할 일 밖(추가 학습)에서 놀 때도 지금 상세 단계의 내용으로: 그 놀이가 상세 단계 칸에 있으면 그 설정, 없으면 단계 난이도
export function mathTune(unit, key, k = 0) {
  const all = unit.slots.flatMap(([, pool]) => pool).filter((e) => e.key === key);
  return all[Math.min(k, all.length - 1)] || { key, lv: unit.lv };
}

// 나이로 고르는 시작 단계 (부모님 화면에서 언제든 바꿀 수 있다)
export const startMathUnitForAge = (age) => {
  const id = { 3: 'A-1', 4: 'A-1', 5: 'B-1', 6: 'C-1', 7: 'E-1' }[age] || 'G-1';
  return MATH_UNITS.findIndex((u) => u.id === id);
};
