# 다시 만들 이미지 · 새로 만들 이미지 목록 (2차)

> 3차 목록(새 장면 배경 · 다시 만들 장면 · 수학 Level 배지 · 놀이 속 그림 29장)은 [asset-list-3.md](asset-list-3.md)에 있어요.

> **2026-11-08 현재**: 이 목록(다시 만들기 A 4건 · 새 낱말 B·C 246장)에서 받은 그림은 아직 없어요. 1차 149장의 상태(화면에 나옴 · 다시 만들기 · 아직 안 씀)는 [asset-list.md](asset-list.md)에 표시해 두었어요.

1차로 만든 149장은 모두 다듬어서 앱에 넣었어요. 이 문서는 **다시 만들면 좋은 그림**과 **아직 그림이 없는 낱말**의 목록과 프롬프트예요.

## 만들 때 꼭 지킬 것 (1차와 달라진 점)

1차 그림은 "투명 배경"을 부탁했는데, 생성 모델이 투명 대신 **회색 체크무늬를 그림으로 그려 넣었어요**. 그래서 스크립트로 체크무늬를 지웠지만, 회색 · 흰색 그림(코끼리, 눈사람)은 같이 지워지기 쉬워요.

- **투명 배경 대신 단색 바탕**으로 만들어요. 프롬프트에 이미 넣어 두었어요.
  - 기본은 **자홍 #FF00FF**. 그림이 분홍 · 보라 · 빨강이면 **초록 #00FF00**(목록 제목에 "바탕 초록"으로 표시).
  - 바탕에 체크무늬 · 그라데이션 · 그림자가 생기면 다시 만들어요.
- **정사각형(1:1)** 으로 만들어요. 1차 그림은 가로로 긴 1408×768이 많아서 잘라 써야 했어요.
- 파일은 `assets/<폴더>/<이름>.png`로 넣으면 돼요. 크기 · 형식은 상관없어요(다듬는 스크립트가 줄여서 WebP로 바꿔요).
- 넣은 뒤 할 일: 아래 한 줄을 실행하면 바탕을 지우고 크기를 줄여 앱에 연결해요. 원본은 `asset-src/`로 옮겨져요. 저에게 "그림 넣었어"라고 해 주셔도 돼요.

```bash
python tools/images/prepare_assets.py
```

  처음 한 번은 필요한 묶음을 설치해요.

```bash
pip install pillow numpy scipy
```

- 같은 이름으로 다시 만든 그림(예: `tori-hug.png`)을 넣으면, 예전 원본은 `asset-src/_old/`로 비켜 두고 새 그림으로 바꿔요.

- 낱말 그림은 **파일 이름이 곧 낱말**이에요(`assets/words/햇볕.png`). 스크립트가 `js/wordArtList.js`에 목록을 적어서, 수업에서 그 낱말이 나오면 이모지 대신 그림이 나와요.

| 묶음 | 장수 | 왜 |
|---|---|---|
| A. 다시 만들기 | 4 | 바탕이 덜 지워졌거나, 화면에 맞지 않아요 |
| B. 한글 수업 낱말 (자주 나옴) | 80 | 수업에서 자주 나오는데 그림이 없어 이모지로 나와요. 받침 규칙 낱말(덮개 · 헝겊 · 동녘 …)은 맞는 이모지가 없어 특히 필요해요 |
| C. 한글 수업 낱말 (가끔 나옴) | 166 | 위와 같고, 덜 자주 나와요 |

지금 앱에서 그림이 나오는 낱말은 56개, 한글 수업 54차시에서 그림 낱말로 뽑히는 낱말은 297개예요. B와 C를 다 만들면 수업 낱말 그림이 모두 채워져요.

---
## A. 다시 만들기

