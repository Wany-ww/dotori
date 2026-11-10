# 도토리숲 이미지 · 캐릭터 생성 프롬프트

지금 화면은 이모지와 CSS 그라디언트로 그려져 있어요. 아래 프롬프트로 일러스트를 만들면 그대로 갈아 끼울 수 있어요.
프롬프트는 이미지 생성 모델(Midjourney, DALL·E, Imagen, Firefly 등)에서 잘 통하도록 영어로 썼고, 한국어 설명을 붙였어요.

> 파일 경로 · 크기 · 완성된 프롬프트를 한 장씩 정리한 목록은 [asset-list.md](asset-list.md)에 있어요. 이 문서는 스타일 설명용이에요.

---

## 0. 공통 스타일 (모든 프롬프트 끝에 붙여요)

화면 틀은 "그림책 숲" 스타일로 바뀌었어요: 따뜻한 종이색 바탕, 채도를 조금 낮춘 숲 색, 테두리 대신 부드러운 그림자.
그림도 같은 결로 맞춰요.

```
picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper,
soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9,
violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

- 배경은 **가운데를 비워** 두세요(그 위에 게임 UI가 올라가요). 프롬프트에 `empty center area for UI, details only around the edges`를 넣어요.
- 캐릭터·물건은 **투명 배경 PNG**로 만들어요: `isolated on transparent background, centered, full body`.
- 글자가 들어간 이미지는 생성 모델이 한글을 틀리게 그려요. 글자는 항상 코드(CSS 폰트)로 올리고, 그림에는 `no text`를 꼭 넣어요.

---

## 1. 메인 캐릭터: 다람쥐 토리 🐿️

**코드가 바로 쓰는 파일**: 아래 이름으로 `assets/char/`에 넣으면 이모지 대신 그림이 나와요(파일이 없으면 이모지 그대로).

| 파일 (512×512 투명 WebP) | 쓰는 곳 |
|---|---|
| `assets/char/tori.webp` | 홈 인사 동그라미, 로그인, 수업 지도의 "지금 여기" |
| `assets/char/tori-cheer.webp` | 정답일 때 화면 아래에서 고개를 내밀며 칭찬 |
| `assets/char/tori-think.webp` | 두 번 틀렸을 때 "괜찮아, 다시 해 보자!" |

얼굴이 동그라미 안에 잘리므로 **가슴 위까지(bust) 가운데에** 오게 만들어요: `bust portrait, centered, head fills the upper two thirds`.

세 파일 말고 코드가 읽는 토리 그림은 아직 없어요. 아래 "표정·포즈"의 나머지 포즈는 만들어 두면 좋은 추가분이고, 쓰려면 화면에 따로 연결해야 해요.
기준 시트(`tori-sheet.png`, 2048×2048)는 표정을 만들 때 참조용으로만 쓰고 앱에는 넣지 않아요.

**캐릭터 시트 (먼저 만들어 기준으로 삼아요)**
```
character turnaround sheet of "Tori", a cute little squirrel mascot for a preschool learning app,
big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail,
warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf,
holding a shiny acorn, front view, 3/4 view, side view, back view, consistent proportions,
2.5 heads tall chibi proportions, white background
```

**표정 · 포즈 세트** (시트 이미지를 참조 이미지로 넣고 하나씩)
```
Tori the squirrel mascot, [POSE], same character design as reference, isolated on transparent background, full body
```
- `smiling, looking at viewer, friendly` → 기본 (`tori.webp`, 코드가 읽음)
- `jumping with both arms up, cheering, confetti` → 정답 · 보상 (`tori-cheer.webp`, 코드가 읽음)
- `tilting head, finger on chin, curious` → 두 번 틀렸을 때 (`tori-think.webp`, 코드가 읽음)
- 추가분 (아직 연결 안 됨):
  - `waving hello with one paw, big smile` → 인사
  - `pointing forward with paw, encouraging` → 안내
  - `hugging a big acorn, sleepy happy eyes` → 수업 완료

---

## 2. 게임 친구 캐릭터 (투명 배경 PNG, 1024×1024)

| 캐릭터 | 게임 | 프롬프트 |
|---|---|---|
| 부엉이 별지기 🦉 | 별빛 소리 | `a chubby round baby owl in lavender and navy feathers, big glowing yellow eyes, tiny night cap with a star, sitting on a crescent moon, cute chibi` |
| 여우 퀴즈 진행자 🦊 | 퀴즈의 시간 | `a cute fox quiz show host with a red bow tie and a tiny microphone, big friendly eyes, peach orange fur, standing on stage, cute chibi` |
| 병아리 키커 🐥 | 단어 축구 | `a round yellow chick soccer player in a mint jersey, about to kick a ball, determined happy face, cute chibi` |
| 펭귄 골키퍼 🐧 | 단어 축구 | `a small chubby penguin goalkeeper with big pink gloves, diving pose, surprised funny face, cute chibi` |
| 두더지 광부 🦫 | (예정) 보석 광산 | `a tiny mole miner with a yellow helmet lamp and a mint cart, cute chibi` |
| 보라 고양이 🐱 | 설명해 주세요 | `a friendly purple cat sitting behind a wooden desk, big round eyes, yellow-green collar, one paw raised as if explaining, upper body, cute chibi` (말할 때 입 벌린 것, 박수 치는 것 2장 더) |
| 몬스터 3형제 | 장난감 공장 | `three small round fluffy monsters in green, orange and violet, each with a tiny party hat and a single tooth, holding an empty cardboard box, cute chibi, three separate characters` |
| 트럭 기사님 | 말소리 정류장 | `a small cheerful bear truck driver with a cap, leaning out of a mint green toy truck window, waving, side view, cute chibi` |
| 마녀 꼬마 | 마법의 솥 | `a little witch girl with a big violet hat stirring a bubbling black cauldron, sparkles, cute chibi, no face paint` |
| 원숭이 | 열매를 받아라 | `a playful monkey swinging on a vine with one arm, big smile, cute chibi` |

---

## 3. 게임 장면 배경 (1920×1200 WebP, 가운데 비움)

만든 뒤 `css/tokens.css`의 변수에 넣으면 그 장면 맨 위 층에 깔려요. 예:
```css
--art-beach: url(../assets/scenes/beach.webp);
```

| 변수 · 파일 | 게임 | 프롬프트 (공통 스타일 덧붙이기) |
|---|---|---|
| `--art-beach` `beach.webp` | 모래사장 따라쓰기 | `top-down view of a sunny beach, turquoise sea with white foam waves across the top 15%, wide smooth golden sand below, a few seashells, a starfish and a tiny crab near the edges, empty center area for UI` |
| `--art-night` `night.webp` | 별빛 소리 | `dreamy night sky over soft rolling purple hills, crescent moon in the upper right, scattered twinkling stars and faint constellations, deep indigo to lavender gradient, empty center area for UI` |
| `--art-chalk` `chalk-room.webp` | 모여라 자음 모음 | `cozy wooden classroom wall made of warm light-oak planks, a small shelf with crayons and a potted plant at the edges, soft window light, empty center area for UI` |
| `--art-wood` `desk.webp` | 카드를 기억해 · 낱말 완성하기 | `top-down view of a warm light wooden desk with visible soft grain, a few pencils, an eraser and a sticker sheet at the very edges, empty center area for UI` |
| `--art-table` `table.webp` | 낱말 카드 · 같은 글자 짝 찾기 | `top-down view of a large honey-colored wooden tabletop with soft swirling wood grain filling the whole frame, a few acorns and autumn leaves at the very corners, empty center area for UI` |
| `--art-factory` `factory.webp` | 장난감 공장 | `cozy toy factory interior wall in deep lavender purple, a long pink shelf with gift boxes and toy robots across the middle, blue lockers and pipes at both edges, hanging lamps along the top, no conveyor belt, empty center area for UI` |
| `--art-meadow` `meadow.webp` | 누가 누가 다를까 | `sunny forest meadow by a calm blue lake, soft rolling green hills and round trees on both sides, bright grass covering the lower half, a few flowers at the very edges, empty center area for UI` |
| `--art-bath` `bath.webp` | 목욕 시간 | `bright bathroom with pale aqua square wall tiles, a pink clawfoot bathtub at the left edge, a white sink and round mirror at the right edge, mint checkered floor along the bottom, empty center area for UI` |
| `--art-book` `book-desk.webp` | 나를 찾아줘 | `top-down view of a warm dark wooden desk with a soft lamp glow in the middle and a few pencils and stickers at the very edges, empty center area for UI` |
| `--art-neon` `neon.webp` | 리듬 한글 | `dark navy music room with faint glowing cyan staff lines and tiny floating music notes and triangles, soft neon glow, empty center area for UI` |
| `--art-kitchen` `kitchen.webp` | 신기한 초콜릿 | `bright sky blue kitchen wall with a few hanging utensils and jars at the very edges, soft light, empty center area for UI` |
| `--art-city` `city.webp` | 말소리 정류장 | `pale lavender sky with soft flat city building silhouettes and a few clouds, gentle pastel tones, empty lower half for road and UI` |
| `--art-witch` `witch.webp` | 마법의 솥 | `cozy purple witch's room with faint brick wall, candles and a broom at the very edges, soft magical glow, empty center area for UI` |
| `--art-grove` `grove.webp` | 열매를 받아라 | `light green forest with soft leafy trees in the background edges, bright and calm, empty center area for UI` |
| `--art-study` `study.webp` | 설명해 주세요 | `cozy warm orange living room at sunset, floor lamp on the left, window frame and bookshelf on the right, wooden desk edge at the bottom, empty center area for UI` |
| `--art-notebook` `notebook.webp` | 문장 만들기 | `mint green grid notebook paper filling the frame, washi tape pieces and doodles of stars and hearts at the corners, empty center area for UI` |
| `--art-stage` `stage.webp` | 퀴즈의 시간 | `small theater stage with strawberry pink velvet curtains on both sides and a scalloped valance on top, warm spotlight in the middle, wooden stage floor at the bottom, empty center area for UI` |
| `--art-workshop` `workshop.webp` | 돌려라 글자판 | `cheerful toy workshop wall with butter yellow and cream stripes, pegboard with tiny gears and tools at the edges, wooden workbench at the bottom, empty center area for UI` |
| `--art-field` `field.webp` | 단어 축구 | `bright soccer field with striped green grass, light blue sky with fluffy clouds in the top 40%, small stands with cheering animal silhouettes far away, empty center area for UI` |
| `--art-mine` `mine.webp` | 보석 광산 | `cozy cartoon gem mine cave, plum and mauve rock walls with glowing pastel crystals at the edges, wooden support beams, a tiny mine cart rail along the bottom, lantern light, empty center area for UI` |
| `--art-space` `space.webp` | 숨은 낱말 찾기 | `cute pastel outer space, indigo to lavender gradient, a pink ringed planet in the upper right, a small blue planet in the lower left, a friendly UFO and tiny stars, empty center area for UI` |

