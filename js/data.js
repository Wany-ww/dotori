import { shuffle, pickN } from './util.js';

/* ---------- 난이도 ---------- */
export const MAX_LEVEL = 5;
export const LEVELS = [
  { n: 1, name: '새싹', e: '🌱' },
  { n: 2, name: '잎새', e: '🍃' },
  { n: 3, name: '꽃봉오리', e: '🌷' },
  { n: 4, name: '열매', e: '🍎' },
  { n: 5, name: '큰 나무', e: '🌳' },
];
export const AVATARS = ['🐰', '🦊', '🐻', '🐼', '🐯', '🐨', '🐸', '🦁'];

/* ---------- 과목 & 일일 수업 설계 ----------
   plan: 하루 수업의 단계. 각 단계는 후보 놀이(pool) 중 하나가 날마다 바뀌어 배치된다. */
export const SUBJECTS = {
  hangul: {
    id: 'hangul',
    name: '한글',
    glyph: '가',
    tagline: '자음과 모음, 소리 블록을 모아 글자를 만들어요.',
    courseName: '할 일',
    minutes: '15~20분',
    courseDesc: '도입 → 탐색 → 연습 → 평가 순서로, 오늘 차시에서 배우는 글자와 낱말로 된 6개 놀이를 해요. 놀이 구성은 날마다 바뀌고, 5번째 날에는 확인 퀴즈가 붙어요.',
    levelDesc: ['자음·모음 모양과 소리', '자음+모음으로 글자 만들기', '낱말 읽고 완성하기', '받침 글자 익히기', '받침 낱말과 문장 만들기'],
    plan: [
      { stage: '도입', pool: ['k-trace', 'k-listen', 'k-line', 'k-pair', 'k-hat', 'k-wash', 'k-tutor', 'k-wtrace'] },
      { stage: '탐색', pool: ['k-puzzle', 'k-memory', 'k-picker', 'k-jewel', 'k-pair', 'k-ispy', 'k-rhythm', 'k-present', 'k-table', 'k-tunnel'] },
      { stage: '탐색', pool: ['k-puzzle', 'k-picker', 'k-jewel', 'k-memory', 'k-listen', 'k-flash', 'k-toy', 'k-choco', 'k-stage', 'k-station', 'k-wcard', 'k-easy', 'k-label'] },
      { stage: '연습', pool: ['k-complete', 'k-sentence', 'k-kicker', 'k-search', 'k-gletter', 'k-fruit', 'k-explain', 'k-grocery', 'k-rocket', 'k-cross'] },
      { stage: '연습', pool: ['k-complete', 'k-sentence', 'k-kicker', 'k-jelly', 'k-sticky', 'k-search', 'k-line', 'k-gtype1', 'k-gsearch1', 'k-gsearch2', 'k-gtype2', 'k-pot', 'k-sheep', 'k-build', 'k-ktype'] },
      { stage: '평가', pool: ['k-quiz', 'k-gquiz'] },
    ],
    games: [
      'k-trace', 'k-listen', 'k-line', 'k-pair', 'k-hat', 'k-wash', 'k-ispy', 'k-flash', 'k-toy', 'k-rhythm', 'k-choco', 'k-stage', 'k-station', 'k-dog', 'k-puzzle', 'k-picker', 'k-jewel', 'k-memory', 'k-complete', 'k-fruit', 'k-pot', 'k-kicker',
      'k-explain', 'k-search', 'k-sentence', 'k-sticky', 'k-jelly', 'k-quiz',
      'k-easy', 'k-tutor', 'k-tunnel', 'k-grocery', 'k-rocket', 'k-wcard', 'k-wtrace', 'k-label', 'k-present', 'k-sheep', 'k-cross', 'k-table', 'k-build', 'k-ktype',
      'k-talk', 'k-petdict', 'k-lightup', 'k-readans', 'k-write', 'k-dict', 'k-hwtype',
      'k-gquiz', 'k-gletter', 'k-gsearch1', 'k-gsearch2', 'k-gtype1', 'k-gtype2', 'k-clock',
    ],
  },
  math: {
    id: 'math',
    name: '수학',
    glyph: '123',
    tagline: '만지고, 세고, 묶으면서 수와 친해져요.',
    courseName: '데일리 어드벤처',
    minutes: '15~20분',
    courseDesc: '8단계(Level A ~ H) 중 오늘 상세 단계의 목표에 맞춘 놀이를 탐색 → 기호화 → 숙달 → 응용 순서로 해요. 6칸이 안 되면 바로 앞 단계를 복습해요. 놀이 구성은 날마다 바뀌어요.',
    levelDesc: ['1~5 수 세기와 기본 도형', '10까지 수와 덧셈', '20까지 수, 덧셈·뺄셈', '두 자리 수와 자릿값', '100까지 수, 곱셈 기초'],
    games: ['m-bakery', 'm-basic', 'm-count', 'm-compare', 'm-shapes', 'm-trace', 'm-blocks', 'm-memory', 'm-quick', 'm-pattern',
      'm-balance', 'm-beads', 'm-circus', 'm-cookies', 'm-graph2', 'm-graph1', 'm-draw', 'm-observe', 'm-studyas', 'm-studydiv', 'm-studyshape', 'm-days', 'm-placegrid', 'm-eggs', 'm-equation', 'm-fallblocks', 'm-falling', 'm-ferris', 'm-domino', 'm-fish', 'm-frog', 'm-hpuzzle', 'm-hquiz', 'm-caterpillar', 'm-line', 'm-farm', 'm-mango', 'm-same', 'm-kicker', 'm-matrix', 'm-missing', 'm-change', 'm-gugu', 'm-light', 'm-digits', 'm-numpuz', 'm-quickmul', 'm-quicksub', 'm-facts', 'm-div', 'm-rocket', 'm-rulercount', 'm-ruler', 'm-shapetrace', 'm-add1', 'm-add2', 'm-sub1', 'm-sub2', 'm-tally', 'm-tallylab', 'm-tallycatch', 'm-clock', 'm-grocery', 'm-wordeq', 'm-windows', 'm-drink', 'm-pizza', 'm-tallydiv', 'm-jellydiv', 'm-create', 'm-tutor', 'm-classify', 'm-sea', 'm-cuckoo', 'm-tangram', 'm-decal', 'm-cubes', 'm-cubes2', 'm-sudoku', 'm-origami', 'm-path', 'm-gridlock', 'm-multidigit', 'm-icecream', 'm-flowers', 'm-gugumaster', 'm-aias', 'm-aimul', 'm-aidiv'],
  },
  english: {
    id: 'english',
    name: '영어',
    glyph: 'ABC',
    latin: true,
    tagline: '소리 듣고, 글자 쓰고, 그림책까지 함께 읽어요.',
    courseName: '데일리 코스',
    minutes: '20~25분',
    courseDesc: '24단계(Level A ~ Z) 중 오늘 차시의 목표에 맞춘 6개 놀이를 해요. 알파벳 단계는 듣기 → 쓰기 → 읽기, 문장 단계는 어휘 → 문장 규칙 → 말하기 → 읽기 순서예요.',
    levelDesc: ['알파벳 대문자와 첫소리', '첫소리와 쉬운 단어', '소문자와 단어 읽기', '끝소리와 철자 만들기', '긴 단어와 문장 읽기'],
    plan: [
      { stage: '소리', pool: ['e-phonics', 'e-dog', 'e-memory', 'e-hat', 'e-listen', 'e-wash', 'e-strain', 'e-balls'] },
      { stage: '철자', pool: ['e-abc', 'e-missing', 'e-trace', 'e-spell', 'e-ispy', 'e-strain', 'e-wmatrix', 'e-shapetrace', 'e-card', 'e-tutor', 'e-wtrace', 'e-note', 'e-type'] },
      { stage: '철자', pool: ['e-spell', 'e-abc', 'e-missing', 'e-trace', 'e-dog', 'e-ispy', 'e-numtrace', 'e-machine', 'e-wmatrix', 'e-cross', 'e-search'] },
      { stage: '어휘', pool: ['e-flash', 'e-easy', 'e-what', 'e-memory', 'e-color', 'e-toy', 'e-listen', 'e-count', 'e-days', 'e-matrix', 'e-numpuz', 'e-space', 'e-machine', 'e-kicker', 'e-jelly', 'e-pattern', 'e-shapes', 'e-clock', 'e-label', 'e-line', 'e-grocery', 'e-rocket'] },
      { stage: '말하기', pool: ['e-talk', 'e-bird', 'e-sayho', 'e-paint', 'e-petdict', 'e-alien', 'e-quiz'] },
      { stage: '읽기', pool: ['e-book', 'e-book', 'e-bridge', 'e-blank', 'e-missingw', 'e-bricks', 'e-cookie', 'e-ice', 'e-sticky', 'e-ship'] },
    ],
    games: ['e-abc', 'e-easy', 'e-color', 'e-dog', 'e-flash', 'e-ispy', 'e-listen', 'e-hat', 'e-toy', 'e-wash', 'e-phonics', 'e-memory', 'e-missing', 'e-trace', 'e-spell', 'e-what',
      'e-count', 'e-numpuz', 'e-numtrace', 'e-days', 'e-matrix', 'e-pattern', 'e-shapes', 'e-shapetrace', 'e-clock',
      'e-strain', 'e-machine', 'e-wmatrix', 'e-space', 'e-kicker', 'e-jelly', 'e-quiz',
      'e-label', 'e-card', 'e-line', 'e-bridge', 'e-blank', 'e-tutor', 'e-grocery', 'e-note', 'e-wtrace', 'e-rocket', 'e-missingw', 'e-bricks', 'e-type', 'e-cookie', 'e-ice',
      'e-balls', 'e-sticky', 'e-ship', 'e-cross', 'e-search',
      'e-talk', 'e-bird', 'e-sayho', 'e-paint', 'e-petdict', 'e-alien', 'e-book', 'e-story',
      'e-wchal', 'e-pchal', 'e-lchal', 'e-gchal', 'e-tower', 'e-call', 'e-starfall'],
  },
};