### A1. `assets/ui/reward-burst.png`
- 쓰는 곳: 보상 창 별 뒤의 햇살
- 왜 다시: 햇살 줄기에 체크무늬가 조금 남아 있어요.
- 바탕: 자홍 #FF00FF
```
radiant sunburst of soft golden rays with tiny leaves and acorns between the rays, perfectly round and centered, empty circle in the middle, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A2. `assets/char/tori-hug.png`
- 쓰는 곳: 수업을 다 마쳤을 때 보상 창의 토리
- 왜 다시: 1차 그림은 토리가 작고 주변에 색종이 조각이 흩어져 있어서, 잘라 내면 토리가 아주 작게 보여요.
- 바탕: 자홍 #FF00FF
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, 2.5 heads tall chibi proportions, hugging a big acorn with both arms, sleepy happy eyes, full body, character fills about 85% of a square 1:1 frame, no confetti, nothing else around the character, same character design as the reference image, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A3. `assets/ui/map-node.png`
- 쓰는 곳: 수업 지도의 단계 동그라미 (아직 연결 안 함)
- 왜 다시: 1차 그림은 가운데에 도토리 무늬가 있어서, 그 위에 게임 아이콘을 올리면 겹쳐요. 가운데가 빈 판이 필요해요.
- 바탕: 자홍 #FF00FF
```
round wooden stage marker disc for a level map, glossy pastel wood, thick rounded rim, completely plain empty flat center with no emblem and no pattern, front view, square 1:1, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### A4. `assets/char/monster-green.png · monster-orange.png · monster-violet.png (3장)`
- 쓰는 곳: 장난감 공장 몬스터 3형제 (아직 연결 안 함)
- 왜 다시: 1차 그림은 셋이 한 장에 함께 있어서, 게임에서 한 마리씩 움직일 수 없어요. 한 마리씩 따로 만들어요(색만 바꿔 3번).
- 바탕: 자홍 #FF00FF
```
one small round fluffy monster in {green / orange / violet}, a tiny party hat and a single tooth, happy face, arms up, front view, full body, centered, character fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## B. 한글 수업 낱말 그림 — 자주 나오는 80개

모두 `assets/words/<낱말>.png` · 정사각형. 1차 낱말 그림(흰 테두리 스티커 모양)과 같은 모양이에요.

### B1. `assets/words/햇볕.png` — 햇볕
```
cute die-cut sticker illustration of warm sunlight beaming down on a little sprout, a smiling sun with soft rays, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B2. `assets/words/팥.png` — 팥
```
cute die-cut sticker illustration of a small pile of dark red adzuki beans in a tiny wooden scoop, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B3. `assets/words/덮개.png` — 덮개
```
cute die-cut sticker illustration of a cozy quilted cover draped over a small basket, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B4. `assets/words/못.png` — 못
```
cute die-cut sticker illustration of a single shiny metal nail standing upright, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B5. `assets/words/빗.png` — 빗
```
cute die-cut sticker illustration of a pastel wooden hair comb, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B6. `assets/words/빛.png` — 빛
```
cute die-cut sticker illustration of a glowing lantern giving off soft warm light rays, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B7. `assets/words/젖.png` — 젖
```
cute die-cut sticker illustration of a baby milk bottle full of milk, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B8. `assets/words/낮.png` — 낮
```
cute die-cut sticker illustration of a bright daytime sky with a smiling sun over a small green hill, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B9. `assets/words/숲.png` — 숲
```
cute die-cut sticker illustration of a small cluster of round friendly trees forming a little forest, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B10. `assets/words/앞치마.png` — 앞치마
```
cute die-cut sticker illustration of a cute kitchen apron with a front pocket, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B11. `assets/words/헝겊.png` — 헝겊
```
cute die-cut sticker illustration of a few soft colorful fabric scraps with stitched edges, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B12. `assets/words/동녘.png` — 동녘
```
cute die-cut sticker illustration of the sun rising over gentle eastern hills at dawn, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B13. `assets/words/붓.png` — 붓
```
cute die-cut sticker illustration of a calligraphy paint brush with a wooden handle, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B14. `assets/words/낚시.png` — 낚시
```
cute die-cut sticker illustration of a fishing rod with a line and a little fish on the hook, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B15. `assets/words/곶감.png` — 곶감
```
cute die-cut sticker illustration of a string of dried persimmons, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B16. `assets/words/밭.png` — 밭
```
cute die-cut sticker illustration of a small vegetable field with neat rows of sprouts, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B17. `assets/words/윷.png` — 윷
```
cute die-cut sticker illustration of four Korean yut sticks used in the traditional yut game, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B18. `assets/words/늪.png` — 늪
```
cute die-cut sticker illustration of a small swamp pond with reeds and lily pads, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B19. `assets/words/꽃밭.png` — 꽃밭
```
cute die-cut sticker illustration of a flower bed full of colorful tulips, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B20. `assets/words/닻.png` — 닻
```
cute die-cut sticker illustration of a ship anchor, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B21. `assets/words/숲속.png` — 숲속
```
cute die-cut sticker illustration of a path inside a cozy forest with tall trees and mushrooms, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B22. `assets/words/들녘.png` — 들녘
```
cute die-cut sticker illustration of a wide golden field of ripe rice with a blue sky, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B23. `assets/words/그릇.png` — 그릇
```
cute die-cut sticker illustration of an empty ceramic bowl, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B24. `assets/words/돛.png` — 돛
```
cute die-cut sticker illustration of a sailboat with a big white sail, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B25. `assets/words/잎.png` — 잎
```
cute die-cut sticker illustration of a single green leaf, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B26. `assets/words/젓가락.png` — 젓가락
```
cute die-cut sticker illustration of a pair of chopsticks, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B27. `assets/words/솥.png` — 솥
```
cute die-cut sticker illustration of a traditional Korean iron rice pot with a lid, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B28. `assets/words/짚.png` — 짚
```
cute die-cut sticker illustration of a bundle of golden straw tied with string, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B29. `assets/words/부엌.png` — 부엌
```
cute die-cut sticker illustration of a small cozy kitchen corner with a stove and pots, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B30. `assets/words/옷.png` — 옷
```
cute die-cut sticker illustration of a child's shirt on a hanger, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B31. `assets/words/앞발.png` — 앞발
```
cute die-cut sticker illustration of a cute puppy's front paws, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B32. `assets/words/깃발.png` — 깃발
```
cute die-cut sticker illustration of a small flag waving on a pole, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B33. `assets/words/돋보기.png` — 돋보기
```
cute die-cut sticker illustration of a magnifying glass, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B34. `assets/words/무릎.png` — 무릎
```
cute die-cut sticker illustration of a child's knee with a cute bandage, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B35. `assets/words/볶음밥.png` — 볶음밥
```
cute die-cut sticker illustration of a plate of fried rice with peas and carrots, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B36. `assets/words/닭.png` — 닭
```
cute die-cut sticker illustration of a plump hen, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B37. `assets/words/흙.png` — 흙
```
cute die-cut sticker illustration of a mound of brown soil with a small shovel, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B38. `assets/words/귓속말.png` — 귓속말
```
cute die-cut sticker illustration of two little kids whispering into each other's ear, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B39. `assets/words/값.png` — 값
```
cute die-cut sticker illustration of a price tag with a few coins, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B40. `assets/words/오빠.png` — 오빠
```
cute die-cut sticker illustration of a smiling older brother, a boy about ten years old, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B41. `assets/words/잇몸.png` — 잇몸 · 바탕 초록
```
cute die-cut sticker illustration of a smiling mouth showing pink gums and little teeth, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B42. `assets/words/바닷가.png` — 바닷가
```
cute die-cut sticker illustration of a sandy beach with gentle waves and a sand bucket, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B43. `assets/words/냇가.png` — 냇가
```
cute die-cut sticker illustration of a small stream with smooth stones and grass on the banks, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B44. `assets/words/바닷물.png` — 바닷물
```
cute die-cut sticker illustration of a splash of blue sea water wave, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B45. `assets/words/뒷문.png` — 뒷문
```
cute die-cut sticker illustration of the back door of a little house, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B46. `assets/words/빗물.png` — 빗물
```
cute die-cut sticker illustration of raindrops falling into a small puddle, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B47. `assets/words/콧노래.png` — 콧노래
```
cute die-cut sticker illustration of a child humming happily with music notes floating out, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B48. `assets/words/나뭇잎.png` — 나뭇잎
```
cute die-cut sticker illustration of a few colorful tree leaves, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B49. `assets/words/깻잎.png` — 깻잎
```
cute die-cut sticker illustration of a perilla leaf, wide green leaf with serrated edges, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B50. `assets/words/아빠.png` — 아빠
```
cute die-cut sticker illustration of a smiling dad, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B51. `assets/words/햇빛.png` — 햇빛
```
cute die-cut sticker illustration of bright sunshine rays coming through clouds, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B52. `assets/words/햇살.png` — 햇살
```
cute die-cut sticker illustration of soft golden sunbeams, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B53. `assets/words/콧물.png` — 콧물
```
cute die-cut sticker illustration of a little child with a runny nose holding a tissue, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B54. `assets/words/촛불.png` — 촛불
```
cute die-cut sticker illustration of a lit candle with a gentle flame, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B55. `assets/words/혓바닥.png` — 혓바닥 · 바탕 초록
```
cute die-cut sticker illustration of a cute cartoon tongue sticking out of a smiling mouth, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B56. `assets/words/감자.png` — 감자
```
cute die-cut sticker illustration of a potato, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B57. `assets/words/아기.png` — 아기
```
cute die-cut sticker illustration of a smiling baby in a onesie, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B58. `assets/words/호랑이.png` — 호랑이
```
cute die-cut sticker illustration of a cute tiger cub, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B59. `assets/words/소라.png` — 소라
```
cute die-cut sticker illustration of a spiral conch shell, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B60. `assets/words/부엉이.png` — 부엉이
```
cute die-cut sticker illustration of a round owl, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B61. `assets/words/노루.png` — 노루
```
cute die-cut sticker illustration of a roe deer, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B62. `assets/words/가족.png` — 가족
```
cute die-cut sticker illustration of a happy family of four standing together, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B63. `assets/words/수도.png` — 수도
```
cute die-cut sticker illustration of a water tap with water running, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B64. `assets/words/엄마.png` — 엄마
```
cute die-cut sticker illustration of a smiling mom, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B65. `assets/words/오징어.png` — 오징어 · 바탕 초록
```
cute die-cut sticker illustration of a cute squid, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B66. `assets/words/구두.png` — 구두
```
cute die-cut sticker illustration of a pair of polished leather shoes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B67. `assets/words/악어.png` — 악어
```
cute die-cut sticker illustration of a friendly crocodile, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B68. `assets/words/상어.png` — 상어
```
cute die-cut sticker illustration of a friendly cartoon shark, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B69. `assets/words/목도리.png` — 목도리
```
cute die-cut sticker illustration of a knitted scarf, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B70. `assets/words/옥수수.png` — 옥수수
```
cute die-cut sticker illustration of an ear of corn, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B71. `assets/words/물고기.png` — 물고기
```
cute die-cut sticker illustration of a cute fish, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B72. `assets/words/고추.png` — 고추
```
cute die-cut sticker illustration of a red chili pepper, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B73. `assets/words/김밥.png` — 김밥
```
cute die-cut sticker illustration of sliced Korean gimbap rolls, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B74. `assets/words/문어.png` — 문어 · 바탕 초록
```
cute die-cut sticker illustration of a cute octopus, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B75. `assets/words/찌개.png` — 찌개
```
cute die-cut sticker illustration of a bubbling stew in a small earthen pot, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B76. `assets/words/장갑.png` — 장갑
```
cute die-cut sticker illustration of a pair of knitted mittens, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B77. `assets/words/국수.png` — 국수
```
cute die-cut sticker illustration of a bowl of noodles, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B78. `assets/words/복숭아.png` — 복숭아 · 바탕 초록
```
cute die-cut sticker illustration of a peach, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B79. `assets/words/사다리.png` — 사다리
```
cute die-cut sticker illustration of a wooden ladder, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### B80. `assets/words/신발.png` — 신발
```
cute die-cut sticker illustration of a pair of sneakers, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

## C. 한글 수업 낱말 그림 — 나머지

모두 `assets/words/<낱말>.png` · 정사각형. 1차 낱말 그림(흰 테두리 스티커 모양)과 같은 모양이에요.

### C81. `assets/words/호박.png` — 호박
```
cute die-cut sticker illustration of a pumpkin, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C82. `assets/words/뿌리.png` — 뿌리
```
cute die-cut sticker illustration of a small plant pulled up showing its roots, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C83. `assets/words/가지.png` — 가지 · 바탕 초록
```
cute die-cut sticker illustration of an eggplant, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C84. `assets/words/주스.png` — 주스
```
cute die-cut sticker illustration of a glass of orange juice with a straw, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C85. `assets/words/후추.png` — 후추
```
cute die-cut sticker illustration of a pepper shaker, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C86. `assets/words/당근.png` — 당근
```
cute die-cut sticker illustration of a carrot, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C87. `assets/words/너구리.png` — 너구리
```
cute die-cut sticker illustration of a raccoon dog, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C88. `assets/words/누나.png` — 누나
```
cute die-cut sticker illustration of a smiling older sister, a girl about ten years old, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C89. `assets/words/할아버지.png` — 할아버지
```
cute die-cut sticker illustration of a smiling grandfather, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C90. `assets/words/나무.png` — 나무
```
cute die-cut sticker illustration of a round leafy tree, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C91. `assets/words/오이.png` — 오이
```
cute die-cut sticker illustration of a cucumber, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C92. `assets/words/머루.png` — 머루 · 바탕 초록
```
cute die-cut sticker illustration of a bunch of small dark wild grapes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C93. `assets/words/할머니.png` — 할머니
```
cute die-cut sticker illustration of a smiling grandmother, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C94. `assets/words/고기.png` — 고기
```
cute die-cut sticker illustration of a piece of meat on the bone, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C95. `assets/words/사탕.png` — 사탕
```
cute die-cut sticker illustration of a wrapped candy, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C96. `assets/words/마늘.png` — 마늘
```
cute die-cut sticker illustration of a garlic bulb, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C97. `assets/words/치즈.png` — 치즈
```
cute die-cut sticker illustration of a wedge of cheese, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C98. `assets/words/만두.png` — 만두
```
cute die-cut sticker illustration of a few Korean dumplings, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C99. `assets/words/어머니.png` — 어머니
```
cute die-cut sticker illustration of a kind mother in a neat dress, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C100. `assets/words/자전거.png` — 자전거
```
cute die-cut sticker illustration of a bicycle, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C101. `assets/words/도라지.png` — 도라지 · 바탕 초록
```
cute die-cut sticker illustration of a balloon flower plant with purple star-shaped flowers and roots, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C102. `assets/words/따오기.png` — 따오기 · 바탕 초록
```
cute die-cut sticker illustration of a crested ibis bird with soft pink feathers, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C103. `assets/words/코코아.png` — 코코아
```
cute die-cut sticker illustration of a mug of hot cocoa with marshmallows, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C104. `assets/words/아이.png` — 아이
```
cute die-cut sticker illustration of a smiling young child, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C105. `assets/words/거울.png` — 거울
```
cute die-cut sticker illustration of a hand mirror, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C106. `assets/words/언니.png` — 언니
```
cute die-cut sticker illustration of a smiling older sister, a teenage girl, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C107. `assets/words/바다.png` — 바다
```
cute die-cut sticker illustration of a calm blue sea with small waves, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C108. `assets/words/고구마.png` — 고구마 · 바탕 초록
```
cute die-cut sticker illustration of a sweet potato, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C109. `assets/words/두루미.png` — 두루미
```
cute die-cut sticker illustration of a red-crowned crane, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C110. `assets/words/라마.png` — 라마
```
cute die-cut sticker illustration of a fluffy llama, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C111. `assets/words/모기.png` — 모기
```
cute die-cut sticker illustration of a little cartoon mosquito, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C112. `assets/words/지도.png` — 지도
```
cute die-cut sticker illustration of a folded treasure map, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C113. `assets/words/비누.png` — 비누
```
cute die-cut sticker illustration of a bar of soap with bubbles, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C114. `assets/words/바지.png` — 바지
```
cute die-cut sticker illustration of a pair of pants, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C115. `assets/words/꼬마.png` — 꼬마
```
cute die-cut sticker illustration of a cheerful little kid, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C116. `assets/words/물감.png` — 물감
```
cute die-cut sticker illustration of paint tubes and a palette, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C117. `assets/words/종.png` — 종
```
cute die-cut sticker illustration of a golden bell, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C118. `assets/words/돼지.png` — 돼지 · 바탕 초록
```
cute die-cut sticker illustration of a cute piglet, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C119. `assets/words/타조.png` — 타조
```
cute die-cut sticker illustration of an ostrich, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C120. `assets/words/투구.png` — 투구
```
cute die-cut sticker illustration of an old warrior helmet, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C121. `assets/words/다리.png` — 다리
```
cute die-cut sticker illustration of a child's leg with a sock and shoe, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C122. `assets/words/보리.png` — 보리
```
cute die-cut sticker illustration of stalks of barley, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C123. `assets/words/국.png` — 국
```
cute die-cut sticker illustration of a bowl of soup, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C124. `assets/words/치마.png` — 치마
```
cute die-cut sticker illustration of a skirt, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C125. `assets/words/기타.png` — 기타
```
cute die-cut sticker illustration of an acoustic guitar, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C126. `assets/words/바구니.png` — 바구니
```
cute die-cut sticker illustration of a woven basket, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C127. `assets/words/토마토.png` — 토마토
```
cute die-cut sticker illustration of a tomato, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C128. `assets/words/참외.png` — 참외
```
cute die-cut sticker illustration of a Korean melon, yellow with white stripes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C129. `assets/words/케이크.png` — 케이크 · 바탕 초록
```
cute die-cut sticker illustration of a birthday cake with candles, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C130. `assets/words/머리.png` — 머리
```
cute die-cut sticker illustration of a child's head with neat hair, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C131. `assets/words/하늘.png` — 하늘
```
cute die-cut sticker illustration of a blue sky with fluffy clouds, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C132. `assets/words/계란.png` — 계란
```
cute die-cut sticker illustration of an egg, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C133. `assets/words/의자.png` — 의자
```
cute die-cut sticker illustration of a wooden chair, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C134. `assets/words/과자.png` — 과자
```
cute die-cut sticker illustration of a few cookies, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C135. `assets/words/밥.png` — 밥
```
cute die-cut sticker illustration of a bowl of steamed rice, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C136. `assets/words/외투.png` — 외투
```
cute die-cut sticker illustration of a warm winter coat, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C137. `assets/words/카드.png` — 카드
```
cute die-cut sticker illustration of a greeting card, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C138. `assets/words/여우.png` — 여우
```
cute die-cut sticker illustration of a cute fox, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C139. `assets/words/와플.png` — 와플
```
cute die-cut sticker illustration of a waffle, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C140. `assets/words/도끼.png` — 도끼
```
cute die-cut sticker illustration of a small wood axe, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C141. `assets/words/피리.png` — 피리
```
cute die-cut sticker illustration of a wooden recorder flute, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C142. `assets/words/빨대.png` — 빨대
```
cute die-cut sticker illustration of a drinking straw, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C143. `assets/words/키위.png` — 키위
```
cute die-cut sticker illustration of a kiwi fruit cut in half, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C144. `assets/words/과일.png` — 과일
```
cute die-cut sticker illustration of a basket of mixed fruit, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C145. `assets/words/라디오.png` — 라디오
```
cute die-cut sticker illustration of a retro radio, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C146. `assets/words/북.png` — 북
```
cute die-cut sticker illustration of a drum, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C147. `assets/words/브로콜리.png` — 브로콜리
```
cute die-cut sticker illustration of broccoli, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C148. `assets/words/화가.png` — 화가
```
cute die-cut sticker illustration of a little painter with a beret and an easel, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C149. `assets/words/왜가리.png` — 왜가리
```
cute die-cut sticker illustration of a grey heron, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C150. `assets/words/의사.png` — 의사
```
cute die-cut sticker illustration of a friendly doctor with a stethoscope, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C151. `assets/words/카레.png` — 카레
```
cute die-cut sticker illustration of a plate of curry rice, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C152. `assets/words/체리.png` — 체리
```
cute die-cut sticker illustration of a pair of cherries, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C153. `assets/words/낙타.png` — 낙타
```
cute die-cut sticker illustration of a camel, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C154. `assets/words/코.png` — 코
```
cute die-cut sticker illustration of a cute nose, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C155. `assets/words/입.png` — 입 · 바탕 초록
```
cute die-cut sticker illustration of a smiling mouth with lips, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C156. `assets/words/파도.png` — 파도
```
cute die-cut sticker illustration of a big ocean wave, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C157. `assets/words/꼬리.png` — 꼬리
```
cute die-cut sticker illustration of a fluffy animal tail, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C158. `assets/words/주머니.png` — 주머니
```
cute die-cut sticker illustration of a small drawstring pouch, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C159. `assets/words/필통.png` — 필통
```
cute die-cut sticker illustration of a pencil case, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C160. `assets/words/쓰레기.png` — 쓰레기
```
cute die-cut sticker illustration of a trash bin with crumpled paper, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C161. `assets/words/인형.png` — 인형
```
cute die-cut sticker illustration of a teddy bear doll, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C162. `assets/words/열쇠.png` — 열쇠
```
cute die-cut sticker illustration of a key, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C163. `assets/words/다람쥐.png` — 다람쥐
```
cute die-cut sticker illustration of a chipmunk, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C164. `assets/words/휴게소.png` — 휴게소
```
cute die-cut sticker illustration of a small highway rest stop building, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C165. `assets/words/조개.png` — 조개
```
cute die-cut sticker illustration of a clam shell, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C166. `assets/words/가위.png` — 가위
```
cute die-cut sticker illustration of a pair of scissors, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C167. `assets/words/레몬.png` — 레몬
```
cute die-cut sticker illustration of a lemon, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C168. `assets/words/판다.png` — 판다
```
cute die-cut sticker illustration of a panda, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C169. `assets/words/채소.png` — 채소
```
cute die-cut sticker illustration of a basket of vegetables, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C170. `assets/words/쌀.png` — 쌀
```
cute die-cut sticker illustration of a sack of rice grains, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C171. `assets/words/초.png` — 초
```
cute die-cut sticker illustration of a candle, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C172. `assets/words/피아노.png` — 피아노
```
cute die-cut sticker illustration of a small piano, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C173. `assets/words/돌.png` — 돌
```
cute die-cut sticker illustration of a smooth stone, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C174. `assets/words/괴물.png` — 괴물
```
cute die-cut sticker illustration of a cute friendly little monster, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C175. `assets/words/트럭.png` — 트럭
```
cute die-cut sticker illustration of a truck, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C176. `assets/words/뚜껑.png` — 뚜껑
```
cute die-cut sticker illustration of a jar with its lid, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C177. `assets/words/쪽지.png` — 쪽지
```
cute die-cut sticker illustration of a folded note paper, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C178. `assets/words/불.png` — 불
```
cute die-cut sticker illustration of a campfire flame, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C179. `assets/words/메뚜기.png` — 메뚜기
```
cute die-cut sticker illustration of a grasshopper, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C180. `assets/words/추위.png` — 추위
```
cute die-cut sticker illustration of a child shivering in the cold with a scarf, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C181. `assets/words/교회.png` — 교회
```
cute die-cut sticker illustration of a small church building, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C182. `assets/words/재채기.png` — 재채기
```
cute die-cut sticker illustration of a child sneezing, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C183. `assets/words/소.png` — 소
```
cute die-cut sticker illustration of a cow, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C184. `assets/words/이.png` — 이
```
cute die-cut sticker illustration of a cute tooth, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C185. `assets/words/씨앗.png` — 씨앗
```
cute die-cut sticker illustration of seeds sprouting from soil, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C186. `assets/words/뼈.png` — 뼈
```
cute die-cut sticker illustration of a bone, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C187. `assets/words/바위.png` — 바위
```
cute die-cut sticker illustration of a big rock, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C188. `assets/words/여름.png` — 여름
```
cute die-cut sticker illustration of a summer scene with a sun, a watermelon slice and a beach ball, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C189. `assets/words/포크.png` — 포크
```
cute die-cut sticker illustration of a fork, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C190. `assets/words/카메라.png` — 카메라
```
cute die-cut sticker illustration of a camera, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C191. `assets/words/양파.png` — 양파
```
cute die-cut sticker illustration of an onion, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C192. `assets/words/안경.png` — 안경
```
cute die-cut sticker illustration of a pair of glasses, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C193. `assets/words/네모.png` — 네모
```
cute die-cut sticker illustration of a square shape, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C194. `assets/words/눈.png` — 눈
```
cute die-cut sticker illustration of snow falling with snowflakes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C195. `assets/words/그네.png` — 그네
```
cute die-cut sticker illustration of a swing hanging from a tree branch, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C196. `assets/words/세모.png` — 세모
```
cute die-cut sticker illustration of a triangle shape, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C197. `assets/words/외계인.png` — 외계인
```
cute die-cut sticker illustration of a cute friendly alien, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C198. `assets/words/개구리.png` — 개구리
```
cute die-cut sticker illustration of a frog, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C199. `assets/words/겨울.png` — 겨울
```
cute die-cut sticker illustration of a winter scene with snow-covered trees, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C200. `assets/words/계단.png` — 계단
```
cute die-cut sticker illustration of a short staircase, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C201. `assets/words/개미.png` — 개미
```
cute die-cut sticker illustration of an ant, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C202. `assets/words/티셔츠.png` — 티셔츠
```
cute die-cut sticker illustration of a t-shirt, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C203. `assets/words/나팔.png` — 나팔
```
cute die-cut sticker illustration of a trumpet, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C204. `assets/words/횃불.png` — 횃불
```
cute die-cut sticker illustration of a burning torch, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C205. `assets/words/배추.png` — 배추
```
cute die-cut sticker illustration of a napa cabbage, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C206. `assets/words/멜론.png` — 멜론
```
cute die-cut sticker illustration of a melon, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C207. `assets/words/꽈배기.png` — 꽈배기
```
cute die-cut sticker illustration of a twisted doughnut, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C208. `assets/words/벌.png` — 벌
```
cute die-cut sticker illustration of a bee, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C209. `assets/words/말.png` — 말
```
cute die-cut sticker illustration of a horse, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C210. `assets/words/교실.png` — 교실
```
cute die-cut sticker illustration of a classroom with desks and a blackboard, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C211. `assets/words/대나무.png` — 대나무
```
cute die-cut sticker illustration of bamboo stalks, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C212. `assets/words/제비.png` — 제비
```
cute die-cut sticker illustration of a swallow bird, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C213. `assets/words/휴지.png` — 휴지
```
cute die-cut sticker illustration of a roll of toilet paper, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C214. `assets/words/냉장고.png` — 냉장고
```
cute die-cut sticker illustration of a refrigerator, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C215. `assets/words/가게.png` — 가게
```
cute die-cut sticker illustration of a small corner shop, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C216. `assets/words/계절.png` — 계절
```
cute die-cut sticker illustration of four little trees showing spring, summer, autumn and winter, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C217. `assets/words/발.png` — 발
```
cute die-cut sticker illustration of a child's foot, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C218. `assets/words/가면.png` — 가면
```
cute die-cut sticker illustration of a festival mask, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C219. `assets/words/동생.png` — 동생
```
cute die-cut sticker illustration of a younger sibling, a toddler, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C220. `assets/words/모래.png` — 모래
```
cute die-cut sticker illustration of a pile of sand with a sand bucket, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C221. `assets/words/베개.png` — 베개
```
cute die-cut sticker illustration of a pillow, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C222. `assets/words/크레파스.png` — 크레파스
```
cute die-cut sticker illustration of a box of crayons, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C223. `assets/words/야구.png` — 야구
```
cute die-cut sticker illustration of a baseball and a bat, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C224. `assets/words/요리.png` — 요리
```
cute die-cut sticker illustration of a child cooking with a frying pan, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C225. `assets/words/유리.png` — 유리
```
cute die-cut sticker illustration of a window glass pane, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C226. `assets/words/노래.png` — 노래
```
cute die-cut sticker illustration of a child singing with music notes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C227. `assets/words/자.png` — 자
```
cute die-cut sticker illustration of a ruler, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C228. `assets/words/지우개.png` — 지우개
```
cute die-cut sticker illustration of an eraser, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C229. `assets/words/도넛.png` — 도넛 · 바탕 초록
```
cute die-cut sticker illustration of a doughnut, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C230. `assets/words/공책.png` — 공책
```
cute die-cut sticker illustration of a notebook, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C231. `assets/words/차.png` — 차
```
cute die-cut sticker illustration of a small cute car, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C232. `assets/words/펭귄.png` — 펭귄
```
cute die-cut sticker illustration of a penguin, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C233. `assets/words/게.png` — 게
```
cute die-cut sticker illustration of a crab, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C234. `assets/words/개.png` — 개
```
cute die-cut sticker illustration of a dog, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C235. `assets/words/버섯.png` — 버섯
```
cute die-cut sticker illustration of a mushroom, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C236. `assets/words/떡.png` — 떡 · 바탕 초록
```
cute die-cut sticker illustration of colorful Korean rice cakes, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure green (#00FF00) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C237. `assets/words/새.png` — 새
```
cute die-cut sticker illustration of a little bird, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C238. `assets/words/비.png` — 비
```
cute die-cut sticker illustration of rain falling from a cloud, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C239. `assets/words/로봇.png` — 로봇
```
cute die-cut sticker illustration of a toy robot, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C240. `assets/words/해.png` — 해
```
cute die-cut sticker illustration of a smiling sun, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C241. `assets/words/꿀.png` — 꿀
```
cute die-cut sticker illustration of a jar of honey, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C242. `assets/words/잠옷.png` — 잠옷
```
cute die-cut sticker illustration of a pair of pajamas, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C243. `assets/words/택시.png` — 택시
```
cute die-cut sticker illustration of a taxi, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C244. `assets/words/캐나다.png` — 캐나다
```
cute die-cut sticker illustration of a maple leaf, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C245. `assets/words/콩.png` — 콩
```
cute die-cut sticker illustration of a pile of beans, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### C246. `assets/words/컵.png` — 컵
```
cute die-cut sticker illustration of a cup, thick white sticker outline around the whole shape, single subject, centered, subject fills about 80% of a square 1:1 frame, plain solid flat pure magenta (#FF00FF) background filling the whole image, no checkerboard, no gradient, no shadow on the background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```
