// 영어 24단계(Level A ~ Z) × 4차시 커리큘럼.
// 단계마다 학습 목표(goal)가 있고, 차시마다 그날 무엇을 배우는지(kind · letters · tags · show)를 정해 두면
// enLesson.js가 그 차시에 맞는 글자 · 단어 · 문장 · 대화 · 그림책을 골라 준다.
//   kind: alpha(알파벳 대·소문자) · sound(글자의 대표 음가) · initial(첫소리와 주제 단어) · family(단모음 단어 가족)
//         grammar(문장 규칙) · long(장모음) · context(문맥 읽기) · story(이야기 흐름과 독해)
//   letters: 이 차시에 새로 배우는 글자 · tags: 어휘 주제(enContent.js의 단어 꼬리표) · show: 오늘 배우는 것(화면 표시)
//   lv: 놀이 손놀림 난이도(보기 수 · 속도 등, 1~5)

export const EN_LEVELS = [
  {
    code: 'A', title: '알파벳 A ~ P', lv: 1, track: 'alpha',
    goal: '도토리숲의 디지털 영어 놀이 방식에 익숙해져요. 알파벳 A부터 P까지의 대/소문자를 정확하게 듣고, 따라 쓰고, 읽으면서 알파벳에 친숙해지며, 해당 알파벳으로 시작하는 대표 단어를 자연스럽게 익힐 수 있어요.',
    units: [
      { goal: '손가락으로 누르고, 끌고, 따라 그리며 놀이 방법에 익숙해져요. A, B, C, D의 대문자와 소문자를 듣고 따라 쓰고, apple · ball · cat · dog를 익혀요.', kind: 'alpha', letters: ['A', 'B', 'C', 'D'], intro: true },
      { goal: 'E, F, G, H의 대문자와 소문자를 듣고 따라 쓰고 읽어요. egg · fish · goat · hat처럼 이 글자로 시작하는 단어를 익혀요.', kind: 'alpha', letters: ['E', 'F', 'G', 'H'] },
      { goal: 'I, J, K, L의 대문자와 소문자를 듣고 따라 쓰고 읽어요. insect · juice · kite · lion처럼 이 글자로 시작하는 단어를 익혀요.', kind: 'alpha', letters: ['I', 'J', 'K', 'L'] },
      { goal: 'M, N, O, P의 대문자와 소문자를 듣고 따라 쓰고 읽어요. moon · nose · octopus · pig를 익히고 A부터 P까지 차례대로 말해요.', kind: 'alpha', letters: ['M', 'N', 'O', 'P'] },
    ],
  },
  {
    code: 'B', title: '알파벳 Q ~ Z', lv: 1, track: 'alpha',
    goal: '알파벳 Q부터 Z까지의 대/소문자를 정확하게 듣고, 따라 쓰고, 읽으면서 알파벳에 친숙해지며, 해당 알파벳으로 시작하는 대표 단어를 자연스럽게 익힙니다.',
    units: [
      { goal: 'Q, R, S의 대문자와 소문자를 듣고 따라 쓰고 읽어요. queen · rabbit · sun처럼 이 글자로 시작하는 단어를 익혀요.', kind: 'alpha', letters: ['Q', 'R', 'S'] },
      { goal: 'T, U, V의 대문자와 소문자를 듣고 따라 쓰고 읽어요. tiger · umbrella · van처럼 이 글자로 시작하는 단어를 익혀요.', kind: 'alpha', letters: ['T', 'U', 'V'] },
      { goal: 'W, X, Y, Z의 대문자와 소문자를 듣고 따라 쓰고 읽어요. whale · box · yo-yo · zebra를 익혀요.', kind: 'alpha', letters: ['W', 'X', 'Y', 'Z'] },
      { goal: 'A부터 Z까지 26개 알파벳의 대문자와 소문자를 차례대로 읽고, 빠진 글자를 찾고, 짝을 맞추며 모두 복습해요.', kind: 'alpha', letters: [], review: true },
    ],
  },
  {
    code: 'C', title: '글자의 소리 · 파닉스 첫걸음', lv: 2, track: 'phonics',
    goal: '알파벳 글자의 대표 음가(Sound)를 연습하면서 파닉스의 개념을 처음 접하고, 주요 단어를 배우면서 영어 단어와 철자에 흥미를 가지기 시작해요. 뜻은 몰라도 읽을 수 있는 단어들이 생기기 시작하는 단계에요.',
    units: [
      { goal: '자음 b, c, d, f, g, h의 대표 소리를 듣고 따라 해요. ball의 /b/, cat의 /k/처럼 글자와 소리를 이어요.', kind: 'sound', letters: ['B', 'C', 'D', 'F', 'G', 'H'] },
      { goal: '자음 j, k, l, m, n, p의 대표 소리를 듣고 따라 해요. 소리를 듣고 그 소리로 시작하는 단어를 찾아요.', kind: 'sound', letters: ['J', 'K', 'L', 'M', 'N', 'P'] },
      { goal: '자음 r, s, t, v, w, y, z의 대표 소리를 듣고 따라 해요. 처음 보는 단어도 첫소리로 읽어 봐요.', kind: 'sound', letters: ['R', 'S', 'T', 'V', 'W', 'Y', 'Z'] },
      { goal: '모음 a, e, i, o, u의 짧은 소리를 익히고, cat · bed · pig · dog · sun처럼 세 글자 단어를 소리 내어 읽어요.', kind: 'sound', letters: ['A', 'E', 'I', 'O', 'U'], vowels: true },
    ],
  },
  {
    code: 'D', title: '첫소리와 주제 단어', lv: 2, track: 'word', challenge: 'word',
    goal: '단어의 시작 음가를 인식하고 구분할 수 있어요. 파닉스와 주제별/필수 단어들의 학습을 본격적으로 시작해요. 워드챌린지(Word Challenge) 도전이 가능한 단계로 드릴링(Drilling) 학습이 강화되고, 다양한 말하기 액티비티 활동이 확대됩니다.',
    units: [
      { goal: '동물 이름의 첫소리를 듣고 구분해요. cat과 dog, pig와 bear처럼 첫소리가 다른 단어를 골라 말해요.', kind: 'initial', tags: ['animal'], show: '🐾 animals' },
      { goal: '음식과 과일 이름의 첫소리를 구분하고, 단어를 여러 번 듣고 읽고 말하며 익혀요.', kind: 'initial', tags: ['food', 'fruit'], show: '🍎 food' },
      { goal: '색깔과 숫자 단어를 익혀요. red · blue · one · two를 듣고 고르고 따라 말해요.', kind: 'initial', tags: ['color', 'number'], show: '🎨 colors · 123' },
      { goal: '몸과 옷 이름을 익히고, 워드챌린지로 이 단계의 단어를 모두 읽어 봐요.', kind: 'initial', tags: ['body', 'clothes'], show: '👕 body · clothes' },
    ],
  },
  {
    code: 'F', title: '단어 가족 · 사이트워드 · 복수형', lv: 3, track: 'word', challenge: 'phonics',
    goal: '파닉스와 주제별/필수 단어 습득, 사이트워드(Sight Words) 학습을 지속하며, 파닉스챌린지(Phonics Challenge) 도전이 가능한 단계입니다. 명사의 복수형이나 인칭 대명사를 배우면서 기초 문법(syntax)을 시작해요.',
    units: [
      { goal: '짧은 a 소리 단어 가족(-at, -an, -ap)을 읽고, 하나일 때와 여럿일 때(cat → cats) 복수형 -s를 붙여요.', kind: 'family', vowel: 'a', show: '-at · -an · -s', jelly: 0 },
      { goal: '짧은 i · o 소리 단어 가족(-ig, -in, -op, -ot)을 읽고, the · a · is · see · can 같은 사이트워드를 바로 읽어요.', kind: 'family', vowel: 'io', show: '-ig · -op · the · see' },
      { goal: 'I, you, he, she, it, we, they 인칭 대명사를 배우고, 가족을 가리키며 알맞은 대명사로 말해요.', kind: 'family', vowel: 'any', tags: ['family'], show: 'I · you · he · she · they' },
      { goal: '짧은 e · u 소리 단어 가족(-en, -et, -ug, -un)을 읽고, box → boxes처럼 복수형 -es를 붙여요. 파닉스챌린지에 도전해요.', kind: 'family', vowel: 'eu', show: '-en · -ug · -es', jelly: 1 },
    ],
  },
  {
    code: 'G', title: 'be동사 2형식 문장', lv: 3, track: 'sentence',
    goal: '영어의 기본 문장 구조를 접하면서 한글과 품사 배열이 다름을 인지합니다. 주어(subject) - 동사(verb) - 보어(complement)로 구성된 2형식 문장과 be동사(am, is, are)의 특성을 배우게 돼요.',
    units: [
      { goal: '"I am happy."처럼 I 다음에는 am을 써요. 우리말(나는 행복해요)과 단어 순서가 다르다는 것을 알아요.', kind: 'grammar', tags: ['feeling'], show: 'I am ~' },
      { goal: 'he, she, it 다음에는 is를 써요. "She is a doctor." "It is big."처럼 사람과 물건을 소개해요.', kind: 'grammar', tags: ['job'], show: 'He · She · It is ~' },
      { goal: 'we, you, they와 여럿 다음에는 are를 써요. "They are cats." "We are friends."', kind: 'grammar', tags: ['animal'], show: 'We · You · They are ~' },
      { goal: 'am, is, are를 주어에 맞게 골라 주어 - 동사 - 보어 순서로 문장을 만들어요.', kind: 'grammar', tags: ['feeling', 'animal'], show: 'am · is · are' },
    ],
  },
  {
    code: 'I', title: '묻고 답하기 · 문장 읽기', lv: 3, track: 'sentence',
    goal: '질문하고 답하는 문장 구조를 익히면서 친구들과 역할놀이가 가능해지고, 책을 읽으면서 문장을 이해하는 읽기 학습이 강화됩니다. 다양한 주제의 필수 단어들을 습득하고, 파닉스의 심화 학습과 기초 문법의 활용을 계속해서 연습해요.',
    units: [
      { goal: '"Is it a cat?" "Yes, it is. / No, it isn\'t."처럼 묻고 답해요. 질문은 is가 앞으로 나와요.', kind: 'grammar', tags: ['animal', 'toy'], show: 'Is it ~? Yes, it is.' },
      { goal: '"What is it?" "It is a ball."처럼 무엇인지 묻고 답해요.', kind: 'grammar', tags: ['toy', 'school'], show: 'What is it?' },
      { goal: '"Are you hungry?" "Yes, I am. / No, I\'m not."처럼 상대방에 대해 묻고 답하며 역할놀이를 해요.', kind: 'grammar', tags: ['feeling'], show: 'Are you ~?' },
      { goal: '"Who is she?" "She is my sister."처럼 사람에 대해 묻고 답하고, 짧은 그림책 문장을 읽고 이해해요.', kind: 'grammar', tags: ['family'], show: 'Who is ~?' },
    ],
  },
  {
    code: 'J', title: '느낌 표현 · 장모음', lv: 4, track: 'sentence',
    goal: '나의 감정이나 생각을 짧은 문장으로 표현할 수 있어요. 단모음과 장모음의 개념을 익혀 단어의 철자를 보다 정확하게 읽고 쓸 수 있어요. 다양한 주제의 필수 단어들을 습득하고, 파닉스의 심화 학습과 기초 문법의 활용을 계속해서 연습해요.',
    units: [
      { goal: '"I feel happy." "I am sad because I lost my toy."처럼 나의 감정을 짧은 문장으로 말해요.', kind: 'grammar', tags: ['feeling'], show: 'I feel ~' },
      { goal: '짧은 a(cat, hat)와 긴 a(cake, game)를 구분해요. 끝에 e가 붙으면 a가 이름 소리로 바뀌어요.', kind: 'long', vowel: 'a', show: 'a → a_e' },
      { goal: '짧은 i · o(pig, hot)와 긴 i · o(kite, rope)를 구분해 읽고 써요.', kind: 'long', vowel: 'io', show: 'i_e · o_e' },
      { goal: '"I think it is fun." "I want a new bike."처럼 나의 생각과 바람을 말하고, 긴 u · ee 소리(cube, tree)도 읽어요.', kind: 'long', vowel: 'ue', show: 'I think · I want' },
    ],
  },
  {
    code: 'K', title: '문맥으로 뜻 짐작하기', lv: 4, track: 'reading',
    goal: '단어가 많고 문장이 긴 책을 읽으면서 문맥(Context)을 파악하며, 이를 통해 책을 읽을 때 모르는 단어의 뜻을 유추해낼 수 있게 됩니다. 다양한 주제의 필수 단어들을 습득하고, 파닉스의 심화 학습과 기초 문법의 활용을 계속해서 연습해요.',
    units: [
      { goal: '동물 이야기를 읽으며 앞뒤 문장을 보고 모르는 단어의 뜻을 짐작해요.', kind: 'context', tags: ['animal', 'nature'], show: '📖 context · animals' },
      { goal: '날씨와 계절 이야기를 읽고, 문맥에 맞는 단어를 골라 빈칸을 채워요.', kind: 'context', tags: ['weather', 'nature'], show: '📖 context · weather' },
      { goal: '학교의 하루 이야기를 읽으며 처음 보는 단어를 그림과 문장으로 짐작해요.', kind: 'context', tags: ['school'], show: '📖 context · school' },
      { goal: '농장 나들이 이야기를 읽고, 긴 문장 속에서 단어의 뜻을 찾아요.', kind: 'context', tags: ['animal', 'food'], show: '📖 context · farm' },
    ],
  },
  {
    code: 'L', title: '이야기 흐름 · 독해', lv: 4, track: 'reading',
    goal: '책을 읽은 후에 이야기의 흐름을 정리하여 재배열하거나 향상된 독해력으로 이야기에 대한 질문에 구체적으로 답할 수 있어요. 미국 Grade-1 수준의 읽기와 쓰기가 가능해지는 레벨입니다.',
    units: [
      { goal: '이야기를 읽고 first, next, then, last 순서대로 장면을 다시 배열해요.', kind: 'story', tags: ['nature', 'animal'], show: '📚 first · next · last' },
      { goal: '이야기를 읽고 "Who?" "What?" 질문에 구체적으로 답해요.', kind: 'story', tags: ['food', 'family'], show: '📚 who · what' },
      { goal: '이야기를 읽고 "Where?" "When?" 질문에 답하며 장면을 떠올려요.', kind: 'story', tags: ['house', 'time'], show: '📚 where · when' },
      { goal: '이야기의 흐름을 정리해 다시 말하고, 그림을 보고 짧은 문장을 써요.', kind: 'story', tags: ['animal', 'nature'], show: '📚 retell · write' },
    ],
  },
  {
    code: 'M', title: '타이핑 · 좋아요 / 싫어요', lv: 4, track: 'sentence', typing: true,
    goal: '문장을 구성하고 쓰는 연습을 강화하기 위해서 QWERTY 키보드 타이핑 연습을 시작해요. 좋아하는 것과 싫어하는 것에 대해 묻고 답하며 정확한 표현으로 대화하는 법을 익힙니다.',
    units: [
      { goal: 'QWERTY 자판의 글자 자리를 익히며 단어를 쳐요. "I like apples."처럼 좋아하는 것을 말해요.', kind: 'grammar', tags: ['food', 'fruit'], show: '⌨️ I like ~' },
      { goal: '"I don\'t like snakes."처럼 싫어하는 것을 말하고, 짧은 문장을 자판으로 쳐요.', kind: 'grammar', tags: ['animal', 'food'], show: "⌨️ I don't like ~" },
      { goal: '"Do you like soccer?" "Yes, I do. / No, I don\'t."처럼 묻고 정확하게 답해요.', kind: 'grammar', tags: ['sport', 'food'], show: 'Do you like ~?' },
      { goal: '"What do you like?" "I like music."처럼 묻고 답하고, 내 대답을 자판으로 쳐서 문장을 완성해요.', kind: 'grammar', tags: ['sport', 'toy'], show: 'What do you like?' },
    ],
  },
  {
    code: 'N', title: '대화책 · 조동사 · 호칭', lv: 4, track: 'reading',
    goal: '대화 형식으로 이루어진 책을 읽고서 내용과 문맥을 파악합니다. 조동사와 다양한 호칭의 활용법을 익혀 복합적인 의미(Semantic Complexity)를 전달하는 문장을 읽고 이해할 수 있어요.',
    units: [
      { goal: '"I can swim." "Can you ride a bike?"처럼 할 수 있는 것과 없는 것을 대화로 읽고 말해요.', kind: 'grammar', tags: ['verb', 'sport'], show: 'can · can\'t', dialogBook: true },
      { goal: '"May I come in?" "Can I have some water?"처럼 허락을 구하는 대화를 읽고 답해요.', kind: 'grammar', tags: ['house', 'food'], show: 'May I ~?', dialogBook: true },
      { goal: '"You should wear a coat." "We must stop here."처럼 충고와 규칙을 말하는 문장을 이해해요.', kind: 'grammar', tags: ['clothes', 'place'], show: 'should · must', dialogBook: true },
      { goal: 'Mr., Mrs., Ms., Dr., Grandma 같은 호칭을 알맞게 써서 공손하게 대화해요.', kind: 'grammar', tags: ['job', 'family'], show: 'Mr. · Mrs. · Ms.', dialogBook: true },
    ],
  },
  {
    code: 'O', title: '일치하는 질문 · 형용사와 부사', lv: 5, track: 'sentence',
    goal: '인칭/수/동사가 일치하는 질문을 구성하며, 주어진 질문에 맞게 답하거나 주어진 대답에 알맞게 질문할 수 있어요. 형용사와 부사를 활용하여 동작, 사람, 사물, 장소 등을 길고, 수준 높은 문장으로 묘사합니다.',
    units: [
      { goal: '"Do you ~?" "Does he ~?"처럼 주어에 맞게 do와 does를 골라 질문을 만들어요.', kind: 'grammar', tags: ['verb'], show: 'Do · Does ~?' },
      { goal: '질문에 "Yes, she does."처럼 알맞게 답하고, 대답을 보고 알맞은 질문을 골라요.', kind: 'grammar', tags: ['verb', 'animal'], show: 'Yes, he does.' },
      { goal: '"a big brown dog"처럼 형용사로 사람, 사물, 장소를 길게 묘사해요.', kind: 'grammar', tags: ['animal', 'color'], show: 'a big red ball' },
      { goal: '"The turtle walks slowly."처럼 부사로 동작을 자세히 묘사해요.', kind: 'grammar', tags: ['verb'], show: 'slowly · quickly' },
    ],
  },
  {
    code: 'P', title: 'this · that · these · those', lv: 5, track: 'sentence',
    goal: '단어와 문장 구조를 익히는 과정에서 어휘력을 다지고, 문법 실력이 향상됩니다. 상황에 따라 this/that/these/those를 구분하여 문장을 구성하고, 대명사 또는 한정사로서 각각을 다르게 활용할 수 있어요.',
    units: [
      { goal: '가까이 있는 하나는 this, 멀리 있는 하나는 that으로 가리켜요. "This is my bag." "That is a bird."', kind: 'grammar', tags: ['school', 'animal'], show: 'this · that' },
      { goal: '가까이 있는 여럿은 these, 멀리 있는 여럿은 those로 가리켜요. "These are my shoes."', kind: 'grammar', tags: ['clothes', 'fruit'], show: 'these · those' },
      { goal: '대명사로 써요: "Is this yours?" "That is mine." 혼자서 물건을 가리키는 말로 써요.', kind: 'grammar', tags: ['toy', 'school'], show: 'This is ~ (대명사)' },
      { goal: '한정사로 써요: "This apple is red." "Those birds are small." 명사 앞에서 꾸며 줘요.', kind: 'grammar', tags: ['fruit', 'animal'], show: 'this apple (한정사)' },
    ],
  },
  {
    code: 'Q', title: '위치 · 문장 종류 · 목적어', lv: 5, track: 'sentence',
    goal: '사물이 위치한 장소를 묘사하고, 다양한 종류의 문장을 만들 수 있어요. 문장 내에서 지칭하는 명사에 따라 목적어를 구분하여 사용할 수 있으며, 정확한 문장을 구성하는 법을 익힙니다.',
    units: [
      { goal: 'in, on, under로 물건이 있는 곳을 말해요. "The cat is under the table."', kind: 'grammar', tags: ['house', 'toy'], show: 'in · on · under' },
      { goal: 'behind, next to, between, in front of로 위치를 더 자세히 말해요.', kind: 'grammar', tags: ['house', 'animal'], show: 'behind · next to' },
      { goal: 'me, you, him, her, it, us, them 중 가리키는 명사에 맞는 목적어를 골라요. "I like him."', kind: 'grammar', tags: ['family'], show: 'him · her · them' },
      { goal: '평서문, 의문문, 명령문, 감탄문을 구분하고 알맞은 문장 부호로 정확하게 써요.', kind: 'grammar', tags: ['verb'], show: '. ? !' },
    ],
  },
  {
    code: 'R', title: '시간과 때 · 하루 일과', lv: 5, track: 'sentence', time: true,
    goal: '숫자/요일/월에 관한 어휘를 확장하여 시간과 때를 나타내는 표현을 배우고, 의문사 What time, When 등을 활용하여 묻고 답할 수 있어요. 알맞은 전치사를 활용하여 나의 활동과 일과를 표현하는 문장을 만들 수 있어요.',
    units: [
      { goal: '"What time is it?" "It is seven o\'clock."처럼 시각을 묻고 답해요. 시각 앞에는 at을 써요.', kind: 'grammar', tags: ['time', 'number'], show: 'What time? · at 7' },
      { goal: '요일 이름을 익히고 "I go swimming on Monday."처럼 요일 앞에는 on을 써요.', kind: 'grammar', tags: ['day'], show: 'on Monday' },
      { goal: '달 이름을 익히고 "When is your birthday?" "It is in May."처럼 달 앞에는 in을 써요.', kind: 'grammar', tags: ['month'], show: 'When? · in May' },
      { goal: '"I get up at seven. I go to school at eight."처럼 나의 하루 일과를 시간 순서대로 말해요.', kind: 'grammar', tags: ['time', 'verb'], show: '⏰ daily routine' },
    ],
  },
  {
    code: 'S', title: '위치와 방향 · 빈도부사', lv: 5, track: 'sentence',
    goal: '위치와 방향을 나타내는 표현을 확장하여, 사람/사물/장소가 있는 곳을 더 구체적으로 묘사할 수 있어요. 빈도부사(Frequency Adverbs)의 쓰임을 익혀 나의 생활과 습관을 나타내는 표현을 구사할 수 있어요.',
    units: [
      { goal: '"Where is the bank?" "It is across from the park."처럼 마을의 장소가 어디 있는지 말해요.', kind: 'grammar', tags: ['place'], show: 'across from · near' },
      { goal: '"Go straight. Turn left."처럼 길을 묻고 방향을 알려 줘요.', kind: 'grammar', tags: ['place'], show: 'turn left · go straight' },
      { goal: 'always, usually, often, sometimes, never로 얼마나 자주 하는지 말해요.', kind: 'grammar', tags: ['verb', 'food'], show: 'always · never' },
      { goal: '"I usually read a book before bed."처럼 빈도부사로 나의 생활과 습관을 말해요.', kind: 'grammar', tags: ['verb', 'house'], show: '🔁 my habits' },
    ],
  },
  {
    code: 'T', title: '셀 수 있는 · 없는 명사 · 주문하기', lv: 5, track: 'sentence', count: true,
    goal: '다양한 범주의 가산/불가산(Countable/Uncountable) 명사를 배워 어휘를 확장합니다. 의문사 How many/How much를 활용하여 수량을 나타내는 질문과 답변을 주고받을 수 있어요. 음식을 구입하거나 주문하는 상황에 알맞은 회화 표현을 연습해요.',
    units: [
      { goal: '셀 수 있는 명사는 a/an을 붙이거나 여럿이면 -s를 붙여요. "three eggs"', kind: 'grammar', tags: ['food', 'fruit'], show: 'an egg · three eggs', jelly: 0 },
      { goal: 'water, milk, bread처럼 셀 수 없는 명사는 some이나 a glass of로 말해요.', kind: 'grammar', tags: ['drink', 'food'], show: 'some milk' },
      { goal: '"How many apples?" "How much milk?"처럼 수량을 묻고 답해요.', kind: 'grammar', tags: ['fruit', 'drink'], show: 'How many · How much' },
      { goal: '"Can I have a hamburger, please?" "I\'d like some juice."처럼 음식을 주문하고 사요.', kind: 'grammar', tags: ['food', 'drink'], show: '🍔 ordering food' },
    ],
  },
  {
    code: 'U', title: '비교급 · 최상급 · 의견 나누기', lv: 5, track: 'sentence',
    goal: '형용사의 비교급과 최상급 표현을 익혀 사람이나 물건을 서로 비교하며 묘사할 수 있어요. 또한, 다양한 수식어를 활용하여 질문과 문장을 구성할 수 있습니다. 사실(Facts)을 설명하거나 의견이 대립(Conflicts)할 때 조화롭게 대화하는 회화 스킬을 연습해요.',
    units: [
      { goal: '"An elephant is bigger than a dog."처럼 -er than으로 둘을 비교해요.', kind: 'grammar', tags: ['animal'], show: 'bigger than', jelly: 4 },
      { goal: '"The giraffe is the tallest animal."처럼 the -est로 가장 ~한 것을 말해요.', kind: 'grammar', tags: ['animal', 'nature'], show: 'the tallest' },
      { goal: 'more, most와 very, really, so 같은 수식어로 질문과 문장을 꾸며요.', kind: 'grammar', tags: ['nature', 'place'], show: 'more · most · very' },
      { goal: '사실을 설명하고, "I think ~." "I see, but ~." "Let\'s try both!"처럼 생각이 다를 때도 사이좋게 말해요.', kind: 'grammar', tags: ['food', 'sport'], show: 'I think · I agree' },
    ],
  },
  {
    code: 'V', title: 'be동사 과거 · 어린 시절', lv: 5, track: 'sentence',
    goal: 'Be 동사의 과거 시제를 배워 과거의 상태나 장소 등을 표현할 수 있으며, 현재와 과거를 나타내는 시간 표현을 사용하여 여러 시제를 상황에 맞춰 쓸 수 있어요. 나의 어린 시절에 대해 이야기하는 회화 표현도 함께 연습해요.',
    units: [
      { goal: 'am, is의 과거는 was예요. "I was sleepy yesterday." "It was sunny."', kind: 'grammar', tags: ['feeling', 'weather'], show: 'was' },
      { goal: 'are의 과거는 were예요. "We were at the park." "They were happy."', kind: 'grammar', tags: ['place'], show: 'were' },
      { goal: '"Where were you yesterday?" "Was it fun?"처럼 과거에 대해 묻고, now와 yesterday로 시제를 구분해요.', kind: 'grammar', tags: ['place', 'weather'], show: 'now · yesterday' },
      { goal: '"When I was a baby, I was very small."처럼 나의 어린 시절을 이야기해요.', kind: 'grammar', tags: ['family', 'feeling'], show: '👶 when I was little' },
    ],
  },
  {
    code: 'W', title: '일반동사 과거 · whose', lv: 5, track: 'sentence',
    goal: '일반 동사의 규칙/불규칙 과거형을 배워 과거 행동을 표현하고, 다양한 동사와 시간 표현을 사용하여 과거에 일어난 일을 구체적으로 묘사할 수 있어요. 또한, 의문사 whose를 활용하여 소유를 나타내는 회화 표현을 연습해요.',
    units: [
      { goal: 'play → played, jump → jumped처럼 규칙 과거형 -ed를 붙여 지난 일을 말해요.', kind: 'grammar', tags: ['verb'], show: '-ed', jelly: 4 },
      { goal: 'go → went, eat → ate, see → saw처럼 모양이 바뀌는 불규칙 과거형을 익혀요.', kind: 'grammar', tags: ['verb', 'food'], show: 'went · ate · saw' },
      { goal: 'yesterday, last week, two days ago 같은 시간 표현과 함께 과거에 일어난 일을 자세히 말해요.', kind: 'grammar', tags: ['verb', 'place'], show: 'yesterday · ago' },
      { goal: '"Whose bag is this?" "It\'s mine. / It\'s Tom\'s."처럼 누구의 물건인지 묻고 답해요.', kind: 'grammar', tags: ['school', 'clothes'], show: 'Whose ~?' },
    ],
  },
  {
    code: 'X', title: '과거 부정문 · 의문문 · 시간 접속사', lv: 5, track: 'sentence',
    goal: '일반 동사의 과거 시제를 부정문과 의문문으로 나타내어 과거 행동에 관해 묻고 답할 수 있으며, 다양한 시간 접속사를 활용한 복합 문장으로 특정 사건이 일어난 전후 상황에 대해 더욱 구체적으로 묘사할 수 있어요.',
    units: [
      { goal: '"I didn\'t eat breakfast."처럼 didn\'t + 동사원형으로 하지 않은 일을 말해요.', kind: 'grammar', tags: ['verb', 'food'], show: "didn't" },
      { goal: '"Did you see the movie?" "Yes, I did. / No, I didn\'t."처럼 과거의 일을 묻고 답해요.', kind: 'grammar', tags: ['verb', 'place'], show: 'Did you ~?' },
      { goal: '"I washed my hands before I ate."처럼 before, after로 일이 일어난 앞뒤를 말해요.', kind: 'grammar', tags: ['verb', 'house'], show: 'before · after' },
      { goal: '"When I got home, it was raining."처럼 when, while로 두 일을 한 문장에 이어 말해요.', kind: 'grammar', tags: ['verb', 'weather'], show: 'when · while' },
    ],
  },
  {
    code: 'Y', title: '미래 표현 · 공감하는 대화', lv: 5, track: 'sentence',
    goal: '미래 시제를 나타내는 여러 가지 어법과 문형을 배워 미래에 일어날 일들과 계획에 대해 표현할 수 있어요. 또한 상대방이 처한 상황에 공감하고 감정을 공유하는 대화를 연습하며 한층 성숙한 회화 표현을 익힙니다.',
    units: [
      { goal: '"It will rain tomorrow." "I will help you."처럼 will로 앞으로 일어날 일을 말해요.', kind: 'grammar', tags: ['weather', 'verb'], show: 'will' },
      { goal: '"I am going to visit my grandma."처럼 be going to로 정해 둔 계획을 말해요.', kind: 'grammar', tags: ['family', 'place'], show: 'be going to' },
      { goal: '"What will you do this weekend?"처럼 tomorrow, next week와 함께 계획을 묻고 답해요.', kind: 'grammar', tags: ['place', 'sport'], show: 'next week · this weekend' },
      { goal: '"I\'m sorry to hear that." "That sounds great!"처럼 친구의 기분에 공감하는 말을 해요.', kind: 'grammar', tags: ['feeling'], show: '💗 That sounds great!' },
    ],
  },
  {
    code: 'Z', title: '의문사 · 연결어 · 짧은 이야기', lv: 5, track: 'sentence',
    goal: '구체적인 정보를 요구하는 의문사의 활용을 확대하여 상태 또는 수단, 이유와 원인을 묻고 답할 수 있으며, 알맞은 연결어를 사용하여 연속되는 사건을 논리적으로 묘사하거나 다양한 주제로 짧은 이야기를 만들 수 있어요.',
    units: [
      { goal: '"How do you go to school?" "By bus." "How is the weather?"처럼 수단과 상태를 묻고 답해요.', kind: 'grammar', tags: ['ride', 'weather'], show: 'How ~?' },
      { goal: '"Why are you sad?" "Because I lost my cap."처럼 이유와 원인을 묻고 답해요.', kind: 'grammar', tags: ['feeling'], show: 'Why? · Because' },
      { goal: 'first, then, next, finally로 이어지는 일을 순서대로 말해요.', kind: 'grammar', tags: ['food', 'verb'], show: 'first · then · finally' },
      { goal: 'and, but, so, because로 문장을 이어 다양한 주제의 짧은 이야기를 만들어요.', kind: 'story', tags: ['weather', 'animal'], show: '✏️ my short story' },
    ],
  },
];