export const GAMES = {
  // scene: 플레이 화면 배경 장면 (css/app.css의 .player[data-scene])
  'k-trace': { subject: 'hangul', module: 'trace', opts: { set: 'jamo' }, scene: 'beach', title: '모래사장 따라쓰기', icon: '🏖️', uKey: 'LetterTrace', desc: '모래 위에 자음·모음을 바른 획순으로 따라 써요.' },
  'k-listen': { subject: 'hangul', module: 'starSound', scene: 'night', title: '별빛 소리', icon: '🌟', uKey: 'ListenNMatch', desc: '소리를 듣고 밤하늘에서 같은 글자가 반짝이는 별자리를 찾아요.' },
  'k-puzzle': { subject: 'hangul', module: 'jamoPuzzle', scene: 'chalk', title: '모여라 자음 모음', icon: '🧩', uKey: 'HangeulPuzzle', desc: '나무 블록을 칠판 틀에 끼워 글자를 만들어요.' },
  'k-picker': { subject: 'hangul', module: 'letterPicker', scene: 'workshop', title: '돌려라 글자판', icon: '🎰', uKey: 'LetterPicker', desc: '글자판을 돌려 자음과 모음을 골라 글자를 완성해요.' },
  'k-memory': { subject: 'hangul', module: 'memoryMatch', opts: { set: 'hangul' }, scene: 'wood', title: '카드를 기억해', icon: '🃏', uKey: 'MemoryMatch', desc: '뒤집힌 카드에서 짝꿍을 찾아요.' },
  'k-complete': { subject: 'hangul', module: 'completeWords', scene: 'wood', title: '낱말 완성하기', icon: '🐳', uKey: 'CompleteWords', desc: '낱말 카드의 빈칸에 들어갈 글자 조각을 찾아요.' },
  'k-kicker': { subject: 'hangul', module: 'wordKicker', scene: 'field', title: '단어 축구', icon: '⚽', uKey: 'WordKicker', desc: '문장을 듣고 알맞은 말을 골라 골을 넣어요.' },
  'k-sentence': { subject: 'hangul', module: 'sentenceMaker', scene: 'notebook', title: '문장 만들기', icon: '📝', uKey: 'SentenceMaker', desc: '종이 조각을 순서대로 붙여 문장을 만들어요.', minLevel: 2 },
  'k-jewel': { subject: 'hangul', module: 'jewelMine', scene: 'mine', title: '보석 광산', icon: '💎', uKey: 'JewelMiner', desc: '알맞은 글자 보석을 모두 찾아 캐요.' },
  'k-line': { subject: 'hangul', module: 'lineMatch', scene: 'wood', title: '선 긋기', icon: '🔗', uKey: 'LineMatching', desc: '서로 짝이 되는 것을 선으로 이어요.' },
  'k-jelly': { subject: 'hangul', module: 'jellyAffix', scene: 'pond', title: '젤리 문장 만들기', icon: '🍬', uKey: 'JellyAffix', desc: '젤리 문장의 빈 곳에 받침에 맞는 말 젤리(이/가, 을/를…)를 붙여요.' },
  'k-easy': { subject: 'hangul', module: 'easyPuzzle', scene: 'pond', title: '그림 조각 맞추기', icon: '🧩', uKey: 'EasyPuzzle', desc: '그림 조각을 그림자 자리에 맞추면 그림이 움직이고 낱말이 나타나요.' },
  'k-tutor': { subject: 'hangul', module: 'trace', opts: { set: 'lines' }, scene: 'beach', title: '따라 그리기', icon: '〰️', uKey: 'TutorialTrace', desc: '곧은 선, 물결, 지그재그부터 집과 무지개까지 따라 그려요.' },
  'k-tunnel': { subject: 'hangul', module: 'letterTunnel', scene: 'mine', title: '으랏차 글자 광산', icon: '⛏️', uKey: 'LetterTunnel', desc: '광차를 타고 터널을 지나며 빈칸의 자음·모음을 골라 글자를 완성해요.' },
  'k-grocery': { subject: 'hangul', module: 'grocery', scene: 'kitchen', title: '동물 마트', icon: '🛒', uKey: 'WordGrocery', desc: '동물 손님이 원하는 종류의 물건을 개수만큼 바구니에 담아요.' },
  'k-rocket': { subject: 'hangul', module: 'sortRockets', scene: 'space', title: '낱말 로켓', icon: '🚀', uKey: 'SortingRockets', desc: '알맞은 갈래의 낱말을 골라 로켓에 싣고 발사해요.' },
  'k-wcard': { subject: 'hangul', module: 'wordCard', scene: 'table', title: '낱말 조각 맞추기', icon: '🃏', uKey: 'WordCardPuzzle', desc: '글자 조각을 제자리에 놓을수록 흐릿한 그림이 선명해져요.' },
  'k-wtrace': { subject: 'hangul', module: 'wordTrace', opts: { mode: 'ko' }, scene: 'chalk', title: '칠판 따라쓰기', icon: '🖍️', uKey: 'WordTracing', desc: '칠판 위 낱말을 한 글자씩 따라 쓰면 멋진 그림이 나와요.' },
  'k-label': { subject: 'hangul', module: 'labeling', scene: 'meadow', title: '이름표 붙이기', icon: '🏷️', uKey: 'Labeling', desc: '그림 속 빈칸에 알맞은 이름표를 붙여요.' },
  'k-present': { subject: 'hangul', module: 'findAll', scene: 'stage', title: '말소리 발표', icon: '📢', uKey: 'PhonicsPresentation', desc: '토리가 발표할 말소리가 나는 글자를 모두 찾아요.' },
  'k-sheep': { subject: 'hangul', module: 'typing', opts: { mode: 'sheep' }, scene: 'night', title: '구름 타자치기', icon: '🐑', uKey: 'StarFall', desc: '밤하늘에서 내려오는 양의 글자를 자판으로 쳐요.' },
  'k-cross': { subject: 'hangul', module: 'crossword', scene: 'notebook', title: '십자말풀이', icon: '✚', uKey: 'CrossWord', desc: '그림 단서를 보고 가로세로 빈칸을 낱말로 채워요.', minLevel: 2 },
  'k-table': { subject: 'hangul', module: 'matrix', opts: { kind: 'hangul' }, scene: 'wood', title: '한글표 완성하기', icon: '🔠', uKey: 'Matrix', desc: '자음과 모음이 만나는 한글표의 빈칸에 글자 조각을 끼워요.' },
  'k-build': { subject: 'hangul', module: 'typing', opts: { mode: 'build' }, scene: 'notebook', title: '듣고 글자 만들기', icon: '🔡', uKey: 'GraphemeTyper', desc: '문장을 듣고 빈칸의 글자를 자모 자판으로 만들어요.', minLevel: 2 },
  'k-ktype': { subject: 'hangul', module: 'typing', opts: { mode: 'blank' }, scene: 'notebook', title: '듣고 타자치기', icon: '⌨️', uKey: 'KeyboardTyper', desc: '문장을 듣고 빈칸의 낱말을 자판으로 쳐요.', minLevel: 2 },
  'e-label': { subject: 'english', module: 'labeling', scene: 'meadow', title: '라벨링', icon: '🏷️', uKey: 'Labeling', desc: '그림에 맞는 영어 이름표를 붙이고, 그림 전체의 제목도 붙여요.' },
  'e-card': { subject: 'english', module: 'wordTrace', opts: { mode: 'card' }, scene: 'craft', title: '알파벳 카드', icon: '🔤', uKey: 'LetterTracingCard', desc: '카드에 쓰인 대문자·소문자를 따라 써요.' },
  'e-line': { subject: 'english', module: 'lineMatch', scene: 'wood', title: '선긋기', icon: '🔗', uKey: 'LineMatching', desc: '그림과 영어 단어, 첫 글자의 짝을 선으로 이어요.' },
  'e-bridge': { subject: 'english', module: 'bridgeType', scene: 'meadow', title: '문장 다리 만들기', icon: '🌉', uKey: 'SentenceBridge', desc: '다리 위 문장에서 빠진 글자를 알파벳 자판으로 쳐서 트럭이 건너게 해요.' },
  'e-blank': { subject: 'english', module: 'sentenceKit', opts: { mode: 'maker' }, scene: 'notebook', title: '빈칸 채우기', icon: '✍️', uKey: 'SentenceMaker', desc: '그림을 보고 문장의 빈칸에 필요한 단어를 채워요.' },
  'e-tutor': { subject: 'english', module: 'trace', opts: { set: 'linesEn' }, scene: 'beach', title: '손가락 따라쓰기', icon: '〰️', uKey: 'TutorialTrace', desc: '곧은 선부터 물결, 지그재그까지 손가락으로 따라 그려요.' },
  'e-grocery': { subject: 'english', module: 'grocery', scene: 'kitchen', title: '동물 마트', icon: '🛒', uKey: 'WordGrocery', desc: '동물 손님의 영어 주문을 보고 물건을 바구니에 담아요.' },
  'e-note': { subject: 'english', module: 'wordCard', scene: 'notebook', title: '워드 노트', icon: '📒', uKey: 'WordNote', desc: '철자 종이 조각을 붙이면 흐릿한 그림이 살아나요.' },
  'e-wtrace': { subject: 'english', module: 'wordTrace', opts: { mode: 'en' }, scene: 'craft', title: '단어 따라쓰기', icon: '✏️', uKey: 'WordTracing', desc: '단어를 한 글자씩 따라 쓰면 그림이 짠 나타나요.' },
  'e-rocket': { subject: 'english', module: 'sortRockets', scene: 'space', title: '단어 로켓', icon: '🚀', uKey: 'SortingRockets', desc: '외계인이 말하는 종류의 단어만 로켓에 실어 발사해요.' },
  'e-missingw': { subject: 'english', module: 'missingWords', scene: 'notebook', title: '글자가 사라졌다', icon: '📓', uKey: 'MissingWords', desc: '공책 글에서 사라진 낱말을, 둥둥 떠 있는 낱말(함정도 섞임) 중에서 골라 채워요.', minLevel: 2 },
  'e-bricks': { subject: 'english', module: 'sentenceBricks', scene: 'city', title: '문장 벽돌', icon: '🧱', uKey: 'SentenceBricks', desc: '빈칸에 들어갈 수 있는 낱말 벽돌을 모두 찾아 깨뜨려요. 위 벽돌이 내려와요!' },
  'e-type': { subject: 'english', module: 'typing', opts: { mode: 'en' }, scene: 'notebook', title: '타자 연습', icon: '⌨️', uKey: 'TypeTime', desc: '영어 자판으로 글자와 단어를 쳐요.' },
  'e-cookie': { subject: 'english', module: 'sentenceKit', opts: { mode: 'cookie' }, scene: 'kitchen', title: '쿠키 박스', icon: '🍪', uKey: 'CookieBox', desc: '단어 쿠키를 상자의 빈칸에 넣어 문장을 완성해요.' },
  'e-ice': { subject: 'english', module: 'iceBuild', scene: 'pond', title: '얼음 맞추기', icon: '🧊', uKey: 'BreaknBuild', desc: '문장 얼음다리의 빈 곳에 낱말 얼음을 맞춰 넣으면 펭귄이 건너가 생선을 먹어요.' },
  'e-balls': { subject: 'english', module: 'spellBalls', scene: 'meadow', title: '떨어지는 글자 받기', icon: '🍒', uKey: 'SpellBalls', desc: '나무에서 떨어지는 글자 공을 순서대로 받아 단어를 완성해요.' },
  'e-sticky': { subject: 'english', module: 'stickyStory', scene: 'notebook', title: '문장 메모', icon: '📝', uKey: 'StickySentences', desc: '게시판 종이의 글이 한 문장씩 이어져요. 빈칸에 가장 잘 맞는 메모지를 붙여요.' },
  'e-ship': { subject: 'english', module: 'fixShip', scene: 'pond', title: '배를 고치자', icon: '🚢', uKey: 'FixtheShip', desc: '배에 쓰인 문장의 빈칸에 나무 조각을 끼워 고치면 배가 돛을 올리고 떠나요.', minLevel: 2 },
  'e-cross': { subject: 'english', module: 'crossword', scene: 'notebook', title: '십자말풀이', icon: '✚', uKey: 'Crossword', desc: '그림과 소리 단서를 보고 가로세로 칸을 단어로 채워요.', minLevel: 2 },
  'e-search': { subject: 'english', module: 'wordSearch', scene: 'notebook', title: '숨은 낱말 찾기', icon: '🔍', uKey: 'WordSearch', desc: '알파벳 판에 숨은 주제 단어를 이어서 찾아요.' },
  'k-sticky': { subject: 'hangul', module: 'stickySentence', scene: 'notebook', title: '조각 조각 붙여요', icon: '✂️', uKey: 'CompleteTheSentence', desc: '바르게 쓴 종이 조각을 문장 빈칸에 붙여요.', minLevel: 2 },
  'k-search': { subject: 'hangul', module: 'wordSearch', scene: 'space', title: '숨은 낱말 찾기', icon: '🔍', uKey: 'WordSearch', desc: '글자판 속에 숨은 낱말을 찾아 이어요.', minLevel: 2 },
  'k-pair': { subject: 'hangul', module: 'findPair', scene: 'table', title: '같은 글자 짝 찾기', icon: '🔠', uKey: 'FindThePair', desc: '글씨 모양과 색이 달라도 같은 글자인 카드 짝을 찾아요.' },
  'k-flash': { subject: 'hangul', module: 'flashCard', scene: 'table', title: '낱말 카드', icon: '🗂️', uKey: 'FlashCard', desc: '다람쥐 친구와 책상 위 카드에서 그림과 낱말의 짝을 찾아요.' },
  'k-wash': { subject: 'hangul', module: 'washLetters', scene: 'bath', title: '목욕 시간', icon: '🛁', uKey: 'WashingAlphabet', desc: '더러워진 글자를 비누 거품으로 씻겨 주고 글자 소리를 들어요.' },
  'k-ispy': { subject: 'hangul', module: 'iSpy', scene: 'book', title: '나를 찾아줘', icon: '🔎', uKey: 'ISpy', desc: '그림책 속에 숨은 글자를 찾아 짝꿍 자리에 붙여요.' },
  'k-rhythm': { subject: 'hangul', module: 'rhythmHangul', scene: 'neon', title: '리듬 한글', icon: '🎵', uKey: 'RhythmHangeul', desc: '자음과 모음을 모아 글자를 완성하면 신나는 리듬이 흘러나와요.' },
  'k-choco': { subject: 'hangul', module: 'chocolate', scene: 'kitchen', title: '신기한 초콜릿', icon: '🍫', uKey: 'FantasticChocolate', desc: '낱말을 듣고 글자 수만큼 젤리를 잘라 쟁반에 올려요.' },
  'k-stage': { subject: 'hangul', module: 'goUpStage', scene: 'stage', title: '무대 위로 올라가', icon: '🎭', uKey: 'GoupStage', desc: '낱말을 만드는 글자 소리 친구들을 찾아 무대 위로 올려요.' },
  'k-station': { subject: 'hangul', module: 'phonicsStation', scene: 'city', title: '말소리 정류장', icon: '🚚', uKey: 'PhonicsStation', desc: '기사님 말을 듣고 첫 글자가 맞는 상자를 트럭에 실어요.' },
  'k-pot': { subject: 'hangul', module: 'magicPot', scene: 'witch', title: '마법의 솥', icon: '🧪', uKey: 'MagicPot', desc: '자음·모음 자판으로 재료 이름을 완성해 마법의 솥에 넣어요.' },
  'k-fruit': { subject: 'hangul', module: 'fruitCatch', scene: 'grove', title: '열매를 받아라', icon: '🧺', uKey: 'SpellBalls', desc: '나무에서 떨어지는 글자 열매를 바구니로 받아 낱말을 완성해요.' },
  'k-explain': { subject: 'hangul', module: 'explainToMe', scene: 'study', title: '설명해 주세요', icon: '🐱', uKey: 'ExplaintoMe', desc: '고양이의 설명을 읽고 무엇인지 맞히고, 내 낱말도 설명해 줘요.' },
  'k-hat': { subject: 'hangul', module: 'sillyHat', scene: 'meadow', title: '누가 누가 다를까', icon: '🎩', uKey: 'SillyHat', desc: '한 친구만 다른 소리를 내요. 찾아서 마법 모자를 씌워 줘요.' },
  'k-toy': { subject: 'hangul', module: 'toyFactory', scene: 'factory', title: '장난감 공장', icon: '🏭', uKey: 'ToyFactory', desc: '몬스터 친구의 말을 듣고 벨트 위 물건을 알맞은 상자에 담아요.' },
  'k-gquiz': { subject: 'hangul', module: 'wordQuizGalaxy', scene: 'space', title: '낱말 퀴즈 은하', icon: '🛸', uKey: 'WordChallenge', desc: '그림에 맞는 낱말을 골라 우주선을 날려요.' },
  'k-gsearch1': { subject: 'hangul', module: 'wordSearch', opts: { galaxy: 1 }, scene: 'space', title: '낱말 찾기 은하 1', icon: '🪐', uKey: 'WordSearchChallenge', desc: '주제와 글자 수만 보고 숨은 낱말을 찾아요.', minLevel: 2 },
  'k-gsearch2': { subject: 'hangul', module: 'wordSearch', opts: { galaxy: 2 }, scene: 'space', title: '낱말 찾기 은하 2', icon: '🌌', uKey: 'WordSearchChallenge2', desc: '더 큰 글자판에서 가로·세로로 숨은 낱말을 찾아요.', minLevel: 3 },
  'k-gletter': { subject: 'hangul', module: 'letterGalaxy', scene: 'space', title: '글자 고르기 은하', icon: '✉️', uKey: 'LetterTyperChallenge', desc: '문장을 듣고 빈칸 낱말을 글자 단추로 만들어요.', minLevel: 2 },
  'k-gtype1': { subject: 'hangul', module: 'typeGalaxy', opts: { mode: 'word' }, scene: 'space', title: '타자 연습 은하 1', icon: '⌨️', uKey: 'TypeTimeKoreanChallenge', desc: '카드의 글자와 낱말을 한글 자판으로 쳐요.', minLevel: 2 },
  'k-gtype2': { subject: 'hangul', module: 'typeGalaxy', opts: { mode: 'sentence' }, scene: 'space', title: '타자 연습 은하 2', icon: '📜', uKey: 'TypeTimeKoreanChallenge2', desc: '짧은 문장을 띄어쓰기까지 한글 자판으로 쳐요.', minLevel: 3 },
  'k-dog': { subject: 'hangul', module: 'dogPhonics', scene: 'yard', title: '강아지 먹이 주기', icon: '🐶', uKey: 'DogPhonics', desc: '두 강아지가 내는 소리를 듣고, 그 소리가 든 낱말 간식을 나눠 줘요.' },
  'k-talk': { subject: 'hangul', module: 'sayAfter', opts: { cast: 'koala' }, scene: 'grove', title: '말하는 코알라', icon: '🐨', uKey: 'TalkingRaccoon', desc: '코알라가 하는 말을 듣고 마이크에 대고 똑같이 따라 말해요.', mic: true },
  'k-petdict': { subject: 'hangul', module: 'sayAfter', opts: { cast: 'fox' }, scene: 'study', title: '여우의 받아쓰기', icon: '🦊', uKey: 'PetDictation', desc: '낱말 카드를 소리 내어 읽어 주면 여우가 수첩에 받아써요.', mic: true },
  'k-lightup': { subject: 'hangul', module: 'lightUp', scene: 'night', title: '전구 켜기', icon: '💡', uKey: 'LightUp', desc: '문장을 소리 내어 읽으면 읽은 낱말마다 전구에 불이 켜져요.', mic: true, minLevel: 2 },
  'k-readans': { subject: 'hangul', module: 'lightUp', opts: { passage: true }, scene: 'book', title: '읽고 답해요', icon: '📗', uKey: 'ReadingActivity', desc: '짧은 글을 또박또박 소리 내어 읽고 질문에 답해요.', mic: true, minLevel: 3 },
  'k-write': { subject: 'hangul', module: 'handWrite', opts: { mode: 'letter' }, scene: 'craft', title: '글자를 써보자', icon: '👕', uKey: 'SimpleWriting', desc: '글자를 바른 획순으로 쓰면 내 글씨가 옷에 무늬로 찍혀요.' },
  'k-dict': { subject: 'hangul', module: 'handWrite', opts: { mode: 'word' }, scene: 'notebook', title: '손글씨 낱말 카드', icon: '🖋️', uKey: 'WordDictation', desc: '낱말을 듣고 한 글자씩 바르게 써서 내 손글씨 낱말 카드를 만들어요.', minLevel: 2 },
  'k-hwtype': { subject: 'hangul', module: 'handWrite', opts: { mode: 'blank' }, scene: 'notebook', title: '듣고 손으로 쓰기', icon: '✍️', uKey: 'HandwritingTyper', desc: '문장을 듣고 빈칸에 들어갈 낱말을 손으로 써요.', minLevel: 3 },
  'k-clock': { subject: 'hangul', module: 'clockTrain', opts: { hangul: true }, scene: 'city', title: '시계 기차', icon: '⏰', uKey: 'TrainTime', desc: '"세 시 삼십 분"처럼 한글로 쓴 출발 시각을 읽고 시계를 맞추거나, 시계를 보고 알맞은 한글 시각을 골라요.', minLevel: 3 },
  // 확인 퀴즈는 오늘의 할 일 5번째 날에만 붙는다 (추가 학습 목록에는 없다)
  'k-check': { subject: 'hangul', module: 'checkTest', scene: 'space', title: '확인 퀴즈', icon: '📝', uKey: 'PlacementTest', desc: '최근 5차시에서 배운 글자 · 낱말 · 문장을 10문제로 확인해요.' },
  'k-quiz': { subject: 'hangul', module: 'quiz', scene: 'stage', title: '퀴즈의 시간', icon: '🦊', uKey: 'PetQuiz', desc: '무대 위 퀴즈를 풀어 우표를 모아요!' },

  'm-count': { subject: 'math', module: 'countWrite', scene: 'pond', title: '수 세기', icon: '🍎', uKey: 'Counting', desc: '과일을 하나씩 · 둘씩 · 다섯씩 · 열씩 세고, 숫자판을 넣거나 손으로 써서 답해요.' },
  'm-basic': { subject: 'math', module: 'enCount', scene: 'bath', title: '수 세기 기초', icon: '🔢', uKey: 'CountingMC', desc: '물건을 하나씩 눌러 세고, 맞는 숫자 카드를 골라요.' },
  'm-compare': { subject: 'math', module: 'compare', scene: 'pond', title: '식사 시간', icon: '🐊', uKey: 'FrogorHippo', desc: '양쪽 먹이나 수를 비교해 > = < 기호를 골라요.' },
  'm-shapes': { subject: 'math', module: 'shapePairs', scene: 'meadow', title: '도형 맞추기', icon: '🔷', uKey: 'ShapeMatching', desc: '겹쳐 쌓인 카드에서 모양이 같은 짝을 찾아 없애요.' },
  'm-trace': { subject: 'math', module: 'numberTrace', scene: 'night', title: '숫자 따라 쓰기', icon: '✏️', uKey: 'Tracing', desc: '수만큼 점을 보고, 숫자를 획순대로 따라 써요.' },
  'm-blocks': { subject: 'math', module: 'numberBlocks', scene: 'study', title: '자릿값 블록', icon: '🧱', uKey: 'NumberBlocks', desc: '자릿값 카드(90 · 4)를 겹쳐 놓아 수를 만들어요.', minLevel: 3 },
  'm-memory': { subject: 'math', module: 'memoryMatch', opts: { set: 'math' }, title: '수 카드 짝꿍', icon: '🃏', uKey: 'MemoryMatch', desc: '숫자와 점, 식과 답의 짝을 찾아요.' },
  'm-quick': { subject: 'math', module: 'quickMath', opts: { mode: 'add' }, scene: 'neon', title: '스피드 덧셈', icon: '⚡', uKey: 'QuickAdd', desc: '덧셈 판의 위에서부터 차례로 빠르게 답을 넣어요.' },
  'm-quicksub': { subject: 'math', module: 'quickMath', opts: { mode: 'sub' }, scene: 'neon', title: '스피드 뺄셈', icon: '⚡', uKey: 'QuickSub', desc: '뺄셈 판의 위에서부터 차례로 빠르게 답을 넣어요.', minLevel: 2 },
  'm-quickmul': { subject: 'math', module: 'quickMath', opts: { mode: 'mul' }, scene: 'neon', title: '스피드 곱셈', icon: '✖️', uKey: 'QuickMul', desc: '한 단씩 곱셈 판을 빠르게 풀어요.', minLevel: 4 },
  'm-bakery': { subject: 'math', module: 'bakery', scene: 'kitchen', title: '빵집 연산', icon: '🧁', uKey: 'BakeryMath', desc: '반죽 기계의 다이얼을 돌려 주문한 수만큼 쿠키를 구워요.', minLevel: 4 },
  'm-multidigit': { subject: 'math', module: 'multiDigit', scene: 'study', title: '여러 자리 수 연산', icon: '🧮', uKey: 'MultiDigitCalc', desc: '연습장에 세로셈을 풀어 보고 숫자판으로 답을 넣어요.', minLevel: 3 },
  'm-cookies': { subject: 'math', module: 'cookies', scene: 'kitchen', title: '쿠키', icon: '🍪', uKey: 'Cookies', desc: '고양이가 놓아 준 쿠키를 세어 덧셈 답을 넣어요.' },
  'm-fallblocks': { subject: 'math', module: 'blockMath', scene: 'neon', title: '블록 연산', icon: '🟩', uKey: 'FallingBlocks', desc: '내려오는 블록의 식을 10칸 판으로 보고 풀어요.', minLevel: 2 },
  'm-windows': { subject: 'math', module: 'wordWindows', scene: 'city', title: '몇 개일까요', icon: '🪟', uKey: 'WordWindows', desc: '창문에 적힌 글을 읽고 알맞은 수를 골라요.', minLevel: 2 },
  'm-balance': { subject: 'math', module: 'mathQuiz', opts: { kind: 'balance' }, scene: 'workshop', title: '양팔 저울 수식', icon: '⚖️', uKey: 'BalancingEquations', desc: '양팔 저울이 평평해지도록 알맞은 수 추를 골라요.', minLevel: 2 },
  'm-beads': { subject: 'math', module: 'beadString', scene: 'chalk', title: '곱셈 구슬', icon: '📿', uKey: 'BeadsPlay', desc: '실 끝을 끌어 한 단의 곱셈 구슬을 차례로 꿰어요.', minLevel: 4 },
  'm-graph2': { subject: 'math', module: 'graph', opts: { mode: 'mark' }, scene: 'notebook', title: '그래프 II', icon: '📊', uKey: 'DataMark', desc: '쪽지를 보고 그래프에 점을 찍은 뒤 질문에 답해요.' },
  'm-draw': { subject: 'math', module: 'drawShapes', scene: 'night', title: '도형 그리기', icon: '✏️', uKey: 'DrawShapes', desc: '점판에서 점을 이어 빠진 변을 그려 도형을 완성해요.' },
  'm-observe': { subject: 'math', module: 'observeShapes', scene: 'study', title: '사물 관찰하기', icon: '🔍', uKey: 'ObserveShapes', desc: '물건을 돌려 보며 상자 · 둥근 기둥 · 공 모양을 알아봐요.' },
  'm-graph1': { subject: 'math', module: 'graph', opts: { mode: 'sort' }, scene: 'notebook', title: '그래프 I', icon: '📈', uKey: 'DataSort', desc: '흩어진 물건을 그래프에 쌓고, 몇 개인지 답해요.' },
  'm-days': { subject: 'math', module: 'calendarPuzzle', scene: 'table', title: '달력과 요일', icon: '📅', uKey: 'DaysAndWeeks', desc: '요일 · 열두 달 · 날짜 조각을 달력에 끼워요.' },
  'm-placegrid': { subject: 'math', module: 'hundred', opts: { mode: 'grid' }, scene: 'notebook', title: '자릿값 격자', icon: '🔟', uKey: 'DoubleDigit', desc: '10칸 줄과 낱칸을 칠해 두 자리 수를 만들어요.', minLevel: 2 },
  'm-eggs': { subject: 'math', module: 'eggs', scene: 'kitchen', title: '달걀 묶음 판매', icon: '🥚', uKey: 'EggsForSale', desc: '손님이 말한 수만큼 달걀판에서 네모나게 골라 곱셈식을 만들어요.', minLevel: 3 },
  'm-equation': { subject: 'math', module: 'equation', opts: { mode: 'eq' }, scene: 'chalk', title: '수식 완성하기', icon: '🟰', uKey: 'EquationMaker', desc: '숫자 · 기호 타일로 맞는 등식을 만들어요.', minLevel: 2 },
  'm-falling': { subject: 'math', module: 'fallingShapes', scene: 'night', title: '떨어지는 도형', icon: '🔷', uKey: 'FallingShapes', desc: '쌓인 도형 중 말한 도형을 모두 찾아 눌러요. 위의 도형이 떨어져요.' },
  'm-ferris': { subject: 'math', module: 'ferrisWheel', scene: 'city', title: '관람차', icon: '🎡', uKey: 'FerrisWheel', desc: '수가 적힌 관람차 칸을 시계처럼 차례대로 매달아요. 1씩, 5씩 세어요.' },
  'm-domino': { subject: 'math', module: 'mathQuiz', opts: { kind: 'domino' }, scene: 'wood', title: '도미노 산수', icon: '🁫', uKey: 'FindNMake', desc: '점의 수로 도미노를 찾고, 양쪽 점을 덧셈으로 바꿔요.' },
  'm-fish': { subject: 'math', module: 'fishTank', scene: 'pond', title: '어항 물고기 세기', icon: '🐠', uKey: 'FishTank', desc: '물고기를 어항에 나눠 담거나 그물로 건지고 식을 완성해요.' },
  'm-frog': { subject: 'math', module: 'frogPond', scene: 'pond', title: '개구리 수직선 점프', icon: '🐸', uKey: 'FroggyHop', desc: '곱셈의 답이 적힌 연잎으로 개구리를 뛰게 해 연못을 건너요.', minLevel: 4 },
  'm-hpuzzle': { subject: 'math', module: 'hundred', opts: { mode: 'puzzle' }, scene: 'wood', title: '백 칸 퍼즐', icon: '💯', uKey: 'HundredPuzzle', desc: '여러 칸짜리 숫자 조각을 100판의 빈자리에 끼워요.' },
  'm-hquiz': { subject: 'math', module: 'hundred', opts: { mode: 'quiz' }, scene: 'notebook', title: '백 칸 퀴즈', icon: '🔢', uKey: 'HundredsBoard', desc: '100판에서 수를 찾고, 1 · 10 큰 수와 작은 수도 찾아요.' },
  'm-caterpillar': { subject: 'math', module: 'fruitDrop', scene: 'grove', title: '배고픈 애벌레', icon: '🐛', uKey: 'HungryCaterpillar', desc: '과일이 쿵! 뒤죽박죽이 된 애벌레 몸통을 수 차례대로 맞춰요.' },
  'm-line': { subject: 'math', module: 'lineMatch', opts: { mode: 'math' }, scene: 'wood', title: '짝 연결하기', icon: '🔗', uKey: 'LineMatching', desc: '색깔 · 개수 · 모양이 같은 것끼리 선으로 이어요.' },
  'm-farm': { subject: 'math', module: 'barnCount', scene: 'yard', title: '작은 농장', icon: '🐑', uKey: 'LittleFarm', desc: '양이 헛간에 들어가고 나오는 것을 보고, 헛간에 몇 마리 있는지 골라요.' },
  'm-mango': { subject: 'math', module: 'fruitShop', scene: 'kitchen', title: '과일 가게 덧셈', icon: '🍓', uKey: 'MangoShop', desc: '상자의 과일을 옮겨 10을 만들고 덧셈 · 뺄셈 답을 넣어요.', minLevel: 2 },
  'm-same': { subject: 'math', module: 'memoryMatch', opts: { set: 'same' }, scene: 'meadow', title: '짝 맞추기', icon: '🃏', uKey: 'MatchGame', desc: '카드를 잘 봐 두었다가 같은 카드 두 장을 찾아요.' },
  'm-kicker': { subject: 'math', module: 'mathQuiz', opts: { kind: 'kick' }, scene: 'field', title: '수학 축구', icon: '⚽', uKey: 'MathKicker', desc: '연산의 정답 공을 골라 골을 넣어요.' },
  'm-matrix': { subject: 'math', module: 'matrix', opts: { kind: 'math' }, scene: 'wood', title: '매트릭스', icon: '🧮', uKey: 'Matrix', desc: '수와 물건이 만나는 칸에, 그 물건에 점이 수만큼 있는 조각을 끼워요.' },
  'm-change': { subject: 'math', module: 'coinSum', scene: 'kitchen', title: '동전의 분류와 합', icon: '🪙', uKey: 'MoneyGameKR', desc: '쟁반에 적힌 금액이 되도록 동전을 골라 모아요.', minLevel: 3 },
  'm-gugu': { subject: 'math', module: 'mulPuzzle', scene: 'wood', title: '구구단 마스터', icon: '✖️', uKey: 'MultiplicationTable', desc: '단 막대를 알맞은 줄에 끼워 곱셈표를 완성해요.', minLevel: 4 },
  'm-light': { subject: 'math', module: 'lineLight', scene: 'night', title: '수직선 불 켜기', icon: '💡', uKey: 'NumberLine', desc: '블록 줄을 수직선에 이어 붙여 식의 답에 불을 켜요.' },
  'm-digits': { subject: 'math', module: 'equation', opts: { mode: 'digits' }, scene: 'workshop', title: '숫자 조합기', icon: '🎛️', uKey: 'NumberLineUp', desc: '숫자 카드를 자리 칸에 넣어 목표 수를 만들어요.', minLevel: 2 },
  'm-numpuz': { subject: 'math', module: 'numberPuzzle', scene: 'forestfloor', title: '숫자 퍼즐', icon: '🔟', uKey: 'NumberPuzzle', desc: '나무판의 숫자 모양 홈에 숫자 조각을 차례로 끼워요.' },
  'm-facts': { subject: 'math', module: 'quickMath', opts: { mode: 'facts' }, scene: 'neon', title: '스피드 수 연산', icon: '⚡', uKey: 'QuickFacts', desc: '같은 수에서 더하고 빼기, 10 만들기를 빠르게 해요.' },
  'm-div': { subject: 'math', module: 'quickMath', opts: { mode: 'div' }, scene: 'neon', title: '스피드 나눗셈', icon: '➗', uKey: 'QuickDiv', desc: '나눗셈 판의 위에서부터 차례로 빠르게 몫을 넣어요.', minLevel: 4 },
  'm-rocket': { subject: 'math', module: 'rocketFuel', scene: 'space', title: '로켓 발사', icon: '🚀', uKey: 'RocketLaunch', desc: '10 묶음과 낱개 연료를 수만큼 넣어 로켓을 발사해요.' },
  'm-circus': { subject: 'math', module: 'numberTrain', scene: 'meadow', title: '숫자 열차', icon: '🚂', uKey: 'CircusTrain', desc: '가장 큰 수 · 가장 작은 수를 찾고, 수를 크기 차례대로 열차에 실어요.', minLevel: 2 },
  'm-missing': { subject: 'math', module: 'skipCount', scene: 'field', title: '빠진 숫자 찾기', icon: '🥚', uKey: 'MissingNumber', desc: '뛰어 세는 수를 보고 빈 알에 들어갈 수를 붙여요.', minLevel: 2 },
  'm-rulercount': { subject: 'math', module: 'unitMeasure', scene: 'study', title: '길이 재기 I', icon: '📎', uKey: 'RulerCount', desc: '동전과 클립을 거듭 놓아 물건의 길이를 재요.' },
  'm-ruler': { subject: 'math', module: 'ruler', scene: 'study', title: '길이 재기 II', icon: '📐', uKey: 'RulerMeasure', desc: '자 위에 놓인 물건이 몇 cm인지 읽어요.', minLevel: 2 },
  'm-shapetrace': { subject: 'math', module: 'trace', opts: { set: 'shapesKo' }, scene: 'beach', title: '도형 따라 그리기', icon: '🔺', uKey: 'ShapeTracing', desc: '원 · 마름모 · 타원 · 육각형을 한 번에 따라 그려요.' },
  'm-add1': { subject: 'math', module: 'partialSum', scene: 'notebook', title: '받아올림 없는 세로셈 덧셈', icon: '➕', uKey: 'StackedAddition1', desc: '자리마다 따로 더한 값을 적고, 그 값들을 모두 더해 답을 내요.', minLevel: 3 },
  'm-add2': { subject: 'math', module: 'stacked', opts: { mode: 'add2' }, scene: 'notebook', title: '받아올림 있는 세로셈 덧셈', icon: '➕', uKey: 'StackedAddition2', desc: '일의 자리에서 10이 넘으면 1을 올려요.', minLevel: 3 },
  'm-sub1': { subject: 'math', module: 'stacked', opts: { mode: 'sub1' }, scene: 'notebook', title: '받아내림 없는 세로셈 뺄셈', icon: '➖', uKey: 'StackedSubtraction1', desc: '자리를 맞춰 일의 자리부터 빼요.', minLevel: 2 },
  'm-sub2': { subject: 'math', module: 'stacked', opts: { mode: 'sub2' }, scene: 'notebook', title: '받아내림 있는 세로셈 뺄셈', icon: '➖', uKey: 'StackedSubtraction2', desc: '뺄 수 없으면 윗자리에서 10을 빌려 와요.', minLevel: 3 },
  'm-tally': { subject: 'math', module: 'tallyBlocks', opts: { mode: 'make' }, scene: 'night', title: '탈리', icon: '🟨', uKey: 'Tallies', desc: '탈리를 줄 위로 올리고 내리며 동그라미 속 수를 만들어요.' },
  'm-tallylab': { subject: 'math', module: 'tallyBlocks', opts: { mode: 'lab' }, scene: 'night', title: '탈리 연구실', icon: '⚗️', uKey: 'TalliesLab', desc: '탈리 묶음을 플라스크에 넣어 목에 적힌 수를 만들어요.' },
  'm-tallycatch': { subject: 'math', module: 'tallyCatch', scene: 'night', title: '탈리를 잡아라', icon: '🎯', uKey: 'TallyCatch', desc: '수직선에 숨은 탈리의 자리를 겨냥해 도토리를 쏘아요.' },
  'm-clock': { subject: 'math', module: 'clockCards', scene: 'city', title: '시계 기차', icon: '⏰', uKey: 'TrainTime', desc: '기관차의 시계를 읽고 숫자 카드를 끼워 기차를 출발시켜요.', minLevel: 2 },
  'm-grocery': { subject: 'math', module: 'grocery', opts: { mode: 'math' }, scene: 'kitchen', title: '동물 마트', icon: '🛒', uKey: 'WordGrocery', desc: '"마실 것을 모두 찾아 주세요." 손님이 말한 종류의 물건을 모두 찾아 담아요.' },
  'm-wordeq': { subject: 'math', module: 'equation', opts: { mode: 'word' }, scene: 'notebook', title: '문장제 수식 변환', icon: '📝', uKey: 'WordToEquation', desc: '이야기를 읽고 카드를 늘어놓아 알맞은 식을 만들어요.', minLevel: 2 },
  'm-drink': { subject: 'math', module: 'fraction', opts: { mode: 'drink' }, scene: 'kitchen', title: '음료수 분수', icon: '🧃', uKey: 'FractionDrinks', desc: '단추를 누르고 있다가 떼어 컵에 주스를 분수만큼 채워요.', minLevel: 4 },
  'm-pizza': { subject: 'math', module: 'fraction', opts: { mode: 'pizza' }, scene: 'kitchen', title: '피자 조각 분수', icon: '🍕', uKey: 'FractionPizza', desc: '피자를 손가락으로 그어 똑같이 자르고 분수만큼 쟁반에 담아요.', minLevel: 4 },
  'm-tallydiv': { subject: 'math', module: 'shareDivide', opts: { mode: 'scale' }, scene: 'kitchen', title: '탈리 묶음 나눗셈', icon: '⚖️', uKey: 'TallyDivision', desc: '탈리를 저울 위에 똑같이 나눠 올리고 몫을 넣어요.', minLevel: 4 },
  'm-jellydiv': { subject: 'math', module: 'shareDivide', opts: { mode: 'jelly' }, scene: 'kitchen', title: '젤리 블록 나눗셈', icon: '🐻', uKey: 'BlockDivision', desc: '젤리곰을 몇 개씩 골라 봉지에 담고 봉지 수를 답해요.', minLevel: 4 },
  'm-create': { subject: 'math', module: 'tangram', opts: { mode: 'create' }, scene: 'craft', title: '도형 조합 만들기', icon: '🔶', uKey: 'CreateShapes', desc: '작은 도형을 돌려 붙여 큰 도형을 만들어요.' },
  'm-tutor': { subject: 'math', module: 'trace', opts: { set: 'lines' }, scene: 'beach', title: '선 긋기 튜토리얼', icon: '〰️', uKey: 'TutorialTrace', desc: '곧은 선 · 곡선 · 지그재그를 따라 그려요.' },
  'm-classify': { subject: 'math', module: 'sortRockets', opts: { mode: 'shape' }, scene: 'space', title: '속성별 분류', icon: '🗂️', uKey: 'Classification', desc: '색 · 모양 · 크기 조건에 맞는 도형만 골라 실어요.' },
  'm-sea': { subject: 'math', module: 'seaFriends', scene: 'pond', title: '바닷속 친구들', icon: '🐬', uKey: 'UnderWater', desc: '동그라미 친 친구를 기억했다가, 헤엄쳐 오는 친구 중 그 친구만 눌러요.' },
  'm-cuckoo': { subject: 'math', module: 'cuckooClock', scene: 'yard', title: '뻐꾸기 시계', icon: '🐦', uKey: 'Cuckoo', desc: '가운데 수를 기억해서 시계 둘레의 그 수 자리를 눌러요.', minLevel: 2 },
  'm-tangram': { subject: 'math', module: 'tangram', opts: { mode: 'tangram' }, scene: 'craft', title: '칠교놀이', icon: '🧩', uKey: 'Tangram', desc: '조각을 돌려 붙여 집 · 배 · 로켓 모양을 완성해요.', minLevel: 2 },
  'm-decal': { subject: 'math', module: 'symmetry', scene: 'craft', title: '데칼코마니', icon: '🦋', uKey: 'Decalcomanie', desc: '접는 선을 기준으로 반대쪽을 똑같이 칠해요.', minLevel: 2 },
  'm-cubes': { subject: 'math', module: 'cubeCount', scene: 'wood', title: '쌓기나무 세기 1', icon: '🧊', uKey: 'CubeCount', desc: '쌓기나무를 돌려 보며 숨은 것까지 세어요.', minLevel: 2 },
  'm-cubes2': { subject: 'math', module: 'cubeCount', opts: { big: true }, scene: 'wood', title: '쌓기나무 세기 심화', icon: '🧊', uKey: 'CubeCountRemake', desc: '더 많이 쌓인 쌓기나무를 돌려 보며 세어요.', minLevel: 3 },
  'm-sudoku': { subject: 'math', module: 'sudoku', scene: 'notebook', title: '스도쿠', icon: '🔢', uKey: 'Sudoku', desc: '줄과 상자에 같은 수가 겹치지 않게 숫자 조각을 끼워요.', minLevel: 2 },
  'm-origami': { subject: 'math', module: 'paperCut', scene: 'craft', title: '종이 접어 자르기', icon: '✂️', uKey: 'Origami', desc: '종이를 접어 가위로 오린 뒤 펼쳐서 대칭 모양을 봐요.', minLevel: 3 },
  'm-path': { subject: 'math', module: 'trackPath', scene: 'beach', title: '경로 완성하기', icon: '🛤️', uKey: 'TrackPath', desc: '기찻길 조각을 돌려 기차가 역까지 갈 길을 이어요.', minLevel: 2 },
  'm-studyas': { subject: 'math', module: 'studyLab', opts: { mode: 'addsub' }, scene: 'study', title: '덧뺄셈 스터디 랩', icon: '📘', uKey: 'StudyGameAddSub', desc: '개념 카드로 세 수의 덧셈 · 뺄셈을 익히고 문제를 풀어요.', minLevel: 4 },
  'm-studydiv': { subject: 'math', module: 'studyLab', opts: { mode: 'div' }, scene: 'study', title: '나눗셈 스터디 랩', icon: '📗', uKey: 'StudyGameDivision', desc: '개념 카드로 나눗셈을 익히고 몫을 구해요.', minLevel: 4 },
  'm-studyshape': { subject: 'math', module: 'studyLab', opts: { mode: 'shapes' }, scene: 'study', title: '도형 스터디 랩', icon: '📙', uKey: 'StudyGameShapes', desc: '입체도형의 면 · 모서리 · 꼭짓점을 익히고 세어요.', minLevel: 4 },
  'm-gridlock': { subject: 'math', module: 'gridLock', scene: 'workshop', title: '탈출하기', icon: '🚕', uKey: 'GridLock', desc: '길을 막은 차를 앞뒤로 옮겨 노란 택시를 빼내요.', minLevel: 3 },
  'm-icecream': { subject: 'math', module: 'iceCream', scene: 'beach', title: '아이스크림 옮기기', icon: '🍦', uKey: 'IceCream', desc: '맨 위 스쿱을 옮겨 작게 보이는 아이스크림과 똑같이 만들어요.' },
  'm-flowers': { subject: 'math', module: 'flowerOrder', scene: 'yard', title: '순서 기억하기', icon: '🌸', uKey: 'Flowers', desc: '꽃이 피는 차례를 기억했다가 같은 차례로 눌러요.' },
  'm-gugumaster': { subject: 'math', module: 'guguMaster', scene: 'study', title: '곱셈구구 마스터', icon: '📒', uKey: 'MultiplicationMaster', desc: '연습할 단을 골라 공책에 나온 곱셈 10문제를 숫자판으로 풀어요.', minLevel: 4 },
  'm-aias': { subject: 'math', module: 'mathPractice', opts: { topic: 'addsub' }, scene: 'study', title: '맞춤 연습문제 (덧셈 · 뺄셈)', icon: '📝', uKey: 'AIPractice', desc: '틀렸던 셈을 섞어 만든 덧셈 · 뺄셈 10문제를 연습장에 풀어 봐요.' },
  'm-aimul': { subject: 'math', module: 'mathPractice', opts: { topic: 'mul' }, scene: 'study', title: '맞춤 연습문제 (곱셈)', icon: '📝', uKey: 'AIPractice', desc: '틀렸던 곱셈을 섞어 만든 10문제를 풀어요.', minLevel: 4 },
  'm-aidiv': { subject: 'math', module: 'mathPractice', opts: { topic: 'div' }, scene: 'study', title: '맞춤 연습문제 (나눗셈)', icon: '📝', uKey: 'AIPractice', desc: '틀렸던 나눗셈을 섞어 만든 10문제를 풀어요.', minLevel: 4 },
  'm-pattern': { subject: 'math', module: 'patterns', opts: { mode: 'table' }, scene: 'kitchen', title: '규칙 찾기', icon: '🥪', uKey: 'Patterns', desc: '식탁 위 음식이 놓인 규칙을 찾아 물음표 자리를 채워요.' },

  'e-abc': { subject: 'english', module: 'alphabetPuzzle', scene: 'forestfloor', title: '알파벳 퍼즐', icon: '🔠', uKey: 'AlphabetPuzzle', desc: '나무 알파벳 판의 빈 자리에 꼭 맞는 글자 조각을 끼워요.' },
  'e-easy': { subject: 'english', module: 'easyPuzzle', scene: 'pond', title: '그림 조각 맞추기', icon: '🧩', uKey: 'EasyPuzzle', desc: '그림 조각을 그림자 자리에 맞추면 영어 단어가 나타나요.' },
  'e-color': { subject: 'english', module: 'coloringMonster', scene: 'craft', title: '몬스터 색칠공부', icon: '🖍️', uKey: 'ColoringMonster', desc: '몬스터가 말하는 색 크레파스로 몬스터를 칠해 줘요.' },
  'e-dog': { subject: 'english', module: 'dogPhonics', scene: 'yard', title: '강아지 파닉스', icon: '🐶', uKey: 'DogPhonics', desc: '두 강아지가 짖는 소리를 듣고, 그 소리가 든 단어 뼈다귀를 나눠 줘요.' },
  'e-flash': { subject: 'english', module: 'enFlashCard', scene: 'table', title: '플래시 카드', icon: '🗂️', uKey: 'FlashCard', desc: '토리가 보여 주는 단어 카드를 익히고, 듣고 읽어서 다시 찾아요.' },
  'e-ispy': { subject: 'english', module: 'iSpy', scene: 'book', title: '나를 찾아줘', icon: '🔎', uKey: 'ISpy', desc: '소리를 듣고 그림책 속에 숨은 알파벳을 찾아 붙여요.' },
  'e-listen': { subject: 'english', module: 'starSound', scene: 'night', title: '별자리 맞히기', icon: '🌟', uKey: 'ListenNMatch', desc: '어떤 별자리를 말하는지 듣고, 그 알파벳이나 단어가 반짝이는 별자리를 찾아요.' },
  'e-hat': { subject: 'english', module: 'sillyHat', scene: 'meadow', title: '엉뚱한 모자', icon: '🎩', uKey: 'SillyHat', desc: '한 친구만 다른 소리를 내요. 찾아서 엉뚱한 모자를 씌워 줘요.' },
  'e-toy': { subject: 'english', module: 'toyFactory', scene: 'factory', title: '장난감 공장', icon: '🏭', uKey: 'ToyFactory', desc: '몬스터 친구의 영어 주문을 듣고 벨트 위 물건을 상자에 담아요.' },
  'e-wash': { subject: 'english', module: 'washLetters', scene: 'bath', title: '목욕시간', icon: '🛁', uKey: 'WashingAlphabet', desc: '더러워진 알파벳을 씻겨 주고 글자가 내는 소리를 들어요.' },
  'e-talk': { subject: 'english', module: 'sayAfter', opts: { cast: 'raccoon' }, scene: 'forestfloor', title: '말하는 너구리', icon: '🦝', uKey: 'TalkingRaccoon', desc: '너구리가 하는 영어를 듣고 마이크에 대고 따라 말해요.', mic: true },
  'e-bird': { subject: 'english', module: 'sayAfter', opts: { cast: 'bird' }, scene: 'meadow', title: '따라서 읽어보기', icon: '🐦', uKey: 'ReadingBird', desc: '새가 보여 주는 단어를 큰 소리로 읽어요.', mic: true },
  'e-sayho': { subject: 'english', module: 'sayHo', scene: 'stage', title: '따라 말하기', icon: '🎤', uKey: 'SayHo', desc: '무대 위 가수가 외치는 말을 크게 따라 외쳐요.', mic: true },
  'e-paint': { subject: 'english', module: 'paintWord', scene: 'craft', title: '단어 그리기', icon: '🎨', uKey: 'PainttheWord', desc: '그리고 싶은 것을 영어로 말하면 붓이 도화지에 그려 줘요.', mic: true },
  'e-petdict': { subject: 'english', module: 'sayAfter', opts: { cast: 'pet' }, scene: 'chalk', title: '받아쓰기', icon: '🦊', uKey: 'PetDictation', desc: '단어 카드를 소리 내어 읽어 주면 여우가 칠판에 받아써요.', mic: true, minLevel: 2 },
  'e-alien': { subject: 'english', module: 'alienChat', scene: 'space', title: '외계인 챗', icon: '👽', uKey: 'AlienChat', desc: '지구로 이사 온 외계인 친구와 영어로 화상 통화를 해요.', mic: true, minLevel: 2 },
  'e-count': { subject: 'english', module: 'enCount', scene: 'bath', title: '수 세기 기초', icon: '🔢', uKey: 'BasicCounting', desc: '물건을 하나씩 눌러 영어로 세고, 맞는 숫자 카드를 골라요.' },
  'e-days': { subject: 'english', module: 'calendarPuzzle', scene: 'table', title: '달력 퍼즐', icon: '📅', uKey: 'DaysandWeeks', desc: '요일 · 달 · 날짜 조각을 제자리에 끼워 한 주, 한 해, 한 달을 완성해요.' },
  'e-matrix': { subject: 'english', module: 'matrix', scene: 'wood', title: '퍼즐 매트릭스', icon: '🧮', uKey: 'Matrix', desc: '가로줄과 세로줄이 만나는 칸에 둘을 모두 닮은 조각을 끼워요.' },
  'e-numpuz': { subject: 'english', module: 'numberPuzzle', scene: 'forestfloor', title: '숫자 퍼즐', icon: '🔟', uKey: 'NumberPuzzle', desc: '나무판의 숫자 홈에 숫자 조각을 끼우며 영어 이름을 들어요.' },
  'e-numtrace': { subject: 'english', module: 'numberTrace', scene: 'night', title: '숫자 따라쓰기', icon: '✏️', uKey: 'NumberTracing', desc: '수만큼 점을 보고, 숫자를 획순대로 따라 쓰며 영어로 읽어요.' },
  // 챌린지(주간 평가): 그 차시 내용으로 5문제, 문제마다 한 번만 고른다
  'e-wchal': { subject: 'english', module: 'enChallenge', opts: { kind: 'word' }, title: '워드 챌린지', icon: '🏕️', uKey: 'WordChallenge', desc: '단어를 읽거나 듣고 알맞은 그림을 골라요. 5문제 챌린지!' },
  'e-pchal': { subject: 'english', module: 'enChallenge', opts: { kind: 'phonics' }, title: '파닉스 챌린지', icon: '🏛️', uKey: 'PhonicsChallenge', desc: '그림과 소리를 듣고 빈칸(_ad)에 들어갈 글자를 골라요. 5문제 챌린지!' },
  'e-lchal': { subject: 'english', module: 'enChallenge', opts: { kind: 'listening' }, title: '리스닝 챌린지', icon: '🎧', uKey: 'ListeningChallenge', desc: '문장을 듣고 알맞은 그림을 골라요. 5문제 챌린지!' },
  'e-gchal': { subject: 'english', module: 'enChallenge', opts: { kind: 'grammar' }, title: '그래머 챌린지', icon: '🚩', uKey: 'GrammarChallenge', desc: 'a cat · two cats · a big dog처럼 말에 꼭 맞는 그림을 골라요. 5문제 챌린지!' },
  'e-starfall': { subject: 'english', module: 'starFall', title: '떨어지는 별 받기', icon: '🌠', uKey: 'StarFall', desc: '밤하늘에서 글자 · 단어 별이 떨어져요. 땅에 닿기 전에 맞는 글자나 그림을 눌러 별을 받아요.' },
  'e-call': { subject: 'english', module: 'messenger', scene: 'space', title: '메신저', icon: '📞', uKey: 'CallwithFriends', desc: '따르르릉! 걸려 온 영상 전화를 받고, 친구의 말에 알맞은 대답을 골라 영어로 말해요.', mic: true },
  'e-tower': { subject: 'english', module: 'towerDrop', scene: 'beach', title: '낙하탑 낱말 맞히기', icon: '🗼', uKey: 'TowerDrop', desc: '글자를 골라 단어를 완성해 다람쥐를 탑 위에 지켜요. 틀리면 사탕과 탑 막대가 하나씩 사라지고, 사탕을 다 쓰면 게임 오버!' },
  'e-quiz': { subject: 'english', module: 'enChallenge', opts: { kind: 'pet' }, title: '펫 퀴즈', icon: '🐶', uKey: 'PetQuiz', desc: '오늘 낱말을 카드로 익힌 다음, 강아지와 12문제 퀴즈! 듣고 그림 · 듣고 낱말 · 읽고 그림을 골라요.' },
  'e-strain': { subject: 'english', module: 'soundTrain', scene: 'meadow', title: '소리 기차', icon: '🚂', uKey: 'SoundTrain', desc: '원숭이 기관사가 말하는 단어를 듣고 글자 상자를 순서대로 객차에 실어요.' },
  'e-kicker': { subject: 'english', module: 'wordKicker', scene: 'field', title: '단어 축구', icon: '⚽', uKey: 'WordKicker', desc: '새 친구의 말을 듣고 빈칸에 알맞은 단어(a/an, is/are…)를 골라 골을 넣어요.' },
  'e-machine': { subject: 'english', module: 'wordMachine', scene: 'notebook', title: '단어 맞히기', icon: '🎰', uKey: 'WordMachine', desc: '단추를 누르면 글자 통이 돌아 단어가 나와요. 읽고 맞는 그림을 골라요.' },
  'e-wmatrix': { subject: 'english', module: 'matrix', opts: { kind: 'word' }, scene: 'wood', title: '단어 매트릭스', icon: '🔡', uKey: 'WordMatrix', desc: '첫소리와 끝소리가 만나는 칸에 두 조각을 이은 단어를 끼워요.' },
  'e-space': { subject: 'english', module: 'spaceRepair', scene: 'space', title: '우주 정비소', icon: '🛸', uKey: 'SpaceRepairShop', desc: '고장 난 우주선 화면의 그림에 맞는 단어 부품을 끌어 올려 고쳐 줘요.' },
  'e-jelly': { subject: 'english', module: 'jellyAffix', scene: 'pond', title: '젤리 붙이기', icon: '🍬', uKey: 'JellyAffix', desc: '단어 젤리 끝에 -s, -es, -en 같은 젤리를 붙여 문장을 완성해요.', minLevel: 2 },
  'e-pattern': { subject: 'english', module: 'patterns', scene: 'meadow', title: '패턴 기차', icon: '🚃', uKey: 'PatternTrain', desc: '패턴 기차의 규칙을 찾아요. 숫자 기차는 영어로 세어요.' },
  'e-shapes': { subject: 'english', module: 'shapes', scene: 'craft', title: '도형 맞추기', icon: '🔷', uKey: 'ShapeMatching', desc: '영어로 도형 이름을 듣고 알맞은 도형을 찾아요.' },
  'e-shapetrace': { subject: 'english', module: 'trace', opts: { set: 'shapes' }, scene: 'beach', title: '도형 따라그리기', icon: '🔺', uKey: 'ShapeTracing', desc: '도형을 한 번에 따라 그리며 영어 이름을 들어요.' },
  'e-clock': { subject: 'english', module: 'clockTrain', scene: 'city', title: '시계 기차', icon: '⏰', uKey: 'TrainTime', desc: '기차 출발 시각을 보고 시계바늘을 돌려 맞춰요. 시각을 영어로 읽어요.', minLevel: 2 },
  'e-phonics': { subject: 'english', module: 'phonics', title: '보석 캐기', icon: '💎', uKey: 'JewelMiner', desc: '첫소리·끝소리를 듣고 글자 보석을 캐요.' },
  'e-memory': { subject: 'english', module: 'memoryMatch', opts: { set: 'english' }, title: '짝꿍 찾기', icon: '🃏', uKey: 'MemoryMatch', desc: '대문자·소문자, 단어와 그림의 짝을 찾아요.' },
  'e-missing': { subject: 'english', module: 'missingLetter', title: '빠진 알파벳 찾기', icon: '🔤', uKey: 'MissingLetter', desc: '알파벳 순서에서 빠진 글자를 찾아요.' },
  'e-trace': { subject: 'english', module: 'trace', opts: { set: 'alpha' }, title: '알파벳 쓰기', icon: '✍️', uKey: 'LetterTrace', desc: '알파벳을 따라 써요.' },
  'e-spell': { subject: 'english', module: 'spelling', title: '스펠링 거품', icon: '🫧', uKey: 'Spelling', desc: '알파벳 거품을 순서대로 눌러 단어를 만들어요.', minLevel: 2 },
  'e-what': { subject: 'english', module: 'whatIsThis', title: '무엇일까요?', icon: '🖼️', uKey: 'WhatIsThis', desc: '그림과 단어를 짝지어요.' },
  'e-book': { subject: 'english', module: 'readAlong', title: '오디오 픽처북', icon: '📖', uKey: 'ReadAlongBook', desc: '그림책을 들으며 함께 읽어요.' },
  'e-story': { subject: 'english', module: 'readAlong', opts: { mode: 'quiz' }, scene: 'book', title: '이야기 독해', icon: '🧠', uKey: 'StoryQuiz', desc: '그림책을 읽고 장면을 순서대로 놓거나 이야기 질문에 답해요.' },
};

