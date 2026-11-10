# 이미지 목록 + 생성 프롬프트 (3차)

> **2026-11-10 작성**: 지금 화면을 1 · 2차 그림과 대조해서, 그림 없이 CSS 색이나 이모지로 남은 곳과 그림체가 어긋난 곳을 모았어요. 2차 목록([asset-list-2.md](asset-list-2.md))은 아직 받은 그림이 없고, 거기 있는 것은 여기에 다시 넣지 않았어요.

프롬프트는 공통 스타일까지 붙인 완성본이라 그대로 복사해서 쓰면 돼요. 만드는 방법(단색 바탕 · 정사각형 · `python tools/images/prepare_assets.py`)은 2차와 같아요.

- **투명 대신 단색 바탕**: 기본은 자홍 #FF00FF, 그림이 분홍 · 빨강 · 보라면 초록 #00FF00 (제목에 "바탕 초록"으로 표시).
- **장면 배경은 바탕색 없이** 16:10 가로 그림으로 만들어요. 스크립트가 가로 1600픽셀 WebP로 줄여요.
- **배지는 참조 이미지를 넣고** 만들어요. `assets/ui/stage-01.webp`(한글 1단계 배지)를 함께 넣으면 나무 테두리와 잎 화환이 같게 나와요.
- 파일을 `assets/<폴더>/<이름>.png`로 넣고 "그림 넣었어"라고 해 주시면 다듬어서 화면에 연결할게요. 화면 연결(코드)이 필요한 그림은 **연결**에 적었어요.

## 요약 (29장)

| 묶음 | 장수 | 왜 |
|---|---|---|
| A. 새 장면 배경 | 5 | 놀이 30개가 그림 배경 없이 CSS 색만으로 나와요(연못 · 공작실 · 마당 · 숲 바닥). 바닷속 친구들은 연못 배경을 빌려 써요 |
| B. 다시 만들 장면 배경 | 4 | 처음에 만든 배경이라, 나중 배경들(테두리에 소품이 놓인 그림책 페이지)과 결이 달라요 |
| C. 수학 Level A ~ H 배지 | 8 | 새 수학 커리큘럼(8단계) 길에 한글 14단계처럼 배지를 달아요 |
| D. 놀이 속 그림 (낱말 스티커) | 12 | 최근 수학 놀이(바닷속 친구들 · 순서 기억하기 · 뻐꾸기 시계 · 빠진 숫자 찾기 · 수 세기)가 이모지로 그려져요 |

## 만드는 순서 추천

1. **A1 연못 · A2 공작실**: 각각 놀이 11개와 10개가 쓰는 배경이에요.
2. **B1 바닷가 · B2 밤하늘**: 놀이 9개와 12개가 쓰는데 가장 밋밋해요.
3. **C 수학 배지 8장**: 수학 화면의 A ~ H 길이 지금은 글자 동그라미예요.
4. 나머지 장면과 D 놀이 그림.

## 지금 그림체 점검 결과

- 캐릭터(토리, 게임 친구 10명), 스티커 24장, 한글 배지 14장, 수업 지도 3장, 홈 그림은 같은 그림체로 잘 맞아요. 다시 만들 것은 2차의 4건(보상 햇살 · 토리 안기 · 지도 동그라미 · 몬스터 3형제)뿐이에요.
- 장면 배경 21장 중 나중에 만든 9장(들판 · 숲 · 부엌 · 풀밭 · 광산 · 우주 · 무대 · 공부방 · 공작대)은 둥근 종이 테두리에 소품이 놓인 그림책 페이지 모양이에요. 처음에 만든 장면은 테두리 없이 한 색 면이 넓어요. 그중 결이 가장 다른 4장을 B에 넣었어요.
  - 욕실 · 도시 · 공장 · 네온 · 마녀 · 책상 · 공책 · 그림책 책상은 단순하지만 놀이 판이 잘 보여서 그대로 둬요.
- 칠판 방(chalk-room)과 나무 책상(desk)은 거의 같은 나무 벽 그림이에요. 칠판 방은 칠판이 있는 교실로 다시 만들어요(B4).
- 놀이 아이콘(놀이 목록과 수업 지도 동그라미 속 그림)은 모두 이모지예요. 213개라 이번 목록에서는 뺐어요.

---
## A. 새 장면 배경: `assets/scenes/` (16:10)