// 차시 하나가 하루치 오늘의 할 일이다 (24단계 × 4차시)
export const EN_UNITS = EN_LEVELS.flatMap((lv, li) => lv.units.map((u, i) => ({
  ...u, id: `${lv.code}-${i + 1}`, code: lv.code, levelIndex: li, no: i + 1,
  levelTitle: lv.title, levelGoal: lv.goal, lv: lv.lv, track: u.kind === 'story' && lv.track !== 'reading' ? 'reading' : lv.track,
  challenge: lv.challenge || null, typing: Boolean(lv.typing), time: Boolean(lv.time), count: Boolean(lv.count),
})));

// 오늘의 할 일 6칸: 갈래(track)마다 칸 이름과 후보 놀이. 칸마다 하나가 날마다 바뀌어 들어간다
const PLANS = {
  // A · B: 알파벳 — 듣기 → 쓰기 → 글자 → 단어 → 말하기 → 읽기
  alpha: [
    ['듣기', ['e-wash', 'e-listen', 'e-ispy']],
    ['쓰기', ['e-trace', 'e-card']],
    ['글자', ['e-abc', 'e-missing', 'e-memory', 'e-ispy', 'e-starfall']],
    ['단어', ['e-flash', 'e-easy', 'e-what', 'e-line']],
    ['말하기', ['e-talk', 'e-bird', 'e-sayho']],
    ['읽기', ['e-book']],
  ],
  // C: 글자의 소리 — 소리 → 소리 → 철자 → 단어 → 말하기 → 읽기
  phonics: [
    ['소리', ['e-phonics', 'e-wash', 'e-listen']],
    ['소리', ['e-dog', 'e-hat', 'e-ispy', 'e-strain']],
    ['철자', ['e-wtrace', 'e-card', 'e-balls', 'e-spell', 'e-machine', 'e-tower']],
    ['단어', ['e-flash', 'e-easy', 'e-what', 'e-memory', 'e-toy', 'e-line', 'e-starfall']],
    ['말하기', ['e-talk', 'e-bird', 'e-sayho', 'e-paint']],
    ['읽기', ['e-book']],
  ],
  // D · F: 첫소리 · 단어 — 소리 → 어휘 → 드릴 → 철자 → 말하기 → 챌린지(워드 · 파닉스)
  word: [
    ['소리', ['e-phonics', 'e-dog', 'e-hat', 'e-listen', 'e-strain']],
    ['어휘', ['e-flash', 'e-easy', 'e-what', 'e-toy', 'e-space', 'e-label', 'e-line', 'e-quiz']],
    ['드릴', ['e-memory', 'e-machine', 'e-search', 'e-rocket', 'e-wmatrix', 'e-starfall']],
    ['철자', ['e-spell', 'e-balls', 'e-wtrace', 'e-note', 'e-cross', 'e-tower']],
    ['말하기', ['e-talk', 'e-bird', 'e-paint', 'e-sayho', 'e-petdict']],
    ['챌린지', ['e-quiz']],
  ],
  // G ~ Z: 문장 — 어휘 → 문장 규칙 → 문장 만들기 → 쓰기 → 말하기 → 읽기
  sentence: [
    ['어휘', ['e-flash', 'e-what', 'e-space', 'e-memory', 'e-line', 'e-machine', 'e-starfall', 'e-quiz']],
    ['문장 규칙', ['e-kicker', 'e-sticky', 'e-blank', 'e-cookie']],
    ['문장 만들기', ['e-bridge', 'e-bricks', 'e-ice', 'e-ship']],
    ['쓰기', ['e-spell', 'e-cross', 'e-search', 'e-note', 'e-missingw', 'e-tower']],
    ['말하기', ['e-alien', 'e-call', 'e-talk', 'e-petdict', 'e-bird']],
    ['읽기', ['e-book']],
  ],
  // K · L · N · Z-4: 읽기 — 어휘 → 읽기 → 문맥 → 문장 → 말하기 → 독해
  reading: [
    ['어휘', ['e-flash', 'e-what', 'e-space', 'e-memory', 'e-search', 'e-quiz']],
    ['읽기', ['e-book']],
    ['문맥', ['e-missingw', 'e-sticky', 'e-blank']],
    ['문장', ['e-bridge', 'e-ice', 'e-ship', 'e-bricks', 'e-cookie']],
    ['말하기', ['e-talk', 'e-alien', 'e-call', 'e-bird', 'e-petdict']],
    ['독해', ['e-story']],
  ],
};
// 단계 목표에 꼭 맞는 놀이는 그 칸에 먼저 넣는다 (차시 kind · 단계 특징별)
function tweak(unit, plan) {
  const at = (stage, games, only = false) => {
    const slot = plan.find((s) => s[0] === stage);
    if (slot) slot[1] = only ? games : [...new Set([...games, ...slot[1]])];
  };
  if (unit.intro) at('쓰기', ['e-tutor'], true);
  if (unit.code === 'B' && unit.review) at('글자', ['e-abc', 'e-missing'], true);
  if (unit.code === 'D') at('어휘', unit.tags.includes('color') ? ['e-color', 'e-count'] : ['e-label', 'e-rocket'], true);
  // 챌린지: D는 워드 챌린지, F는 파닉스 챌린지 칸이 날마다 있다
  if (unit.code === 'D') at('챌린지', ['e-wchal'], true);
  if (unit.code === 'F') at('챌린지', ['e-pchal'], true);
  // 그 밖의 단계는 단계의 마지막(4) 차시에 챌린지 칸이 하나 더 붙는다 (주간 평가)
  if (unit.no === 4 && unit.code !== 'D' && unit.code !== 'F') {
    plan.push(['챌린지', { alpha: ['e-wchal'], phonics: ['e-pchal'], word: ['e-wchal'], sentence: ['e-gchal', 'e-lchal'], reading: ['e-lchal'] }[unit.track]]);
  }
  if (unit.code === 'F' && unit.no !== 2) at('드릴', unit.jelly != null ? ['e-jelly', 'e-grocery'] : ['e-kicker'], true);
  if (unit.kind === 'long') at('어휘', ['e-machine', 'e-wmatrix', 'e-spell']);
  if (unit.typing) at('쓰기', ['e-type'], true);
  if (unit.time) at('어휘', unit.no === 1 || unit.no === 4 ? ['e-clock'] : ['e-days'], true);
  if (unit.count) at('어휘', unit.no === 4 ? ['e-grocery'] : ['e-count', 'e-grocery'], true);
  if (unit.jelly != null && unit.code !== 'F') at('문장 규칙', ['e-jelly'], true);
  if (unit.code === 'I' || unit.code === 'M' || unit.code === 'O' || unit.code === 'Y') at('말하기', ['e-alien'], true);
  if (unit.kind === 'context') at('문맥', ['e-missingw', 'e-sticky'], true);
  if (unit.code === 'Q' && unit.no === 4) at('문장 규칙', ['e-sticky', 'e-blank'], true);
  // J 단계부터는 문장 단계의 읽기 칸에도 이야기 독해를 넣는다
  if (unit.track === 'sentence' && unit.lv >= 4) at('읽기', ['e-book', 'e-story'], true);
  return plan;
}

export function planForUnit(unit) {
  const base = PLANS[unit.track].map(([stage, pool]) => [stage, [...pool]]);
  return tweak(unit, base).map(([stage, pool]) => ({ stage, pool }));
}

// 나이로 고르는 시작 차시 (부모님 화면에서 언제든 바꿀 수 있다)
export const startUnitForAge = (age) => {
  const id = { 3: 'A-1', 4: 'A-1', 5: 'A-1', 6: 'C-1', 7: 'D-1' }[age] || 'F-1';
  return EN_UNITS.findIndex((u) => u.id === id);
};