// 자유 활동: 학습 과목 · 일일 수업과 따로 있는 놀이. 보상 없이 작품을 앨범에 모은다
export const FREE_ACTS = {
  'f-paint': { module: 'painting', title: '자유 그리기', icon: '🎨', uKey: 'Painting', desc: '도화지에 붓과 스탬프로 마음대로 그려요.' },
  'f-color': { module: 'coloring', title: '색칠하기', icon: '🖍️', uKey: 'Coloring', desc: '밑그림을 골라 예쁘게 색칠해요.' },
  'f-word': { module: 'writing', opts: { mode: 'word' }, title: '낱말 쓰기 연습', icon: '✏️', uKey: 'WritingPractice', desc: '쓰고 싶은 낱말을 골라 원고지에 따라 써요.' },
  'f-sentence': { module: 'writing', opts: { mode: 'sentence' }, title: '문장 쓰기 연습', icon: '📝', uKey: 'SentenceWritingPractice', desc: '쓰고 싶은 문장을 골라 원고지에 따라 써요.' },
  'f-letter': { module: 'letterColor', title: '글자 색칠하기', icon: '🔤', uKey: 'ColoringLetters', desc: '커다란 글자를 골라 글자 안을 색칠해요.' },
  'f-card': { module: 'card', title: '카드 쓰기', icon: '💌', uKey: 'WritingCards', desc: '가족이나 친구에게 마음을 담은 카드를 써요.' },
};
export const STICKERS = ['🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦄', '🐙', '🦋', '🐳', '🦉', '🐧', '🐢', '🦔', '🦩', '🐞', '🐝', '🦕', '🐬', '🦜', '🐹'];