---

## 4. UI 오브젝트 (투명 PNG)

| 파일 | 프롬프트 |
|---|---|
| `ui/jamo-block.png` (512) | `a single blank square wooden toy block, rounded corners, light maple wood with soft grain, front-facing, slight 3D depth, isolated on transparent background, no text` — 글자는 CSS로 올려요 |
| `ui/chalkboard.png` (1024×800) | `small green chalkboard with a chunky light wood frame, faint chalk dust smudges, front view, isolated, no text` |
| `ui/word-card.png` (1024×600) | `blank flash card with a mint green header strip and rounded corners, white paper texture, soft shadow, isolated, no text` |
| `ui/letter-machine.png` (1200×1000) | `cute retro slot machine toy in sky blue with three empty vertical reel windows and a yellow round button, rounded bubbly shape, front view, isolated, no text, no symbols in the reels` |
| `ui/card-back.png` (512×614) | `back side of a playing card for kids, strawberry pink with a white border and a repeating tiny acorn pattern, rounded corners, isolated` |
| `ui/stamp.png` (256) | `cute postage stamp with perforated edges and a tiny fox face, pastel colors, isolated, no text` |
| `ui/map-node.png` (256) | `round wooden stage marker for a level map, glossy pastel, with a small acorn emblem, isolated` |

