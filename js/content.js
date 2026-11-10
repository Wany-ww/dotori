// 새 놀이들이 함께 쓰는 학습 내용 (이름표 붙이기 · 낱말 로켓 · 동물 마트 · 십자말풀이 …)

// 이름표 붙이기: 장면마다 물건 [그림, 한국어, 영어] (장면 이름은 영어판 제목 고르기에 쓴다)
export const LABEL_SCENES = [
  { ko: '농장', en: 'Farm', bg: 'farm', things: [['🐄', '소', 'cow'], ['🐷', '돼지', 'pig'], ['🐔', '닭', 'hen'], ['🐴', '말', 'horse'], ['🐑', '양', 'sheep'], ['🚜', '트랙터', 'tractor'], ['🏠', '집', 'house'], ['🌳', '나무', 'tree']] },
  { ko: '바다', en: 'Sea', bg: 'sea', things: [['🐳', '고래', 'whale'], ['🐙', '문어', 'octopus'], ['🦀', '게', 'crab'], ['⛵', '배', 'boat'], ['🐚', '조개', 'shell'], ['🐟', '물고기', 'fish'], ['☀️', '해', 'sun'], ['🐢', '거북', 'turtle']] },
  { ko: '부엌', en: 'Kitchen', bg: 'kitchen', things: [['🍲', '냄비', 'pot'], ['🥄', '숟가락', 'spoon'], ['🍴', '포크', 'fork'], ['☕', '컵', 'cup'], ['🍞', '빵', 'bread'], ['🥛', '우유', 'milk'], ['🍎', '사과', 'apple'], ['🍳', '달걀', 'egg']] },
  { ko: '공원', en: 'Park', bg: 'park', things: [['🌳', '나무', 'tree'], ['🌸', '꽃', 'flower'], ['🐦', '새', 'bird'], ['🐕', '개', 'dog'], ['⚽', '공', 'ball'], ['🚲', '자전거', 'bike'], ['🪁', '연', 'kite'], ['🦋', '나비', 'butterfly']] },
  { ko: '교실', en: 'Classroom', bg: 'class', things: [['📕', '책', 'book'], ['✏️', '연필', 'pencil'], ['🎒', '가방', 'bag'], ['⏰', '시계', 'clock'], ['✂️', '가위', 'scissors'], ['🖍️', '크레파스', 'crayon'], ['🪑', '의자', 'chair'], ['📏', '자', 'ruler']] },
];

