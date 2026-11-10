# NAS에서 서버 돌리고 안드로이드 앱으로 접속하기

도토리숲 서버(`server.js`)를 집의 NAS에서 Docker로 돌리고, 밖에서는 안드로이드 앱(APK)으로 접속해요.

지금 쓰는 구성은 **유그린 DXP2800 + Tailscale Funnel**이에요(아래 1). 공유기 포트를 열지 않고, Tailscale Funnel이 `https://dotori.<tailnet>.ts.net` 주소를 인터넷에 열어 줘요. 휴대폰에는 Tailscale 앱이 없어도 돼요.

```
[휴대폰 · 태블릿: 도토리숲 앱] ──https──▶ [Tailscale Funnel 입구] ──Tailscale(암호화)──▶ [NAS: dotori-tailscale ─▶ dotori :5173] ──▶ NAS의 data 폴더
```

시놀로지에서 DDNS · 공유기 포트 포워딩으로 공개하는 방법도 4에 남겨 두었어요.

- 서버는 앱이 쓰는 파일(`index.html` · `js/` · `css/` · `assets/`)과 API만 내보내요. 계정 · 학습 기록이 든 `data/`, 문서, 도구, `.git`은 밖에서 열 수 없어요.
- 그림 · 음성(약 160MB)은 기기에 7일 동안 저장해 두고, 코드는 바뀌었을 때만 다시 받아요. 처음 한 번만 오래 걸려요.
- **자동 업데이트**: GitHub `main`에 커밋이 푸시되면
  - 서버: NAS의 컨테이너가 5분마다 새 커밋을 확인해서 저절로 받아요(아래 2 참고).
  - 앱 화면(놀이 · 커리큘럼): 서버에서 늘 새로 받아서 바로 바뀌어요.
  - 앱 자체(`android/`가 바뀐 경우): GitHub Actions가 서명한 APK를 Releases에 올리고, 앱이 켜질 때 새 버전을 받을지 물어요(아래 3 참고).

## 방법 고르기

| | Tailscale Funnel (지금 쓰는 방법) | 공개 주소(DDNS + 포트 포워딩) |
|---|---|---|
| 쓰는 파일 | `docker-compose.tailscale.yml` | `docker-compose.yml` |
| 접속할 수 있는 기기 | 주소를 아는 누구나(로그인 화면까지) | 주소를 아는 누구나(로그인 화면까지) |
| 공유기 설정 | 없음 | 80 · 443 포트 포워딩 |
| 주소 · HTTPS 인증서 | `https://dotori.<tailnet>.ts.net`, Tailscale이 자동 발급 | DDNS + Let's Encrypt (시놀로지는 DSM에서, 유그린은 따로 필요) |
| 공인 IP | 필요 없음 | 필요 |
| 휴대폰 준비 | 없음 | 없음 |
| 자동 업데이트 | 같음 | 같음 |

두 방법 모두 compose 파일 하나만 있으면 돼요. 이미지를 직접 빌드하지 않고 `node:22-alpine`에 git을 깔아 저장소를 받는 방식이라, NAS의 프로젝트 화면이 빌드를 지원하지 않아도 돼요.

## 1. 유그린 DXP2800 + Tailscale Funnel (지금 쓰는 방법)

DXP2800(UGOS Pro, Intel N100)은 Docker를 쓸 수 있어요. `docker-compose.tailscale.yml`에 도토리숲 서버와 Tailscale을 함께 넣었어요.

- 공유기 포트를 열지 않아요. **Funnel**이 `https://dotori.<tailnet 이름>.ts.net`을 인터넷에 열어 줘서, 휴대폰에 Tailscale이 없어도 접속돼요.
- HTTPS 인증서는 Tailscale이 자동으로 받고 갱신해요. 공인 IP가 없어도 돼요.
- 주소를 아는 사람은 누구나 로그인 화면까지 볼 수 있어요. 보호자 계정 비밀번호를 8자 이상으로 길게 정하고, 로그인을 10번 틀린 IP는 10분 동안 막아요.
- Funnel은 443 포트로만 열려요. 인터넷 공개를 끄려면 compose의 `"AllowFunnel"…true`를 `false`로 바꿔 다시 배포해요. 그러면 Tailscale에 로그인한 기기에서만 열려요.