export const TREE = [
  { e: '🌰', label: '씨앗이 쿨쿨 자고 있어요' },
  { e: '🌱', label: '새싹이 돋았어요!' },
  { e: '🌿', label: '쑥쑥 자라고 있어요!' },
  { e: '🌳', label: '큰 도토리나무가 되었어요!' },
];

/* ---------- 한글 자모 ---------- */
export const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const CHO_SOUND = { ㄱ: '그', ㄴ: '느', ㄷ: '드', ㄹ: '르', ㅁ: '므', ㅂ: '브', ㅅ: '스', ㅇ: '으', ㅈ: '즈', ㅊ: '츠', ㅋ: '크', ㅌ: '트', ㅍ: '프', ㅎ: '흐' };
export const JUNG_SOUND = { ㅏ: '아', ㅑ: '야', ㅓ: '어', ㅕ: '여', ㅗ: '오', ㅛ: '요', ㅜ: '우', ㅠ: '유', ㅡ: '으', ㅣ: '이' };
export const JONG_SOUND = { ㄱ: '윽', ㄴ: '은', ㄹ: '을', ㅁ: '음', ㅂ: '읍', ㅅ: '읏', ㅇ: '응' };
export const JAMO_NAME = {
  ㄱ: '기역', ㄴ: '니은', ㄷ: '디귿', ㄹ: '리을', ㅁ: '미음', ㅂ: '비읍', ㅅ: '시옷',
  ㅇ: '이응', ㅈ: '지읒', ㅊ: '치읓', ㅋ: '키읔', ㅌ: '티읕', ㅍ: '피읖', ㅎ: '히읗', ...JUNG_SOUND,
  ㄲ: '쌍기역', ㄸ: '쌍디귿', ㅃ: '쌍비읍', ㅆ: '쌍시옷', ㅉ: '쌍지읒',
  ㅐ: '애', ㅔ: '에', ㅚ: '외', ㅟ: '위', ㅘ: '와', ㅝ: '워', ㅢ: '의',
  ㅒ: '얘', ㅖ: '예', ㅙ: '왜', ㅞ: '웨',
};

const idx = (list, v) => (typeof v === 'string' ? list.indexOf(v) : v);
export const compose = (c, j, t = 0) => String.fromCharCode(0xac00 + (idx(CHO, c) * 21 + idx(JUNG, j)) * 28 + idx(JONG, t));
export function decompose(s) {
  const i = s.charCodeAt(0) - 0xac00;
  if (i < 0 || i > 11171) return null;
  return { c: Math.floor(i / 588), j: Math.floor((i % 588) / 28), t: i % 28 };
}
export const hasBatchim = (s) => {
  const d = decompose(s.slice(-1));
  return Boolean(d && d.t);
};
export const objJosa = (s) => (hasBatchim(s) ? '을' : '를');

// 모음이 비슷한 함정 보기(고/구/거)와 자음이 비슷한 보기를 번갈아 제공
export function similarSyllables(s) {
  const d = decompose(s);
  if (!d) return [];
  const J = [0, 4, 8, 13, 18, 20, 1];
  const C = [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 16, 17, 18];
  const a = shuffle(J.filter((x) => x !== d.j).map((j) => compose(d.c, j, d.t)));
  const b = shuffle(C.filter((x) => x !== d.c).map((c) => compose(c, d.j, d.t)));
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export const PUZZLE_WORDS = [
  { word: '가방', emoji: '🎒', parts: ['ㄱ', 'ㅏ'] },
  { word: '나비', emoji: '🦋', parts: ['ㄴ', 'ㅏ'] },
  { word: '바나나', emoji: '🍌', parts: ['ㅂ', 'ㅏ'] },
  { word: '사과', emoji: '🍎', parts: ['ㅅ', 'ㅏ'] },
  { word: '하마', emoji: '🦛', parts: ['ㅎ', 'ㅏ'] },
  { word: '라면', emoji: '🍜', parts: ['ㄹ', 'ㅏ'] },
  { word: '고래', emoji: '🐳', parts: ['ㄱ', 'ㅗ'] },
  { word: '도토리', emoji: '🌰', parts: ['ㄷ', 'ㅗ'] },
  { word: '모자', emoji: '👒', parts: ['ㅁ', 'ㅗ'] },
  { word: '오리', emoji: '🦆', parts: ['ㅇ', 'ㅗ'] },
  { word: '호랑이', emoji: '🐯', parts: ['ㅎ', 'ㅗ'] },
  { word: '구름', emoji: '☁️', parts: ['ㄱ', 'ㅜ'] },
  { word: '우산', emoji: '☂️', parts: ['ㅇ', 'ㅜ'] },
  { word: '수박', emoji: '🍉', parts: ['ㅅ', 'ㅜ'] },
  { word: '무지개', emoji: '🌈', parts: ['ㅁ', 'ㅜ'] },
  { word: '기차', emoji: '🚂', parts: ['ㄱ', 'ㅣ'] },
  { word: '지구', emoji: '🌏', parts: ['ㅈ', 'ㅣ'] },
  { word: '거북이', emoji: '🐢', parts: ['ㄱ', 'ㅓ'] },
  { word: '버스', emoji: '🚌', parts: ['ㅂ', 'ㅓ'] },
];

export const PUZZLE_BATCHIM = [
  { word: '강아지', emoji: '🐶', parts: ['ㄱ', 'ㅏ', 'ㅇ'] },
  { word: '곰', emoji: '🐻', parts: ['ㄱ', 'ㅗ', 'ㅁ'] },
  { word: '달', emoji: '🌙', parts: ['ㄷ', 'ㅏ', 'ㄹ'] },
  { word: '별', emoji: '⭐', parts: ['ㅂ', 'ㅕ', 'ㄹ'] },
  { word: '산', emoji: '⛰️', parts: ['ㅅ', 'ㅏ', 'ㄴ'] },
  { word: '문', emoji: '🚪', parts: ['ㅁ', 'ㅜ', 'ㄴ'] },
  { word: '밤', emoji: '🌰', parts: ['ㅂ', 'ㅏ', 'ㅁ'] },
  { word: '공', emoji: '⚽', parts: ['ㄱ', 'ㅗ', 'ㅇ'] },
  { word: '눈사람', emoji: '⛄', parts: ['ㄴ', 'ㅜ', 'ㄴ'] },
  { word: '집', emoji: '🏠', parts: ['ㅈ', 'ㅣ', 'ㅂ'] },
  { word: '손', emoji: '✋', parts: ['ㅅ', 'ㅗ', 'ㄴ'] },
  { word: '물', emoji: '💧', parts: ['ㅁ', 'ㅜ', 'ㄹ'] },
];

export const WORDS = [
  { word: '고래', emoji: '🐳' }, { word: '사과', emoji: '🍎' }, { word: '나비', emoji: '🦋' },
  { word: '기차', emoji: '🚂' }, { word: '모자', emoji: '👒' }, { word: '우유', emoji: '🥛' },
  { word: '포도', emoji: '🍇' }, { word: '토끼', emoji: '🐰' }, { word: '사자', emoji: '🦁' },
  { word: '오리', emoji: '🦆' }, { word: '바나나', emoji: '🍌' }, { word: '도토리', emoji: '🌰' },
  { word: '피자', emoji: '🍕' }, { word: '하마', emoji: '🦛' }, { word: '거미', emoji: '🕷️' },
  { word: '시계', emoji: '⏰' }, { word: '버스', emoji: '🚌' }, { word: '자두', emoji: '🍑' },
];

export const WORDS2 = [
  { word: '강아지', emoji: '🐶' }, { word: '고양이', emoji: '🐱' }, { word: '사슴', emoji: '🦌' },
  { word: '연필', emoji: '✏️' }, { word: '딸기', emoji: '🍓' }, { word: '수박', emoji: '🍉' },
  { word: '우산', emoji: '☂️' }, { word: '기린', emoji: '🦒' }, { word: '선물', emoji: '🎁' },
  { word: '풍선', emoji: '🎈' }, { word: '눈사람', emoji: '⛄' }, { word: '자동차', emoji: '🚗' },
  { word: '비행기', emoji: '✈️' }, { word: '햄버거', emoji: '🍔' }, { word: '코끼리', emoji: '🐘' },
  { word: '원숭이', emoji: '🐵' }, { word: '병아리', emoji: '🐥' }, { word: '달팽이', emoji: '🐌' },
];

export const QUIZ_SYLLABLES = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '하', '고', '노', '도', '모', '보', '소', '오', '구', '누', '두', '무', '부', '수', '우', '기', '니', '리', '미', '비', '시', '이'];
export const QUIZ_BATCHIM = ['강', '곰', '달', '별', '산', '문', '밤', '공', '눈', '집', '손', '물', '감', '양', '맛', '잠'];

// 어절 수가 곧 난이도: 2어절(Lv1~2) → 3어절(Lv3) → 4어절(Lv4~5)
export const SENTENCES = {
  2: [
    { words: ['사과를', '먹어요'], e: '🍎😋' },
    { words: ['고양이가', '자요'], e: '🐱💤' },
    { words: ['비가', '와요'], e: '🌧️' },
    { words: ['꽃이', '예뻐요'], e: '🌸' },
    { words: ['토끼가', '뛰어요'], e: '🐰💨' },
    { words: ['아기가', '웃어요'], e: '👶😄' },
    { words: ['물고기가', '헤엄쳐요'], e: '🐟🌊' },
  ],
  3: [
    { words: ['나는', '우유를', '마셔요'], e: '🧒🥛' },
    { words: ['강아지가', '공을', '물어요'], e: '🐶⚽' },
    { words: ['엄마가', '책을', '읽어요'], e: '👩📖' },
    { words: ['하늘에', '별이', '반짝여요'], e: '🌌⭐' },
    { words: ['토리가', '도토리를', '모아요'], e: '🐿️🌰' },
    { words: ['아빠가', '차를', '닦아요'], e: '👨🚗' },
  ],
  4: [
    { words: ['나는', '친구와', '같이', '놀아요'], e: '🧒🤝🧒' },
    { words: ['토리는', '나무', '위에', '살아요'], e: '🐿️🌳' },
    { words: ['우리는', '공원에서', '자전거를', '타요'], e: '🚲🌳' },
    { words: ['아침에', '일찍', '밥을', '먹어요'], e: '🌅🍚' },
    { words: ['동생이', '큰', '소리로', '웃어요'], e: '👧😆' },
    { words: ['겨울에는', '하얀', '눈이', '내려요'], e: '❄️⛄' },
  ],
  extra: ['빨리', '아주', '천천히', '조금', '모두'],
};

// 단어 축구: 받침이 있으면 앞 말(이·을·은·과), 없으면 뒷말(가·를·는·와)
export const JOSA_PAIRS = { subj: ['이', '가'], obj: ['을', '를'], topic: ['은', '는'], with: ['과', '와'] };
export const KICKER_NOUNS = [
  { w: '강아지', e: '🐶', a: true }, { w: '고양이', e: '🐱', a: true }, { w: '곰', e: '🐻', a: true },
  { w: '토끼', e: '🐰', a: true }, { w: '사자', e: '🦁', a: true }, { w: '기린', e: '🦒', a: true },
  { w: '오리', e: '🦆', a: true }, { w: '거북이', e: '🐢', a: true }, { w: '하마', e: '🦛', a: true },
  { w: '사과', e: '🍎' }, { w: '수박', e: '🍉' }, { w: '빵', e: '🍞' }, { w: '책', e: '📕' },
  { w: '공', e: '⚽' }, { w: '우산', e: '☂️' }, { w: '꽃', e: '🌸' }, { w: '모자', e: '👒' }, { w: '양말', e: '🧦' },
];
// 조각 조각 붙여요: 배열이 빈칸 — [바른 글자, 틀리기 쉬운 글자...]
export const STICKY = [
  { e: '🏠🏪', parts: ['집 ', ['옆', '엽', '엮'], '에 마트가 ', ['있어요', '이써요', '잇어요'], '.'] },
  { e: '🧒🤝🧒', parts: ['친구와 ', ['같이', '가치', '갇이'], ' ', ['놀아요', '노라요', '놀야요'], '.'] },
  { e: '🍚😋', parts: ['밥을 ', ['맛있게', '마싯게', '맛잇게'], ' 먹어요.'] },
  { e: '👧📖', parts: ['동생이 ', ['책을', '채글', '책흘'], ' ', ['읽어요', '일거요', '익어요'], '.'] },
  { e: '🪑', parts: ['의자에 ', ['앉아요', '안자요', '안저요'], '.'] },
  { e: '🌸🌼', parts: ['꽃이 ', ['많이', '마니', '만이'], ' 피었어요.'] },
  { e: '👶😄', parts: ['아기가 ', ['웃어요', '우서요', '웃서요'], '.'] },
  { e: '🧹✨', parts: ['방을 ', ['깨끗이', '깨끄시', '깨끗히'], ' 치워요.'] },
  { e: '🌌⭐', parts: ['하늘에 ', ['별이', '벼리', '별히'], ' ', ['반짝여요', '반짜겨요', '반작여요'], '.'] },
  { e: '🏫', parts: ['우리 ', ['학교', '학꾜', '핚교'], '는 커요.'] },
  { e: '🛝', parts: ['오늘은 ', ['놀이터', '노리터', '놀이더'], '에 가요.'] },
  { e: '🥛', parts: ['우유를 ', ['마셔요', '마서요', '마쇼요'], '.'] },
  { e: '❄️⛄', parts: ['눈이 ', ['와서', '와써', '와사'], ' ', ['좋아요', '조아요', '좋와요'], '.'] },
  { e: '🐱💤', parts: ['고양이가 ', ['잠을', '자믈', '잠믈'], ' 자요.'] },
  { e: '👩🛒', parts: ['엄마와 ', ['시장', '시짱', '시잔'], '에 가요.'] },
];