// 낱말 로켓 · 동물 마트: 갈래별 낱말 [그림, 한국어, 영어]
export const CATEGORIES = [
  { id: 'fruit', ko: '과일', en: 'fruit', e: '🍎', items: [['🍎', '사과', 'apple'], ['🍌', '바나나', 'banana'], ['🍇', '포도', 'grapes'], ['🍓', '딸기', 'strawberry'], ['🍉', '수박', 'watermelon'], ['🍋', '레몬', 'lemon'], ['🍑', '복숭아', 'peach'], ['🍐', '배', 'pear']] },
  { id: 'animal', ko: '동물', en: 'animals', e: '🐾', items: [['🐶', '강아지', 'dog'], ['🐱', '고양이', 'cat'], ['🐰', '토끼', 'rabbit'], ['🐻', '곰', 'bear'], ['🦁', '사자', 'lion'], ['🐘', '코끼리', 'elephant'], ['🐵', '원숭이', 'monkey'], ['🐷', '돼지', 'pig']] },
  { id: 'ride', ko: '탈것', en: 'things that go', e: '🚦', items: [['🚗', '자동차', 'car'], ['🚌', '버스', 'bus'], ['🚂', '기차', 'train'], ['✈️', '비행기', 'plane'], ['🚲', '자전거', 'bike'], ['⛵', '배', 'boat'], ['🚚', '트럭', 'truck'], ['🚀', '로켓', 'rocket']] },
  { id: 'drink', ko: '마실 것', en: 'drinks', e: '🥤', items: [['🥛', '우유', 'milk'], ['🧃', '주스', 'juice'], ['💧', '물', 'water'], ['🍵', '차', 'tea'], ['🥤', '콜라', 'soda'], ['🍫', '코코아', 'cocoa']] },
  { id: 'snack', ko: '간식', en: 'snacks', e: '🍪', items: [['🍪', '과자', 'cookie'], ['🍬', '사탕', 'candy'], ['🍰', '케이크', 'cake'], ['🍩', '도넛', 'donut'], ['🍦', '아이스크림', 'ice cream'], ['🍿', '팝콘', 'popcorn']] },
  { id: 'veg', ko: '채소', en: 'vegetables', e: '🥕', items: [['🥕', '당근', 'carrot'], ['🥔', '감자', 'potato'], ['🌽', '옥수수', 'corn'], ['🥒', '오이', 'cucumber'], ['🍅', '토마토', 'tomato'], ['🥦', '브로콜리', 'broccoli']] },
  { id: 'clothes', ko: '옷', en: 'clothes', e: '👕', items: [['👕', '티셔츠', 'shirt'], ['👖', '바지', 'pants'], ['👗', '원피스', 'dress'], ['🧦', '양말', 'socks'], ['🧢', '모자', 'cap'], ['🧤', '장갑', 'gloves']] },
  { id: 'school', ko: '학용품', en: 'school things', e: '🎒', items: [['✏️', '연필', 'pencil'], ['📕', '책', 'book'], ['✂️', '가위', 'scissors'], ['🖍️', '크레파스', 'crayon'], ['📏', '자', 'ruler'], ['🎒', '가방', 'bag']] },
];
// 동물 마트(영어): [그림, 하나, 여럿]
export const EN_SHOP = [
  ['🍎', 'apple', 'apples'], ['🍌', 'banana', 'bananas'], ['🍊', 'orange', 'oranges'], ['🍋', 'lemon', 'lemons'], ['🍑', 'peach', 'peaches'],
  ['🥕', 'carrot', 'carrots'], ['🍅', 'tomato', 'tomatoes'], ['🥔', 'potato', 'potatoes'], ['🍪', 'cookie', 'cookies'], ['🍩', 'donut', 'donuts'],
  ['🥚', 'egg', 'eggs'], ['🧁', 'cupcake', 'cupcakes'],
];
export const SHOPPERS = ['🐻', '🐰', '🐷', '🦊', '🐼', '🐨', '🐯', '🐸'];
// 영어 문장 놀이: [그림, 문장({빈칸 낱말}), 품사] — 단계 = 낱말 수
export const EN_SENT = [
  ['🐱', 'I like {cats}.', 'n', 1], ['🐶', 'I see a {dog}.', 'n', 1], ['🍎', 'I eat an {apple}.', 'n', 1], ['🏃', 'I can {run}.', 'v', 1], ['🐟', 'Fish can {swim}.', 'v', 1],
  ['☀️', 'The sun is {hot}.', 'a', 2], ['🐘', 'The elephant is {big}.', 'a', 2], ['🥛', 'I drink {milk} every day.', 'n', 2], ['🐦', 'The bird can {fly}.', 'v', 2], ['🚌', 'We go by {bus}.', 'n', 2],
  ['📖', 'She reads a {book} at night.', 'n', 3], ['⚽', 'He kicks the {ball} hard.', 'n', 3], ['🌧️', 'It is {rainy} today.', 'a', 3], ['🎂', 'We eat {cake} at the party.', 'n', 3], ['🐸', 'The frog {jumps} into the pond.', 'v', 3],
  ['🧸', 'My little sister loves her {teddy} bear.', 'n', 4], ['🌙', 'The moon is {bright} in the sky.', 'a', 4], ['🎨', 'I {paint} a picture for my mom.', 'v', 4], ['🚲', 'He rides his {bike} to school.', 'n', 4], ['🍕', 'We share a big {pizza} for lunch.', 'n', 4],
  ['⛄', 'We build a {snowman} in the yard after school.', 'n', 5], ['🐢', 'The turtle walks {slowly} to the river.', 'adv', 5], ['🌈', 'After the rain, a {rainbow} appears in the sky.', 'n', 5], ['🎵', 'My friends and I {sing} songs together.', 'v', 5], ['🦁', 'The lion is the {king} of the jungle.', 'n', 5],
];
// 얼음 맞추기 · 배를 고치자: 빠진 덩어리(낱말 → 구 → 절) [그림, 앞, 정답, 뒤, 함정들, 단계]
export const EN_CHUNKS = [
  ['🐧🐟', 'The penguin', 'eats', 'a fish.', ['sleeps', 'sings'], 1], ['🐻🍯', 'The bear', 'likes', 'honey.', ['runs', 'flies'], 1],
  ['🐶🦴', 'The dog', 'eats', 'a bone.', ['flies', 'reads'], 1], ['🐰🥕', 'The rabbit', 'likes', 'carrots.', ['swims', 'sings'], 1],
  ['🐦🌳', 'The bird', 'sits', 'in the tree.', ['runs', 'eats'], 2], ['👦⚽', 'He', 'kicks', 'the ball.', ['drinks', 'reads'], 2],
  ['🐱🛏️', 'The cat', 'sleeps', 'on the bed.', ['eats', 'swims'], 2], ['👧🎨', 'She', 'draws', 'a flower.', ['drinks', 'jumps'], 2],
  ['🐶🎾', 'The dog', 'plays with a ball', '.', ['drinks some milk', 'reads a book'], 3], ['👦🍦', 'The boy', 'eats an ice cream', '.', ['rides a bike', 'flies a kite'], 3],
  ['🐧🧊', 'The penguins', 'slide on the ice', '.', ['swim in the pool', 'sit on a chair'], 3], ['🧒🌳', 'The kids', 'climb a big tree', '.', ['eat a big cake', 'read a big book'], 3],
  ['☀️🍦', 'I eat ice cream', 'because it is hot', '.', ['because it is cold', 'when I am sleepy'], 4], ['🌧️☂️', 'I take my umbrella', 'because it is raining', '.', ['because it is sunny', 'when I am hungry'], 4],
  ['😴🛏️', 'I go to bed', 'when I am sleepy', '.', ['when I am hungry', 'because it is hot'], 4], ['🍽️😋', 'I eat lunch', 'when I am hungry', '.', ['when I am sleepy', 'because it is raining'], 4],
  ['🚢🔧', 'We can sail away', 'after we fix the ship', '.', ['before we eat lunch', 'because the sea is blue'], 5], ['🏖️🌊', 'We swim in the sea', 'when the sun is out', '.', ['when it is snowing', 'after we go to bed'], 5],
  ['📚✏️', 'I do my homework', 'before I play games', '.', ['after I fall asleep', 'when the moon is up'], 5], ['🧥❄️', 'I wear my coat', 'because it is snowing', '.', ['because it is hot', 'when I swim'], 5],
];
// 글자가 사라졌다: 공책의 짧은 글
export const EN_NOTES = [
  'I have a cat. My cat is big. It likes milk.',
  'The sun is hot. We go to the sea. We swim and play.',
  'Tom has a red ball. He kicks the ball. The dog runs.',
  'It is cold. I wear a hat. I make a snowman.',
  'Look at the bird. It can fly. It sings a song.',
  'My mom makes a cake. It is sweet. I eat it all.',
];
// 가까운 갈래(헷갈리기 쉬운 짝) — 높은 단계에서 함께 낸다
export const NEAR_CATS = [['fruit', 'veg'], ['drink', 'snack'], ['animal', 'ride'], ['clothes', 'school']];