### 1. Tailscale 계정 준비 (처음 한 번)

1. https://login.tailscale.com 에서 가입하거나 로그인해요(구글 · 애플 계정 등). 이 계정의 기기 묶음이 tailnet이에요.
2. 관리 화면 **DNS** 탭에서
   - **MagicDNS**가 켜져 있는지 확인해요(새 계정은 보통 켜져 있어요).
   - 아래쪽 **HTTPS Certificates → Enable HTTPS**를 눌러요.
   - 같은 화면 위쪽 **Tailnet name**(예: `tail1234.ts.net`)을 적어 둬요. 이것이 주소의 뒷부분이에요.
3. **Funnel 허용**: 관리 화면 **Access controls**(정책 파일)에 아래 `nodeAttrs` 항목이 있는지 봐요. 새 계정은 보통 이미 들어 있어요. 없으면 정책 맨 바깥 `{ }` 안에 넣고 **Save**해요.
   ```json
   "nodeAttrs": [
     { "target": ["autogroup:member"], "attr": ["funnel"] }
   ],
   ```
   - 이미 `nodeAttrs`가 있으면 그 목록 안에 `{ "target": ["autogroup:member"], "attr": ["funnel"] }` 한 줄만 더해요.
4. (선택) **Settings → Keys → Generate auth key**로 인증 키를 만들면 NAS를 로그인 링크 없이 붙일 수 있어요. 키는 남에게 보여 주지 마세요.

### 2. NAS에 올리기

1. UGOS Pro 앱 센터에서 **Docker**를 설치해요.
2. **Docker → 프로젝트 → 생성**
   - 프로젝트 이름: `dotori`
   - 저장 위치: 원하는 공유 폴더(예: `docker/dotori`). 이 폴더 아래에 `data/`(기록) · `tailscale/`(Tailscale 로그인 상태)가 생겨요.
   - Compose 설정: 저장소의 `docker-compose.tailscale.yml` 내용을 통째로 붙여 넣어요.
   - 1번의 4단계에서 인증 키를 만들었다면 `# - TS_AUTHKEY=…` 줄의 `#`을 지우고 키를 넣어요.
3. **배포(Deploy)** → `dotori-tailscale` · `dotori` 두 컨테이너가 켜져요. 처음에는 저장소를 받느라 1~2분 걸려요.
4. 인증 키를 넣지 않았다면 **컨테이너 → dotori-tailscale → 로그**에서 `https://login.tailscale.com/a/…` 링크를 찾아 열고 로그인해요. Tailscale 관리 화면 **Machines**에 `dotori`가 보이면 연결된 거예요.
5. 확인
   - 집 와이파이의 컴퓨터에서 `http://<NAS 내부 IP>:5173` → 로그인 화면
   - 휴대폰 데이터(와이파이 끄고)로 `https://dotori.<tailnet 이름>.ts.net` → 로그인 화면. 처음 열 때 인증서를 받느라 10초쯤 걸리고, Funnel 주소가 인터넷에 알려지기까지 몇 분 걸릴 수 있어요.
   - **dotori-tailscale → 터미널**에서 `tailscale funnel status`를 치면 `https://dotori.….ts.net (Funnel on)`과 `proxy http://127.0.0.1:5173`이 보여야 해요.

관리자 계정은 **Docker → 컨테이너 → dotori → 터미널**에서 만들어요.