### A1. `assets/scenes/pond.png` · 연못
- 쓰는 놀이: 수 세기 · 식사 시간 · 어항 물고기 세기 · 개구리 수직선 점프 · 그림 조각 맞추기(한글 · 영어) · 젤리 문장 만들기 · 젤리 붙이기 · 얼음 맞추기 · 배를 고치자 (10개, 바닷속 친구들은 A5로 옮김)
- 연결: `css/tokens.css`에 `--art-pond`를 더하고, `css/english.css`의 연못 장면에 그림을 연결해요.
```
a calm sunny pond seen from the bank, lily pads, reeds and cattails, a few smooth stones and tiny frogs and dragonflies along the edges, soft blue water in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A2. `assets/scenes/craft.png` · 공작실
- 쓰는 놀이: 도형 조합 만들기 · 칠교놀이 · 데칼코마니 · 종이 접어 자르기 · 알파벳 카드 · 단어 따라쓰기 · 글자를 써보자 · 몬스터 색칠공부 · 단어 그리기 · 도형 맞추기 (10개)
- 연결: `--art-craft`를 더하고 공작실 장면에 연결해요.
```
a cozy kids craft table seen from above, warm light wood, colored paper sheets, crayons, safety scissors, glue stick, paint cups and paper shapes scattered only along the edges, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A3. `assets/scenes/yard.png` · 마당
- 쓰는 놀이: 작은 농장 · 뻐꾸기 시계 · 순서 기억하기 · 강아지 먹이 주기 · 강아지 파닉스 (5개)
- 연결: `--art-yard`를 더해요. 지금 CSS는 별이 뜬 밤하늘이라, 그림을 넣으면 낮 마당으로 바뀌어요.
```
a sunny cottage backyard in the forest, low wooden fence, small red barn and doghouse at the side, flower beds and a few chickens near the edges, soft green lawn in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A4. `assets/scenes/forestfloor.png` · 숲 바닥
- 쓰는 놀이: 숫자 퍼즐(수학 · 영어) · 알파벳 퍼즐 · 말하는 너구리 (4개)
- 연결: `--art-forestfloor`를 더하고 숲 바닥 장면에 연결해요.
```
a mossy forest floor seen from above, fallen leaves, acorns, little mushrooms, ferns and pebbles around the edges, soft brown earth and moss in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A5. `assets/scenes/sea.png` · 바닷속
- 쓰는 놀이: 바닷속 친구들 (영어 배를 고치자도 쓸 수 있어요)
- 연결: `--art-sea`를 더하고, `js/data.js`에서 `m-sea`의 장면을 `pond`에서 `sea`로 바꿔요.
```
gentle underwater sea scene, soft turquoise water with light rays from above, seaweed, coral and shells along the bottom and sides, a few bubbles, open clear water in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## B. 다시 만들 장면 배경: `assets/scenes/` (16:10)

같은 이름으로 넣으면 예전 그림은 `asset-src/_old/`로 비켜 두고 새 그림으로 바꿔요. 화면 연결은 이미 돼 있어요.

### B1. `assets/scenes/beach.png` · 바닷가
- 쓰는 곳: 놀이 9개 (모래 위 따라 쓰기 등)
- 왜 다시: 모래색 면만 넓고 테두리와 소품이 거의 없어 다른 장면보다 밋밋해요.
```
sunny beach seen from above, soft sand in the middle, gentle waves with foam along the top edge, shells, starfish, a little bucket and spade, a beach umbrella tip and a crab along the edges, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B2. `assets/scenes/night.png` · 밤하늘 캠프
- 쓰는 곳: 놀이 12개
- 왜 다시: 하늘색 띠만 있고, 텐트와 모닥불은 CSS 이모지(⛺🔥)로 얹고 있어요. 그림 안에 넣어요.
```
cozy night campsite in the forest, deep blue starry sky with a crescent moon, small tent, glowing campfire, lanterns and pine trees around the edges, calm dark-blue open space in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B3. `assets/scenes/table.png` · 나무 탁자
- 쓰는 곳: 놀이 6개
- 왜 다시: 나뭇결만 있는 판이라 다른 장면과 결이 달라요.
```
warm wooden kitchen table seen from above, a checked cloth napkin, small plant pot, teacup and a basket of acorns along the edges, smooth wood grain in the middle, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B4. `assets/scenes/chalk-room.png` · 칠판 교실
- 쓰는 곳: 놀이 5개
- 왜 다시: 나무 책상(desk)과 거의 같은 나무 벽 그림이에요. 칠판이 있는 교실로 바꿔요.
```
a cheerful forest classroom wall with a large green chalkboard filling the middle, wooden frame, chalk tray with colorful chalk, small paper garland and plants at the top corners and sides, wide 16:10 landscape game background, rounded storybook-page frame with small props tucked along the edges like the other scenes of this app, large empty calm center area for game UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## C. 수학 Level A ~ H 배지: `assets/ui/stage-math-a.png` ~ `stage-math-h.png`

- 한글 14단계 배지와 같은 나무 메달이에요. 이름이 `stage-`로 시작하면 스크립트가 256×256으로 줄여요.
- 참조 이미지: `assets/ui/stage-01.webp`
- 연결: 수학 화면의 A ~ H 길에서 글자 동그라미 대신 배지를 보여 줘요. 잠긴 단계는 한글처럼 회색이에요.

### C1. `assets/ui/stage-math-a.png` · Level A · 10까지 수 · 기본 도형 · 규칙
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of a little stack of colorful counting blocks next to a circle, a triangle and a square, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C2. `assets/ui/stage-math-b.png` · Level B · 20까지 수 · 5 이하 덧셈과 뺄셈 · 비교
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of two small baskets of acorns being poured together into one basket, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C3. `assets/ui/stage-math-c.png` · Level C · 수의 순서 · 10 이하 덧셈과 뺄셈 · 시계
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of a row of round stepping stones leading to a small friendly wall clock, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C4. `assets/ui/stage-math-d.png` · Level D · 100까지 수 · 자릿값 · 평면도형 · 시계
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of bundles of ten twigs tied with a ribbon next to a few single twigs, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C5. `assets/ui/stage-math-e.png` · Level E · 두 자리 수의 순서 · 받아올림 · 도형 · 길이
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of a little caterpillar measuring a leaf with a wooden ruler, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C6. `assets/ui/stage-math-f.png` · Level F · 세 자리 수 · 곱셈 · 입체도형 · 자 · 그래프
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of a cube, a cylinder and a ball beside a tiny bar chart made of stacked acorns, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C7. `assets/ui/stage-math-g.png` · Level G · 세 자리 수 · 받아올림 덧셈 · 곱셈구구 · 시계
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of neat equal rows of acorns arranged in a grid like a multiplication array, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C8. `assets/ui/stage-math-h.png` · Level H · 세 자리 수의 계산 · 나눗셈 · 분수 · 입체도형
```
round wooden badge medallion with a small leafy wreath and a tiny acorn at the bottom, centered round window with an emblem of a round pie cut into four equal slices shared on little plates, same badge design as the reference image, front view, badge fills about 85% of the frame, no numbers, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## D. 놀이 속 그림 (낱말 스티커): `assets/words/<낱말>.png`