// 문장 벽돌(SentenceBricks) 빈칸 문장 틀: 들어갈 수 있는 낱말(good)을 모두 찾고, 들어갈 수 없는 낱말(bad)은 남긴다.
// code: 이 틀을 먼저 쓰는 영어 단계, lv: 차시 난이도가 이 범위면 쓴다
export const BRICK_FRAMES = [
  { lv: [1, 2], frame: 'This is a ___.', good: ['cat', 'dog', 'ball', 'hat', 'pen', 'bag', 'cup'], bad: ['cats', 'dogs', 'balls', 'hats', 'apple', 'eggs'] },
  { lv: [1, 2], frame: 'I see two ___.', good: ['cats', 'dogs', 'apples', 'hats', 'cups', 'pens'], bad: ['cat', 'dog', 'apple', 'hat', 'cup', 'pen'] },
  { lv: [2, 3], code: 'F', frame: 'There are three ___.', good: ['boxes', 'buses', 'foxes', 'birds', 'trees', 'dishes'], bad: ['box', 'bus', 'fox', 'bird', 'tree', 'dish'] },
  { lv: [3], code: 'G', frame: 'She is ___.', good: ['happy', 'sad', 'tall', 'hungry', 'tired', 'kind'], bad: ['run', 'eat', 'apples', 'go', 'sings', 'books'] },
  { lv: [3, 4], code: 'M', frame: 'I like ___.', good: ['apples', 'cats', 'music', 'pizza', 'dogs', 'milk'], bad: ['happy', 'is', 'big', 'go', 'are', 'tall'] },
  { lv: [3, 4], frame: 'I can ___.', good: ['run', 'swim', 'jump', 'sing', 'read', 'dance'], bad: ['ran', 'swam', 'jumped', 'sang', 'happy', 'books'] },
  { lv: [4], code: 'O', frame: 'They are ___ now.', good: ['running', 'eating', 'singing', 'playing', 'swimming', 'dancing'], bad: ['run', 'ate', 'sing', 'played', 'swam', 'danced'] },
  { lv: [4], code: 'P', frame: 'These are my ___.', good: ['books', 'shoes', 'pens', 'toys', 'socks', 'cars'], bad: ['book', 'shoe', 'pen', 'toy', 'sock', 'car'] },
  { lv: [5], code: 'U', frame: 'A lion is ___ than a cat.', good: ['bigger', 'stronger', 'louder', 'faster', 'heavier'], bad: ['big', 'strong', 'loud', 'fast', 'heavy', 'biggest', 'tallest'] },
  { lv: [5], code: 'V', frame: 'Yesterday it was ___.', good: ['sunny', 'rainy', 'cold', 'hot', 'windy', 'cloudy'], bad: ['run', 'sang', 'is', 'are', 'eat', 'went'] },
  { lv: [5], code: 'W', frame: 'Yesterday I ___.', good: ['ran', 'swam', 'sang', 'played', 'cooked', 'danced'], bad: ['run', 'swim', 'sing', 'play', 'cook', 'dance'] },
  { lv: [5], code: 'X', frame: 'I did not ___ yesterday.', good: ['run', 'swim', 'sing', 'play', 'cook', 'read'], bad: ['ran', 'swam', 'sang', 'played', 'cooked', 'running'] },
  { lv: [5], code: 'Y', frame: 'He will ___ tomorrow.', good: ['read', 'sing', 'swim', 'cook', 'run', 'play', 'come'], bad: ['came', 'played', 'cooked', 'ran', 'sang'] },
];