```
node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

### 3. 휴대폰 · 태블릿 준비

1. 도토리숲 앱(아래 3)을 설치하고 켜요. 서버 주소(`https://dotori.tailf5847f.ts.net`)가 앱에 들어 있어서 바로 연결돼요.
2. Tailscale 앱은 없어도 돼요. 집 와이파이 · 데이터 어디서나 같은 주소로 열려요.

### 업데이트 · 백업

- 서버는 5분마다 GitHub를 확인해서 저절로 업데이트해요(아래 2).
- 기록은 프로젝트 저장 위치의 `data/`, Tailscale 로그인 상태는 `tailscale/`에 있어요. `data/`는 꼭 백업해 주세요. `tailscale/`을 지우면 NAS를 Tailscale에 다시 로그인시키면 돼요.
- Tailscale 관리 화면에서 `dotori` 기기의 **Disable key expiry**를 켜 두면, 몇 달 뒤 로그인이 만료돼 끊기는 일이 없어요.

## 2. 서버 자동 업데이트

컨테이너 안의 실행기(`tools/runner.js`)가 하는 일이에요.

- 5분마다 GitHub `main` 브랜치에 새 커밋이 있는지 확인해요.
- 새 커밋이 있으면 그 커밋으로 파일을 바꿔요.
  - 화면 파일(`js` · `css` · `assets`)만 바뀌었으면 서버를 끄지 않고 바로 새 파일을 내보내요.
  - 서버 코드(`server.js` · `tools/` · `package.json`)가 바뀌었으면 서버를 몇 초 동안 다시 켜요.
- 서버가 멈추면 3초 뒤 다시 켜요.
- `data/`(아이 · 보호자 기록)는 건드리지 않아요.
- 컨테이너 **로그**에 `업데이트: 4a14fd9 → 220015d`처럼 남아요.

`docker-compose.yml`의 환경 변수로 바꿀 수 있어요.

| 변수 | 기본값 | 뜻 |
|---|---|---|
| `UPDATE_MINUTES` | `5` | 새 커밋 확인 간격(분) |
| `AUTO_UPDATE` | `1` | `0`이면 자동 업데이트를 꺼요(컨테이너를 다시 만들 때만 새로 받아요) |
| `BRANCH` | `main` | 따라갈 브랜치 |
| `REPO_URL` | 이 저장소 | 받을 저장소 주소 |

실행기(`tools/runner.js`)가 바뀐 커밋을 받으면 실행기가 컨테이너를 끝내고, Docker가 컨테이너를 다시 켜면서 새 실행기로 돌아요(`restart: unless-stopped`). compose 파일 자체를 바꿨을 때만 프로젝트를 다시 만들어(또는 `docker compose up -d`) 주세요. 저장소가 비공개로 바뀌면 받을 수 없으니 공개로 두어야 해요.

## 3. 안드로이드 앱 (APK)

### 처음 한 번: 서명 키 넣기

앱을 자동으로 업데이트하려면 모든 APK를 같은 키로 서명해야 해요. 키는 만들어 두었어요(`android/release.keystore`, 저장소에는 올리지 않아요).

1. `android/signing.local.txt`를 열어요(이 컴퓨터에만 있어요).
2. GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret**에서 파일에 적힌 4개(`ANDROID_KEY_ALIAS` · `ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_PASSWORD` · `ANDROID_KEYSTORE_BASE64`)를 이름과 값 그대로 넣어요.
3. GitHub **Actions → Android APK → Run workflow**를 한 번 눌러요. 끝나면 **Releases**에 `도토리숲 앱 1.<번호>`가 생겨요.
4. `release.keystore`와 `signing.local.txt`는 잃어버리면 같은 앱으로 업데이트할 수 없어요. USB나 비밀번호 관리 앱 등 저장소 밖에 따로 보관해 주세요.

Secrets가 없으면 Actions는 디버그 APK만 만들어 실행 결과(Artifacts)에 올리고, Releases에는 올리지 않아요.

### 설치

