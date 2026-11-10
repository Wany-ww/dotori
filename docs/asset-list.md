# 이미지 전체 목록 + 생성 프롬프트 (1차)

> **2026-11-08 현재**: 149장을 모두 받아 다듬고 앱에 넣었어요. 140장이 화면에 나오고, 4장은 다시 만들고(🔁), 4장은 아직 안 쓰고(⏸), 1장은 참조용 시트예요. 다시 만들 그림과 새로 필요한 낱말 그림 246장은 [asset-list-2.md](asset-list-2.md)에 있어요.

모든 프롬프트는 **공통 스타일까지 이미 붙여 둔 완성본**이라 그대로 복사해서 쓰면 돼요. 이미지 생성 모델 입력용이라 영어예요.

- 상태 ✅ 화면에 나와요 · 🔁 다시 만들기([asset-list-2.md](asset-list-2.md)) · ⏸ 아직 안 씀 · 📎 참조용
- 받은 그림은 `tools/images/prepare_assets.py`가 배경을 지우고 줄여서 `assets/<폴더>/<이름>.webp`로 저장해요. 원본은 `asset-src/`에 있어요.
- 투명 배경은 PNG 또는 WebP(알파), 배경 그림은 WebP로 저장해요.
- 같은 캐릭터가 여러 장 필요하면 1번 시트를 참조 이미지로 넣고 만들어요.

총 149장 (아래 번호는 만드는 순서 추천)

| 묶음 | 장수 | 상태 |
|---|---|---|
| A. 토리 | 7 (시트 1, 기본 3, 추가 포즈 3) | 5 ✅ · 1 🔁(tori-hug) · 1 📎(시트) |
| B. 게임 친구 | 12 (캐릭터 10, 고양이 표정 2) | 11 ✅ · 1 🔁(monsters) |
| C. 게임 장면 배경 | 21 | 21 ✅ |
| D. 수업 지도 배경 | 3 | 3 ✅ |
| E. 바깥 화면 | 5 | 4 ✅ · 1 🔁(reward-burst) |
| F. 한글 14단계 배지 | 14 | 14 ✅ |
| G. UI 오브젝트 | 7 | 2 ✅ · 1 🔁(map-node) · 4 ⏸ |
| H. 낱말 그림 카드 | 56 | 56 ✅ |
| I. 스티커 | 24 | 24 ✅ |

---
## A. 토리 (다람쥐 마스코트) — `assets/char/`

