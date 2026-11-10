// 한글 14단계 × 4차시 커리큘럼.
// 차시마다 무엇을 배우는지(kind·focus)를 정해 두면, lesson.js가 그 차시에 맞는 글자·낱말·문장을 골라 준다.
//   kind: vocab(그림 낱말) · jamoShape(낱자 모양과 이름) · theme(주제 낱말 통글자) · vowel · cons · cv(자음+모음 글자)
//         final(받침) · finals(여러 받침) · diph(이중 모음) · mix(종합) · rule(소리와 글자가 다른 낱말)
//   focus: 이 차시에 새로 배우는 낱자 (rule이면 규칙 이름)

export const HANGUL_STAGES = [
  {
    n: 1, title: '글자와 친해지기',
    goal: '낱글자의 모양과 이름을 알고, 소리를 듣고 따라 쓰면서 자연스럽게 글자와 친해져요.',
    steps: [
      { goal: '그림 조각 맞추기, 선 긋기, 카드 맞추기를 하며 앞으로 다시 만날 낱말들의 소리와 뜻을 익혀요.', kind: 'vocab' },
      { goal: '자음 ㄱ부터 ㅎ까지, 모음 ㅏ부터 ㅣ까지 모양을 보고 이름을 배워요.', kind: 'jamoShape' },
    ],
  },
  {
    n: 2, title: '통글자로 낱말 읽기',
    goal: '자주 보는 낱말을 통글자로 익히고, 글자를 가지고 놀며 한글이 모이는 원리에 익숙해져요.',
    steps: [
      { goal: '과일과 채소 이름을 통글자로 읽고 찾아요. 자음·모음의 모양과 이름도 익혀요.', kind: 'theme', themes: ['fruit', 'veg'], jamo: true },
      { goal: '음식 이름을 통글자로 읽어요. 낱말 속 말소리를 나누고 붙이며 말소리의 단위를 배워요.', kind: 'theme', themes: ['food'], sound: true },
      { goal: '동물 이름을 통글자로 읽어요. 낱말 속 말소리를 알고 글자와 이을 준비를 해요.', kind: 'theme', themes: ['animal'], sound: true },
      { goal: '가족 호칭, 옷, 학용품 이름을 통글자로 읽고 무엇인지 찾아요.', kind: 'theme', themes: ['family', 'clothes', 'school'] },
    ],
  },
  {
    n: 3, title: '모음과 첫 자음의 소리',
    goal: '기본 모음과 자음 낱글자의 말소리를 듣고 익혀서, 낱글자와 말소리를 이어 읽어요.',
    steps: [
      { goal: '기본 모음 ㅏ, ㅓ, ㅗ, ㅜ의 모양과 말소리를 익히고, 이 모음이 들어간 글자를 읽어요.', kind: 'vowel', focus: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ'] },
      { goal: '기본 모음 ㅗ, ㅜ, ㅡ, ㅣ의 모양과 말소리를 익히고, 이 모음이 들어간 글자를 읽어요.', kind: 'vowel', focus: ['ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'] },
      { goal: '기본 자음 ㄱ, ㄴ의 모양과 말소리를 익히고, ㄱ, ㄴ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㄱ', 'ㄴ'] },
      { goal: '기본 자음 ㄷ, ㄹ의 모양과 말소리를 익히고, ㄷ, ㄹ로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㄷ', 'ㄹ'] },
    ],
  },
  {
    n: 4, title: '자음 소리와 처음 보는 낱말',
    goal: '기본 자음의 말소리를 익히고, 배운 모음과 자음으로 된 글자라면 처음 본 낱말도 읽어요.',
    steps: [
      { goal: '기본 자음 ㅁ, ㅂ, ㅅ의 모양과 말소리를 익히고, ㅁ, ㅂ, ㅅ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㅁ', 'ㅂ', 'ㅅ'] },
      { goal: '기본 자음 ㅅ, ㅈ, ㅎ의 모양과 말소리를 익히고, ㅅ, ㅈ, ㅎ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㅅ', 'ㅈ', 'ㅎ'] },
      { goal: '기본 자음과 모음으로 된 글자를 읽어요. 쉬운 낱말로 낱글자와 말소리의 관계를 확실히 익혀요.', kind: 'cv' },
      { goal: '더 다양한 글자와 낱말을 소리 듣고 찾기, 읽기, 따라 쓰기, 조합하기로 연습해요.', kind: 'cv', wide: true },
    ],
  },
  {
    n: 5, title: '받침 ㅁ ㅇ ㄴ ㄹ',
    goal: '받침으로 쓰이는 낱글자의 말소리를 익히고, 받침이 있는 글자를 읽어요.',
    steps: [
      { goal: '받침 ㅁ, ㅇ의 모양과 말소리를 익히고, ㅁ, ㅇ 받침이 있는 글자와 낱말을 읽어요.', kind: 'final', focus: ['ㅁ', 'ㅇ'] },
      { goal: 'ㅁ, ㅇ 받침 글자와 낱말을 읽고, 소리를 듣고 ㅁ, ㅇ 받침을 찾아요.', kind: 'final', focus: ['ㅁ', 'ㅇ'], find: true },
      { goal: '받침 ㄴ, ㄹ의 모양과 말소리를 익히고, ㄴ, ㄹ 받침이 있는 글자와 낱말을 읽어요.', kind: 'final', focus: ['ㄴ', 'ㄹ'] },
      { goal: 'ㄴ, ㄹ 받침 글자와 낱말을 읽고, 소리를 듣고 ㄴ, ㄹ 받침을 찾아요.', kind: 'final', focus: ['ㄴ', 'ㄹ'], find: true },
    ],
  },
  {
    n: 6, title: '받침 ㅂ ㄱ과 여러 받침',
    goal: '주요 받침을 모두 배우고, 여러 받침이 있는 글자를 말소리와 이어 읽어요.',
    steps: [
      { goal: '받침 ㅂ, ㄱ의 모양과 말소리를 익히고, ㅂ, ㄱ 받침이 있는 글자와 낱말을 읽어요.', kind: 'final', focus: ['ㅂ', 'ㄱ'] },
      { goal: 'ㅂ, ㄱ 받침 글자와 낱말을 읽고, 소리를 듣고 ㅂ, ㄱ 받침을 찾아요.', kind: 'final', focus: ['ㅂ', 'ㄱ'], find: true },
      { goal: '여러 받침이 있는 글자를 읽어요. 쉬운 받침 낱말로 낱글자와 말소리의 관계를 확실히 익혀요.', kind: 'finals' },
      { goal: '받침 있는 낱말을 다양하게 읽고, 처음 보는 낱말도 글자 구성을 살펴 스스로 읽어요.', kind: 'finals', wide: true },
    ],
  },
  {
    n: 7, title: '거센소리와 된소리',
    goal: '거센소리와 된소리가 나는 자음의 말소리를 익히고, 이 자음이 들어간 글자와 낱말을 읽어요.',
    steps: [
      { goal: '거센소리 ㅋ, ㅌ의 모양과 말소리를 익히고, ㅋ, ㅌ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㅋ', 'ㅌ'], tense: true },
      { goal: '거센소리 ㅍ, ㅊ의 모양과 말소리를 익히고, ㅍ, ㅊ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㅍ', 'ㅊ'], tense: true },
      { goal: '된소리 ㄲ, ㄸ, ㅃ의 모양과 말소리를 익히고, ㄲ, ㄸ, ㅃ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㄲ', 'ㄸ', 'ㅃ'], tense: true },
      { goal: '된소리 ㅃ, ㅉ, ㅆ의 모양과 말소리를 익히고, ㅃ, ㅉ, ㅆ으로 시작하는 글자와 낱말을 읽어요.', kind: 'cons', focus: ['ㅃ', 'ㅉ', 'ㅆ'], tense: true },
    ],
  },
  {
    n: 8, title: '이중 모음',
    goal: '여러 이중 모음의 말소리를 익히고, 지금까지 배운 것을 활용해 다양한 낱말을 읽어요.',
    steps: [
      { goal: '이중 모음 ㅘ, ㅝ, ㅟ, ㅢ의 모양과 말소리를 익혀요. 두 모음의 소리를 이어 읽어요.', kind: 'diph', focus: ['ㅘ', 'ㅝ', 'ㅟ', 'ㅢ'] },
      { goal: '이중 모음 ㅑ, ㅕ, ㅛ, ㅠ의 모양과 말소리를 익혀요. 두 모음의 소리를 이어 읽어요.', kind: 'diph', focus: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'] },
      { goal: '모음 ㅚ, ㅙ, ㅔ, ㅐ의 모양과 말소리를 익혀요. 소리는 같아도 글자가 다르다는 것을 알아요.', kind: 'diph', focus: ['ㅚ', 'ㅙ', 'ㅔ', 'ㅐ'] },
      { goal: '받침, 거센소리와 된소리, 이중 모음이 들어간 글자를 읽고, 처음 보는 낱말도 스스로 읽어요.', kind: 'mix' },
    ],
  },
  {
    n: 9, title: '받침 ㅍ · ㅋ · ㄲ',
    goal: '받침에서 [ㅂ] 소리가 나는 ㅍ과 [ㄱ] 소리가 나는 ㅋ, ㄲ을 배우고 낱말과 문장을 읽어요.',
    steps: [
      { goal: '받침 ㅍ이 [ㅂ] 소리라는 것을 알고, 받침 ㅍ을 [ㅂ]으로 읽어요.', kind: 'rule', focus: ['pf'] },
      { goal: '문장 속 받침 ㅍ 낱말을 [ㅂ] 소리로 읽고, ㅍ 받침으로 바르게 써요.', kind: 'rule', focus: ['pf'], sentence: true },
      { goal: '받침 ㅋ, ㄲ이 [ㄱ] 소리라는 것을 알고, 받침 ㅋ, ㄲ을 [ㄱ]으로 읽어요.', kind: 'rule', focus: ['kf'] },
      { goal: '문장 속 받침 ㅋ, ㄲ 낱말을 [ㄱ] 소리로 읽고, ㅋ, ㄲ 받침으로 바르게 써요.', kind: 'rule', focus: ['kf'], sentence: true },
    ],
  },
  {
    n: 10, title: '받침 ㄷ · ㅌ',
    goal: '받침에서 [ㄷ] 소리가 나는 글자를 배우고, ㄷ, ㅌ 받침이 들어간 낱말과 문장을 읽어요.',
    steps: [
      { goal: '받침 ㄷ의 모양과 소리를 익히고, ㄷ 받침 글자와 낱말을 읽어요.', kind: 'rule', focus: ['df'] },
      { goal: '문장 속 받침 ㄷ 낱말을 [ㄷ] 소리로 읽고, ㄷ 받침으로 바르게 써요.', kind: 'rule', focus: ['df'], sentence: true },
      { goal: '받침 ㅌ이 [ㄷ] 소리라는 것을 알고, 받침 ㅌ을 [ㄷ]으로 읽어요.', kind: 'rule', focus: ['tf'] },
      { goal: '문장 속 받침 ㅌ 낱말을 [ㄷ] 소리로 읽고, ㅌ 받침으로 바르게 써요.', kind: 'rule', focus: ['tf'], sentence: true },
    ],
  },
  {
    n: 11, title: '받침 ㅅ · ㅈ · ㅊ',
    goal: '받침에서 [ㄷ] 소리가 나는 ㅅ, ㅈ, ㅊ을 배우고, 소리가 같아도 뜻에 따라 다르게 쓰는 낱말을 구분해요.',
    steps: [
      { goal: '받침 ㅅ이 [ㄷ] 소리라는 것을 알고, 받침 ㅅ을 [ㄷ]으로 읽어요.', kind: 'rule', focus: ['sf'] },
      { goal: '문장 속 받침 ㅅ 낱말을 [ㄷ] 소리로 읽고, ㅅ 받침으로 바르게 써요.', kind: 'rule', focus: ['sf'], sentence: true },
      { goal: '받침 ㅈ, ㅊ이 [ㄷ] 소리라는 것을 알고, 받침 ㅈ, ㅊ을 [ㄷ]으로 읽어요.', kind: 'rule', focus: ['jf'] },
      { goal: '문장 속 받침 ㅈ, ㅊ 낱말을 [ㄷ] 소리로 읽고, ㅈ, ㅊ 받침으로 바르게 써요.', kind: 'rule', focus: ['jf'], sentence: true },
    ],
  },
  {
    n: 12, title: '사이시옷과 받침 모아 읽기',
    goal: '사이시옷이 들어간 낱말과 받침 ㅅ이 넘어가는 낱말, 지금까지 배운 여러 받침의 낱말과 문장을 읽어요.',
    steps: [
      { goal: '두 낱말이 합쳐질 때 사이시옷이 들어가는 것을 알고 정확하게 읽고 써요.', kind: 'rule', focus: ['sai'], sentence: true },
      { goal: '받침 ㅅ 뒤에 모음이 오면 ㅅ이 뒤로 넘어가 소리 나는 낱말을 정확하게 읽고 써요.', kind: 'rule', focus: ['slink'], sentence: true },
      { goal: '지금까지 배운 여러 받침이 들어간 낱말과 문장을 읽고 써요.', kind: 'rule', focus: ['pf', 'kf', 'df', 'tf', 'sf', 'jf'] },
      { goal: '지금까지 배운 여러 받침이 들어간 낱말과 문장을 읽고 써요.', kind: 'rule', focus: ['pf', 'kf', 'df', 'tf', 'sf', 'jf', 'sai', 'slink'], sentence: true },
    ],
  },
  {
    n: 13, title: '받침 ㅎ과 소리가 같은 모음',
    goal: '받침 ㅎ이 다른 글자와 만나 소리가 바뀌는 것을 알고, ㅔ/ㅐ, ㅚ/ㅙ처럼 소리가 같은 모음을 뜻에 따라 구분해요.',
    steps: [
      { goal: '받침 ㅎ이 다른 자음을 만나면 거센소리가 나는 것을 알고 읽어요.', kind: 'rule', focus: ['hf'], sentence: true },
      { goal: '받침 ㅎ 뒤에 모음이 오면 ㅎ 소리가 나지 않아도 뜻에 맞게 ㅎ 받침으로 읽고 써요.', kind: 'rule', focus: ['hv'], sentence: true },
      { goal: '소리가 같은 모음 ㅔ, ㅐ가 들어간 낱말을 뜻에 따라 바르게 써요.', kind: 'rule', focus: ['ae'], sentence: true },
      { goal: '소리가 같은 모음 ㅚ, ㅙ와 모음 ㅖ가 들어간 낱말을 읽고 뜻에 따라 바르게 써요.', kind: 'rule', focus: ['oe', 'ye'], sentence: true },
    ],
  },
  {
    n: 14, title: '겹받침',
    goal: '여러 겹받침이 어떤 소리를 내는지 알고, 겹받침이 들어간 낱말과 문장을 읽어요.',
    steps: [
      { goal: '겹받침 ㄵ, ㄼ, ㄺ, ㄻ이 어떤 소리가 나는지 배우고 낱말과 문장에서 읽어요.', kind: 'rule', focus: ['g1'] },
      { goal: '겹받침 ㄵ, ㄼ, ㄺ, ㄻ이 들어간 여러 낱말과 문장을 읽고 써요.', kind: 'rule', focus: ['g1'], sentence: true },
      { goal: '겹받침 ㄶ, ㅀ, ㄾ, ㅄ이 어떤 소리가 나는지 배우고 낱말과 문장에서 읽어요.', kind: 'rule', focus: ['g2'] },
      { goal: '겹받침 ㄶ, ㅀ, ㄾ, ㅄ이 들어간 여러 낱말과 문장을 읽고 써요.', kind: 'rule', focus: ['g2'], sentence: true },
    ],
  },
];