// 숨은 낱말 찾기: 주제별 낱말
export const SEARCH_SETS = [
  { name: '과일', e: '🧺', words: [['사과', '🍎'], ['포도', '🍇'], ['딸기', '🍓'], ['수박', '🍉'], ['바나나', '🍌'], ['자두', '🍑'], ['참외', '🍈'], ['레몬', '🍋']] },
  { name: '동물', e: '🐾', words: [['토끼', '🐰'], ['사자', '🦁'], ['기린', '🦒'], ['하마', '🦛'], ['오리', '🦆'], ['고래', '🐳'], ['여우', '🦊'], ['코끼리', '🐘'], ['원숭이', '🐵'], ['다람쥐', '🐿️']] },
  { name: '탈것', e: '🚦', words: [['기차', '🚂'], ['버스', '🚌'], ['택시', '🚕'], ['자동차', '🚗'], ['비행기', '✈️'], ['자전거', '🚲'], ['트럭', '🚚'], ['배', '🚢']] },
  { name: '음식', e: '🍽️', words: [['피자', '🍕'], ['라면', '🍜'], ['김밥', '🍙'], ['우유', '🥛'], ['햄버거', '🍔'], ['빵', '🍞'], ['케이크', '🍰'], ['사탕', '🍬']] },
];
// 낱말 카드: 판마다 주제 하나 (세 글자 이하 낱말)
export const FLASH_SETS = [
  { name: '과일', e: '🧺', words: [['사과', '🍎'], ['포도', '🍇'], ['딸기', '🍓'], ['수박', '🍉'], ['바나나', '🍌'], ['자두', '🍑'], ['레몬', '🍋'], ['배', '🍐'], ['귤', '🍊']] },
  { name: '먹을 것', e: '🍽️', words: [['물', '💧'], ['우유', '🥛'], ['주스', '🧃'], ['사탕', '🍬'], ['빵', '🍞'], ['과자', '🍪'], ['케이크', '🍰'], ['피자', '🍕']] },
  { name: '옷', e: '👚', words: [['바지', '👖'], ['원피스', '👗'], ['양말', '🧦'], ['모자', '👒'], ['신발', '👟'], ['장갑', '🧤'], ['티셔츠', '👕'], ['목도리', '🧣']] },
  { name: '학교', e: '🏫', words: [['연필', '✏️'], ['가위', '✂️'], ['공책', '📓'], ['책', '📕'], ['가방', '🎒'], ['자', '📏'], ['물감', '🎨'], ['시계', '⏰']] },
  { name: '동물', e: '🐾', words: [['강아지', '🐶'], ['고양이', '🐱'], ['돼지', '🐷'], ['오리', '🦆'], ['말', '🐴'], ['소', '🐮'], ['토끼', '🐰'], ['병아리', '🐥'], ['곰', '🐻']] },
  { name: '바닷속', e: '🌊', words: [['고래', '🐳'], ['문어', '🐙'], ['게', '🦀'], ['물고기', '🐟'], ['상어', '🦈'], ['새우', '🦐'], ['거북', '🐢'], ['오징어', '🦑']] },
];
// 장난감 공장: 몬스터가 달라는 물건. Lv1~2는 받침 없는 낱말, Lv3부터 받침 낱말도
export const TOY_WORDS = [
  ['새', '🐦'], ['배', '⛵'], ['기차', '🚂'], ['버스', '🚌'], ['오리', '🦆'], ['토끼', '🐰'],
  ['나비', '🦋'], ['모자', '👒'], ['포도', '🍇'], ['피아노', '🎹'], ['사과', '🍎'], ['고래', '🐳'],
];
export const TOY_WORDS2 = [
  ['곰', '🐻'], ['공', '⚽'], ['풍선', '🎈'], ['로봇', '🤖'], ['인형', '🪆'], ['블록', '🧱'],
  ['자동차', '🚗'], ['비행기', '✈️'], ['북', '🥁'], ['나팔', '🎺'], ['우산', '☂️'], ['선물', '🎁'],
];
// 소리가 비슷한 낱말 묶음 (Lv4~5는 소리만 듣고 골라요)
export const TOY_ALIKE = [
  [['곰', '🐻'], ['공', '⚽']],
  [['말', '🐴'], ['달', '🌙'], ['발', '🦶']],
  [['별', '⭐'], ['벌', '🐝']],
  [['문', '🚪'], ['물', '💧']],
  [['불', '🔥'], ['풀', '🌿']],
  [['토끼', '🐰'], ['도끼', '🪓']],
  [['쥐', '🐭'], ['귀', '👂']],
  [['배', '⛵'], ['새', '🐦'], ['개', '🐕']],
  [['기차', '🚂'], ['기린', '🦒']],
  [['사과', '🍎'], ['사자', '🦁']],
];

// 신기한 초콜릿: 글자 수(음절 수)별 낱말
export const SYLLABLE_WORDS = {
  1: ['곰', '공', '달', '별', '산', '문', '밤', '눈', '집', '손', '물', '빵', '책', '배', '새', '꽃', '귤', '말'],
  2: ['사과', '포도', '토끼', '나비', '기차', '모자', '우유', '오리', '하마', '사자', '피자', '버스', '연필', '딸기', '우산', '풍선', '기린', '양말'],
  3: ['바나나', '도토리', '강아지', '고양이', '자동차', '비행기', '코끼리', '원숭이', '병아리', '달팽이', '햄버거', '거북이', '무지개', '눈사람'],
  4: ['오토바이', '해바라기', '헬리콥터', '무당벌레', '코스모스', '할아버지', '텔레비전'],
};

// 말소리 정류장: 상자 그림 낱말 (첫 글자·첫소리가 같은 낱말이 3개 이상씩 모이도록)
export const STATION_WORDS = [
  ['가위', '✂️'], ['가방', '🎒'], ['가지', '🍆'], ['가면', '🎭'],
  ['고래', '🐳'], ['고양이', '🐱'], ['고구마', '🍠'], ['고추', '🌶️'],
  ['기차', '🚂'], ['기린', '🦒'], ['기타', '🎸'],
  ['거미', '🕷️'], ['거북이', '🐢'], ['거울', '🪞'],
  ['나비', '🦋'], ['나무', '🌳'], ['나팔', '🎺'],
  ['도토리', '🌰'], ['도넛', '🍩'], ['도끼', '🪓'],
  ['다람쥐', '🐿️'], ['달팽이', '🐌'], ['당근', '🥕'],
  ['모자', '👒'], ['모기', '🦟'], ['문어', '🐙'], ['무지개', '🌈'],
  ['바나나', '🍌'], ['바지', '👖'], ['바다', '🌊'],
  ['버스', '🚌'], ['버섯', '🍄'], ['비행기', '✈️'], ['비누', '🧼'],
  ['사과', '🍎'], ['사자', '🦁'], ['사탕', '🍬'], ['사슴', '🦌'], ['수박', '🍉'],
  ['오리', '🦆'], ['오이', '🥒'], ['오렌지', '🍊'], ['오징어', '🦑'],
  ['우산', '☂️'], ['우유', '🥛'], ['우체통', '📮'],
  ['자동차', '🚗'], ['자전거', '🚲'], ['자두', '🍑'], ['지구', '🌏'], ['주스', '🧃'],
  ['토끼', '🐰'], ['토마토', '🍅'], ['포도', '🍇'], ['피자', '🍕'], ['피아노', '🎹'],
  ['하마', '🦛'], ['하트', '❤️'], ['호랑이', '🐯'], ['라면', '🍜'], ['로봇', '🤖'], ['레몬', '🍋'],
];

// 마법의 솥: 레시피 4가지 재료(낱말)와 다 끓이면 나오는 것. batchim: 받침 낱말 레시피(Lv4~5)
export const POT_RECIPES = [
  { items: [['가루', '🧂'], ['구두', '👞'], ['자두', '🍑'], ['바나나', '🍌']], out: ['유니콘', '🦄'] },
  { items: [['포도', '🍇'], ['우유', '🥛'], ['거미', '🕷️'], ['고구마', '🍠']], out: ['아기 용', '🐲'] },
  { items: [['모자', '👒'], ['나비', '🦋'], ['오리', '🦆'], ['도토리', '🌰']], out: ['요정', '🧚'] },
  { items: [['피자', '🍕'], ['토마토', '🍅'], ['오이', '🥒'], ['보리', '🌾']], out: ['케이크', '🎂'] },
  { items: [['사탕', '🍬'], ['별', '⭐'], ['양말', '🧦'], ['풍선', '🎈']], out: ['무지개', '🌈'], batchim: true },
  { items: [['딸기', '🍓'], ['수박', '🍉'], ['연필', '✏️'], ['당근', '🥕']], out: ['로켓', '🚀'], batchim: true },
  { items: [['꽃', '🌸'], ['달', '🌙'], ['버섯', '🍄'], ['선물', '🎁']], out: ['마법사', '🧙'], batchim: true },
  { items: [['곰', '🐻'], ['문어', '🐙'], ['눈사람', '⛄'], ['종', '🔔']], out: ['공룡', '🦖'], batchim: true },
];

// 열매를 받아라: 바구니에 받아 완성할 낱말
export const FRUIT_WORDS = {
  2: [['오리', '🦆'], ['나비', '🦋'], ['하마', '🦛'], ['모자', '👒'], ['포도', '🍇'], ['우유', '🥛'], ['기차', '🚂'], ['피자', '🍕'], ['자두', '🍑'], ['거미', '🕷️'], ['토끼', '🐰'], ['버스', '🚌']],
  3: [['고구마', '🍠'], ['바나나', '🍌'], ['도토리', '🌰'], ['토마토', '🍅'], ['오징어', '🦑'], ['무지개', '🌈'], ['비행기', '✈️'], ['코끼리', '🐘'], ['자동차', '🚗'], ['피아노', '🎹']],
  b: [['사탕', '🍬'], ['수박', '🍉'], ['연필', '✏️'], ['우산', '☂️'], ['풍선', '🎈'], ['당근', '🥕'], ['강아지', '🐶'], ['달팽이', '🐌'], ['눈사람', '⛄'], ['호랑이', '🐯']],
};

// 설명해 주세요: 고양이와 주고받는 스무고개. yes는 넓은 설명 → 좁은 설명 순서(마지막 설명은 그것만의 특징),
// no는 그 낱말에 확실히 맞지 않는 설명(아이가 설명할 차례의 함정)
export const EXPLAIN_RIDDLES = [
  { w: '코끼리', e: '🐘', kind: 'animal', yes: ['동물이에요.', '다리가 4개예요.', '사람보다 무거워요.', '귀가 커요.', '코가 길어요.'], no: ['하늘을 날아요.', '바다에 살아요.', '손바닥만큼 작아요.'] },
  { w: '기린', e: '🦒', kind: 'animal', yes: ['동물이에요.', '다리가 4개예요.', '몸에 무늬가 있어요.', '키가 아주 커요.', '목이 길어요.'], no: ['코가 길어요.', '하늘을 날아요.', '바다에 살아요.'] },
  { w: '사자', e: '🦁', kind: 'animal', yes: ['동물이에요.', '다리가 4개예요.', '고기를 먹어요.', '어흥 하고 울어요.', '머리에 갈기가 있어요.'], no: ['목이 길어요.', '하늘을 날아요.', '바다에 살아요.'] },
  { w: '토끼', e: '🐰', kind: 'animal', yes: ['동물이에요.', '다리가 4개예요.', '깡충깡충 뛰어요.', '당근을 좋아해요.', '귀가 길어요.'], no: ['바다에 살아요.', '사람보다 무거워요.', '하늘을 날아요.'] },
  { w: '말', e: '🐴', kind: 'animal', yes: ['동물이에요.', '다리가 4개예요.', '사람을 태우고 달려요.', '히힝 하고 울어요.'], no: ['하늘을 날아요.', '바다에 살아요.', '코가 길어요.'] },
  { w: '펭귄', e: '🐧', kind: 'animal', yes: ['동물이에요.', '다리가 2개예요.', '추운 곳에 살아요.', '날개가 있지만 날지 못해요.', '뒤뚱뒤뚱 걸어요.'], no: ['다리가 4개예요.', '더운 사막에 살아요.', '하늘을 높이 날아요.'] },
  { w: '오징어', e: '🦑', kind: 'animal', yes: ['동물이에요.', '바다에 살아요.', '다리가 10개예요.', '먹물을 뿜어요.'], no: ['다리가 4개예요.', '하늘을 날아요.', '몸에 털이 있어요.'] },
  { w: '바나나', e: '🍌', kind: 'food', yes: ['먹는 거예요.', '과일이에요.', '노란색이에요.', '껍질을 벗겨 먹어요.', '길쭉하게 생겼어요.'], no: ['빨간색이에요.', '동물이에요.', '뜨겁게 끓여 먹어요.'] },
  { w: '국수', e: '🍜', kind: 'food', yes: ['먹는 거예요.', '그릇에 담아 먹어요.', '젓가락으로 먹어요.', '길고 가늘어요.', '후루룩 먹어요.'], no: ['과일이에요.', '나무에 열려요.', '동물이에요.'] },
  { w: '사과', e: '🍎', kind: 'food', yes: ['먹는 거예요.', '과일이에요.', '나무에 열려요.', '동그랗게 생겼어요.', '빨간색이에요.'], no: ['길쭉하게 생겼어요.', '동물이에요.', '후루룩 먹어요.'] },
  { w: '수박', e: '🍉', kind: 'food', yes: ['먹는 거예요.', '과일이에요.', '여름에 먹어요.', '속이 빨개요.', '겉에 초록 줄무늬가 있어요.'], no: ['손바닥만큼 작아요.', '동물이에요.', '나무에 열려요.'] },
  { w: '아이스크림', e: '🍦', kind: 'food', yes: ['먹는 거예요.', '달콤해요.', '차가워요.', '더우면 녹아요.'], no: ['뜨거워요.', '과일이에요.', '동물이에요.'] },
  { w: '신발', e: '👟', kind: 'thing', yes: ['물건이에요.', '두 짝이 한 켤레예요.', '밖에 나갈 때 필요해요.', '발에 신어요.'], no: ['먹는 거예요.', '머리에 써요.', '동물이에요.'] },
  { w: '바늘', e: '🪡', kind: 'thing', yes: ['물건이에요.', '아주 가늘어요.', '끝이 뾰족해요.', '실을 꿰어 옷을 꿰매요.'], no: ['먹는 거예요.', '크고 무거워요.', '동그래요.'] },
  { w: '공', e: '⚽', kind: 'thing', yes: ['물건이에요.', '놀 때 써요.', '동그래요.', '데굴데굴 굴러가요.', '발로 뻥 차요.'], no: ['먹는 거예요.', '끝이 뾰족해요.', '동물이에요.'] },
  { w: '우산', e: '☂️', kind: 'thing', yes: ['물건이에요.', '접었다 펼 수 있어요.', '손잡이가 있어요.', '비 올 때 써요.'], no: ['먹는 거예요.', '발에 신어요.', '동물이에요.'] },
  { w: '모자', e: '🧢', kind: 'thing', yes: ['물건이에요.', '밖에 나갈 때 써요.', '햇빛을 가려 줘요.', '머리에 써요.'], no: ['발에 신어요.', '먹는 거예요.', '동물이에요.'] },
  { w: '시계', e: '⏰', kind: 'thing', yes: ['물건이에요.', '숫자가 있어요.', '똑딱똑딱 소리가 나요.', '시간을 알려 줘요.'], no: ['먹는 거예요.', '발에 신어요.', '동물이에요.'] },
  { w: '비행기', e: '✈️', kind: 'ride', yes: ['탈것이에요.', '사람이 많이 타요.', '날개가 있어요.', '하늘을 날아요.'], no: ['동물이에요.', '먹는 거예요.', '철길 위를 달려요.'] },
  { w: '자전거', e: '🚲', kind: 'ride', yes: ['탈것이에요.', '바퀴가 두 개예요.', '발로 페달을 밟아요.', '따르릉 벨이 있어요.'], no: ['하늘을 날아요.', '먹는 거예요.', '철길 위를 달려요.'] },
  { w: '기차', e: '🚂', kind: 'ride', yes: ['탈것이에요.', '아주 길어요.', '여러 칸이 이어져 있어요.', '철길 위를 달려요.'], no: ['하늘을 날아요.', '바퀴가 두 개예요.', '먹는 거예요.'] },
  { w: '버스', e: '🚌', kind: 'ride', yes: ['탈것이에요.', '바퀴가 있어요.', '사람이 많이 타요.', '정류장에 서요.'], no: ['하늘을 날아요.', '철길 위를 달려요.', '동물이에요.'] },
];

// 낱말 찾기 은하: 그림 없이 주제와 글자 수(○)만 보고 찾는 긴 낱말
export const GALAXY_SEARCH_SETS = [
  { name: '음식', words: ['짜장면', '아이스크림', '햄버거', '떡꼬치', '김밥', '피자', '케이크', '라면', '만두', '떡볶이'] },
  { name: '꽃', words: ['장미', '해바라기', '튤립', '민들레', '개나리', '진달래', '백합', '무궁화', '코스모스', '국화'] },
  { name: '동물', words: ['호랑이', '코끼리', '원숭이', '다람쥐', '고양이', '강아지', '거북이', '기린', '사자', '하마'] },
  { name: '탈것', words: ['자동차', '비행기', '자전거', '기차', '버스', '택시', '헬리콥터', '오토바이', '트럭', '잠수함'] },
  { name: '학교', words: ['연필', '지우개', '공책', '가방', '선생님', '칠판', '색연필', '필통', '운동장', '교실'] },
];

// 타자 연습 은하: 1은 글자·낱말, 2는 짧은 문장
export const TYPE_WORDS = [
  ['가', '나', '도', '루', '모', '비', '소', '우', '자', '하'],
  ['기차', '나비', '모자', '우유', '포도', '오리', '하마', '버스', '자두', '피자'],
  ['사슴', '연필', '수박', '우산', '기린', '선물', '풍선', '잠', '곰', '별'],
  ['딸기', '토끼', '사과', '의자', '돼지', '원숭이', '꽃병', '쥐', '뼈', '꿀벌'],
  ['햄버거', '비행기', '코끼리', '눈사람', '달팽이', '병아리', '자동차', '읽기', '앉기', '닭'],
];
export const TYPE_SENTENCES = [
  ['사랑해요.', '고마워요.', '잘 자요.', '안녕!', '좋아요.'],
  ['소원을 빌어.', '밥을 먹어요.', '비가 와요.', '안녕하세요.', '같이 놀자!'],
  ['하늘이 파래요.', '꽃이 피었어요.', '친구와 놀아요.', '물을 마셔요.', '책을 읽어요.'],
  ['토끼가 깡충 뛰어요.', '오늘은 날씨가 맑아요.', '엄마, 사랑해요!', '눈이 와서 좋아요.', '나는 빵을 좋아해요.'],
];

// 글자 고르기 은하: 빈칸에 들어갈 낱말을 글자 단추로 만든다
export const LETTER_GALAXY = [
  { w: '사과', after: '가 빨개요.', e: '🍎' }, { w: '우산', after: '을 써요.', e: '☂️' },
  { w: '나비', after: '가 날아요.', e: '🦋' }, { w: '기차', after: '가 지나가요.', e: '🚂' },
  { w: '수박', after: '이 정말 커요.', e: '🍉' }, { w: '연필', after: '로 그림을 그려요.', e: '✏️' },
  { w: '딸기', after: '가 달아요.', e: '🍓' }, { w: '모자', after: '를 썼어요.', e: '👒' },
  { w: '우체통', after: '에 편지를 넣어요.', e: '📮' }, { w: '도서관', after: '에서 책을 빌려요.', e: '📚' },
  { w: '놀이터', after: '에서 그네를 타요.', e: '🛝' }, { w: '냉장고', after: '에 우유가 있어요.', e: '🧊' },
  { w: '소방차', after: '가 불을 꺼요.', e: '🚒' }, { w: '무지개', after: '가 떴어요.', e: '🌈' },
  { w: '자전거', after: '를 타고 가요.', e: '🚲' }, { w: '눈사람', after: '을 만들었어요.', e: '⛄' },
  { w: '병아리', after: '가 삐약삐약 울어요.', e: '🐥' }, { w: '선생님', after: '이 웃으세요.', e: '🧑‍🏫' },
];