### 1. `assets/char/tori-sheet.png`
- 크기: 2048×2048 · 쓰는 곳: 기준 시트 (앱에는 안 넣고, 아래 표정을 만들 때 참조 이미지로만 사용)
- 상태: 📎 참조용 (앱에 안 넣음)
```
character turnaround sheet of Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, front view, 3/4 view, side view, back view, consistent proportions, white background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 2. `assets/char/tori.webp`
- 크기: 512×512 투명 · 쓰는 곳: 홈 인사 동그라미, 로그인, 수업 지도의 "지금 여기"
- 상태: ✅ 화면에 나와요 — 홈 인사 동그라미, 모두 찾기 · 탑 쌓기 놀이
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, smiling and looking at viewer, friendly, bust portrait, centered, head fills the upper two thirds, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 3. `assets/char/tori-cheer.webp`
- 크기: 512×512 투명 · 쓰는 곳: 정답일 때 화면 아래에서 고개를 내밀며 칭찬
- 상태: ✅ 화면에 나와요 — 정답 칭찬 말풍선, 손글씨 놀이
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, jumping with both arms up, cheering, a few small confetti pieces, bust portrait, centered, head fills the upper two thirds, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 4. `assets/char/tori-think.webp`
- 크기: 512×512 투명 · 쓰는 곳: 두 번 틀렸을 때 "괜찮아, 다시 해 보자!"
- 상태: ✅ 화면에 나와요 — "다시 해 보자" 말풍선
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, tilting head with a paw on chin, curious and encouraging, bust portrait, centered, head fills the upper two thirds, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

**추가 포즈 (만들어 두면 좋은 것, 아직 화면에는 안 들어가요)**

### 5. `assets/char/tori-wave.webp`
- 크기: 512×512 투명 · 쓰는 곳: 인사
- 상태: ✅ 화면에 나와요 — 로그인 화면
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, waving hello with one paw, big smile, bust portrait, centered, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 6. `assets/char/tori-point.webp`
- 크기: 512×512 투명 · 쓰는 곳: 안내
- 상태: ✅ 화면에 나와요 — 수업 지도의 "지금 여기"
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, pointing forward with one paw, encouraging, bust portrait, centered, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 7. `assets/char/tori-hug.webp`
- 크기: 512×512 투명 · 쓰는 곳: 수업 완료
- 상태: 🔁 다시 만들기 — 코스 완주 보상 화면에 붙였지만 그림 속 토리가 너무 작아요 ([asset-list-2.md](asset-list-2.md) A)
```
Tori, a cute little squirrel mascot for a preschool learning app, big round head, huge sparkly dark eyes, rosy cheeks, tiny buck teeth, oversized fluffy curled tail, warm acorn-orange fur (#E0873F) with cream belly (#FFF1DC), wearing a small mint green scarf, holding a shiny acorn, 2.5 heads tall chibi proportions, hugging a big acorn, sleepy happy eyes, bust portrait, centered, same character design as the reference image, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## B. 게임 친구 캐릭터 — `assets/char/` (투명, 1024×1024)

### 8. `assets/char/owl.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 부엉이 별지기 (별빛 소리)
- 상태: ✅ 화면에 나와요 — 별 소리 놀이의 부엉이
```
a chubby round baby owl in lavender and navy feathers, big glowing yellow eyes, tiny night cap with a star, sitting on a crescent moon, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 9. `assets/char/fox.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 여우 퀴즈 진행자 (퀴즈의 시간)
- 상태: ✅ 화면에 나와요 — 퀴즈의 시간
```
a cute fox quiz show host with a red bow tie and a tiny microphone, big friendly eyes, peach orange fur, standing on stage, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 10. `assets/char/chick.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 병아리 키커 (단어 축구)
- 상태: ✅ 화면에 나와요 — 단어 축구 (차는 선수)
```
a round yellow chick soccer player in a mint jersey, about to kick a ball, determined happy face, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 11. `assets/char/penguin.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 펭귄 골키퍼 (단어 축구)
- 상태: ✅ 화면에 나와요 — 단어 축구 (골키퍼)
```
a small chubby penguin goalkeeper with big pink gloves, diving pose, surprised funny face, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 12. `assets/char/mole.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 두더지 광부 (보석 광산)
- 상태: ✅ 화면에 나와요 — 보석 광산
```
a tiny mole miner with a yellow helmet lamp and a mint cart, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 13. `assets/char/cat.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 보라 고양이 (설명해 주세요)
- 상태: ✅ 화면에 나와요 — 설명해 주세요
```
a friendly purple cat sitting behind a wooden desk, big round eyes, yellow-green collar, one paw raised as if explaining, upper body, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 14. `assets/char/monsters.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 몬스터 3형제 (장난감 공장)
- 상태: 🔁 다시 만들기 — 세 마리가 한 장에 있어 못 씀. 한 마리씩 세 장으로 ([asset-list-2.md](asset-list-2.md) A)
```
three small round fluffy monsters in green, orange and violet, each with a tiny party hat and a single tooth, holding an empty cardboard box, three separate characters, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 15. `assets/char/driver.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 트럭 기사님 곰 (말소리 정류장)
- 상태: ✅ 화면에 나와요 — 말소리 정류장의 곰 기사님
```
a small cheerful bear truck driver with a cap, leaning out of a mint green toy truck window, waving, side view, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 16. `assets/char/witch.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 마녀 꼬마 (마법의 솥)
- 상태: ✅ 화면에 나와요 — 마법 냄비
```
a little witch girl with a big violet hat stirring a bubbling black cauldron, sparkles, no face paint, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 17. `assets/char/monkey.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 원숭이 (열매를 받아라)
- 상태: ✅ 화면에 나와요 — 과일 받기
```
a playful monkey swinging on a vine with one arm, big smile, cute chibi, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 18. `assets/char/cat-talk.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 보라 고양이가 말할 때 (입 벌림)
- 상태: ✅ 화면에 나와요 — 설명해 주세요 (말할 때)
```
a friendly purple cat sitting behind a wooden desk, big round eyes, yellow-green collar, mouth open as if talking, one paw raised, upper body, cute chibi, same character design as the reference image, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 19. `assets/char/cat-clap.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 보라 고양이가 박수 칠 때
- 상태: ✅ 화면에 나와요 — 설명해 주세요 (맞혔을 때)
```
a friendly purple cat sitting behind a wooden desk, big round eyes, yellow-green collar, clapping both paws, happy smile, upper body, cute chibi, same character design as the reference image, isolated on transparent background, centered, full body, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## C. 게임 장면 배경 — `assets/scenes/` (1920×1200 WebP)

변수는 `css/tokens.css`에 있어요. 예: `--art-beach: url(../assets/scenes/beach.webp);`

### 20. `assets/scenes/beach.webp`
- 크기: 1920×1200 · 쓰는 곳: 모래사장 따라쓰기 배경 (변수 `--art-beach`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
top-down view of a sunny beach, turquoise sea with white foam waves across the top 15%, wide smooth golden sand below, a few seashells, a starfish and a tiny crab near the edges, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 21. `assets/scenes/night.webp`
- 크기: 1920×1200 · 쓰는 곳: 별빛 소리 배경 (변수 `--art-night`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
dreamy night sky over soft rolling purple hills, crescent moon in the upper right, scattered twinkling stars and faint constellations, deep indigo to lavender gradient, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 22. `assets/scenes/chalk-room.webp`
- 크기: 1920×1200 · 쓰는 곳: 모여라 자음 모음 배경 (변수 `--art-chalk`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cozy wooden classroom wall made of warm light-oak planks, a small shelf with crayons and a potted plant at the edges, soft window light, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 23. `assets/scenes/desk.webp`
- 크기: 1920×1200 · 쓰는 곳: 카드를 기억해 · 낱말 완성하기 배경 (변수 `--art-wood`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
top-down view of a warm light wooden desk with visible soft grain, a few pencils, an eraser and a sticker sheet at the very edges, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 24. `assets/scenes/table.webp`
- 크기: 1920×1200 · 쓰는 곳: 낱말 카드 · 같은 글자 짝 찾기 배경 (변수 `--art-table`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
top-down view of a large honey-colored wooden tabletop with soft swirling wood grain filling the whole frame, a few acorns and autumn leaves at the very corners, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 25. `assets/scenes/factory.webp`
- 크기: 1920×1200 · 쓰는 곳: 장난감 공장 배경 (변수 `--art-factory`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cozy toy factory interior wall in deep lavender purple, a long pink shelf with gift boxes and toy robots across the middle, blue lockers and pipes at both edges, hanging lamps along the top, no conveyor belt, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 26. `assets/scenes/meadow.webp`
- 크기: 1920×1200 · 쓰는 곳: 누가 누가 다를까 배경 (변수 `--art-meadow`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
sunny forest meadow by a calm blue lake, soft rolling green hills and round trees on both sides, bright grass covering the lower half, a few flowers at the very edges, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 27. `assets/scenes/bath.webp`
- 크기: 1920×1200 · 쓰는 곳: 목욕 시간 배경 (변수 `--art-bath`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
bright bathroom with pale aqua square wall tiles, a pink clawfoot bathtub at the left edge, a white sink and round mirror at the right edge, mint checkered floor along the bottom, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 28. `assets/scenes/book-desk.webp`
- 크기: 1920×1200 · 쓰는 곳: 나를 찾아줘 배경 (변수 `--art-book`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
top-down view of a warm dark wooden desk with a soft lamp glow in the middle and a few pencils and stickers at the very edges, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 29. `assets/scenes/neon.webp`
- 크기: 1920×1200 · 쓰는 곳: 리듬 한글 배경 (변수 `--art-neon`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
dark navy music room with faint glowing cyan staff lines and tiny floating music notes and triangles, soft neon glow, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 30. `assets/scenes/kitchen.webp`
- 크기: 1920×1200 · 쓰는 곳: 신기한 초콜릿 배경 (변수 `--art-kitchen`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
bright sky blue kitchen wall with a few hanging utensils and jars at the very edges, soft light, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 31. `assets/scenes/city.webp`
- 크기: 1920×1200 · 쓰는 곳: 말소리 정류장 배경 (변수 `--art-city`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
pale lavender sky with soft flat city building silhouettes and a few clouds, gentle pastel tones, empty lower half for road and UI, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 32. `assets/scenes/witch.webp`
- 크기: 1920×1200 · 쓰는 곳: 마법의 솥 배경 (변수 `--art-witch`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cozy purple witch's room with faint brick wall, candles and a broom at the very edges, soft magical glow, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 33. `assets/scenes/grove.webp`
- 크기: 1920×1200 · 쓰는 곳: 열매를 받아라 배경 (변수 `--art-grove`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
light green forest with soft leafy trees in the background edges, bright and calm, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 34. `assets/scenes/study.webp`
- 크기: 1920×1200 · 쓰는 곳: 설명해 주세요 배경 (변수 `--art-study`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cozy warm orange living room at sunset, floor lamp on the left, window frame and bookshelf on the right, wooden desk edge at the bottom, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 35. `assets/scenes/notebook.webp`
- 크기: 1920×1200 · 쓰는 곳: 문장 만들기 배경 (변수 `--art-notebook`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
mint green grid notebook paper filling the frame, washi tape pieces and doodles of stars and hearts at the corners, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 36. `assets/scenes/stage.webp`
- 크기: 1920×1200 · 쓰는 곳: 퀴즈의 시간 배경 (변수 `--art-stage`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
small theater stage with strawberry pink velvet curtains on both sides and a scalloped valance on top, warm spotlight in the middle, wooden stage floor at the bottom, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 37. `assets/scenes/workshop.webp`
- 크기: 1920×1200 · 쓰는 곳: 돌려라 글자판 배경 (변수 `--art-workshop`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cheerful toy workshop wall with butter yellow and cream stripes, pegboard with tiny gears and tools at the edges, wooden workbench at the bottom, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 38. `assets/scenes/field.webp`
- 크기: 1920×1200 · 쓰는 곳: 단어 축구 배경 (변수 `--art-field`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
bright soccer field with striped green grass, light blue sky with fluffy clouds in the top 40%, small stands with cheering animal silhouettes far away, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 39. `assets/scenes/mine.webp`
- 크기: 1920×1200 · 쓰는 곳: 보석 광산 배경 (변수 `--art-mine`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cozy cartoon gem mine cave, plum and mauve rock walls with glowing pastel crystals at the edges, wooden support beams, a tiny mine cart rail along the bottom, lantern light, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 40. `assets/scenes/space.webp`
- 크기: 1920×1200 · 쓰는 곳: 숨은 낱말 찾기 배경 (변수 `--art-space`)
- 상태: ✅ 화면에 나와요 — 게임 장면 배경
```
cute pastel outer space, indigo to lavender gradient, a pink ringed planet in the upper right, a small blue planet in the lower left, a friendly UFO and tiny stars, empty center area for UI, details only around the edges, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## D. 수업 지도 배경 — `assets/maps/` (1920×1320 WebP)

길은 코드가 그리므로 길은 넣지 않고, 가운데 띠(위아래 30% 사이)를 비워 둬요.

### 41. `assets/maps/hangul.webp`
- 크기: 1920×1320 · 쓰는 곳: 한글 수업 지도 바탕 (변수 `--map-hangul`)
- 상태: ✅ 화면에 나와요 — 과목 수업 지도 배경
```
whimsical top-down landscape for a kids learning app level map, pastel mint forest meadow with round trees, mushrooms, flowers and a small pond, decorations only along the edges and in small clusters, large calm open areas, no road, no path, no numbers, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 42. `assets/maps/math.webp`
- 크기: 1920×1320 · 쓰는 곳: 수학 수업 지도 바탕 (변수 `--map-math`)
- 상태: ✅ 화면에 나와요 — 과목 수업 지도 배경
```
whimsical top-down landscape for a kids learning app level map, candy desert with peach sand dunes, cacti, lollipop trees, tents and a tiny oasis, decorations only along the edges and in small clusters, large calm open areas, no road, no path, no numbers, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 43. `assets/maps/english.webp`
- 크기: 1920×1320 · 쓰는 곳: 영어 수업 지도 바탕 (변수 `--map-english`)
- 상태: ✅ 화면에 나와요 — 과목 수업 지도 배경
```
whimsical top-down landscape for a kids learning app level map, sunny ocean with a big sandy island, palm trees, sailboats, shells and friendly fish, decorations only along the edges and in small clusters, large calm open areas, no road, no path, no numbers, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## E. 바깥 화면 일러스트 — `assets/ui/`

### 44. `assets/ui/home-hills.webp`
- 크기: 2400×360 · 쓰는 곳: 모든 바깥 화면 맨 아래 언덕 (지금은 SVG로 그림)
- 상태: ✅ 화면에 나와요 — 홈 화면 아래 언덕 (낮고 흐리게)
```
wide panoramic strip of gentle rolling hills and a distant forest edge, tiny houses and acorn trees, soft morning light, very low contrast, flat bottom edge, empty sky, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 45. `assets/ui/cover-hangul.webp`
- 크기: 800×360 · 쓰는 곳: 홈 과목 카드 윗부분 (한글)
- 상태: ✅ 화면에 나와요 — 과목 카드 표지
```
a cozy reading nook in a hollow tree with floating soft letter-shaped blocks without any readable letters, coral and cream tones, room on the left for a big title, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 46. `assets/ui/cover-math.webp`
- 크기: 800×360 · 쓰는 곳: 홈 과목 카드 (수학)
- 상태: ✅ 화면에 나와요 — 과목 카드 표지
```
acorns lined up and counted by little forest animals on a sunny hill, sky blue tones, room on the left for a big title, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 47. `assets/ui/cover-english.webp`
- 크기: 800×360 · 쓰는 곳: 홈 과목 카드 (영어)
- 상태: ✅ 화면에 나와요 — 과목 카드 표지
```
a small sailboat carrying picture books across a calm violet sea at dusk, room on the left for a big title, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 48. `assets/ui/reward-burst.webp`
- 크기: 1024×1024 투명 · 쓰는 곳: 보상 창 별 뒤의 햇살
- 상태: 🔁 다시 만들기 — 보상 카드 뒤에 붙였지만 햇살에 바둑판 자국이 남았어요 ([asset-list-2.md](asset-list-2.md) A)
```
radiant sunburst of soft golden rays and tiny leaves and acorns around an empty center, isolated on transparent background, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## F. 한글 14단계 배지 — `assets/ui/stage-01.png` ~ `stage-14.png` (256×256 투명)

### 49. `assets/ui/stage-01.png`
- 크기: 256×256 투명 · 쓰는 곳: 1단계 · 글자와 친해지기 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a sprouting seed, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 50. `assets/ui/stage-02.png`
- 크기: 256×256 투명 · 쓰는 곳: 2단계 · 통글자로 낱말 읽기 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a basket of fruit, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 51. `assets/ui/stage-03.png`
- 크기: 256×256 투명 · 쓰는 곳: 3단계 · 모음과 첫 자음 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a small sun and a moon, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 52. `assets/ui/stage-04.png`
- 크기: 256×256 투명 · 쓰는 곳: 4단계 · 자음 소리 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a bird singing, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 53. `assets/ui/stage-05.png`
- 크기: 256×256 투명 · 쓰는 곳: 5단계 · 받침 ㅁ ㅇ ㄴ ㄹ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a bear and a ball, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 54. `assets/ui/stage-06.png`
- 크기: 256×256 투명 · 쓰는 곳: 6단계 · 받침 ㅂ ㄱ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a turtle and a drum, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 55. `assets/ui/stage-07.png`
- 크기: 256×256 투명 · 쓰는 곳: 7단계 · 거센소리·된소리 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a rabbit jumping high, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 56. `assets/ui/stage-08.png`
- 크기: 256×256 투명 · 쓰는 곳: 8단계 · 이중 모음 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of two raindrops merging, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 57. `assets/ui/stage-09.png`
- 크기: 256×256 투명 · 쓰는 곳: 9단계 · 받침 ㅍ·ㅋ·ㄲ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a leaf and a kitchen pot, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 58. `assets/ui/stage-10.png`
- 크기: 256×256 투명 · 쓰는 곳: 10단계 · 받침 ㄷ·ㅌ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a vegetable field, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 59. `assets/ui/stage-11.png`
- 크기: 256×256 투명 · 쓰는 곳: 11단계 · 받침 ㅅ·ㅈ·ㅊ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a blooming flower, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 60. `assets/ui/stage-12.png`
- 크기: 256×256 투명 · 쓰는 곳: 12단계 · 사이시옷 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a seaside with a candle, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 61. `assets/ui/stage-13.png`
- 크기: 256×256 투명 · 쓰는 곳: 13단계 · 받침 ㅎ 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a stack of building blocks, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 62. `assets/ui/stage-14.png`
- 크기: 256×256 투명 · 쓰는 곳: 14단계 · 겹받침 배지
- 상태: ✅ 화면에 나와요 — 한글 14단계 길의 배지 (잠긴 단계는 회색)
```
round wooden badge medallion with a small leafy wreath, centered emblem of a hen and a flowerpot, picture-book style, isolated on transparent background, no text, no numbers, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## G. UI 오브젝트 — `assets/ui/` (투명)

### 63. `assets/ui/jamo-block.png`
- 크기: 512×512 투명 · 쓰는 곳: 글자 블록 (글자는 코드로 올림)
- 상태: ⏸ 아직 안 씀 — 지금 화면(글자를 CSS 블록으로 그림)과 맞지 않아요
```
a single blank square wooden toy block, rounded corners, light maple wood with soft grain, front-facing, slight 3D depth, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 64. `assets/ui/chalkboard.png`
- 크기: 1024×800 투명 · 쓰는 곳: 칠판
- 상태: ⏸ 아직 안 씀 — 칠판 장면은 chalk-room 배경으로 대신해요
```
small green chalkboard with a chunky light wood frame, faint chalk dust smudges, front view, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 65. `assets/ui/word-card.png`
- 크기: 1024×600 투명 · 쓰는 곳: 낱말 카드 틀
- 상태: ⏸ 아직 안 씀 — 낱말 카드는 CSS로 그려요
```
blank flash card with a mint green header strip and rounded corners, white paper texture, soft shadow, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 66. `assets/ui/letter-machine.png`
- 크기: 1200×1000 투명 · 쓰는 곳: 돌려라 글자판 기계
- 상태: ⏸ 아직 안 씀 — 글자 기계 놀이는 CSS로 그려요
```
cute retro slot machine toy in sky blue with three empty vertical reel windows and a yellow round button, rounded bubbly shape, front view, no symbols in the reels, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 67. `assets/ui/card-back.png`
- 크기: 512×614 투명 · 쓰는 곳: 카드 뒷면 (카드를 기억해)
- 상태: ✅ 화면에 나와요 — 짝 맞추기 카드 뒷면
```
back side of a playing card for kids, strawberry pink with a white border and a repeating tiny acorn pattern, rounded corners, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 68. `assets/ui/stamp.png`
- 크기: 256×256 투명 · 쓰는 곳: 도장
- 상태: ✅ 화면에 나와요 — 퀴즈의 시간 도장
```
cute postage stamp with perforated edges and a tiny fox face, pastel colors, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

### 69. `assets/ui/map-node.png`
- 크기: 256×256 투명 · 쓰는 곳: 수업 지도의 단계 표시
- 상태: 🔁 다시 만들기 — 가운데에 도토리가 그려져 있어 번호를 못 얹어요. 가운데를 비운 판으로 ([asset-list-2.md](asset-list-2.md) A)
```
round wooden stage marker for a level map, glossy pastel, with a small acorn emblem, isolated on transparent background, no text, picture-book illustration for a preschool Korean reading app, gouache and colored-pencil texture on warm paper, soft rounded shapes, gentle natural palette (acorn orange #D97A33, leaf green #4FA36B, coral #EE6C5F, sky blue #3D8FD9, violet #8668D7, butter yellow #F6C343, warm paper #FAF5EC), thin warm-brown outlines, cozy and calm, no text, no letters, no watermark
```

---
## H. 낱말 그림 카드 — `assets/words/<낱말>.png` (512×512 투명)

낱말 이름이 파일 이름이에요. 같은 시드(seed)로 한 번에 만들면 그림 결이 맞아요. 지금 앱은 낱말 약 450개를 이모지로 보여 주는데, 아래는 가장 먼저 바꿀 56개예요.

### 70. `assets/words/고래.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "고래"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single blue whale, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 71. `assets/words/사과.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "사과"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single red apple, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 72. `assets/words/나비.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "나비"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single butterfly, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 73. `assets/words/기차.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "기차"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single toy train, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 74. `assets/words/모자.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "모자"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single sun hat, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 75. `assets/words/우유.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "우유"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single milk carton, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 76. `assets/words/포도.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "포도"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single bunch of grapes, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 77. `assets/words/토끼.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "토끼"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single white rabbit, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 78. `assets/words/사자.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "사자"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single lion cub, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 79. `assets/words/오리.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "오리"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single duckling, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 80. `assets/words/바나나.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "바나나"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single banana, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 81. `assets/words/도토리.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "도토리"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single acorn, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 82. `assets/words/피자.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "피자"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single pizza slice, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 83. `assets/words/하마.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "하마"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single hippo, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 84. `assets/words/거미.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "거미"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single smiling spider, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 85. `assets/words/시계.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "시계"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single alarm clock, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 86. `assets/words/버스.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "버스"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single yellow bus, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 87. `assets/words/자두.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "자두"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 · 가장자리에 작은 점이 조금 남음
```
a single plum, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 88. `assets/words/강아지.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "강아지"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single puppy, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 89. `assets/words/고양이.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "고양이"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single kitten, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 90. `assets/words/사슴.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "사슴"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single fawn deer, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 91. `assets/words/연필.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "연필"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single pencil, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 92. `assets/words/딸기.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "딸기"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single strawberry, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 93. `assets/words/수박.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "수박"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single watermelon slice, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 94. `assets/words/우산.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "우산"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single umbrella, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 95. `assets/words/기린.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "기린"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single giraffe, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 96. `assets/words/선물.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "선물"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single gift box, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 97. `assets/words/풍선.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "풍선"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single balloon, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 98. `assets/words/눈사람.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "눈사람"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single snowman, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 99. `assets/words/자동차.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "자동차"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single toy car, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 100. `assets/words/비행기.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "비행기"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single airplane, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 101. `assets/words/햄버거.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "햄버거"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single hamburger, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 102. `assets/words/코끼리.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "코끼리"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single elephant, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 103. `assets/words/원숭이.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "원숭이"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single monkey, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 104. `assets/words/병아리.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "병아리"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 · 가장자리에 작은 점이 조금 남음
```
a single baby chick, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 105. `assets/words/달팽이.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "달팽이"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 · 가장자리에 작은 점이 조금 남음
```
a single snail, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 106. `assets/words/가방.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "가방"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 · 가장자리에 작은 점이 조금 남음
```
a single backpack, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 107. `assets/words/라면.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "라면"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 · 가장자리에 작은 점이 조금 남음
```
a single bowl of noodles, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 108. `assets/words/구름.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "구름"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single fluffy cloud, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 109. `assets/words/무지개.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "무지개"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single rainbow, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 110. `assets/words/지구.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "지구"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single planet earth, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 111. `assets/words/거북이.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "거북이"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single turtle, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 112. `assets/words/곰.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "곰"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single teddy bear, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 113. `assets/words/달.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "달"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 (🌙 달일 때만)
```
a single crescent moon, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 114. `assets/words/별.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "별"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 (⭐ 별일 때만)
```
a single star, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 115. `assets/words/산.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "산"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single mountain, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 116. `assets/words/문.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "문"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single wooden door, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 117. `assets/words/밤.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "밤"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 (🌰 밤(열매)일 때만)
```
a single chestnut, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 118. `assets/words/공.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "공"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single soccer ball, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 119. `assets/words/집.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "집"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single little house, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 120. `assets/words/손.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "손"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single open hand, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 121. `assets/words/물.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "물"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신 (💧 물일 때만)
```
a single water drop, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 122. `assets/words/빵.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "빵"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single loaf of bread, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 123. `assets/words/책.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "책"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single picture book, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 124. `assets/words/꽃.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "꽃"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single cherry blossom, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

### 125. `assets/words/양말.png`
- 크기: 512×512 투명 · 쓰는 곳: 낱말 "양말"
- 상태: ✅ 화면에 나와요 — 이 낱말이 나오는 놀이 약 20종에서 이모지 대신
```
a single pair of socks, cute simple sticker illustration for a toddler word card, centered, thick soft outline, saturated pastel colors, isolated on transparent background, no text
```

---
## I. 스티커북 — `assets/stickers/<이름>.png` (512×512 투명)

### 126. `assets/stickers/bunny.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (bunny)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a bunny wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 127. `assets/stickers/fox.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (fox)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a fox wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 128. `assets/stickers/bear.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (bear)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a bear wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 129. `assets/stickers/panda.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (panda)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a panda wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 130. `assets/stickers/koala.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (koala)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a koala wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 131. `assets/stickers/tiger.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (tiger)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a tiger wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 132. `assets/stickers/lion.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (lion)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a lion wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 133. `assets/stickers/frog.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (frog)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a frog wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 134. `assets/stickers/monkey.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (monkey)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a monkey wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 135. `assets/stickers/unicorn.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (unicorn)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a unicorn wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 136. `assets/stickers/octopus.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (octopus)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a octopus wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 137. `assets/stickers/butterfly.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (butterfly)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a butterfly wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 138. `assets/stickers/whale.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (whale)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a whale wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 139. `assets/stickers/owl.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (owl)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a owl wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 140. `assets/stickers/penguin.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (penguin)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a penguin wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 141. `assets/stickers/turtle.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (turtle)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a turtle wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 142. `assets/stickers/hedgehog.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (hedgehog)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a hedgehog wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 143. `assets/stickers/flamingo.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (flamingo)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a flamingo wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 144. `assets/stickers/ladybug.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (ladybug)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a ladybug wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 145. `assets/stickers/bee.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (bee)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a bee wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 146. `assets/stickers/baby-dinosaur.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (baby dinosaur)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a baby dinosaur wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 147. `assets/stickers/dolphin.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (dolphin)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a dolphin wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 148. `assets/stickers/parrot.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (parrot)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a parrot wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```

### 149. `assets/stickers/hamster.png`
- 크기: 512×512 투명 · 쓰는 곳: 스티커 (hamster)
- 상태: ✅ 화면에 나와요 — 스티커북 · 보상 스티커
```
round die-cut sticker of a hamster wearing a tiny acorn accessory, glossy white border, cute chibi, pastel, isolated on transparent background, no text
```