- GitHub 저장소의 **Releases**에서 가장 최근 `도토리숲 앱 1.<번호>`의 `dotori-1.<번호>.apk`를 휴대폰으로 받아 열어요. "출처를 알 수 없는 앱 설치"를 허용하면 설치돼요.
  - 전에 Actions Artifacts의 디버그 APK를 설치했다면 서명이 달라서 위에 덮어 설치할 수 없어요. 그 앱을 한 번 지우고 설치해요.
- 서버 주소는 앱에 들어 있어요(기본 `https://dotori.tailf5847f.ts.net`). 설치하고 켜면 주소를 묻지 않고 바로 연결돼요.
  - 서버에 연결하지 못하면 **다시 시도** 화면이 나와요. 거기서 **다른 서버 주소 적기**로 다른 주소를 쓸 수도 있어요.
  - 다른 주소는 **프로필 → 앱 설정 → 서버 주소 바꾸기**에서도 적을 수 있어요(예: 집 와이파이 안에서만 쓰는 `http://192.168.0.10:5173`). 앱이 `/api/ping`으로 도토리숲 서버인지 확인한 뒤 저장해요. **기본 서버로 되돌리기**로 원래 주소로 돌아가요.
- 앱에 넣는 주소를 바꾸려면(예: tailnet 이름이 바뀜) GitHub 저장소 → **Settings → Secrets and variables → Actions → Variables**에 `DOTORI_SERVER` = `https://새-주소`를 넣고 **Actions → Android APK → Run workflow**를 눌러요. 새 APK부터 그 주소로 연결돼요. 변수가 없으면 `android/app/build.gradle`의 기본 주소를 써요.

### 앱 자동 업데이트

1. `android/`가 바뀐 커밋이 `main`에 푸시되면 GitHub Actions가 버전 번호를 하나 올려 서명한 APK를 만들고, Releases에 `app-<번호>`로 올려요.
2. 설치된 앱은 켜질 때(6시간에 한 번) 최신 릴리스를 확인해요. 지금보다 새 버전이면 "새 버전이 있어요"라고 물어요.
3. **업데이트**를 누르면 APK를 받고 안드로이드 설치 화면을 열어요. 처음 한 번은 "이 출처의 앱 설치 허용"을 켜 달라고 해요.

놀이 화면이나 커리큘럼만 바뀐 커밋은 앱을 다시 설치할 필요가 없어요. 서버가 업데이트되면 앱 화면도 바로 바뀌어요.

### 앱이 하는 일

- 서버의 도토리숲 화면을 그대로 열어요. 앱을 다시 설치하지 않아도 NAS를 업데이트하면 앱 화면도 바뀌어요.
- 웹뷰에는 음성인식 · 음성 합성이 없어서, 안드로이드 음성인식(말하기 놀이)과 TTS(녹음이 없는 말 읽어 주기)로 대신해요(`js/nativeBridge.js`).
  - 처음 켤 때 마이크 권한을 물어요. 녹음은 저장하지 않아요.
  - 음성인식은 휴대폰의 Google 음성 서비스를 써요. 기기 설정에 따라 말소리가 Google 서버로 가요.
- 서버가 아닌 주소(바깥 링크)는 휴대폰 브라우저로 열어요.

### 직접 빌드하기

Android Studio가 설치된 컴퓨터에서:

```bash
cd android
./gradlew assembleDebug
```

- JDK 17 ~ 21이 필요해요(Android Studio에 들어 있는 JDK 25로는 Gradle 8.7이 돌지 않아요).
- `android/local.properties`에 `sdk.dir=<Android SDK 경로>`를 적어 둬요(저장소에는 올리지 않아요).

### 알아 둘 것

- 직접 빌드한 디버그 앱은 새 버전을 묻지 않아요. 서명된 릴리스는 `signing.local.txt`의 값을 환경 변수(`ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_PASSWORD` · `ANDROID_KEY_ALIAS`)로 넣고 `./gradlew assembleRelease`로 만들어요.
- 앱 이름은 "도토리숲", 패키지는 `kr.dotori.forest`예요.