export const SEARCH_FILLER = ['가', '나', '도', '루', '마', '보', '소', '아', '조', '하', '미', '리', '다', '모', '구', '누', '지', '호', '파', '키', '노', '두', '서', '오'];

export const KICKER_TEMPLATES = [
  { pair: 'subj', rest: '있어요.' },
  { pair: 'subj', rest: '정말 커요.' },
  { pair: 'subj', rest: '쿨쿨 잠을 자요.', animal: true },
  { pair: 'obj', rest: '그려요.' },
  { pair: 'obj', rest: '좋아해요.' },
  { pair: 'obj', rest: '찾았어요.' },
  { pair: 'topic', rest: '어디 있나요?' },
  { pair: 'topic', rest: '여기 있어요.' },
  { pair: 'with', rest: '토리가 같이 놀아요.', animal: true },
  { pair: 'with', rest: '나는 친구예요.', animal: true },
];

/* ---------- 수학 ---------- */
// 읽고 수식 만들기(WordToEquation): 문장 세 토막(누가 몇 있었는데 · 몇 더 왔습니다/갔습니다 · 질문)을 이어 읽는다
export const STORY_WHO = [['소녀가', '명'], ['소년이', '명'], ['오리가', '마리'], ['토끼가', '마리']];
export function storyParts(op, [who, unit], a, b) {
  return op === '+'
    ? [`${who} ${a}${unit} 있었는데,`, `${b}${unit} 더 왔습니다.`, `전부 몇 ${unit}일까요?`]
    : [`${who} ${a}${unit} 있었는데,`, `${b}${unit}${unit === '명' ? '이' : '가'} 집에 갔습니다.`, `남은 것은 몇 ${unit}일까요?`];
}
// 몇 개일까요(WordWindows): 커튼 창문 두 개에 적힌 문장과 질문. kind: add1 · add · sub · cmp
export const WINDOW_ITEMS = [['아이스바', '🍦'], ['쿠키', '🍪'], ['사탕', '🍬'], ['도넛', '🍩'], ['사과', '🍎'], ['풍선', '🎈']];
export function windowLines(kind, w, a, b) {
  if (kind === 'cmp') return [`빨간 상자에 ${w} ${a}개가 있어요.`, `파란 상자에 ${w} ${b}개가 있어요.`, '파란 상자에 몇 개 더 있을까요?'];
  const first = `가게에 ${w} ${a}개가 있어요.`;
  if (kind === 'add1') return [first, `그리고 ${w} ${b}개가 있어요.`, '모두 합하면 몇 개일까요?'];
  if (kind === 'add') return [first, `${b}개를 더 가져왔어요.`, '모두 몇 개일까요?'];
  return [first, `그중 ${b}개를 팔았어요.`, '남은 것은 몇 개일까요?'];
}
export const NATIVE_NUM = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열하나', '열둘', '열셋', '열넷', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스물'];
export const COUNT_ITEMS = [
  { e: '🍎', q: '사과는' }, { e: '🐟', q: '물고기는' }, { e: '🐥', q: '병아리는' },
  { e: '⭐', q: '별은' }, { e: '🍓', q: '딸기는' }, { e: '🐞', q: '무당벌레는' },
  { e: '🎈', q: '풍선은' }, { e: '🌰', q: '도토리는' }, { e: '🦆', q: '오리는' },
];
export const PATTERN_SETS = [
  ['🍎', '🍌', '🍇', '🍓'], ['🐶', '🐱', '🐰', '🐻'], ['🔺', '🟦', '⭐', '🟢'],
  ['☀️', '🌙', '⭐', '☁️'], ['🚗', '🚌', '🚲', '✈️'], ['🌷', '🍀', '🍄', '🌻'],
];

/* ---------- 영어 ---------- */
export const PHONICS = [
  { l: 'a', w: 'apple', e: '🍎' }, { l: 'b', w: 'ball', e: '⚽' }, { l: 'c', w: 'cat', e: '🐱' },
  { l: 'd', w: 'dog', e: '🐶' }, { l: 'f', w: 'fish', e: '🐟' }, { l: 'g', w: 'goat', e: '🐐' },
  { l: 'h', w: 'hat', e: '🎩' }, { l: 'k', w: 'kite', e: '🪁' }, { l: 'l', w: 'lion', e: '🦁' },
  { l: 'm', w: 'moon', e: '🌙' }, { l: 'n', w: 'nest', e: '🪺' }, { l: 'p', w: 'pig', e: '🐷' },
  { l: 'r', w: 'rabbit', e: '🐰' }, { l: 's', w: 'sun', e: '☀️' }, { l: 't', w: 'tiger', e: '🐯' },
];
export const END_WORDS = [
  { w: 'cat', e: '🐱' }, { w: 'dog', e: '🐶' }, { w: 'sun', e: '☀️' }, { w: 'pig', e: '🐷' },
  { w: 'hat', e: '🎩' }, { w: 'bus', e: '🚌' }, { w: 'web', e: '🕸️' }, { w: 'bed', e: '🛏️' },
  { w: 'box', e: '📦' }, { w: 'cup', e: '☕' }, { w: 'fox', e: '🦊' }, { w: 'van', e: '🚐' },
  { w: 'map', e: '🗺️' }, { w: 'bat', e: '🦇' }, { w: 'jam', e: '🍯' },
];
export const VOCAB = [
  { w: 'cat', e: '🐱' }, { w: 'dog', e: '🐶' }, { w: 'fish', e: '🐟' }, { w: 'bird', e: '🐦' },
  { w: 'apple', e: '🍎' }, { w: 'banana', e: '🍌' }, { w: 'car', e: '🚗' }, { w: 'bus', e: '🚌' },
  { w: 'ball', e: '⚽' }, { w: 'book', e: '📖' }, { w: 'sun', e: '☀️' }, { w: 'moon', e: '🌙' },
  { w: 'star', e: '⭐' }, { w: 'tree', e: '🌳' }, { w: 'cake', e: '🎂' }, { w: 'duck', e: '🦆' },
  { w: 'frog', e: '🐸' }, { w: 'bear', e: '🐻' }, { w: 'egg', e: '🥚' }, { w: 'milk', e: '🥛' },
];
export const VOCAB2 = [
  { w: 'rabbit', e: '🐰' }, { w: 'lion', e: '🦁' }, { w: 'tiger', e: '🐯' }, { w: 'horse', e: '🐴' },
  { w: 'sheep', e: '🐑' }, { w: 'elephant', e: '🐘' }, { w: 'monkey', e: '🐵' }, { w: 'penguin', e: '🐧' },
  { w: 'flower', e: '🌸' }, { w: 'rainbow', e: '🌈' }, { w: 'pencil', e: '✏️' }, { w: 'umbrella', e: '☂️' },
  { w: 'house', e: '🏠' }, { w: 'train', e: '🚂' }, { w: 'robot', e: '🤖' }, { w: 'cookie', e: '🍪' },
  { w: 'orange', e: '🍊' }, { w: 'grapes', e: '🍇' }, { w: 'snowman', e: '⛄' }, { w: 'turtle', e: '🐢' },
];
export const SPELL_WORDS = {
  3: [
    { w: 'cat', e: '🐱' }, { w: 'dog', e: '🐶' }, { w: 'sun', e: '☀️' }, { w: 'pig', e: '🐷' },
    { w: 'bus', e: '🚌' }, { w: 'hat', e: '🎩' }, { w: 'cup', e: '☕' }, { w: 'fox', e: '🦊' },
    { w: 'bee', e: '🐝' }, { w: 'egg', e: '🥚' }, { w: 'bed', e: '🛏️' }, { w: 'owl', e: '🦉' },
    { w: 'ant', e: '🐜' }, { w: 'car', e: '🚗' },
  ],
  4: [
    { w: 'fish', e: '🐟' }, { w: 'frog', e: '🐸' }, { w: 'duck', e: '🦆' }, { w: 'cake', e: '🎂' },
    { w: 'star', e: '⭐' }, { w: 'tree', e: '🌳' }, { w: 'moon', e: '🌙' }, { w: 'bear', e: '🐻' },
    { w: 'ball', e: '⚽' }, { w: 'milk', e: '🥛' }, { w: 'lion', e: '🦁' }, { w: 'kite', e: '🪁' },
    { w: 'boat', e: '⛵' }, { w: 'book', e: '📖' },
  ],
  5: [
    { w: 'apple', e: '🍎' }, { w: 'tiger', e: '🐯' }, { w: 'horse', e: '🐴' }, { w: 'sheep', e: '🐑' },
    { w: 'house', e: '🏠' }, { w: 'train', e: '🚂' }, { w: 'pizza', e: '🍕' }, { w: 'robot', e: '🤖' },
    { w: 'snake', e: '🐍' }, { w: 'zebra', e: '🦓' }, { w: 'mouse', e: '🐭' }, { w: 'whale', e: '🐳' },
    { w: 'rabbit', e: '🐰' }, { w: 'monkey', e: '🐵' }, { w: 'cookie', e: '🍪' }, { w: 'flower', e: '🌸' },
  ],
};
// 강아지 파닉스: 자음-모음-자음 세 글자 단어(CVC). 첫소리 · 끝소리 · 가운데 모음으로 나눌 수 있게
// (c와 k는 소리가 같아서 k 단어는 넣지 않는다)
export const CVC_WORDS = [
  'bat', 'bed', 'big', 'bus', 'bag', 'bug', 'cat', 'cap', 'cup', 'cot', 'dog', 'dig', 'dot', 'den',
  'fan', 'fin', 'fox', 'fig', 'hat', 'hen', 'hop', 'hut', 'jam', 'jet', 'jug', 'leg', 'lip', 'log',
  'map', 'mop', 'mud', 'man', 'net', 'nut', 'nap', 'pat', 'pin', 'pig', 'pan', 'pen', 'pot', 'rat',
  'red', 'rug', 'run', 'sun', 'sit', 'sad', 'sip', 'ten', 'top', 'tub', 'tap', 'zip', 'zag', 'zap',
  'web', 'wig', 'wet', 'lid', 'mat', 'six', 'van', 'yes',
];

// 장난감 공장(영어): 몬스터가 달라는 물건과, 소리가 비슷한(운율이 같은) 물건 묶음
export const EN_TOY_WORDS = [
  ['ball', '⚽'], ['car', '🚗'], ['kite', '🪁'], ['doll', '🪆'], ['robot', '🤖'], ['drum', '🥁'], ['teddy bear', '🧸'],
  ['boat', '⛵'], ['train', '🚂'], ['duck', '🦆'], ['balloon', '🎈'], ['yo-yo', '🪀'], ['blocks', '🧱'], ['puzzle', '🧩'],
];
export const EN_TOY_ALIKE = [
  [['cat', '🐱'], ['hat', '🎩']], [['box', '📦'], ['fox', '🦊']], [['bee', '🐝'], ['key', '🔑']], [['car', '🚗'], ['star', '⭐']],
  [['mouse', '🐭'], ['house', '🏠']], [['snake', '🐍'], ['cake', '🎂']], [['boat', '⛵'], ['goat', '🐐']], [['sock', '🧦'], ['clock', '⏰']],
  [['frog', '🐸'], ['dog', '🐶']], [['ring', '💍'], ['king', '🤴']], [['bear', '🐻'], ['pear', '🍐']], [['moon', '🌙'], ['spoon', '🥄']],
];
// 목욕시간(영어): 글자마다 소리를 알려 줄 단어 ("B. B is for ball.")
export const EN_LETTER_WORDS = {
  a: 'apple', b: 'ball', c: 'cat', d: 'dog', e: 'egg', f: 'fish', g: 'goat', h: 'hat', i: 'igloo', j: 'jam', k: 'kite', l: 'lion', m: 'moon',
  n: 'nest', o: 'octopus', p: 'pig', q: 'queen', r: 'rabbit', s: 'sun', t: 'tiger', u: 'umbrella', v: 'van', w: 'whale', x: 'box', y: 'yo-yo', z: 'zebra',
};

// 강아지 먹이 주기(한글): 받침 소리로 나누는 한 글자 낱말
export const DOG_FINAL_WORDS = {
  ㄴ: [['산', '⛰️'], ['문', '🚪'], ['손', '✋'], ['돈', '💰'], ['눈', '👁️']],
  ㄹ: [['달', '🌙'], ['별', '⭐'], ['물', '💧'], ['불', '🔥'], ['말', '🐴'], ['풀', '🌿']],
  ㅁ: [['곰', '🐻'], ['밤', '🌰'], ['잠', '💤'], ['솜', '☁️'], ['감', '🟠']],
  ㅇ: [['공', '⚽'], ['빵', '🍞'], ['종', '🔔'], ['콩', '🫘'], ['방', '🛏️']],
};

// 플래시 카드: 주제별 그림 단어
export const EN_FLASH_SETS = [
  { name: 'Body parts', words: [['hand', '✋'], ['foot', '🦶'], ['leg', '🦵'], ['arm', '💪'], ['ear', '👂'], ['nose', '👃'], ['eye', '👁️'], ['mouth', '👄']] },
  { name: 'Fruit', words: [['apple', '🍎'], ['banana', '🍌'], ['grapes', '🍇'], ['lemon', '🍋'], ['cherry', '🍒'], ['peach', '🍑'], ['pear', '🍐'], ['melon', '🍈']] },
  { name: 'Animals', words: [['cat', '🐱'], ['dog', '🐶'], ['pig', '🐷'], ['cow', '🐮'], ['duck', '🦆'], ['frog', '🐸'], ['bear', '🐻'], ['fox', '🦊']] },
  { name: 'Clothes', words: [['hat', '👒'], ['shoes', '👟'], ['socks', '🧦'], ['shirt', '👕'], ['dress', '👗'], ['coat', '🧥'], ['gloves', '🧤'], ['scarf', '🧣']] },
  { name: 'Things that go', words: [['car', '🚗'], ['bus', '🚌'], ['train', '🚂'], ['boat', '⛵'], ['plane', '✈️'], ['bike', '🚲'], ['truck', '🚚'], ['rocket', '🚀']] },
  { name: 'Food', words: [['cake', '🎂'], ['bread', '🍞'], ['milk', '🥛'], ['egg', '🥚'], ['pizza', '🍕'], ['cookie', '🍪'], ['rice', '🍚'], ['cheese', '🧀']] },
  { name: 'Nature', words: [['sun', '☀️'], ['moon', '🌙'], ['star', '⭐'], ['tree', '🌳'], ['flower', '🌸'], ['cloud', '☁️'], ['rain', '🌧️'], ['snow', '❄️']] },
];

// 몬스터 색칠공부: 크레파스 색 (말하는 이름 · 칠하는 색)
export const EN_COLORS = [
  { w: 'red', c: '#E8574F' }, { w: 'orange', c: '#F39A3D' }, { w: 'yellow', c: '#F6CE3A' },
  { w: 'green', c: '#5DBB63' }, { w: 'blue', c: '#4A90E2' }, { w: 'purple', c: '#9B6BD6' },
  { w: 'pink', c: '#F28DB5' }, { w: 'brown', c: '#A8693D' },
];
// 몬스터의 부분: 말하는 이름 (색 이름과 이어서 "Pink nose!")
export const MONSTER_PARTS = ['hat', 'horns', 'eyes', 'nose', 'mouth', 'belly', 'arms', 'feet'];

/* ---------- 말하기 ---------- */
// 따라 말하기·받아쓰기: 짧은 말(4단계)과 문장(5단계)
export const EN_PHRASES = [
  ['Good morning!', '🌅'], ['Thank you!', '🙏'], ['I am happy.', '😊'], ['Nice to meet you!', '🤝'],
  ['See you later!', '👋'], ['I like it!', '👍'], ['Look at me!', '🙋'], ["Let's play!", '🧸'],
];
export const EN_SENTENCES = [
  ['I like apples.', '🍎'], ['The cat is big.', '🐱'], ['I can jump.', '🤸'], ['The sun is hot.', '☀️'],
  ['I see a red bus.', '🚌'], ['My dog can run.', '🐶'], ['I have a ball.', '⚽'], ['The fish can swim.', '🐟'],
];
// 따라 말하기(SayHo): 가수가 외치는 말
export const SAYHO_LINES = [
  ['Hello!', 'Yeah!', 'Wow!', 'Hooray!', 'Hey!', 'Ho!'],
  ['Say hello!', 'Good job!', "Let's go!", 'Yes, I can!', 'Clap, clap!'],
  ['I like music!', 'Clap your hands!', 'Jump up high!', 'Sing with me!', 'Stomp your feet!'],
  ['We love to sing!', 'Everybody dance now!', 'Turn around and clap!', 'Make some noise!'],
  ['Put your hands up in the air!', 'Sing it loud and sing it proud!', 'We are happy, yes we are!', 'Dance and sing with all your friends!'],
];
// 단어 그리기(PainttheWord): 말하면 그려지는 것
export const PAINT_THINGS = [
  ['sun', '☀️', 'sky'], ['moon', '🌙', 'sky'], ['star', '⭐', 'sky'], ['cloud', '☁️', 'sky'], ['rainbow', '🌈', 'sky'], ['bird', '🐦', 'sky'],
  ['tree', '🌳', 'land'], ['flower', '🌸', 'land'], ['house', '🏠', 'land'], ['car', '🚗', 'land'], ['cat', '🐱', 'land'], ['dog', '🐶', 'land'],
  ['apple', '🍎', 'land'], ['ball', '⚽', 'land'], ['fish', '🐟', 'water'], ['boat', '⛵', 'water'], ['duck', '🦆', 'water'], ['frog', '🐸', 'land'],
];
// 읽고 답해요(ReadingActivity): 짧은 글과 질문 (답은 보기의 첫 번째)
export const READ_PASSAGES = [
  { min: 1, lines: ['토끼가 깡충 뛰어요.', '토끼는 당근을 좋아해요.'], q: '토끼는 무엇을 좋아해요?', a: [['당근', '🥕'], ['사과', '🍎'], ['우유', '🥛']] },
  { min: 1, lines: ['비가 와요.', '나는 우산을 써요.'], q: '비가 올 때 무엇을 써요?', a: [['우산', '☂️'], ['모자', '👒'], ['장갑', '🧤']] },
  { min: 1, lines: ['고양이가 자요.', '고양이 옆에 공이 있어요.'], q: '고양이 옆에 무엇이 있어요?', a: [['공', '⚽'], ['책', '📕'], ['꽃', '🌸']] },
  { min: 2, lines: ['아침에 해가 떴어요.', '토리가 도토리를 모아요.', '도토리가 세 개예요.'], q: '도토리는 몇 개예요?', a: [['세 개', '3️⃣'], ['한 개', '1️⃣'], ['다섯 개', '5️⃣']] },
  { min: 2, lines: ['오리가 연못에 가요.', '오리는 물에서 헤엄쳐요.', '오리가 꽥꽥 울어요.'], q: '오리는 어디에 가요?', a: [['연못', '🌊'], ['산', '⛰️'], ['학교', '🏫']] },
  { min: 3, lines: ['오늘은 내 생일이에요.', '엄마가 케이크를 사 왔어요.', '친구들과 노래를 불렀어요.'], q: '엄마가 무엇을 사 왔어요?', a: [['케이크', '🎂'], ['풍선', '🎈'], ['인형', '🧸']] },
  { min: 3, lines: ['겨울이 되었어요.', '하얀 눈이 펑펑 내려요.', '동생과 눈사람을 만들었어요.'], q: '동생과 무엇을 만들었어요?', a: [['눈사람', '⛄'], ['모래성', '🏰'], ['종이배', '⛵']] },
  { min: 4, lines: ['우리는 동물원에 갔어요.', '기린은 목이 아주 길어요.', '코끼리는 코로 물을 뿌려요.', '나는 기린이 제일 좋아요.'], q: '나는 어떤 동물이 제일 좋아요?', a: [['기린', '🦒'], ['코끼리', '🐘'], ['사자', '🦁']] },
  { min: 4, lines: ['아빠와 공원에 갔어요.', '나는 자전거를 탔어요.', '아빠는 사진을 찍었어요.', '집에 와서 손을 씻었어요.'], q: '나는 공원에서 무엇을 탔어요?', a: [['자전거', '🚲'], ['기차', '🚂'], ['배', '⛵']] },
  { min: 5, lines: ['토리는 숲속에 살아요.', '가을이 되면 도토리를 모아요.', '모은 도토리는 나무 구멍에 숨겨요.', '겨울에는 숨겨 둔 도토리를 먹어요.'], q: '토리는 도토리를 어디에 숨겨요?', a: [['나무 구멍', '🌳'], ['바위 밑', '🪨'], ['연못 속', '🌊']] },
];
// 외계인 챗(AlienChat): 외계인이 묻고, 아이가 보기 중 하나로 대답한다. 대답마다 외계인의 맞장구
export const ALIEN_TALK = [
  { min: 1, q: 'Hello! I am Zib.', a: [['Hello!', '👋', 'Hello, hello! Nice to meet you!'], ['Hi!', '🙋', 'Hi! You look nice!']] },
  { min: 1, q: 'How are you?', a: [['I am happy.', '😊', 'Happy! Me too!'], ['I am sleepy.', '😴', 'Sleepy? Have a good nap!'], ['I am hungry.', '😋', 'Hungry? Let us eat!']] },
  { min: 1, q: 'Do you like cats?', a: [['Yes, I do!', '👍', 'Yay! Cats are cute!'], ['No, I don’t.', '👎', 'Okay! Maybe dogs?']] },
  { min: 2, q: 'What color do you like?', a: [['I like red.', '🔴', 'Red like an apple!'], ['I like blue.', '🔵', 'Blue like the sky!'], ['I like green.', '🟢', 'Green like a frog!']] },
  { min: 2, q: 'What did you eat today?', a: [['I ate rice.', '🍚', 'Rice! Yummy!'], ['I ate bread.', '🍞', 'Bread! Yummy!'], ['I ate an apple.', '🍎', 'An apple! So sweet!']] },
  { min: 3, q: 'How was your day?', a: [['It was great!', '🌟', 'Great! I am so glad!'], ['It was fun.', '🎈', 'Fun! Tell me more!'], ['It was okay.', '🙂', 'Okay! Tomorrow will be better!']] },
  { min: 3, q: 'What did you do today?', a: [['I played outside.', '🛝', 'Outside! Was it sunny?'], ['I read a book.', '📖', 'A book! I love books!'], ['I drew a picture.', '🎨', 'A picture! You are an artist!']] },
  { min: 4, q: 'Who did you play with?', a: [['I played with my friend.', '🧒', 'Friends are the best!'], ['I played with my mom.', '👩', 'Your mom is so nice!'], ['I played with my dog.', '🐶', 'A dog! Woof woof!']] },
  { min: 4, q: 'What is the weather like?', a: [['It is sunny.', '☀️', 'Sunny! Wear a hat!'], ['It is rainy.', '🌧️', 'Rainy! Take an umbrella!'], ['It is snowy.', '❄️', 'Snow! Let us make a snowman!']] },
  { min: 5, q: 'What do you want to do tomorrow?', a: [['I want to go to the park.', '🌳', 'The park! Have fun!'], ['I want to play with my friends.', '🧒', 'Play a lot with your friends!'], ['I want to eat ice cream.', '🍦', 'Ice cream! Yum yum!']] },
];
export const ALIEN_BYE = { q: 'I have to go now. Goodbye!', a: [['Goodbye!', '👋', 'Bye bye! See you soon!'], ['See you later!', '🛸', 'See you later, my friend!']] };