---

## 5. 낱말 그림 카드 (512×512 투명 PNG, 같은 스타일로 한 번에)

모든 낱말 그림을 같은 스타일로 맞추려면 아래 틀에 `[OBJECT]`만 바꿔 같은 시드(seed)로 만들어요.
```
a single [OBJECT], cute simple sticker illustration for a toddler word card, centered, thick soft outline,
saturated pastel colors, isolated on transparent background, no text
```

| 낱말 | OBJECT | 낱말 | OBJECT | 낱말 | OBJECT |
|---|---|---|---|---|---|
| 고래 | blue whale | 사과 | red apple | 나비 | butterfly |
| 기차 | toy train | 모자 | sun hat | 우유 | milk carton |
| 포도 | bunch of grapes | 토끼 | white rabbit | 사자 | lion cub |
| 오리 | duckling | 바나나 | banana | 도토리 | acorn |
| 피자 | pizza slice | 하마 | hippo | 거미 | smiling spider |
| 시계 | alarm clock | 버스 | yellow bus | 자두 | plum |
| 강아지 | puppy | 고양이 | kitten | 사슴 | fawn deer |
| 연필 | pencil | 딸기 | strawberry | 수박 | watermelon slice |
| 우산 | umbrella | 기린 | giraffe | 선물 | gift box |
| 풍선 | balloon | 눈사람 | snowman | 자동차 | toy car |
| 비행기 | airplane | 햄버거 | hamburger | 코끼리 | elephant |
| 원숭이 | monkey | 병아리 | baby chick | 달팽이 | snail |
| 가방 | backpack | 라면 | bowl of noodles | 구름 | fluffy cloud |
| 무지개 | rainbow | 지구 | planet earth | 거북이 | turtle |
| 곰 | teddy bear | 달 | crescent moon | 별 | star |
| 산 | mountain | 문 | wooden door | 밤 | chestnut |
| 공 | soccer ball | 집 | little house | 손 | open hand |
| 물 | water drop | 빵 | loaf of bread | 책 | picture book |
| 꽃 | cherry blossom | 양말 | pair of socks | | |