## 4. (다른 방법) 시놀로지에 올리고 공개 주소로 열기

### 서버 올리기

시놀로지(DSM 7.2 이상, Container Manager)를 기준으로 적었어요. QNAP은 Container Station에서 같은 `docker-compose.yml`로 "애플리케이션 만들기"를 하면 돼요.

1. 패키지 센터에서 **Container Manager**를 설치해요.
2. File Station에서 `docker/dotori` 폴더를 만들고, 저장소의 `docker-compose.yml` 하나만 올려요.
   - 앱 파일은 컨테이너가 켜질 때 GitHub에서 직접 받아요(1~2분). 그래서 NAS가 인터넷에 연결돼 있어야 해요.
   - `data/`는 처음 실행할 때 생겨요.
3. Container Manager → **프로젝트** → **생성**
   - 경로: `docker/dotori`
   - 소스: "기존 docker-compose.yml 사용"
   - 이름: `dotori`
4. 다 만들어지면 같은 와이파이의 컴퓨터에서 `http://<NAS 내부 IP>:5173`을 열어 봐요. 로그인 화면이 나오면 성공이에요.
   - 처음에는 저장소를 받느라 1~2분 걸려요. 컨테이너 **로그**에 `서버 시작 (커밋 …)`이 나오면 준비된 거예요.

### 관리자 계정 만들기

Container Manager → 컨테이너 → `dotori` → **터미널** → 만들기(`sh`)에서 아래를 입력해요. 아이디와 비밀번호는 직접 정해요.

```
node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

SSH로 접속했다면:

```bash
sudo docker exec -it dotori node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

### 백업

아이 · 보호자 기록은 모두 `docker/dotori/data`에 있어요. Hyper Backup 등으로 이 폴더를 백업해 주세요.

### 밖에서 접속할 주소 만들기 (HTTPS)

밖에서 쓰려면 주소와 인증서가 필요해요. 비밀번호가 오가므로 **반드시 https**로 열어 주세요.

1. **DDNS**: 제어판 → 외부 액세스 → DDNS → 추가
   - 서비스 공급자: Synology
   - 호스트 이름: 예) `dotori-home.synology.me`
2. **인증서**: 제어판 → 보안 → 인증서 → 추가 → "Let's Encrypt에서 인증서 받기"
   - 도메인 이름: 위의 DDNS 주소
3. **역방향 프록시**: 제어판 → 로그인 포털 → 고급 → 역방향 프록시 → 생성
   - 소스: 프로토콜 HTTPS, 호스트 이름 `dotori-home.synology.me`, 포트 443
   - 대상: 프로토콜 HTTP, 호스트 이름 `localhost`, 포트 5173
   - 서버는 `X-Forwarded-Proto`(https인지)와 `X-Forwarded-For`(접속 IP) 머리글을 봐요. 시놀로지 역방향 프록시는 보통 둘 다 붙여 줘요. 다른 프록시를 쓰면 이 두 머리글을 넣어 주세요(사용자 지정 머리글).
4. 인증서 화면의 **설정**에서 이 역방향 프록시 항목에 2번 인증서를 골라요.
5. **공유기 포트 포워딩**: 외부 443 → NAS 내부 IP 443 (Let's Encrypt 갱신용으로 80 → 80도 열어 둬요).
   - 5173 포트는 공유기에서 열지 않아요. 밖에서는 443(https)으로만 들어오게 해요.
6. 휴대폰 데이터로 `https://dotori-home.synology.me`를 열어 로그인 화면이 나오는지 확인해요.

서버는 `X-Forwarded-Proto: https`를 보고 로그인 쿠키에 `Secure`를 붙여요. 로그인 실패가 잦은 IP는 10분 동안 막아요.