- 1 · 2차 낱말 그림과 같은 흰 테두리 스티커 모양이에요. 파일 이름이 낱말이라, 한글 수업에서 이 낱말이 나와도 그림으로 바뀌어요.
- 연결: 아래 놀이들은 지금 이모지를 직접 그려요. 그림을 넣으면 낱말 그림을 쓰도록 놀이 코드를 고쳐요.
- 2차 목록의 그림도 함께 있어야 놀이 하나를 다 바꿀 수 있어요.
  - 바닷속 친구들: 상어 · 물고기 · 문어 · 오징어 · 게
  - 식사 시간: 악어
  - 수 세기: 옥수수 · 토마토 · 복숭아 · 체리 · 당근 · 브로콜리

### D1. `assets/words/돌고래.png` · 돌고래
- 쓰는 놀이: 바닷속 친구들 (🐬)
```
cute die-cut sticker illustration of a friendly smiling dolphin jumping in a gentle arc, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D2. `assets/words/복어.png` · 복어
- 쓰는 놀이: 바닷속 친구들 (🐡)
```
cute die-cut sticker illustration of a round puffed-up pufferfish with tiny soft spines, looking surprised and cute, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D3. `assets/words/벚꽃.png` · 벚꽃 · 바탕 초록
- 쓰는 놀이: 순서 기억하기 (🌸)
```
cute die-cut sticker illustration of a single open pink cherry blossom flower with five petals, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D4. `assets/words/해바라기.png` · 해바라기
- 쓰는 놀이: 순서 기억하기 (🌻)
```
cute die-cut sticker illustration of a single bright sunflower head with a short green stem and one leaf, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D5. `assets/words/데이지.png` · 데이지
- 쓰는 놀이: 순서 기억하기 (🌼)
```
cute die-cut sticker illustration of a single white and yellow daisy flower with a short stem, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D6. `assets/words/무궁화.png` · 무궁화 · 바탕 초록
- 쓰는 놀이: 순서 기억하기 (🌺)
```
cute die-cut sticker illustration of a single open rose-of-sharon flower (mugunghwa), pale pink petals with a deep red center, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D7. `assets/words/튤립.png` · 튤립 · 바탕 초록
- 쓰는 놀이: 순서 기억하기 (🌷)
```
cute die-cut sticker illustration of a single red tulip with a green stem and two leaves, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D8. `assets/words/뻐꾸기.png` · 뻐꾸기
- 쓰는 놀이: 뻐꾸기 시계 (🐦)
```
cute die-cut sticker illustration of a small cuckoo bird popping out of a tiny wooden clock door, beak open as if singing, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D9. `assets/words/알.png` · 알
- 쓰는 놀이: 빠진 숫자 찾기 (둥지의 알)
```
cute die-cut sticker illustration of one smooth cream-colored egg resting in a small straw nest, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D10. `assets/words/무당벌레.png` · 무당벌레 · 바탕 초록
- 쓰는 놀이: 수 세기 · 식사 시간 (🐞)
```
cute die-cut sticker illustration of a cute round red ladybug with black spots, seen from above, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D11. `assets/words/귤.png` · 귤
- 쓰는 놀이: 수 세기 (🍊)
```
cute die-cut sticker illustration of one small round mandarin orange with a green leaf on top, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### D12. `assets/words/배.png` · 배
- 쓰는 놀이: 수 세기 (🍐)
```
cute die-cut sticker illustration of one round golden Korean pear (asian pear) with a short stem, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```