/* ---------- 영어 숫자 · 요일 · 달 ---------- */
const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
// 0~100을 영어 낱말로: 21 → twenty-one
export const numEn = (n) => (n >= 100 ? 'one hundred' : n < 20 ? EN_ONES[n] : EN_TENS[Math.floor(n / 10)] + (n % 10 ? `-${EN_ONES[n % 10]}` : ''));
export const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const EN_ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
// 수 세기 기초: 세는 물건 (하나 · 여럿)
export const EN_COUNT_ITEMS = [
  { e: '❤️', one: 'heart', many: 'hearts' }, { e: '🍎', one: 'apple', many: 'apples' }, { e: '⭐', one: 'star', many: 'stars' },
  { e: '🎈', one: 'balloon', many: 'balloons' }, { e: '🐟', one: 'fish', many: 'fish' }, { e: '🦆', one: 'duck', many: 'ducks' },
  { e: '🚗', one: 'car', many: 'cars' }, { e: '🌸', one: 'flower', many: 'flowers' }, { e: '⚽', one: 'ball', many: 'balls' },
  { e: '🍦', one: 'ice cream', many: 'ice creams' }, { e: '🐞', one: 'ladybug', many: 'ladybugs' }, { e: '🍌', one: 'banana', many: 'bananas' },
];
// 퍼즐 매트릭스: 가로줄 성질 × 세로줄 성질 → 칸마다 둘을 합친 조각 (say: 조각을 끼우면 읽는 말)
export const MATRIX_SETS = {
  dress: {
    rows: [['hat', '👒'], ['bow', '🎀'], ['glasses', '👓'], ['crown', '👑']],
    cols: [['bunny', '🐰'], ['bear', '🐻'], ['cat', '🐱'], ['dog', '🐶']],
    say: (r, c) => `a ${c} with ${r === 'glasses' ? '' : 'a '}${r}`,
  },
  shape: {
    rows: [['red', '#E8574F'], ['blue', '#4A90E2'], ['yellow', '#F2C230'], ['green', '#5DBB63']],
    cols: [['circle'], ['square'], ['triangle'], ['star'], ['heart']],
    say: (r, c) => `a ${r} ${c}`,
  },
};
// 단어 매트릭스: 첫소리(가로줄) × 끝소리(세로줄) — 판의 모든 칸이 진짜 단어가 되도록 고른 묶음
export const WORD_MATRIX = [
  [[['dr'], ['um', 'op']], [['tr'], ['ip', 'am']], [['sh'], ['ip', 'op']], [['h'], ['at', 'op']], [['p'], ['ig', 'in']]],
  [[['c', 'h'], ['at', 'op']], [['b', 'p'], ['ig', 'in']], [['f', 'p'], ['an', 'in']], [['m', 'h'], ['at', 'op']]],
  [[['b', 'h', 'r'], ['at', 'ug']], [['c', 'f', 'p'], ['an', 'at']], [['sh', 'ch', 'dr'], ['ip', 'op']]],
  [[['sh', 'ch'], ['ip', 'op']], [['cl', 'fl'], ['ap', 'ip']], [['dr', 'tr'], ['ip', 'ap']]],
  [[['b', 'p', 'f'], ['ig', 'it', 'in']], [['p', 't', 'm'], ['an', 'op', 'ug']]],
];
// 단어 축구(영어): 빈칸에 들어갈 기능어 — [그림, 빈칸 앞, 정답, 빈칸 뒤]
export const EN_KICK = {
  aan: { opts: ['a', 'an'], items: [
    ['🍎', 'I see', 'an', 'apple.'], ['🥚', 'I see', 'an', 'egg.'], ['🐜', 'I see', 'an', 'ant.'], ['🦉', 'I see', 'an', 'owl.'],
    ['🍊', 'I see', 'an', 'orange.'], ['🐙', 'I see', 'an', 'octopus.'], ['☂️', 'I have', 'an', 'umbrella.'],
    ['🐱', 'I see', 'a', 'cat.'], ['🐶', 'I see', 'a', 'dog.'], ['⚽', 'I have', 'a', 'ball.'], ['🚌', 'I see', 'a', 'bus.'],
    ['🎩', 'I have', 'a', 'hat.'], ['🍌', 'I have', 'a', 'banana.'], ['🐟', 'I see', 'a', 'fish.']] },
  isare: { opts: ['is', 'are'], items: [
    ['🐱', 'The cat', 'is', 'big.'], ['🐱🐱', 'The cats', 'are', 'big.'], ['🐶', 'The dog', 'is', 'happy.'], ['🐶🐶', 'The dogs', 'are', 'happy.'],
    ['🦆', 'The duck', 'is', 'small.'], ['🦆🦆', 'The ducks', 'are', 'small.'], ['🍎', 'The apple', 'is', 'red.'], ['🍎🍎', 'The apples', 'are', 'red.'],
    ['🐻', 'The bear', 'is', 'cute.'], ['🐻🐻', 'The bears', 'are', 'cute.']] },
  pron: { opts: ['He', 'She', 'They'], items: [
    ['👦', '', 'He', 'is my brother.'], ['👧', '', 'She', 'is my sister.'], ['👴', '', 'He', 'is my grandpa.'], ['👵', '', 'She', 'is my grandma.'],
    ['👫', '', 'They', 'are my friends.'], ['👨', '', 'He', 'is my dad.'], ['👩', '', 'She', 'is my mom.'], ['🐶🐱', '', 'They', 'are my pets.']] },
  verb: { opts: null, items: [
    ['👦🍎', 'He', 'likes', 'apples.', 'like'], ['🙋🍎', 'I', 'like', 'apples.', 'likes'], ['👧🥛', 'She', 'likes', 'milk.', 'like'],
    ['👫🎂', 'They', 'like', 'cake.', 'likes'], ['👦🏃', 'He', 'runs', 'fast.', 'run'], ['👫🏃', 'We', 'run', 'fast.', 'runs'],
    ['🐸', 'The frog', 'jumps', 'high.', 'jump'], ['🐸🐸', 'The frogs', 'jump', 'high.', 'jumps']] },
};
// 젤리 붙이기(영어): [앞 젤리, 줄기 젤리, 붙일 젤리, 뒤 말] — 붙이면 한 낱말이 된다
export const EN_JELLY = [
  [['They are', 'cat', 's', '.'], ['They are', 'dog', 's', '.'], ['They are', 'box', 'es', '.'], ['They are', 'bus', 'es', '.'], ['They are', 'hat', 's', '.'], ['They are', 'fox', 'es', '.'], ['They are', 'pen', 's', '.']],
  [['They are', 'dish', 'es', '.'], ['They are', 'lunch', 'es', '.'], ['They are', 'bab', 'ies', '.'], ['They are', 'cherr', 'ies', '.'], ['They are', 'bird', 's', '.'], ['They are', 'dress', 'es', '.'], ['They are', 'pupp', 'ies', '.']],
  [['They are', 'dish', 'es', '.'], ['They are', 'lunch', 'es', '.'], ['They are', 'wom', 'en', '.'], ['They are', 'child', 'ren', '.'], ['They are', 'fox', 'es', '.'], ['They are', 'm', 'en', '.'], ['They are', 'ox', 'en', '.']],
  [['He', 'jump', 's', 'high.'], ['She', 'wash', 'es', 'her hands.'], ['They are', 'jump', 'ing', '.'], ['He is', 'read', 'ing', 'a book.'], ['She', 'read', 's', 'a book.'], ['The bird', 'sing', 's', '.'], ['We are', 'sing', 'ing', '.'], ['He', 'catch', 'es', 'the ball.']],
  [['I', 'play', 'ed', 'yesterday.'], ['She', 'jump', 'ed', 'high.'], ['A bear is', 'big', 'ger', 'than a cat.'], ['A cat is', 'small', 'er', 'than a dog.'], ['It is the', 'tall', 'est', 'tree.'], ['He is', 'play', 'ing', 'now.'], ['We', 'walk', 'ed', 'home.'], ['It is the', 'fast', 'est', 'car.']],
];
// 우주 정비소: 주제(공구함 이름표)와 그 주제의 단어들
export const SPACE_SETS = [
  { name: 'kitchen', words: [['dishes', '🍽️'], ['spoon', '🥄'], ['fork', '🍴'], ['cup', '☕'], ['pot', '🍲'], ['knife', '🔪'], ['bowl', '🥣'], ['table', '🪑']] },
  ...EN_FLASH_SETS.map((s) => ({ name: s.name.toLowerCase(), words: s.words })),
];
// 시계 기차: 시각을 영어로 (o'clock · half past · quarter · 5분 단위)
export const timeEn = (hh, mm) => (mm === 0 ? [numEn(hh), "o'clock"] : mm === 30 ? ['half past', numEn(hh)] : mm === 15 ? ['quarter past', numEn(hh)]
  : mm === 45 ? ['quarter to', numEn(hh % 12 + 1)] : [numEn(hh), mm < 10 ? `oh ${numEn(mm)}` : numEn(mm)]);

// 한글 시각: 시는 고유어(세 시), 분은 한자어(삼십 분). 시계 기차 한글판이 읽고, 헷갈리는 읽기(삼 시 · 서른 분)를 함정으로 쓴다
export const HOUR_KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
export const SINO_KO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이'];
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰'];
const NATIVE_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
export const sinoMin = (m) => `${['', '십', '이십', '삼십', '사십', '오십'][Math.floor(m / 10)]}${SINO_KO[m % 10]}`;
export const nativeMin = (m) => `${NATIVE_TENS[Math.floor(m / 10)]}${NATIVE_ONES[m % 10]}`;
export const timeHangul = (hh, mm) => `${HOUR_KO[hh]} 시${mm ? ` ${sinoMin(mm)} 분` : ''}`;

export const BOOKS = [
  {
    title: 'Colors Everywhere', min: 1, max: 2,
    pages: [
      { art: '🍎', bg: '#FFE8E3', text: 'A red apple.', ko: '빨간 사과.' },
      { art: '🍌', bg: '#FFF3CF', text: 'A yellow banana.', ko: '노란 바나나.' },
      { art: '🐸', bg: '#E2F3E2', text: 'A green frog.', ko: '초록 개구리.' },
      { art: '🐳', bg: '#E2F0FF', text: 'A blue whale.', ko: '파란 고래.' },
      { art: '🌈', bg: '#EFE8FF', text: 'I like all the colors!', ko: '나는 모든 색이 좋아요!' },
    ],
  },
  {
    title: "Tori's Big Acorn", min: 1, max: 3,
    pages: [
      { art: '🐿️', bg: '#FFF3CF', text: 'This is Tori.', ko: '이 친구는 토리예요.' },
      { art: '🐿️ 🌳', bg: '#E2F3E2', text: 'Tori sees a big tree.', ko: '토리가 커다란 나무를 봐요.' },
      { art: '🌳 🌰', bg: '#E2F0FF', text: 'Look! An acorn!', ko: '보세요! 도토리예요!' },
      { art: '🌰 🌰 🌰', bg: '#FFE8E3', text: 'One, two, three acorns.', ko: '도토리 하나, 둘, 셋.' },
      { art: '🐿️ 💛', bg: '#EFE8FF', text: 'Tori is very happy!', ko: '토리는 정말 기뻐요!' },
    ],
  },
  {
    title: 'Tori and the Rain', min: 3, max: 5,
    pages: [
      { art: '🐿️ ☀️', bg: '#FFF3CF', text: 'Tori plays in the sun.', ko: '토리가 햇볕 아래에서 놀아요.' },
      { art: '☁️ ☁️', bg: '#E8EEF5', text: 'Look! Big gray clouds are coming.', ko: '보세요! 커다란 회색 구름이 와요.' },
      { art: '🌧️ 🐿️', bg: '#E2F0FF', text: 'Drip, drop! It is raining.', ko: '똑, 똑! 비가 와요.' },
      { art: '🍄 🐿️', bg: '#FFE8E3', text: 'Tori hides under a red mushroom.', ko: '토리는 빨간 버섯 아래에 숨어요.' },
      { art: '🌈', bg: '#EFE8FF', text: 'The rain stops. Tori sees a rainbow!', ko: '비가 그쳤어요. 토리가 무지개를 봐요!' },
      { art: '🐿️ 💛 🌈', bg: '#E2F3E2', text: 'What a happy day for Tori!', ko: '토리에게 정말 행복한 날이에요!' },
    ],
  },
  {
    title: "Tori's Winter Plan", min: 4, max: 5,
    pages: [
      { art: '🍂 🐿️', bg: '#FFE8E3', text: 'In the fall, the leaves turn red and yellow.', ko: '가을이 되면 나뭇잎이 빨갛고 노랗게 변해요.' },
      { art: '🌰 🌰', bg: '#FFF3CF', text: 'Tori collects acorns every single day.', ko: '토리는 날마다 도토리를 모아요.' },
      { art: '🌳 🕳️', bg: '#E2F3E2', text: 'Tori hides them in a hole in the old tree.', ko: '토리는 오래된 나무 구멍에 도토리를 숨겨요.' },
      { art: '❄️ ⛄', bg: '#E2F0FF', text: 'Soon, cold winter snow covers the forest.', ko: '곧 차가운 겨울 눈이 숲을 덮어요.' },
      { art: '🐿️ 🌰', bg: '#EFE8FF', text: 'Tori is warm and has lots of food to eat.', ko: '토리는 따뜻하고 먹을 것도 많아요.' },
      { art: '😴 🐿️', bg: '#E8EEF5', text: 'Good night, Tori. See you in the spring!', ko: '잘 자, 토리. 봄에 만나!' },
    ],
  },
];

/* ---------- 따라쓰기 획 데이터 (0~100 좌표, 배열 순서 = 획순, min = 등장 레벨) ---------- */
const oval = (cx, cy, rx, ry, n = 18) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = -Math.PI / 2 - (i * 2 * Math.PI) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
const S = (p) => ({ s: 1, p });

