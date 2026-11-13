# 읽어 주는 목소리

앱이 읽어 주는 낱말·글자·문장은 **미리 만들어 둔 녹음**을 틀어요. 녹음이 없는 말(아이 이름 인사 등)만 브라우저 음성으로 읽어요.

- 한국어: Microsoft 신경망 음성 **선희**(`ko-KR-SunHiNeural`), 조금 느리게(-6%)
- 영어: Microsoft 신경망 음성 **Ana**(`en-US-AnaNeural`, 아이 목소리), 조금 느리게(-8%)
- 녹음은 [edge-tts](https://pypi.org/project/edge-tts/)로 만들어요. Edge 브라우저의 "소리 내어 읽기"와 같은 서비스라서, 만들 때 문장이 Microsoft 서버로 보내져요. 공식 유료 API(Azure Speech)가 아니므로 서비스 이용 조건을 확인하고 쓰세요.

## 파일

| 파일 | 내용 |
|---|---|
| `assets/voice/v000.mp3` … | 녹음 조각 40개씩 이어 붙인 파일 (MP3 24kHz 48kbps) |
| `assets/voice/manifest.json` | `"ko|낱말": [파일 번호, 시작 초, 길이 초]`, 파일마다 내용 해시(`ver`) |
| `js/audio.js` | `speak('사과')`, `speak(['가', '글자를 만들어 볼까요?'])` — 배열이면 조각을 이어서 읽어요 |

## 다시 만들기 (낱말·문장을 바꿨을 때)

```bash
node tools/voice/collect.mjs . tools/voice/strings.json
```

```bash
python tools/voice/gen_voice.py tools/voice/strings.json tools/voice/cache
```

```bash
python tools/voice/pack_voice.py tools/voice/strings.json tools/voice/cache assets/voice
```

- `collect.mjs`: 낱말 사전, 차시별 글자, 문장, 게임 코드의 한국어 문장을 모아요.
- `gen_voice.py`: 아직 없는 말만 새로 만들어요(캐시). `pip install edge-tts`가 필요해요. 403 오류가 나면 edge-tts를 최신으로 올려요.
- `pack_voice.py`: 조각을 40개씩 이어 붙이고 manifest를 써요.

녹음을 다시 묶으면 조각 위치가 모두 바뀌어요. 그래서 앱은 `manifest.json`을 늘 새로 확인하고, 녹음 파일은 `v012.mp3?v=<내용 해시>`로 받아요. 기기에 남은 예전 파일과 새 목록이 섞여 소리가 비거나 끊기지 않게 하려는 것이에요. 녹음 파일을 받지 못하면 기기 음성으로 대신 읽어요.

새 게임에서 낱말이 들어간 문장을 읽을 때는 `` speak(`${낱말}을 주세요`) ``처럼 한 문장으로 만들지 말고
`speak([낱말, '주세요!'])`처럼 나눠 주세요. 여러 문장 · 글자를 읽을 때도 `.join(' ')`로 붙이지 말고 배열로 넘겨요(붙인 문장은 녹음이 없어 기기 음성으로 읽게 돼요). 그러면 낱말 녹음과 문장 녹음을 이어 붙여 읽어서 새 녹음이 필요 없어요.

개발 중에 녹음이 빠진 말을 찾으려면 브라우저 콘솔에서 `window.__voiceLog = new Set()`을 만든 뒤 놀이를 해 보고 `[...window.__voiceLog]`를 보세요.