---

## 6. 스티커북 (512×512 투명 PNG, 24종)

```
round die-cut sticker of a [ANIMAL] wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated, no text
```
ANIMAL: bunny, fox, bear, panda, koala, tiger, lion, frog, monkey, unicorn, octopus, butterfly, whale, owl, penguin, turtle, hedgehog, flamingo, ladybug, bee, baby dinosaur, dolphin, parrot, hamster

---

## 7. 수업 지도 배경 (1920×1320 WebP)

과목 페이지의 "오늘의 수업 지도"는 길과 단계 자리를 코드로 그려요. 그 **아래 바탕만** 이미지로 바꿀 수 있어요.
길은 코드가 그리므로 배경에는 길을 넣지 말고, 가운데 띠(위아래 30% 사이)와 두 줄 자리를 비워 두세요.

```
whimsical top-down landscape for a kids learning app level map, [THEME], decorations only along the edges
and in small clusters, large calm open areas, no road, no path, no numbers, no text
```

| 변수 | THEME |
|---|---|
| `--map-hangul` | `pastel mint forest meadow with round trees, mushrooms, flowers and a small pond` |
| `--map-math` | `candy desert with peach sand dunes, cacti, lollipop trees, tents and a tiny oasis` |
| `--map-english` | `sunny ocean with a big sandy island, palm trees, sailboats, shells and friendly fish` |

휴대폰 화면에서는 지도가 세로로 길어져요(375×1000). 세로용을 따로 만들고 싶다면 `vertical 9:24 composition`으로 한 장 더 만들어 미디어 쿼리에서 바꿔 끼우면 돼요.

---

## 8. 바깥 화면 일러스트 (새 "그림책 숲" 화면 틀용)

| 파일 | 크기 | 쓰는 곳 | 프롬프트 (공통 스타일 덧붙이기) |
|---|---|---|---|
| `assets/ui/home-hills.webp` | 2400×360, 아래쪽만 | 모든 바깥 화면 맨 아래 언덕 (지금은 SVG) | `wide panoramic strip of gentle rolling hills and a distant forest edge, tiny houses and acorn trees, soft morning light, very low contrast, flat bottom edge, empty sky` |
| `assets/ui/cover-hangul.webp` | 800×360 | 홈 과목 카드 윗부분(한글) | `a cozy reading nook in a hollow tree with floating soft letter-shaped blocks without any readable letters, coral and cream tones, room on the left for a big title` |
| `assets/ui/cover-math.webp` | 800×360 | 홈 과목 카드(수학) | `acorns lined up and counted by little forest animals on a sunny hill, sky blue tones, room on the left for a big title` |
| `assets/ui/cover-english.webp` | 800×360 | 홈 과목 카드(영어) | `a small sailboat carrying picture books across a calm violet sea at dusk, room on the left for a big title` |
| `assets/ui/reward-burst.webp` | 1024×1024 투명 | 보상 창 별 뒤의 햇살 | `radiant sunburst of soft golden rays and tiny leaves and acorns around an empty center, isolated on transparent background` |

과목 카드 그림을 쓰려면 `.subject-top`에 `background-image`로 깔고, 그 위의 글자(과목 이름)는 지금처럼 코드로 올려요.

## 9. 한글 14단계 배지 (256×256 투명 PNG, `assets/ui/stage-01.png` ~ `stage-14.png`)

과목 페이지의 "14단계 길"과 프로필에 쓰는 작은 배지예요. 같은 틀로 한 번에 만들어요.
```
round wooden badge medallion with a small leafy wreath, centered emblem of [EMBLEM], picture-book style, isolated on transparent background, no text, no numbers
```

| 단계 | EMBLEM | 단계 | EMBLEM |
|---|---|---|---|
| 1 글자와 친해지기 | a sprouting seed | 8 이중 모음 | two raindrops merging |
| 2 통글자로 낱말 읽기 | a basket of fruit | 9 받침 ㅍ·ㅋ·ㄲ | a leaf and a kitchen pot |
| 3 모음과 첫 자음 | a small sun and a moon | 10 받침 ㄷ·ㅌ | a vegetable field |
| 4 자음 소리 | a bird singing | 11 받침 ㅅ·ㅈ·ㅊ | a blooming flower |
| 5 받침 ㅁ ㅇ ㄴ ㄹ | a bear and a ball | 12 사이시옷 | a seaside with a candle |
| 6 받침 ㅂ ㄱ | a turtle and a drum | 13 받침 ㅎ | a stack of building blocks |
| 7 거센소리·된소리 | a rabbit jumping high | 14 겹받침 | a hen and a flowerpot |