// 1단계는 2차시, 나머지는 4차시. 차시 하나가 하루치 오늘의 할 일이다
export const HANGUL_STEPS = HANGUL_STAGES.flatMap((st) => st.steps.map((s, i) => ({
  ...s, id: `${st.n}-${i + 1}`, stage: st.n, no: i + 1, stageTitle: st.title, stageGoal: st.goal,
})));

// 규칙 이름 (rule 차시의 focus)
export const RULE_NAME = {
  pf: '받침 ㅍ → [ㅂ]', kf: '받침 ㅋ·ㄲ → [ㄱ]', df: '받침 ㄷ', tf: '받침 ㅌ → [ㄷ]', sf: '받침 ㅅ → [ㄷ]', jf: '받침 ㅈ·ㅊ → [ㄷ]',
  sai: '사이시옷', slink: '받침 ㅅ 넘어가기', hf: '받침 ㅎ + 자음', hv: '받침 ㅎ + 모음', ae: 'ㅔ와 ㅐ', oe: 'ㅚ와 ㅙ', ye: 'ㅖ',
  g1: '겹받침 ㄵ ㄼ ㄺ ㄻ', g2: '겹받침 ㄶ ㅀ ㄾ ㅄ',
};

// 오늘의 할 일 6칸의 후보 놀이 (차시 종류별). 칸마다 하나가 날마다 바뀌어 들어간다
export const PLAN_STAGES = ['도입', '탐색', '탐색', '연습', '연습', '평가'];
export const HANGUL_PLANS = {
  vocab: [['k-line', 'k-flash', 'k-talk'], ['k-memory', 'k-flash', 'k-label'], ['k-toy', 'k-explain', 'k-petdict'], ['k-line', 'k-memory', 'k-rocket'], ['k-explain', 'k-toy'], ['k-gquiz', 'k-quiz']],
  jamoShape: [['k-trace', 'k-write', 'k-tutor'], ['k-pair', 'k-wash'], ['k-listen', 'k-wash'], ['k-trace', 'k-pair'], ['k-memory', 'k-flash'], ['k-listen', 'k-pair']],
  theme: [['k-flash', 'k-line', 'k-talk'], ['k-memory', 'k-search', 'k-petdict'], ['k-toy', 'k-explain', 'k-station', 'k-grocery'], ['k-line', 'k-flash'], ['k-gquiz', 'k-toy', 'k-search'], ['k-quiz', 'k-gquiz']],
  themeJamo: [['k-flash', 'k-line'], ['k-trace', 'k-pair', 'k-wash'], ['k-memory', 'k-search', 'k-toy'], ['k-listen', 'k-trace'], ['k-gquiz', 'k-explain'], ['k-quiz', 'k-gquiz']],
  themeSound: [['k-flash', 'k-line'], ['k-choco'], ['k-stage', 'k-hat'], ['k-memory', 'k-search'], ['k-station', 'k-choco'], ['k-gquiz', 'k-quiz']],
  vowel: [['k-trace', 'k-wash', 'k-write'], ['k-listen', 'k-pair'], ['k-picker', 'k-rhythm', 'k-ispy', 'k-table'], ['k-puzzle', 'k-jewel'], ['k-hat', 'k-fruit', 'k-complete'], ['k-quiz', 'k-listen', 'k-jewel']],
  cons: [['k-trace', 'k-wash', 'k-write'], ['k-listen', 'k-pair', 'k-dog'], ['k-picker', 'k-rhythm', 'k-ispy'], ['k-puzzle', 'k-station', 'k-jewel', 'k-dog', 'k-present'], ['k-hat', 'k-fruit', 'k-complete'], ['k-quiz', 'k-listen', 'k-gquiz']],
  cv: [['k-listen', 'k-hat', 'k-write'], ['k-picker', 'k-rhythm', 'k-dog', 'k-tunnel'], ['k-puzzle', 'k-stage', 'k-choco', 'k-petdict'], ['k-fruit', 'k-pot', 'k-complete', 'k-dict'], ['k-gletter', 'k-gtype1', 'k-sentence', 'k-search', 'k-sheep'], ['k-gquiz', 'k-quiz']],
  final: [['k-wash', 'k-listen', 'k-write'], ['k-picker', 'k-rhythm', 'k-dog'], ['k-puzzle', 'k-ispy', 'k-hat'], ['k-jewel', 'k-fruit', 'k-complete', 'k-dict', 'k-tunnel'], ['k-pot', 'k-toy', 'k-stage'], ['k-quiz', 'k-gquiz', 'k-listen']],
  finals: [['k-listen', 'k-hat', 'k-dog'], ['k-rhythm', 'k-picker'], ['k-stage', 'k-choco', 'k-puzzle', 'k-talk'], ['k-pot', 'k-fruit', 'k-complete', 'k-dict'], ['k-search', 'k-gletter', 'k-kicker', 'k-jelly', 'k-gtype1', 'k-lightup', 'k-hwtype', 'k-clock'], ['k-gquiz', 'k-quiz']],
  diph: [['k-trace', 'k-wash', 'k-write'], ['k-listen', 'k-pair'], ['k-picker', 'k-rhythm', 'k-ispy'], ['k-puzzle', 'k-jewel'], ['k-complete', 'k-pot', 'k-fruit'], ['k-quiz', 'k-gquiz']],
  mix: [['k-listen', 'k-hat', 'k-dog'], ['k-rhythm', 'k-picker'], ['k-stage', 'k-choco', 'k-petdict'], ['k-pot', 'k-complete', 'k-fruit', 'k-dict'], ['k-sentence', 'k-kicker', 'k-jelly', 'k-gletter', 'k-gtype1', 'k-lightup', 'k-readans', 'k-hwtype', 'k-build', 'k-ktype', 'k-clock'], ['k-gquiz', 'k-quiz']],
  rule: [['k-listen', 'k-jewel'], ['k-complete', 'k-flash'], ['k-gquiz', 'k-search', 'k-memory'], ['k-pot', 'k-gletter'], ['k-gtype1', 'k-quiz', 'k-complete'], ['k-quiz', 'k-gquiz']],
  ruleSentence: [['k-listen', 'k-complete'], ['k-sticky', 'k-lightup'], ['k-sentence', 'k-gquiz', 'k-search', 'k-readans'], ['k-pot', 'k-gletter', 'k-hwtype'], ['k-gtype2', 'k-sticky', 'k-kicker', 'k-jelly', 'k-lightup'], ['k-quiz', 'k-gquiz']],
};
// 그림 낱말이 꼭 필요한 놀이 (그림 낱말이 적은 차시에서는 뺀다)
export const PICTURE_GAMES = new Set(['k-line', 'k-memory', 'k-flash', 'k-toy', 'k-gquiz', 'k-complete', 'k-fruit', 'k-station', 'k-explain', 'k-dog', 'k-dict']);