export const TRACE_SETS = {
  jamo: {
    lang: 'ko-KR',
    prompt: (it) => `${it.ch} (${it.say}) — 파란 점에서 출발해 모래 위에 따라 써 봐요!`,
    items: [
      { ch: 'ㄱ', say: '기역', min: 1, strokes: [[[22, 22], [78, 22], [78, 84]]] },
      { ch: 'ㄴ', say: '니은', min: 1, strokes: [[[24, 16], [24, 80], [82, 80]]] },
      { ch: 'ㄷ', say: '디귿', min: 2, strokes: [[[22, 20], [78, 20]], [[22, 20], [22, 80], [80, 80]]] },
      { ch: 'ㄹ', say: '리을', min: 3, strokes: [[[22, 16], [76, 16], [76, 48]], [[24, 48], [76, 48]], [[24, 48], [24, 84], [80, 84]]] },
      { ch: 'ㅁ', say: '미음', min: 2, strokes: [[[24, 20], [24, 80]], [[24, 20], [76, 20], [76, 80]], [[24, 80], [76, 80]]] },
      { ch: 'ㅂ', say: '비읍', min: 3, strokes: [[[26, 16], [26, 84]], [[74, 16], [74, 84]], [[26, 48], [74, 48]], [[26, 84], [74, 84]]] },
      { ch: 'ㅅ', say: '시옷', min: 1, strokes: [[[50, 16], [20, 84]], [[44, 44], [82, 84]]] },
      { ch: 'ㅇ', say: '이응', min: 1, strokes: [S(oval(50, 50, 30, 30))] },
      { ch: 'ㅈ', say: '지읒', min: 2, strokes: [[[22, 20], [76, 20], [24, 84]], [[51, 50], [82, 84]]] },
      { ch: 'ㅎ', say: '히읗', min: 3, strokes: [[[50, 8], [50, 22]], [[20, 32], [80, 32]], S(oval(50, 64, 21, 21))] },
      { ch: 'ㅏ', say: '아', min: 1, strokes: [[[40, 10], [40, 90]], [[40, 50], [72, 50]]] },
      { ch: 'ㅓ', say: '어', min: 1, strokes: [[[28, 50], [60, 50]], [[60, 10], [60, 90]]] },
      { ch: 'ㅗ', say: '오', min: 1, strokes: [[[50, 30], [50, 64]], [[14, 64], [86, 64]]] },
      { ch: 'ㅜ', say: '우', min: 1, strokes: [[[14, 36], [86, 36]], [[50, 36], [50, 82]]] },
      { ch: 'ㅣ', say: '이', min: 1, strokes: [[[50, 10], [50, 90]]] },
      // 커리큘럼 차시에서 쓰는 나머지 낱자 (min 6: 레벨로는 나오지 않고 차시가 고를 때만)
      { ch: 'ㅊ', say: '치읓', min: 6, strokes: [[[50, 8], [50, 20]], [[22, 30], [76, 30], [24, 88]], [[51, 58], [82, 88]]] },
      { ch: 'ㅋ', say: '키읔', min: 6, strokes: [[[22, 22], [78, 22], [78, 86]], [[22, 52], [76, 52]]] },
      { ch: 'ㅌ', say: '티읕', min: 6, strokes: [[[22, 18], [78, 18]], [[22, 48], [74, 48]], [[22, 18], [22, 82], [80, 82]]] },
      { ch: 'ㅍ', say: '피읖', min: 6, strokes: [[[18, 20], [82, 20]], [[36, 20], [36, 80]], [[64, 20], [64, 80]], [[14, 80], [86, 80]]] },
      { ch: 'ㄲ', say: '쌍기역', min: 6, strokes: [[[10, 22], [44, 22], [44, 84]], [[56, 22], [90, 22], [90, 84]]] },
      { ch: 'ㄸ', say: '쌍디귿', min: 6, strokes: [[[10, 20], [44, 20]], [[10, 20], [10, 80], [46, 80]], [[56, 20], [90, 20]], [[56, 20], [56, 80], [92, 80]]] },
      { ch: 'ㅃ', say: '쌍비읍', min: 6, strokes: [[[10, 16], [10, 84]], [[42, 16], [42, 84]], [[10, 48], [42, 48]], [[10, 84], [42, 84]], [[58, 16], [58, 84]], [[90, 16], [90, 84]], [[58, 48], [90, 48]], [[58, 84], [90, 84]]] },
      { ch: 'ㅆ', say: '쌍시옷', min: 6, strokes: [[[30, 16], [10, 84]], [[26, 44], [46, 84]], [[72, 16], [52, 84]], [[68, 44], [90, 84]]] },
      { ch: 'ㅉ', say: '쌍지읒', min: 6, strokes: [[[8, 20], [44, 20], [10, 84]], [[28, 50], [46, 84]], [[54, 20], [90, 20], [56, 84]], [[74, 50], [92, 84]]] },
      { ch: 'ㅡ', say: '으', min: 6, strokes: [[[12, 50], [88, 50]]] },
      { ch: 'ㅑ', say: '야', min: 6, strokes: [[[36, 10], [36, 90]], [[36, 36], [68, 36]], [[36, 64], [68, 64]]] },
      { ch: 'ㅕ', say: '여', min: 6, strokes: [[[26, 36], [58, 36]], [[26, 64], [58, 64]], [[58, 10], [58, 90]]] },
      { ch: 'ㅛ', say: '요', min: 6, strokes: [[[38, 34], [38, 64]], [[62, 34], [62, 64]], [[12, 64], [88, 64]]] },
      { ch: 'ㅠ', say: '유', min: 6, strokes: [[[12, 36], [88, 36]], [[38, 36], [38, 80]], [[62, 36], [62, 80]]] },
      { ch: 'ㅐ', say: '애', min: 6, strokes: [[[30, 10], [30, 90]], [[30, 50], [54, 50]], [[62, 10], [62, 90]]] },
      { ch: 'ㅔ', say: '에', min: 6, strokes: [[[22, 50], [44, 50]], [[44, 10], [44, 90]], [[70, 10], [70, 90]]] },
      { ch: 'ㅖ', say: '예', min: 6, strokes: [[[16, 36], [36, 36]], [[16, 62], [36, 62]], [[40, 10], [40, 90]], [[70, 10], [70, 90]]] },
      { ch: 'ㅘ', say: '와', min: 6, strokes: [[[30, 36], [30, 64]], [[8, 64], [52, 64]], [[66, 10], [66, 90]], [[66, 48], [90, 48]]] },
      { ch: 'ㅝ', say: '워', min: 6, strokes: [[[6, 40], [50, 40]], [[28, 40], [28, 80]], [[52, 56], [72, 56]], [[74, 10], [74, 90]]] },
      { ch: 'ㅟ', say: '위', min: 6, strokes: [[[8, 40], [60, 40]], [[34, 40], [34, 82]], [[78, 10], [78, 90]]] },
      { ch: 'ㅢ', say: '의', min: 6, strokes: [[[8, 54], [62, 54]], [[80, 10], [80, 90]]] },
      { ch: 'ㅚ', say: '외', min: 6, strokes: [[[34, 34], [34, 62]], [[8, 62], [60, 62]], [[78, 10], [78, 90]]] },
      { ch: 'ㅙ', say: '왜', min: 6, strokes: [[[26, 36], [26, 64]], [[6, 64], [46, 64]], [[58, 10], [58, 90]], [[58, 48], [74, 48]], [[84, 10], [84, 90]]] },
    ],
  },
  digits: {
    lang: 'ko-KR',
    prompt: (it) => `숫자 ${it.ch} — 초록 점에서 출발해 따라 써 봐요!`,
    items: [
      { ch: '0', say: '영', label: '영', min: 2, strokes: [S(oval(50, 50, 26, 37))] },
      { ch: '1', say: '일', label: '일 · 하나', min: 1, strokes: [[[50, 12], [50, 88]]] },
      { ch: '2', say: '이', label: '이 · 둘', min: 1, strokes: [S([[26, 30], [34, 16], [50, 11], [66, 16], [73, 30], [68, 46], [50, 64], [26, 88]]), [[26, 88], [78, 88]]] },
      { ch: '3', say: '삼', label: '삼 · 셋', min: 1, strokes: [S([[26, 22], [40, 12], [60, 12], [72, 24], [68, 40], [50, 48], [70, 56], [75, 72], [64, 86], [44, 89], [26, 80]])] },
      { ch: '4', say: '사', label: '사 · 넷', min: 1, strokes: [[[60, 12], [18, 64], [84, 64]], [[62, 36], [62, 90]]] },
      { ch: '5', say: '오', label: '오 · 다섯', min: 1, strokes: [S([[32, 12], [29, 46], [46, 40], [64, 44], [74, 60], [70, 78], [54, 88], [34, 86], [24, 78]]), [[32, 12], [74, 12]]] },
      { ch: '6', say: '육', label: '육 · 여섯', min: 2, strokes: [S([[68, 14], [50, 11], [34, 22], [26, 44], [27, 68], [38, 85], [54, 89], [69, 80], [73, 64], [64, 51], [48, 48], [33, 56], [27, 66]])] },
      { ch: '7', say: '칠', label: '칠 · 일곱', min: 2, strokes: [[[22, 14], [78, 14], [40, 88]]] },
      { ch: '8', say: '팔', label: '팔 · 여덟', min: 2, strokes: [S([[66, 24], [52, 12], [34, 16], [30, 32], [48, 46], [68, 58], [72, 76], [56, 89], [36, 87], [28, 72], [36, 56], [52, 46], [66, 34], [66, 24]])] },
      { ch: '9', say: '구', label: '구 · 아홉', min: 2, strokes: [S([[70, 28], [60, 14], [44, 12], [30, 22], [30, 38], [44, 48], [60, 46], [70, 30]]), [[70, 30], [66, 88]]] },
    ],
  },
  alpha: {
    lang: 'en-US',
    latin: true,
    prompt: (it) => `${it.ch} — 초록 점에서 출발해 따라 써 봐요!`,
    items: [
      { ch: 'A', word: 'apple', emoji: '🍎', min: 2, strokes: [[[50, 12], [18, 88]], [[50, 12], [82, 88]], [[31, 60], [69, 60]]] },
      { ch: 'C', word: 'cat', emoji: '🐱', min: 3, strokes: [S([[74, 26], [62, 15], [46, 13], [31, 20], [22, 35], [20, 52], [24, 68], [35, 82], [50, 88], [64, 85], [75, 74]])] },
      { ch: 'E', word: 'egg', emoji: '🥚', min: 1, strokes: [[[28, 12], [28, 88]], [[28, 12], [74, 12]], [[28, 50], [66, 50]], [[28, 88], [74, 88]]] },
      { ch: 'F', word: 'fish', emoji: '🐟', min: 1, strokes: [[[28, 12], [28, 88]], [[28, 12], [74, 12]], [[28, 50], [64, 50]]] },
      { ch: 'H', word: 'hat', emoji: '🎩', min: 1, strokes: [[[25, 12], [25, 88]], [[75, 12], [75, 88]], [[25, 50], [75, 50]]] },
      { ch: 'K', word: 'kite', emoji: '🪁', min: 2, strokes: [[[26, 12], [26, 88]], [[74, 12], [28, 54], [76, 88]]] },
      { ch: 'L', word: 'lion', emoji: '🦁', min: 1, strokes: [[[30, 12], [30, 88], [76, 88]]] },
      { ch: 'M', word: 'moon', emoji: '🌙', min: 2, strokes: [[[18, 12], [18, 88]], [[18, 12], [50, 62], [82, 12], [82, 88]]] },
      { ch: 'N', word: 'nest', emoji: '🪺', min: 2, strokes: [[[24, 12], [24, 88]], [[24, 12], [76, 88], [76, 12]]] },
      { ch: 'O', word: 'octopus', emoji: '🐙', min: 3, strokes: [S(oval(50, 50, 32, 37))] },
      { ch: 'T', word: 'tiger', emoji: '🐯', min: 1, strokes: [[[18, 14], [82, 14]], [[50, 14], [50, 88]]] },
      { ch: 'V', word: 'van', emoji: '🚐', min: 1, strokes: [[[20, 12], [50, 88], [80, 12]]] },
    ].map((it) => ({ ...it, say: `${it.ch}. ${it.ch} is for ${it.word}.`, label: `${it.word} ${it.emoji}` })),
  },
  // 도형 따라그리기(영어): 한 번에 이어 그리는 도형 (영어 이름을 읽어 준다)
  shapes: {
    lang: 'en-US',
    latin: true,
    prompt: (it) => `${it.say} (${it.ko}) — 초록 점에서 출발해 한 번에 따라 그려요!`,
    items: [
      { ch: '●', say: 'circle', ko: '원', min: 1, strokes: [S(oval(50, 50, 34, 34))] },
      { ch: '■', say: 'square', ko: '정사각형', min: 1, strokes: [[[20, 20], [80, 20], [80, 80], [20, 80], [20, 20]]] },
      { ch: '▲', say: 'triangle', ko: '삼각형', min: 1, strokes: [[[50, 14], [86, 82], [14, 82], [50, 14]]] },
      { ch: '▬', say: 'rectangle', ko: '직사각형', min: 2, strokes: [[[10, 28], [90, 28], [90, 72], [10, 72], [10, 28]]] },
      { ch: '◆', say: 'diamond', ko: '마름모', min: 2, strokes: [[[50, 10], [86, 50], [50, 90], [14, 50], [50, 10]]] },
      { ch: '⬮', say: 'oval', ko: '타원', min: 3, strokes: [S(oval(50, 50, 26, 40))] },
      { ch: '♥', say: 'heart', ko: '하트', min: 3, strokes: [S([[50, 30], [40, 16], [24, 14], [12, 28], [16, 48], [32, 66], [50, 86]]), S([[50, 30], [60, 16], [76, 14], [88, 28], [84, 48], [68, 66], [50, 86]])] },
      { ch: '★', say: 'star', ko: '별', min: 4, strokes: [[[50, 8], [62, 40], [94, 40], [68, 60], [78, 92], [50, 72], [22, 92], [32, 60], [6, 40], [38, 40], [50, 8]]] },
      { ch: '⬟', say: 'pentagon', ko: '오각형', min: 4, strokes: [[[50, 10], [88, 38], [74, 86], [26, 86], [12, 38], [50, 10]]] },
      { ch: '⬢', say: 'hexagon', ko: '육각형', min: 5, strokes: [[[30, 14], [70, 14], [90, 50], [70, 86], [30, 86], [10, 50], [30, 14]]] },
    ].map((it) => ({ ...it, label: it.say })),
  },
};

// 알파벳 52자 획 (대문자: 위 12 · 아래 88 / 소문자: 가운데 46 · 바닥 82 · 위로 14 · 아래로 99)
const LATIN_UPPER = {
  A: [[[50, 12], [18, 88]], [[50, 12], [82, 88]], [[31, 60], [69, 60]]],
  B: [[[28, 12], [28, 88]], S([[28, 12], [58, 12], [70, 20], [70, 40], [58, 48], [28, 48]]), S([[28, 48], [62, 48], [76, 58], [76, 78], [62, 88], [28, 88]])],
  C: [S([[74, 26], [62, 15], [46, 13], [31, 20], [22, 35], [20, 52], [24, 68], [35, 82], [50, 88], [64, 85], [75, 74]])],
  D: [[[28, 12], [28, 88]], S([[28, 12], [54, 12], [72, 26], [78, 50], [72, 74], [54, 88], [28, 88]])],
  E: [[[28, 12], [28, 88]], [[28, 12], [74, 12]], [[28, 50], [66, 50]], [[28, 88], [74, 88]]],
  F: [[[28, 12], [28, 88]], [[28, 12], [74, 12]], [[28, 50], [64, 50]]],
  G: [S([[74, 26], [62, 15], [46, 13], [31, 20], [22, 35], [20, 52], [24, 68], [35, 82], [50, 88], [64, 85], [76, 72], [76, 56]]), [[56, 56], [76, 56]]],
  H: [[[25, 12], [25, 88]], [[75, 12], [75, 88]], [[25, 50], [75, 50]]],
  I: [[[50, 12], [50, 88]], [[32, 12], [68, 12]], [[32, 88], [68, 88]]],
  J: [S([[66, 12], [66, 66], [60, 82], [48, 88], [36, 84], [30, 72]])],
  K: [[[26, 12], [26, 88]], [[74, 12], [28, 54], [76, 88]]],
  L: [[[30, 12], [30, 88], [76, 88]]],
  M: [[[18, 12], [18, 88]], [[18, 12], [50, 62], [82, 12], [82, 88]]],
  N: [[[24, 12], [24, 88]], [[24, 12], [76, 88], [76, 12]]],
  O: [S(oval(50, 50, 32, 37))],
  P: [[[28, 12], [28, 88]], S([[28, 12], [60, 12], [72, 22], [72, 42], [60, 52], [28, 52]])],
  Q: [S(oval(50, 48, 32, 36)), [[58, 66], [80, 90]]],
  R: [[[28, 12], [28, 88]], S([[28, 12], [60, 12], [72, 22], [72, 40], [60, 50], [28, 50]]), [[48, 50], [76, 88]]],
  S: [S([[72, 22], [60, 13], [42, 12], [28, 20], [26, 34], [38, 46], [62, 54], [74, 66], [70, 82], [54, 89], [36, 88], [24, 78]])],
  T: [[[18, 14], [82, 14]], [[50, 14], [50, 88]]],
  U: [S([[24, 12], [24, 64], [32, 82], [50, 88], [68, 82], [76, 64], [76, 12]])],
  V: [[[20, 12], [50, 88], [80, 12]]],
  W: [[[12, 12], [30, 88], [50, 36], [70, 88], [88, 12]]],
  X: [[[22, 12], [78, 88]], [[78, 12], [22, 88]]],
  Y: [[[22, 12], [50, 50]], [[78, 12], [50, 50], [50, 88]]],
  Z: [[[22, 12], [78, 12], [22, 88], [78, 88]]],
};
const LATIN_LOWER = {
  a: [S(oval(50, 64, 18, 18)), [[68, 46], [68, 82]]],
  b: [[[32, 14], [32, 82]], S(oval(50, 64, 18, 18))],
  c: [S([[66, 52], [56, 46], [42, 47], [32, 56], [30, 66], [34, 76], [46, 82], [58, 81], [67, 75]])],
  d: [S(oval(46, 64, 18, 18)), [[66, 14], [66, 82]]],
  e: [S([[32, 64], [66, 64], [64, 52], [54, 46], [40, 47], [31, 57], [30, 70], [38, 80], [52, 82], [64, 77]])],
  f: [S([[64, 18], [56, 13], [46, 14], [42, 24], [42, 82]]), [[30, 46], [58, 46]]],
  g: [S(oval(48, 62, 17, 16)), S([[66, 46], [66, 90], [58, 98], [44, 99], [34, 94]])],
  h: [[[32, 14], [32, 82]], S([[32, 58], [42, 48], [56, 46], [66, 54], [68, 64], [68, 82]])],
  i: [[[50, 46], [50, 82]], [[50, 28], [50, 31]]],
  j: [[[56, 46], [56, 92], [50, 99], [38, 98]], [[56, 28], [56, 31]]],
  k: [[[32, 14], [32, 82]], [[66, 46], [32, 66], [68, 82]]],
  l: [[[50, 14], [50, 82]]],
  m: [[[24, 46], [24, 82]], S([[24, 58], [32, 48], [42, 47], [48, 56], [48, 82]]), S([[48, 58], [56, 48], [66, 47], [74, 56], [74, 82]])],
  n: [[[32, 46], [32, 82]], S([[32, 58], [42, 48], [56, 46], [66, 54], [68, 64], [68, 82]])],
  o: [S(oval(50, 64, 19, 18))],
  p: [[[32, 46], [32, 99]], S(oval(50, 64, 18, 18))],
  q: [S(oval(48, 64, 18, 18)), [[66, 46], [66, 99]]],
  r: [[[36, 46], [36, 82]], S([[36, 60], [44, 50], [56, 46], [66, 48]])],
  s: [S([[64, 50], [54, 46], [40, 47], [34, 54], [40, 62], [58, 66], [66, 74], [60, 81], [46, 83], [34, 78]])],
  t: [[[46, 22], [46, 76], [52, 82], [62, 80]], [[32, 46], [62, 46]]],
  u: [S([[32, 46], [32, 72], [40, 82], [54, 82], [66, 72]]), [[66, 46], [66, 82]]],
  v: [[[30, 46], [50, 82], [70, 46]]],
  w: [[[22, 46], [34, 82], [50, 54], [66, 82], [78, 46]]],
  x: [[[32, 46], [68, 82]], [[68, 46], [32, 82]]],
  y: [[[32, 46], [50, 80]], [[68, 46], [42, 99]]],
  z: [[[32, 46], [68, 46], [32, 82], [68, 82]]],
};
TRACE_SETS.latin = {
  lang: 'en-US',
  latin: true,
  lines: true,
  prompt: (it) => `${it.ch} — 초록 점에서 출발해 따라 써 봐요!`,
  items: [...Object.entries(LATIN_UPPER), ...Object.entries(LATIN_LOWER)].map(([ch, strokes]) => ({ ch, strokes, say: ch, label: ch })),
};

// 선 긋기 · 따라 그리기: 곧은 선 → 곡선 → 지그재그 → 그림 (ko · en 이름)
const LINE_ITEMS = [
  { ch: '➖', ko: '가로선', en: 'straight line', min: 1, strokes: [[[12, 50], [88, 50]]] },
  { ch: '│', ko: '세로선', en: 'down line', min: 1, strokes: [[[50, 12], [50, 88]]] },
  { ch: '╲', ko: '비스듬한 선', en: 'slanted line', min: 1, strokes: [[[18, 18], [82, 82]]] },
  { ch: '◠', ko: '둥근 선', en: 'curve', min: 2, strokes: [S([[12, 70], [24, 40], [50, 26], [76, 40], [88, 70]])] },
  { ch: '〰', ko: '물결선', en: 'wavy line', min: 2, strokes: [S([[8, 50], [20, 34], [32, 50], [44, 66], [56, 50], [68, 34], [80, 50], [92, 66]])] },
  { ch: '⩘', ko: '지그재그', en: 'zigzag', min: 2, strokes: [[[8, 70], [26, 30], [44, 70], [62, 30], [80, 70], [92, 40]]] },
  { ch: '🌀', ko: '빙글빙글', en: 'spiral', min: 3, strokes: [S([[50, 50], [56, 46], [58, 54], [50, 60], [40, 54], [40, 42], [52, 34], [66, 40], [70, 56], [62, 70], [46, 74], [30, 66], [26, 48], [34, 30], [52, 22], [72, 28], [82, 46]])] },
  { ch: '➰', ko: '고리', en: 'loops', min: 3, strokes: [S([[8, 70], [22, 40], [34, 28], [40, 40], [30, 56], [22, 48], [34, 34], [52, 40], [58, 56], [48, 62], [44, 48], [60, 36], [74, 44], [76, 60], [66, 62], [64, 50], [80, 38], [92, 50]])] },
  { ch: '⛰️', ko: '산', en: 'mountain', min: 4, strokes: [[[8, 82], [32, 30], [50, 62], [70, 22], [92, 82]]] },
  { ch: '🏠', ko: '집', en: 'house', min: 4, strokes: [[[16, 48], [50, 16], [84, 48]], [[24, 48], [24, 86], [76, 86], [76, 48]]] },
  { ch: '🌈', ko: '무지개', en: 'rainbow', min: 5, strokes: [S([[8, 80], [14, 48], [32, 26], [50, 20], [68, 26], [86, 48], [92, 80]]), S([[26, 80], [30, 58], [42, 44], [50, 42], [58, 44], [70, 58], [74, 80]])] },
  { ch: '🐟', ko: '물고기', en: 'fish', min: 5, strokes: [S([[70, 50], [56, 34], [36, 32], [18, 42], [14, 50], [18, 58], [36, 68], [56, 66], [70, 50]]), [[70, 50], [90, 32], [90, 68], [70, 50]]] },
];
const lineSet = (lang) => ({
  lang: lang === 'en' ? 'en-US' : 'ko-KR',
  latin: lang === 'en',
  prompt: (it) => `${it.ko} — 초록 점에서 출발해 선을 따라 그려요!`,
  items: LINE_ITEMS.map((it) => ({ ...it, say: lang === 'en' ? it.en : it.ko, label: lang === 'en' ? it.en : it.ko })),
});
TRACE_SETS.lines = lineSet('ko');
TRACE_SETS.linesEn = lineSet('en');
// 도형 따라 그리기(수학): 영어판과 같은 도형을 한국어 이름으로
TRACE_SETS.shapesKo = {
  ...TRACE_SETS.shapes,
  lang: 'ko-KR',
  latin: false,
  prompt: (it) => `${it.ko} — 초록 점에서 출발해 한 번에 따라 그려요!`,
  items: TRACE_SETS.shapes.items.map((it) => ({ ...it, say: it.ko, label: it.ko })),
  // 단계별 도형 (참고 영상: 3단계 마름모 → 타원 → 육각형)
  pick(L) {
    const by = (names) => names.map((n) => this.items.find((it) => it.ko === n));
    if (L === 5) return pickN(by(['별', '하트', '오각형', '육각형']), 3);
    return by([['원', '정사각형', '삼각형'], ['직사각형', '마름모', '정사각형'], ['마름모', '타원', '육각형'], ['오각형', '하트', '별']][L - 1]);
  },
};
TRACE_SETS.jamo.items.forEach((it) => { it.label = it.say; });