export function planFor(step) {
  if (step.kind === 'theme') return HANGUL_PLANS[step.jamo ? 'themeJamo' : step.sound ? 'themeSound' : 'theme'];
  if (step.kind === 'rule') return HANGUL_PLANS[step.sentence ? 'ruleSentence' : 'rule'];
  return HANGUL_PLANS[step.kind];
}

// 확인 퀴즈: 오늘의 할 일을 CHECK_EVERY번 마치는 날, 마지막 칸 뒤에 최근 차시들을 묻는 퀴즈가 붙는다.
// CHECK_PASS(70%) 이상 맞히면 그대로 나아가고, 아니면 다음 날 가장 약한 차시로 돌아가 그 차시와 난이도를 다시 한다
export const CHECK_EVERY = 5;
export const CHECK_PASS = 0.7;
export const CHECK_KEY = 'k-check';

// 가장 약한 차시: 맞힌 비율이 가장 낮은 차시 (같으면 먼저 배운 차시)
export function weakestStep(results) {
  const by = new Map();
  results.forEach(({ step, ok }) => {
    const r = by.get(step) || { step, ok: 0, n: 0 };
    r.n++;
    if (ok) r.ok++;
    by.set(step, r);
  });
  return [...by.values()].sort((a, b) => a.ok / a.n - b.ok / b.n || a.step - b.step)[0]?.step ?? null;
}

// 나이로 고르는 시작 차시 (부모님 화면에서 언제든 바꿀 수 있다)
export const startStepForAge = (age) => {
  const id = { 3: '1-1', 4: '1-1', 5: '2-1', 6: '3-1', 7: '4-1' }[age] || '5-1';
  return HANGUL_STEPS.findIndex((s) => s.id === id);
};
